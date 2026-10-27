<?php
/**
 * ==============================================================================
 * High Resolution Technologies - Direct SMTP Form Handler & JSON Logger
 * ==============================================================================
 * Features:
 *  - Accepts JSON payload & standard FormData (application/x-www-form-urlencoded / multipart)
 *  - Validates required fields, email format, and phone number
 *  - Thread-safe storage to submissions.json using atomic file locking (flock)
 *  - Native Gmail SMTP Socket client (ssl://smtp.gmail.com:465) without PHPMailer / Composer
 *  - Responsive, high-conversion HTML email template with IST timestamp
 *  - Clean JSON response format: { status: "success"|"error", message: "..." }
 * ==============================================================================
 */

// -----------------------------------------------------------------------------
// 1. GLOBAL SETTINGS & CREDENTIALS CONFIGURATION
// -----------------------------------------------------------------------------
date_default_timezone_set('Asia/Kolkata'); // Indian Standard Time (IST)

define('PROJECT_NAME', 'High Resolution Technologies');

// Gmail SMTP Credentials (Replace with your actual Gmail ID & 16-character App Password)
// How to generate an App Password: 
// Go to Google Account -> Security -> 2-Step Verification -> App Passwords
define('SMTP_HOST', 'ssl://smtp.gmail.com');
define('SMTP_PORT', 465);
define('SMTP_USER', 'admin@oceansoftwares.com');          // Your Gmail address
define('SMTP_PASS', 'gncg digq kdnl esnw');          // Your 16-digit Google App Password
define('SMTP_FROM_NAME', 'Ocean Softwares');   // Sender Name
define('NOTIFICATION_EMAIL', 'prabhakar.s@highresolutiontech.com');

// Local Storage Path
define('DATA_FILE', __DIR__ . '/submissions.json');

// -----------------------------------------------------------------------------
// 2. HTTP HEADERS & CORS
// -----------------------------------------------------------------------------
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Reject non-POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Method Not Allowed. Only POST requests are accepted.'
    ]);
    exit;
}

// -----------------------------------------------------------------------------
// 3. PARSE & SANITIZE REQUEST DATA
// -----------------------------------------------------------------------------
$rawInput = file_get_contents('php://input');
if (empty($rawInput) && php_sapi_name() === 'cli') {
    $rawInput = file_get_contents('php://stdin');
}
$parsedData = [];

// Determine whether payload is raw JSON or FormData
$contentType = isset($_SERVER['CONTENT_TYPE']) ? trim($_SERVER['CONTENT_TYPE']) : '';
if (stripos($contentType, 'application/json') !== false || (!empty($rawInput) && $rawInput[0] === '{')) {
    $decoded = json_decode($rawInput, true);
    if (is_array($decoded)) {
        $parsedData = $decoded;
    }
}

// Fallback / merge with standard $_POST
if (empty($parsedData) && !empty($_POST)) {
    $parsedData = $_POST;
}

// Honeypot anti-spam check (if bot filled hidden field)
if (!empty($parsedData['website']) || !empty($parsedData['bot_check'])) {
    // Pretend success to fool bots
    echo json_encode(['status' => 'success', 'message' => 'Enquiry submitted successfully.']);
    exit;
}

// Helper to sanitize text
function clean_input($val) {
    if ($val === null) return '';
    return htmlspecialchars(trim((string)$val), ENT_QUOTES, 'UTF-8');
}

// Field Extraction (supports product modal & contact form)
$productName    = clean_input($parsedData['product_name'] ?? $parsedData['product'] ?? $parsedData['item'] ?? $parsedData['subject'] ?? 'General Enquiry');
$firstName      = clean_input($parsedData['first_name'] ?? '');
$lastName       = clean_input($parsedData['last_name'] ?? '');
$fullName       = trim($firstName . ' ' . $lastName);
if (empty($fullName)) {
    $fullName   = clean_input($parsedData['name'] ?? $parsedData['full_name'] ?? '');
    if (!empty($fullName)) {
        $parts      = explode(' ', $fullName, 2);
        $firstName  = $parts[0];
        $lastName   = $parts[1] ?? '';
    }
}
$phone          = clean_input($parsedData['phone'] ?? $parsedData['mobile'] ?? '');
$email          = clean_input($parsedData['email'] ?? '');
$requirement    = clean_input($parsedData['requirement'] ?? $parsedData['message'] ?? $parsedData['comments'] ?? $parsedData['enquiry'] ?? '');

// -----------------------------------------------------------------------------
// 4. VALIDATION
// -----------------------------------------------------------------------------
$errors = [];

if (empty($firstName) && empty($fullName)) {
    $errors['first_name'] = 'First Name is required (minimum 2 characters).';
} elseif (mb_strlen($firstName ?: $fullName) < 2) {
    $errors['first_name'] = 'Name must be at least 2 characters.';
}

// Clean phone digits
$cleanPhone = preg_replace('/[^0-9]/', '', $phone);
if (empty($cleanPhone) || strlen($cleanPhone) < 10) {
    $errors['phone'] = 'A valid 10-digit mobile number is required.';
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'A valid email address is required.';
}

if (empty($requirement)) {
    $errors['requirement'] = 'Please enter your enquiry or requirement.';
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Please fill in all required fields correctly.',
        'errors'  => $errors
    ]);
    exit;
}

// -----------------------------------------------------------------------------
// 5. PREPARE SUBMISSION RECORD (WITH IST TIMESTAMP)
// -----------------------------------------------------------------------------
$submissionId = 'SUB-' . date('Ymd-His') . '-' . strtoupper(substr(bin2hex(random_bytes(2)), 0, 4));
$istTimestamp = date('Y-m-d H:i:s T'); // e.g. 2026-10-27 17:55:00 IST
$ipAddress    = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'Unknown';

$submissionRecord = [
    'date'         => date('d-M-Y'),
    'time'         => date('h:i:s A'),
    'product_name' => $productName,
    'first_name'   => $firstName,
    'last_name'    => $lastName,
    'name'         => $fullName,
    'phone'        => $phone,
    'email'        => $email,
    'requirement'  => $requirement
];

// -----------------------------------------------------------------------------
// 6. SAVE TO SUBMISSIONS.JSON (WITH ATOMIC FILE LOCKING)
// -----------------------------------------------------------------------------
try {
    saveRecordToJson(DATA_FILE, $submissionRecord);
} catch (Exception $e) {
    error_log("Failed to save submission to JSON: " . $e->getMessage());
    // Continue execution to still attempt sending email
}

function saveRecordToJson($filePath, $record) {
    // Open file in c+ mode (creates file if not exists, allows read & write, pointer at beginning)
    $fp = fopen($filePath, 'c+');
    if (!$fp) {
        throw new Exception("Unable to open data storage file: " . $filePath);
    }

    // Acquire an exclusive lock (wait if another process is writing)
    if (!flock($fp, LOCK_EX)) {
        fclose($fp);
        throw new Exception("Could not acquire exclusive file lock.");
    }

    $existingData = [];
    clearstatcache(true, $filePath);
    $fileSize = filesize($filePath);

    if ($fileSize > 0) {
        $content = fread($fp, $fileSize);
        $decoded = json_decode($content, true);
        if (is_array($decoded)) {
            $existingData = $decoded;
        }
    }

    // Append new submission
    $existingData[] = $record;

    // Truncate file, rewind and write updated array
    ftruncate($fp, 0);
    rewind($fp);
    $jsonOutput = json_encode($existingData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    fwrite($fp, $jsonOutput);
    fflush($fp);

    // Release lock & close handle
    flock($fp, LOCK_UN);
    fclose($fp);

    return true;
}

// -----------------------------------------------------------------------------
// 7. BUILD LUXURY HTML EMAIL NOTIFICATION TEMPLATE
// -----------------------------------------------------------------------------
$emailSubject = "New Product Enquiry: " . $productName . " - " . $fullName;

$htmlMessage = '
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <title>New Product Enquiry</title>
  <style type="text/css">
    /* Reset styles */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; }
    
    /* Mobile Responsive Rules */
    @media only screen and (max-width: 600px) {
      .email-card {
        width: 100% !important;
        max-width: 100% !important;
        border-radius: 8px !important;
      }
      .header-cell {
        padding: 24px 16px !important;
      }
      .header-title {
        font-size: 19px !important;
      }
      .action-bar-cell {
        padding: 12px 14px !important;
      }
      .action-btn {
        display: block !important;
        width: 100% !important;
        margin: 0 0 10px 0 !important;
        box-sizing: border-box !important;
        text-align: center !important;
        padding: 12px 14px !important;
        font-size: 14px !important;
      }
      .action-btn-last {
        margin-bottom: 0 !important;
      }
      .content-cell {
        padding: 20px 14px !important;
      }
      .data-table td {
        padding: 10px 4px !important;
      }
      .label-col {
        width: 38% !important;
        font-size: 12px !important;
      }
      .value-col {
        width: 62% !important;
        font-size: 13px !important;
      }
      .break-text {
        word-break: break-word !important;
        overflow-wrap: break-word !important;
      }
      .footer-cell {
        padding: 18px 14px !important;
        font-size: 11px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 18px 8px; background-color: #0b1120; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; color: #334155;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" class="email-card" width="580" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; width: 100%; background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 15px 35px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1);">
          
          <!-- Header Banner -->
          <tr>
            <td class="header-cell" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px 24px; text-align: center; border-bottom: 3px solid #0099ff;">
              <div style="font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #38bdf8; margin-bottom: 8px;">
                ' . htmlspecialchars(PROJECT_NAME) . ' &bull; Lead Alert
              </div>
              <h1 class="header-title" style="margin: 0; font-size: 21px; font-weight: 700; color: #f8fafc; letter-spacing: -0.3px; line-height: 1.3;">
                New Product Enquiry Received
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #94a3b8;">
                Submitted on ' . htmlspecialchars($istTimestamp) . '
              </p>
            </td>
          </tr>

          <!-- Quick Action Bar (Mobile-friendly Stackable Buttons) -->
          <tr>
            <td class="action-bar-cell" style="padding: 14px 20px; background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0; text-align: center;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="tel:' . urlencode($cleanPhone) . '" class="action-btn" style="display: inline-block; background-color: #16a34a; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; margin: 4px; box-sizing: border-box;">
                      &#9742; Call Client (' . htmlspecialchars($phone) . ')
                    </a>
                    <a href="mailto:' . htmlspecialchars($email) . '" class="action-btn action-btn-last" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; margin: 4px; box-sizing: border-box;">
                      &#9993; Reply via Email
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td class="content-cell" style="padding: 24px 22px;">
              <table role="presentation" class="data-table" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; width: 100%;">
                <tr>
                  <td colspan="2" style="padding-bottom: 12px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; border-bottom: 2px solid #e2e8f0;">
                    Lead Details
                  </td>
                </tr>

                <tr class="data-row">
                  <td class="label-col" style="padding: 12px 6px; width: 38%; font-size: 13px; font-weight: 600; color: #475569; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                    Lead ID
                  </td>
                  <td class="value-col break-text" style="padding: 12px 6px; width: 62%; font-size: 13px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #f1f5f9; font-family: monospace; word-break: break-all;">
                    ' . htmlspecialchars($submissionId) . '
                  </td>
                </tr>

                <tr class="data-row">
                  <td class="label-col" style="padding: 12px 6px; width: 38%; font-size: 13px; font-weight: 600; color: #475569; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                    Selected Item
                  </td>
                  <td class="value-col break-text" style="padding: 12px 6px; width: 62%; font-size: 13px; font-weight: 700; color: #0284c7; border-bottom: 1px solid #f1f5f9;">
                    <span style="display: inline-block; background-color: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 4px; font-weight: 700; font-size: 12px; line-height: 1.4; word-break: break-word;">' . htmlspecialchars($productName) . '</span>
                  </td>
                </tr>

                <tr class="data-row">
                  <td class="label-col" style="padding: 12px 6px; width: 38%; font-size: 13px; font-weight: 600; color: #475569; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                    First Name
                  </td>
                  <td class="value-col break-text" style="padding: 12px 6px; width: 62%; font-size: 13px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #f1f5f9;">
                    ' . htmlspecialchars($firstName ?: 'N/A') . '
                  </td>
                </tr>

                <tr class="data-row">
                  <td class="label-col" style="padding: 12px 6px; width: 38%; font-size: 13px; font-weight: 600; color: #475569; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                    Last Name
                  </td>
                  <td class="value-col break-text" style="padding: 12px 6px; width: 62%; font-size: 13px; color: #334155; border-bottom: 1px solid #f1f5f9;">
                    ' . htmlspecialchars($lastName ?: '-') . '
                  </td>
                </tr>

                <tr class="data-row">
                  <td class="label-col" style="padding: 12px 6px; width: 38%; font-size: 13px; font-weight: 600; color: #475569; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                    Email Address
                  </td>
                  <td class="value-col break-text" style="padding: 12px 6px; width: 62%; font-size: 13px; color: #2563eb; border-bottom: 1px solid #f1f5f9; word-break: break-all;">
                    <a href="mailto:' . htmlspecialchars($email) . '" style="color: #2563eb; text-decoration: none; word-break: break-all;">' . htmlspecialchars($email) . '</a>
                  </td>
                </tr>

                <tr class="data-row">
                  <td class="label-col" style="padding: 12px 6px; width: 38%; font-size: 13px; font-weight: 600; color: #475569; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                    Phone Number
                  </td>
                  <td class="value-col break-text" style="padding: 12px 6px; width: 62%; font-size: 13px; font-weight: 600; color: #2563eb; border-bottom: 1px solid #f1f5f9;">
                    <a href="tel:' . urlencode($cleanPhone) . '" style="color: #2563eb; text-decoration: none;">' . htmlspecialchars($phone) . '</a>
                  </td>
                </tr>

                <tr>
                  <td colspan="2" style="padding-top: 18px; padding-bottom: 6px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #64748b;">
                    Enquiry / Requirements:
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 14px 16px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #0099ff; font-size: 13px; line-height: 1.6; color: #1e293b; word-break: break-word;">
                    ' . nl2br(htmlspecialchars($requirement ?: 'No additional notes provided.')) . '
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer-cell" style="padding: 18px 20px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.5;">
              This notification was generated automatically by <strong>' . htmlspecialchars(PROJECT_NAME) . '</strong>.<br/>
              Timestamp: ' . htmlspecialchars($istTimestamp) . '
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
';

// -----------------------------------------------------------------------------
// 8. DIRECT GMAIL SMTP SOCKET CLIENT (NO THIRD-PARTY LIBRARIES)
// -----------------------------------------------------------------------------
$mailResult = ['success' => false, 'error' => ''];

// If credentials are placeholder values, don't attempt connection
if (SMTP_USER === 'your-email@gmail.com' || strpos(SMTP_PASS, 'xxxx') !== false) {
    // Graceful notice: submission saved to JSON, but mail credentials not yet configured
    echo json_encode([
        'status'  => 'success',
        'message' => 'Thank you! Your enquiry has been received successfully.',
        'notice'  => 'Data saved to submissions.json. Configure your Gmail App Password in send-mail.php to enable instant email alerts.',
        'id'      => $submissionId
    ]);
    exit;
}

$mailResult = sendDirectGmailSmtp(
    NOTIFICATION_EMAIL,
    $emailSubject,
    $htmlMessage,
    $email,
    $fullName
);

if ($mailResult['success']) {
    echo json_encode([
        'status'  => 'success',
        'message' => 'Thank you! Your enquiry has been received and our team has been notified.',
        'id'      => $submissionId
    ]);
} else {
    // The data is safely saved in submissions.json, report success to user but log email error
    error_log("Direct SMTP Error: " . $mailResult['error']);
    echo json_encode([
        'status'  => 'success',
        'message' => 'Thank you! Your enquiry has been recorded successfully.',
        'debug'   => 'Email alert could not be sent: ' . $mailResult['error'],
        'id'      => $submissionId
    ]);
}
exit;


/**
 * Sends an email directly via Gmail SMTP SSL socket connection (Port 465).
 * Follows RFC 5321 with multi-line response handling and UTF-8 Base64 encoding.
 */
function sendDirectGmailSmtp($toEmail, $subject, $htmlBody, $replyToEmail = '', $replyToName = '') {
    $timeout = 15; // 15 seconds connection timeout
    
    // SSL Stream Context Options
    $context = stream_context_create([
        'ssl' => [
            'verify_peer'       => false,
            'verify_peer_name'  => false,
            'allow_self_signed' => true
        ]
    ]);

    $socket = @stream_socket_client(
        SMTP_HOST . ':' . SMTP_PORT,
        $errno,
        $errstr,
        $timeout,
        STREAM_CLIENT_CONNECT,
        $context
    );

    if (!$socket) {
        return ['success' => false, 'error' => "Socket connection failed: $errstr ($errno)"];
    }

    stream_set_timeout($socket, $timeout);

    // Read initial 220 banner
    $res = readSmtpResponse($socket);
    if (!checkSmtpCode($res, '220')) {
        fclose($socket);
        return ['success' => false, 'error' => "Unexpected banner: $res"];
    }

    // EHLO
    sendSmtpCommand($socket, "EHLO " . ($_SERVER['SERVER_NAME'] ?? 'localhost'));
    $res = readSmtpResponse($socket);
    if (!checkSmtpCode($res, '250')) {
        fclose($socket);
        return ['success' => false, 'error' => "EHLO failed: $res"];
    }

    // AUTH LOGIN
    sendSmtpCommand($socket, "AUTH LOGIN");
    $res = readSmtpResponse($socket);
    if (!checkSmtpCode($res, '334')) {
        fclose($socket);
        return ['success' => false, 'error' => "AUTH LOGIN rejected: $res"];
    }

    // Username (Base64)
    sendSmtpCommand($socket, base64_encode(SMTP_USER));
    $res = readSmtpResponse($socket);
    if (!checkSmtpCode($res, '334')) {
        fclose($socket);
        return ['success' => false, 'error' => "Username rejected: $res"];
    }

    // Password (Base64) - stripped of spaces
    $cleanPass = str_replace(' ', '', SMTP_PASS);
    sendSmtpCommand($socket, base64_encode($cleanPass));
    $res = readSmtpResponse($socket);
    if (!checkSmtpCode($res, '235')) {
        fclose($socket);
        return ['success' => false, 'error' => "Authentication failed. Check your Gmail App Password: $res"];
    }

    // MAIL FROM
    sendSmtpCommand($socket, "MAIL FROM:<" . SMTP_USER . ">");
    $res = readSmtpResponse($socket);
    if (!checkSmtpCode($res, '250')) {
        fclose($socket);
        return ['success' => false, 'error' => "MAIL FROM rejected: $res"];
    }

    // RCPT TO
    sendSmtpCommand($socket, "RCPT TO:<$toEmail>");
    $res = readSmtpResponse($socket);
    if (!checkSmtpCode($res, '250')) {
        fclose($socket);
        return ['success' => false, 'error' => "RCPT TO rejected: $res"];
    }

    // DATA
    sendSmtpCommand($socket, "DATA");
    $res = readSmtpResponse($socket);
    if (!checkSmtpCode($res, '354')) {
        fclose($socket);
        return ['success' => false, 'error' => "DATA rejected: $res"];
    }

    // Prepare MIME Headers
    $encodedSubject = "=?UTF-8?B?" . base64_encode($subject) . "?=";
    $encodedFromName = "=?UTF-8?B?" . base64_encode(SMTP_FROM_NAME) . "?=";
    
    $headers = [];
    $headers[] = "From: $encodedFromName <" . SMTP_USER . ">";
    $headers[] = "To: <$toEmail>";
    if (!empty($replyToEmail)) {
        $replyName = !empty($replyToName) ? "=?UTF-8?B?" . base64_encode($replyToName) . "?=" : '';
        $headers[] = "Reply-To: $replyName <$replyToEmail>";
    }
    $headers[] = "Subject: $encodedSubject";
    $headers[] = "Date: " . date('r');
    $headers[] = "Message-ID: <" . md5(uniqid(microtime(), true)) . "@" . ($_SERVER['SERVER_NAME'] ?? 'localhost') . ">";
    $headers[] = "MIME-Version: 1.0";
    $headers[] = "Content-Type: text/html; charset=UTF-8";
    $headers[] = "Content-Transfer-Encoding: base64";
    $headers[] = "X-Mailer: PHP-Socket-SMTP/1.0";

    // Split base64 body into 76-character chunks (RFC compliant)
    $encodedBody = chunk_split(base64_encode($htmlBody));

    // Combine headers and body
    $emailData = implode("\r\n", $headers) . "\r\n\r\n" . $encodedBody . "\r\n.\r\n";

    // Send complete message
    fwrite($socket, $emailData);
    $res = readSmtpResponse($socket);
    if (!checkSmtpCode($res, '250')) {
        fclose($socket);
        return ['success' => false, 'error' => "Failed to deliver message: $res"];
    }

    // QUIT
    sendSmtpCommand($socket, "QUIT");
    readSmtpResponse($socket);
    fclose($socket);

    return ['success' => true, 'error' => ''];
}

function sendSmtpCommand($socket, $command) {
    fwrite($socket, $command . "\r\n");
}

function readSmtpResponse($socket) {
    $response = '';
    while (!feof($socket)) {
        $line = fgets($socket, 512);
        if ($line === false) break;
        $response .= $line;
        // RFC 5321: multiline responses have a hyphen at pos 3 (e.g. '250-'), last line has space '250 '
        if (isset($line[3]) && $line[3] === ' ') {
            break;
        }
    }
    return $response;
}

function checkSmtpCode($response, $expectedCode) {
    return (substr(trim($response), 0, strlen($expectedCode)) === $expectedCode);
}
