import sgMail from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn('SENDGRID_API_KEY is not set');
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const FROM_EMAIL = process.env.EMAIL_FROM || 'Saleor Marketplace <info@salp.shop>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://partner.salp.shop';

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
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h1 style="color: #c44d32; font-family: serif;">Welcome, ${name}!</h1>
        <p>Your vendor application has been approved. We're excited to have you on board.</p>
        <p>To get started, please set up your account password by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${setupUrl}" style="background-color: #c44d32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Set Up Password</a>
        </div>
        <p>This link will expire in 24 hours.</p>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${setupUrl}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #999;">If you didn't expect this invitation, you can safely ignore this email.</p>
      </div>
    `,
    trackingSettings: {
      clickTracking: {
        enable: false,
        enableText: false,
      },
    },
  };

  try {
    await sgMail.send(msg as any);
  } catch (error) {
    console.error('Error sending invite email:', error);
    // Don't throw, just log, so process completes
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
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h1 style="color: #c44d32; font-family: serif;">Password Reset Request</h1>
        <p>You requested a password reset for your Saleor Marketplace account.</p>
        <p>Please click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #c44d32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #999;">Saleor Marketplace Security</p>
      </div>
    `,
    trackingSettings: {
      clickTracking: {
        enable: false,
        enableText: false,
      },
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
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h1 style="color: #c44d32; font-family: serif;">Application Update</h1>
        <p>Dear ${brandName},</p>
        <p>Thank you for your interest in becoming a vendor on our marketplace.</p>
        <p>After careful review, we regret to inform you that your application has not been approved at this time.</p>
        <p>For more information about this decision, please contact us at <a href="mailto:info@salp.shop">info@salp.shop</a>.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #999;">Saleor Marketplace Team</p>
      </div>
    `,
    trackingSettings: {
      clickTracking: {
        enable: false,
        enableText: false,
      },
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
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h1 style="color: #c44d32; font-family: serif;">Application Received</h1>
        <p>Dear ${brandName},</p>
        <p>Thank you for submitting your application to join the Saleor Marketplace.</p>
        <p>We have received your details and our team will review them shortly. You can expect to hear from us within 2-3 business days.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #999;">Saleor Marketplace Team</p>
      </div>
    `,
    trackingSettings: {
      clickTracking: {
        enable: false,
        enableText: false,
      },
    },
  };

  try {
    await sgMail.send(msg as any);
  } catch (error) {
    console.error('Error sending application received email:', error);
  }
}
