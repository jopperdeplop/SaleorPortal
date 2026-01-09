import sgMail from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn('SENDGRID_API_KEY is not set');
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const FROM_EMAIL = process.env.EMAIL_FROM || 'Saleor Marketplace <info@salp.shop>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://partner.salp.shop';

// Reusable email styling components
const STYLES = {
  container: 'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; color: #1f2937;',
  card: 'padding: 32px; border: 1px solid #e5e7eb; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);',
  h1: 'color: #111827; font-size: 24px; font-weight: 800; margin-bottom: 16px; letter-spacing: -0.025em;',
  p: 'color: #4b5563; font-size: 16px; line-height: 24px; margin-bottom: 24px;',
  button: 'display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);',
  footer: 'margin-top: 32px; padding-top: 24px; border-top: 1px solid #f3f4f6; color: #9ca3af; font-size: 13px;',
  link: 'color: #4f46e5; text-decoration: underline;'
};

export async function sendInviteEmail(email: string, name: string, token: string) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SENDGRID_API_KEY missing, skipping sendInviteEmail');
    return;
  }
  const setupUrl = `${APP_URL}/setup-password?token=${token}`;

  const msg = {
    to: email,
    from: FROM_EMAIL,
    subject: 'Welcome to the Saleor Marketplace!',
    html: `
      <div style="${STYLES.container}">
        <div style="${STYLES.card}">
          <h1 style="${STYLES.h1}">Welcome, ${name}!</h1>
          <p style="${STYLES.p}">Your vendor application has been approved. We're excited to have you on board the Saleor Marketplace.</p>
          <p style="${STYLES.p}">To get started, please set up your account password by clicking the button below:</p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${setupUrl}" style="${STYLES.button}">Set Up Password</a>
          </div>
          <p style="${STYLES.p}">This link will expire in 24 hours.</p>
          <p style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">If the button doesn't work, copy and paste this link:</p>
          <p style="word-break: break-all; font-size: 13px; color: #4f46e5;">${setupUrl}</p>
          <div style="${STYLES.footer}">
            <p>If you didn't expect this invitation, you can safely ignore this email.</p>
            <p style="margin-top: 8px; font-weight: 600;">Saleor Marketplace Team</p>
          </div>
        </div>
      </div>
    `,
    trackingSettings: {
      clickTracking: { enable: false, enableText: false },
    },
  };

  try {
    console.log(`Attempting to send invite email to: ${email}`);
    const response = await sgMail.send(msg as any);
    console.log(`Invite email sent successfully to ${email}. Response status:`, response[0].statusCode);
  } catch (error) {
    console.error(`Error sending invite email to ${email}:`, error);
    if (error && typeof error === 'object' && 'response' in error) {
        const sgError = error as any;
        console.error('SendGrid Error Body:', JSON.stringify(sgError.response.body, null, 2));
    }
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SENDGRID_API_KEY missing, skipping sendPasswordResetEmail');
    return;
  }
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  const msg = {
    to: email,
    from: FROM_EMAIL,
    subject: 'Reset your password',
    html: `
      <div style="${STYLES.container}">
        <div style="${STYLES.card}">
          <h1 style="${STYLES.h1}">Password Reset Request</h1>
          <p style="${STYLES.p}">You requested a password reset for your Saleor Marketplace account.</p>
          <p style="${STYLES.p}">Please click the button below to set a new password:</p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${resetUrl}" style="${STYLES.button}">Reset Password</a>
          </div>
          <p style="${STYLES.p}">This link will expire in 1 hour.</p>
          <div style="${STYLES.footer}">
            <p>If you didn't request this, you can safely ignore this email.</p>
            <p style="margin-top: 8px; font-weight: 600;">Saleor Marketplace Security</p>
          </div>
        </div>
      </div>
    `,
    trackingSettings: {
      clickTracking: { enable: false, enableText: false },
    },
  };

  try {
    await sgMail.send(msg as any);
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
}

export async function sendRejectionEmail(email: string, brandName: string) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SENDGRID_API_KEY missing, skipping sendRejectionEmail');
    return;
  }
  const msg = {
    to: email,
    from: FROM_EMAIL,
    subject: 'Application Update - Saleor Marketplace',
    html: `
      <div style="${STYLES.container}">
        <div style="${STYLES.card}">
          <h1 style="${STYLES.h1}">Application Update</h1>
          <p style="${STYLES.p}">Dear ${brandName},</p>
          <p style="${STYLES.p}">Thank you for your interest in becoming a vendor on our marketplace.</p>
          <p style="${STYLES.p}">After careful review, we regret to inform you that your application has not been approved at this time.</p>
          <p style="${STYLES.p}">For more information about this decision, please contact us at <a href="mailto:info@salp.shop" style="${STYLES.link}">info@salp.shop</a>.</p>
          <div style="${STYLES.footer}">
            <p>Saleor Marketplace Team</p>
          </div>
        </div>
      </div>
    `,
    trackingSettings: {
      clickTracking: { enable: false, enableText: false },
    },
  };

  try {
    await sgMail.send(msg as any);
  } catch (error) {
    console.error('Error sending rejection email:', error);
  }
}

export async function sendApplicationReceivedEmail(email: string, brandName: string) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SENDGRID_API_KEY missing, skipping sendApplicationReceivedEmail');
    return;
  }
  const msg = {
    to: email,
    from: FROM_EMAIL,
    subject: 'Application Received - Saleor Marketplace',
    html: `
      <div style="${STYLES.container}">
        <div style="${STYLES.card}">
          <h1 style="${STYLES.h1}">Application Received</h1>
          <p style="${STYLES.p}">Dear ${brandName},</p>
          <p style="${STYLES.p}">Thank you for submitting your application to join the Saleor Marketplace.</p>
          <p style="${STYLES.p}">We have received your details and our team will review them shortly. You can expect to hear from us within 2-3 business days.</p>
          <div style="${STYLES.footer}">
            <p>Saleor Marketplace Team</p>
          </div>
        </div>
      </div>
    `,
    trackingSettings: {
      clickTracking: { enable: false, enableText: false },
    },
  };

  try {
    console.log(`Attempting to send application received email to: ${email}`);
    const response = await sgMail.send(msg as any);
    console.log(`Application received email sent successfully to ${email}. Response status:`, response[0].statusCode);
  } catch (error) {
    console.error(`Error sending application received email to ${email}:`, error);
    if (error && typeof error === 'object' && 'response' in error) {
        const sgError = error as any;
        console.error('SendGrid Error Body:', JSON.stringify(sgError.response.body, null, 2));
    }
  }
}
