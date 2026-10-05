import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json().catch(() => ({}));
    const { recipient_id, sender_id } = payload;
    const messageText = payload.body || '';

    if (!recipient_id || !sender_id) return Response.json({ ok: false, reason: 'missing recipient or sender' });
    if (recipient_id === sender_id) return Response.json({ ok: true, skipped: 'self' });

    const [recipient, sender] = await Promise.all([
      base44.asServiceRole.entities.User.get(recipient_id).catch(() => null),
      base44.asServiceRole.entities.User.get(sender_id).catch(() => null),
    ]);
    if (!recipient) return Response.json({ ok: false, reason: 'recipient not found' });

    const senderName = sender?.full_name || sender?.email || 'A Muse member';
    const preview = messageText.slice(0, 140);
    const title = `New message from ${senderName}`;

    await base44.asServiceRole.entities.Notification.create({ user_id: recipient_id, type: 'message', title, body: preview || 'You have a new message', sender_id, read: false });

    if (recipient.email) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({ to: recipient.email, subject: title, body: `${senderName} sent you a message on LuxeBeauty:\n\n"${preview}"\n\nOpen the app to reply.` });
      } catch {}
    }
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}