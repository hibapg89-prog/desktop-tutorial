import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const UNSPLASH_API = 'https://api.unsplash.com/photos/random';

const STOP_WORDS = new Set(['the', 'a', 'an', 'in', 'for', 'to', 'how', 'your', 'my', 'with', 'by', 'and', 'of', 'get', 'i']);

const TUTORIAL_CAT_TERMS: Record<string, string> = {
  makeup:    'makeup beauty editorial',
  skincare:  'skincare beauty routine',
  hair:      'hair beauty salon editorial',
  wellness:  'wellness spa beauty ritual',
};

const SERVICE_TYPE_TERMS: Record<string, string> = {
  spa:             'luxury spa interior wellness',
  salon:           'beauty salon interior elegant',
  hairdresser:     'hair salon interior luxury',
  'beauty clinic': 'beauty clinic aesthetic interior',
  'nail bar':      'nail salon beauty interior',
  wellness:        'wellness center spa interior',
};

function buildQuery(entityType: string, fields: Record<string, string>): string {
  if (entityType === 'Tutorial') {
    const { title = '', category = '' } = fields;
    const catKey = category.toLowerCase();
    const catTerm = TUTORIAL_CAT_TERMS[catKey] || `${category} beauty`;
    const titleWords = title.toLowerCase().split(/\W+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));
    const titleTerm = titleWords.slice(0, 3).join(' ');
    return `${titleTerm} ${catTerm}`.trim();
  }
  if (entityType === 'VenueService') {
    const { type = '' } = fields;
    return SERVICE_TYPE_TERMS[type.toLowerCase()] || `${type} beauty interior luxury`;
  }
  return 'beauty luxury editorial';
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { entity_type, entity_id, ...fields } = body || {};

    if (!entity_type || !entity_id) {
      return Response.json({ error: 'entity_type and entity_id are required' }, { status: 400 });
    }

    const accessKey = Deno.env.get('UNSPLASH_ACCESS_KEY');
    if (!accessKey) {
      return Response.json({ error: 'UNSPLASH_ACCESS_KEY secret not configured' }, { status: 500 });
    }

    const query = buildQuery(entity_type, fields);
    const apiUrl = `${UNSPLASH_API}?query=${encodeURIComponent(query)}&orientation=landscape&client_id=${accessKey}`;

    const resp = await fetch(apiUrl);
    if (!resp.ok) {
      return Response.json({ success: false, error: `Unsplash error ${resp.status}` });
    }

    const photo = await resp.json();
    const imageUrl = photo?.urls?.regular || photo?.urls?.small || null;

    if (!imageUrl) {
      return Response.json({ success: false, image_url: null });
    }

    const entityApi = entity_type === 'Tutorial'
      ? base44.entities.Tutorial
      : base44.entities.VenueService;

    await entityApi.update(entity_id, { image_url: imageUrl });

    return Response.json({ success: true, image_url: imageUrl, query });
  } catch (error) {
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
}
