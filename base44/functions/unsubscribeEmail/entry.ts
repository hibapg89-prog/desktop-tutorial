import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const uid: string | undefined = body.uid;

    if (!uid || typeof uid !== 'string') {
      return Response.json({ error: 'Missing uid' }, { status: 400 });
    }

    await base44.asServiceRole.entities.User.update(uid, { price_emails_opted_in: false });

    return Response.json({ ok: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
