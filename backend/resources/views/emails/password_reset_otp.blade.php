<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset OTP</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f4f6f0;
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #1b3b2b;
            line-height: 1.6;
        }
        .email-container {
            max-width: 540px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
            border: 1px solid #e5e9e2;
        }
        .email-header {
            background-color: #1b3b2b;
            padding: 32px 24px;
            text-align: center;
        }
        .brand-title {
            color: #ffffff;
            font-size: 24px;
            font-weight: 800;
            margin: 0;
            letter-spacing: 0.5px;
        }
        .brand-subtitle {
            color: #a3c293;
            font-size: 13px;
            margin: 6px 0 0 0;
            text-transform: uppercase;
            letter-spacing: 1.5px;
        }
        .email-body {
            padding: 36px 32px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 700;
            color: #1b3b2b;
            margin-top: 0;
            margin-bottom: 14px;
        }
        .instruction {
            font-size: 15px;
            color: #4a5d4e;
            margin-bottom: 24px;
        }
        .otp-box {
            background: linear-gradient(135deg, #f1f6ee 0%, #e8f0e4 100%);
            border: 2px dashed #a3c293;
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            margin: 28px 0;
        }
        .otp-label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #5c755f;
            font-weight: 700;
            margin-bottom: 8px;
        }
        .otp-code {
            font-size: 36px;
            font-weight: 800;
            letter-spacing: 8px;
            color: #1b3b2b;
            margin: 0;
            font-family: 'JetBrains Mono', 'Courier New', Courier, monospace;
        }
        .expiry-badge {
            display: inline-block;
            margin-top: 10px;
            font-size: 12px;
            color: #c0392b;
            font-weight: 600;
            background-color: #fde8e7;
            padding: 4px 12px;
            border-radius: 20px;
        }
        .security-notice {
            background-color: #fafbfc;
            border-left: 4px solid #1b3b2b;
            padding: 14px 16px;
            border-radius: 6px;
            font-size: 13px;
            color: #5a6e5d;
            margin-top: 24px;
        }
        .email-footer {
            background-color: #f9fbf8;
            padding: 24px;
            text-align: center;
            border-top: 1px solid #eef2ec;
            font-size: 12px;
            color: #839785;
        }
        .footer-note {
            margin: 0 0 6px 0;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1 class="brand-title">Mangalam</h1>
            <p class="brand-subtitle">Healthy Foods & Traditional Wellness</p>
        </div>
        
        <div class="email-body">
            <h2 class="greeting">Hello {{ $userName }},</h2>
            <p class="instruction">
                We received a request to reset the password for your Mangalam account. Use the verification code below to proceed with creating your new password.
            </p>

            <div class="otp-box">
                <div class="otp-label">Verification Code (OTP)</div>
                <div class="otp-code">{{ $otp }}</div>
                <div class="expiry-badge">⏱ Valid for 5 minutes only</div>
            </div>

            <div class="security-notice">
                <strong>🔒 Security Notice:</strong> If you did not request a password reset, please ignore this email or reach out to our team immediately. Your password will remain unchanged.
            </div>
        </div>

        <div class="email-footer">
            <p class="footer-note">© {{ date('Y') }} Mangalam Healthy Foods. Sethiyathope, Cuddalore, Tamil Nadu.</p>
            <p class="footer-note" style="margin: 0;">Automated message — please do not reply directly to this email.</p>
        </div>
    </div>
</body>
</html>
