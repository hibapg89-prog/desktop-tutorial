import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const BATCH = 200;

async function purge(entity: any, field: string, value: string): Promise<{ d: number; f: number }> {
  let d = 0, f = 0;
  while (true) {
    const rows = await entity.filter({ [field]: value }, '-created_date', BATCH);
    if (!rows?.length) break;
    for (const r of rows) {
      try { await entity.delete(r.id); d++; } catch { f++; }
    }
    if (rows.length < BATCH) break;
  }
  return { d, f };
}

export default async function(req: Request): Promise<Response> {
  const base44 = createClientFromRequest(req);

  let currentUser: any;
  try { currentUser = await base44.auth.me(); } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!currentUser?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (currentUser.role === 'admin') {
    return Response.json({ error: 'Admin accounts cannot be self-deleted via this endpoint.' }, { status: 403 });
  }

  const uid = currentUser.id;
  const sr = base44.asServiceRole.entities;
  const deleted: Record<string, number> = {};
  const failed: Record<string, number> = {};

  const tally = (key: string, r: { d: number; f: number }) => {
    if (r.d > 0) deleted[key] = (deleted[key] || 0) + r.d;
    if (r.f > 0) failed[key]  = (failed[key]  || 0) + r.f;
  };

  try {
    // ScanLog
    tally('ScanLog', await purge(sr.ScanLog, 'created_by_id', uid));
    // Product — skip curator_product:true
    {
      let d = 0, f = 0;
      while (true) {
        const rows = await sr.Product.filter({ created_by_id: uid }, '-created_date', BATCH);
        if (!rows?.length) break;
        let anyDeleted = false;
        for (const r of rows) {
          if (r.curator_product === true) continue;
          try { await sr.Product.delete(r.id); d++; anyDeleted = true; } catch { f++; }
        }
        // If nothing was deleted this pass, all remaining are curator — stop
        if (!anyDeleted) break;
        if (rows.length < BATCH) break;
      }
      tally('Product', { d, f });
    }
    // Review
    tally('Review', await purge(sr.Review, 'created_by_id', uid));
    // ShadePalette
    tally('ShadePalette', await purge(sr.ShadePalette, 'created_by_id', uid));
    // PaletteTemplate
    tally('PaletteTemplate', await purge(sr.PaletteTemplate, 'created_by_id', uid));
    // TryOnLook
    tally('TryOnLook', await purge(sr.TryOnLook, 'created_by_id', uid));
    // Swap
    tally('Swap', await purge(sr.Swap, 'created_by_id', uid));
    // CommunityPost
    tally('CommunityPost', await purge(sr.CommunityPost, 'created_by_id', uid));
    // CirclePost
    tally('CirclePost', await purge(sr.CirclePost, 'created_by_id', uid));
    // CommunityEvent
    tally('CommunityEvent', await purge(sr.CommunityEvent, 'created_by_id', uid));
    // Poll (own polls)
    tally('Poll', await purge(sr.Poll, 'created_by_id', uid));
    // CircleRoom (own rooms)
    tally('CircleRoom_owned', await purge(sr.CircleRoom, 'created_by_id', uid));
    // Message (as sender)
    tally('Message_sent', await purge(sr.Message, 'sender_id', uid));
    // Message (as recipient)
    tally('Message_recv', await purge(sr.Message, 'recipient_id', uid));
    // Notification (received by user)
    tally('Notification_recv', await purge(sr.Notification, 'user_id', uid));
    // Notification (sent by user — appears on other people's records)
    tally('Notification_sent', await purge(sr.Notification, 'sender_id', uid));
    // UserBadge
    tally('UserBadge', await purge(sr.UserBadge, 'user_id', uid));
    // UserStat
    tally('UserStat', await purge(sr.UserStat, 'user_id', uid));
    // UserFollow (who the user follows)
    tally('UserFollow_ing', await purge(sr.UserFollow, 'follower_id', uid));
    // UserFollow (who follows the user)
    tally('UserFollow_ers', await purge(sr.UserFollow, 'followed_id', uid));

    // Remove uid from Poll.voter_ids on other people's polls
    {
      let d = 0, f = 0;
      const polls = await sr.Poll.filter({}, '-created_date', 500);
      for (const poll of (polls || [])) {
        if (!Array.isArray(poll.voter_ids) || !poll.voter_ids.includes(uid)) continue;
        try {
          await sr.Poll.update(poll.id, { voter_ids: poll.voter_ids.filter((id: string) => id !== uid) });
          d++;
        } catch { f++; }
      }
      tally('Poll_voter_ids', { d, f });
    }

    // Remove uid from CircleRoom.member_ids on other people's rooms
    {
      let d = 0, f = 0;
      const rooms = await sr.CircleRoom.filter({}, '-created_date', 500);
      for (const room of (rooms || [])) {
        let members: string[];
        try { members = JSON.parse(room.member_ids || '[]'); } catch { continue; }
        if (!members.includes(uid)) continue;
        try {
          await sr.CircleRoom.update(room.id, { member_ids: JSON.stringify(members.filter((id: string) => id !== uid)) });
          d++;
        } catch { f++; }
      }
      tally('CircleRoom_member_ids', { d, f });
    }

    // Delete User record last
    let userDeleted = true;
    try { await sr.User.delete(uid); } catch { userDeleted = false; }

    const totalFailed = Object.values(failed).reduce((a, b) => a + b, 0) + (userDeleted ? 0 : 1);

    if (totalFailed > 0 || !userDeleted) {
      if (!userDeleted) failed['User'] = 1;
      return Response.json({ ok: false, deleted, failed }, { status: 500 });
    }

    return Response.json({ ok: true, deleted });
  } catch (error: any) {
    return Response.json({ ok: false, error: error?.message, deleted, failed }, { status: 500 });
  }
}
