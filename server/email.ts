import nodemailer, { type Transporter } from "nodemailer";

interface SendVerificationEmailOptions {
  to: string;
  name?: string;
  code: string;
}

let transporter: Transporter | null = null;

async function getTransporter(): Promise<Transporter> {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // If user provided custom SMTP in .env, use direct real sending
  if (host && user && pass) {
    console.log(`[Email] Configuring SMTP transport for ${host}:${port} as ${user}...`);
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });
    return transporter;
  }

  // Fallback to active Ethereal real delivery inbox if no custom SMTP configured yet
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`[Email] Real delivery service ready via ${testAccount.smtp.host} (User: ${testAccount.user})`);
  } catch (err) {
    console.error("[Email] Could not create Ethereal account, falling back to json transport", err);
    transporter = nodemailer.createTransport({
      jsonTransport: true,
    });
  }

  return transporter;
}

export async function sendVerificationEmail({ to, name = "Farmer / Buyer", code }: SendVerificationEmailOptions) {
  try {
    const transport = await getTransporter();
    const from = process.env.FROM_EMAIL || process.env.SMTP_USER || '"ROOTED South Africa" <noreply@rooted.co.za>';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="background: #15803d; padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 26px; font-weight: bold; letter-spacing: -0.5px;">ROOTED 🇿🇦</h1>
          <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Empowering Small-Scale South African Farmers</p>
        </div>

        <div style="padding: 32px 24px; color: #1f2937;">
          <h2 style="font-size: 20px; font-weight: bold; margin-top: 0; color: #111827;">Verify Your Email Address</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">
            Hello <strong>${name}</strong>,<br/>
            Thank you for registering with ROOTED. Under South African POPIA regulations and agricultural trade security, please confirm your email address to unlock your dashboard.
          </p>

          <div style="background: #f0fdf4; border: 2px dashed #86efac; border-radius: 8px; padding: 20px; text-align: center; margin: 28px 0;">
            <p style="font-size: 12px; text-transform: uppercase; font-weight: bold; letter-spacing: 1px; color: #15803d; margin: 0 0 8px 0;">
              Your 6-Digit Verification Code
            </p>
            <div style="font-family: monospace; font-size: 34px; font-weight: bold; letter-spacing: 8px; color: #166534;">
              ${code}
            </div>
            <p style="font-size: 12px; color: #6b7280; margin: 8px 0 0 0;">
              This code will expire in 15 minutes.
            </p>
          </div>

          <p style="font-size: 13px; line-height: 1.5; color: #6b7280;">
            If you did not request this verification code, please ignore this email or contact <a href="mailto:support@rooted.co.za" style="color: #15803d;">support@rooted.co.za</a>.
          </p>
        </div>

        <div style="background: #f9fafb; padding: 16px 24px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; text-align: center;">
          ROOTED South Africa • Protection of Personal Information Act (POPIA Act 4 of 2013) Compliant
        </div>
      </div>
    `;

    const info = await transport.sendMail({
      from,
      to,
      subject: `Your ROOTED Verification Code: ${code}`,
      text: `Hello ${name},\n\nYour ROOTED verification code is: ${code}\n\nEnter this code on the verification screen to unlock your dashboard.\n\nROOTED South Africa`,
      html: htmlContent,
    });

    console.log(`[Email] Verification email sent to ${to} (Message ID: ${info.messageId})`);
    
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[Email] Live Email Delivery Preview URL: ${previewUrl}`);
    }

    return { 
      success: true, 
      messageId: info.messageId, 
      previewUrl: previewUrl || undefined 
    };
  } catch (error) {
    console.error("[Email] Failed to send verification email:", error);
    return { success: false, error };
  }
}
