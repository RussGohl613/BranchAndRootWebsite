// Vercel serverless function — proxies lead submits to GHL v2 API.
// Custom field IDs come from the GHL location. Keep this map in sync with
// HANDOFF.md → "Reference values you'll need" → "Custom field IDs".
const CUSTOM_FIELD_IDS = {
  business_type: 'e3tgSG6HFOeKsbEv7rus',
  message: 'DXFI0RGaO7htZW7jY9xh',
  lead_source: 'XjIN3AmokIisH9GXZCER',
  lead_magnet_downloaded: 'bB3TjBnbDxMRU5pSnlrH',
  booking_status: 'B28v4TFQK4NHW2aNdUgT'
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method' });
  }

  const token = process.env.GHL_PIT_TOKEN;
  if (!token) {
    console.error('[api/lead] GHL_PIT_TOKEN env var is not set');
    return res.status(500).json({ error: 'config' });
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : (req.body || {});
  const { firstName, lastName, email, phone, source, tags, customFields } = body;

  if (!email || !source) {
    return res.status(400).json({ error: 'missing_fields' });
  }

  const customFieldsArr = normalizeCustomFields(customFields);

  const ghlBody = {
    firstName: firstName || '',
    lastName: lastName || '',
    email,
    phone: phone || '',
    source,
    tags: Array.isArray(tags) ? tags : []
  };
  if (process.env.GHL_LOCATION_ID) ghlBody.locationId = process.env.GHL_LOCATION_ID;
  if (customFieldsArr.length) ghlBody.customFields = customFieldsArr;

  const headers = {
    Authorization: `Bearer ${token}`,
    Version: '2021-07-28',
    'Content-Type': 'application/json',
    Accept: 'application/json'
  };

  try {
    const upstream = await fetch('https://services.leadconnectorhq.com/contacts/', {
      method: 'POST',
      headers,
      body: JSON.stringify(ghlBody)
    });
    const data = await upstream.json().catch(() => ({}));

    if (upstream.ok && data && (data.contact || data.id)) {
      return res.status(200).json({ ok: true, contactId: (data.contact && data.contact.id) || data.id });
    }

    // Duplicate handling — GHL returns 400 with meta.contactId for existing email.
    const dupId = data && data.meta && (data.meta.contactId || data.meta.id);
    if (dupId) {
      if (ghlBody.tags.length) {
        const tagRes = await fetch(`https://services.leadconnectorhq.com/contacts/${dupId}/tags`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ tags: ghlBody.tags })
        });
        if (!tagRes.ok) {
          console.error('[api/lead] tag-add failed for duplicate', dupId, await tagRes.text().catch(() => ''));
        }
      }
      return res.status(200).json({ ok: true, contactId: dupId, duplicate: true });
    }

    console.error('[api/lead] upstream error', upstream.status, data);
    return res.status(502).json({ ok: false, error: 'upstream' });
  } catch (err) {
    console.error('[api/lead] fetch threw', err);
    return res.status(502).json({ ok: false, error: 'upstream' });
  }
}

function safeParse(s) { try { return JSON.parse(s); } catch { return {}; } }

function normalizeCustomFields(cf) {
  if (!cf) return [];
  if (Array.isArray(cf)) return cf.filter(x => x && x.id != null);
  if (typeof cf === 'object') {
    return Object.keys(cf)
      .filter(k => cf[k] !== '' && cf[k] != null)
      .map(k => ({ id: CUSTOM_FIELD_IDS[k] || k, value: cf[k] }));
  }
  return [];
}
