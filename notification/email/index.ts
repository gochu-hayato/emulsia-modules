import { defineSecret } from 'firebase-functions/params';
import { Resend } from 'resend';
import type { SendEmailParams } from './types';

export type { SendEmailParams } from './types';
export { inviteEmailTemplate } from './templates/invite';
export { notificationEmailTemplate } from './templates/notification';

export const resendApiKeySecret = defineSecret('RESEND_API_KEY');

const DEFAULT_FROM = 'noreply@emulsia.jp';

export async function sendEmail(params: SendEmailParams): Promise<void> {
  const apiKey = resendApiKeySecret.value();

  if (!apiKey) {
    throw new Error(
      'RESEND_API_KEY が設定されていません。Cloud Functions のシークレット設定を確認してください。',
    );
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: params.from ?? DEFAULT_FROM,
    to: params.to,
    subject: params.subject,
    html: params.html,
  });

  if (error) {
    throw new Error(`メール送信に失敗しました: ${error.message}`);
  }
}
