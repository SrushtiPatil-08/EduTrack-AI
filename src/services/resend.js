export async function sendEmail({ to, subject, html, text }) {
  // TODO: wire to Resend via Supabase edge function in later phase
  return { error: 'Email service not configured yet.' };
}

export async function sendBulkEmails(recipients, template) {
  return { error: 'Email service not configured yet.' };
}

export default { sendEmail, sendBulkEmails };
