import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const ADMIN_ID = "6a57507f2558691b9c2c4bd0";

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const page: any = await base44.asServiceRole.entities.Product.filter(
      { curator_product: true, created_by_id: ADMIN_ID },
      { limit: 20 }
    );
    const items: any[] = Array.isArray(page) ? page : page?.items || [];

    return Response.json(items);
  } catch (error: any) {
    console.error('[getCuratedProducts] failed', error?.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
