// Admin endpoint — uses the GHL Private Integration Token already in Vercel
// env to run setup / verify / cleanup operations without needing the token
// on Russ's machine.
//
// Auth: every request must include ?secret=<value> (or X-Admin-Secret header)
// matching the ADMIN_SECRET env var. If ADMIN_SECRET is not set in Vercel,
// the endpoint returns 503 and refuses to act — never run unauthenticated.
//
// Usage:
//   GET  /api/admin?op=health&secret=...        full system health check
//   GET  /api/admin?op=workflows&secret=...     list workflows + WF1 status
//   GET  /api/admin?op=custom-fields&secret=... list custom fields (verify IDs)
//   GET  /api/admin?op=pipelines&secret=...     list pipelines + stages
//   GET  /api/admin?op=calendars&secret=...     list calendars
//   GET  /api/admin?op=contact&id=...&secret=.. get one contact (for test verify)
//   POST /api/admin?op=delete-contact&id=...&secret=...   delete a contact
//   POST /api/admin?op=test-lead&secret=...     submit a synthetic lead, verify round-trip

const EXPECTED_CUSTOM_FIELDS = {
  business_type:           'e3tgSG6HFOeKsbEv7rus',
  message:                 'DXFI0RGaO7htZW7jY9xh',
  lead_source:             'XjIN3AmokIisH9GXZCER',
  lead_magnet_downloaded:  'bB3TjBnbDxMRU5pSnlrH',
  booking_status:          'B28v4TFQK4NHW2aNdUgT'
};

const EXPECTED_PIPELINE_NAME = 'Discovery Funnel';
const EXPECTED_STAGES = [
  'New Lead',
  'Follow Up (Form Abandoned)',
  'Follow Up (Magnet Downloaded)',
  'Appointment Booked',
  'No-Show / Cancelled',
  'Rescheduled',
  'Attended — Proposal Pending'
];

const EXPECTED_CALENDAR_ID = 'c7PuY8SoSbTEfdovYwp8';
const EXPECTED_CALENDAR_NAME = 'Free 30-Minute Discovery';

const EXPECTED_WORKFLOWS = [
  'Form Abandoned → Follow Up',
  'Lead Magnet → Nurture',
  'Booked → Confirmation & Reminders',
  'No-Show / Cancelled → Reschedule',
  'Attended → Post-Call'
];

const GHL_BASE = 'https://services.leadconnectorhq.com';
const GHL_VERSION = '2021-07-28';

export default async function handler(req, res) {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    return res.status(503).json({
      error: 'admin_disabled',
      hint: 'Set ADMIN_SECRET in Vercel env vars to enable this endpoint.'
    });
  }

  const url = new URL(req.url, `https://${req.headers.host || 'x'}`);
  const provided = url.searchParams.get('secret') || req.headers['x-admin-secret'] || '';
  if (!constantTimeEqual(provided, adminSecret)) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const token = process.env.GHL_PIT_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;
  if (!token || !locationId) {
    return res.status(500).json({
      error: 'config',
      hint: 'GHL_PIT_TOKEN and GHL_LOCATION_ID must both be set in Vercel env.'
    });
  }

  const op = (url.searchParams.get('op') || '').toLowerCase();
  const headers = {
    Authorization: `Bearer ${token}`,
    Version: GHL_VERSION,
    Accept: 'application/json'
  };

  try {
    switch (op) {
      case 'health':         return res.status(200).json(await opHealth(headers, locationId));
      case 'workflows':      return res.status(200).json(await opWorkflows(headers, locationId));
      case 'custom-fields':  return res.status(200).json(await opCustomFields(headers, locationId));
      case 'pipelines':      return res.status(200).json(await opPipelines(headers, locationId));
      case 'calendars':      return res.status(200).json(await opCalendars(headers, locationId));
      case 'contact': {
        const id = url.searchParams.get('id');
        if (!id) return res.status(400).json({ error: 'missing_id' });
        return res.status(200).json(await opContact(headers, id));
      }
      case 'delete-contact': {
        if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
        const id = url.searchParams.get('id');
        if (!id) return res.status(400).json({ error: 'missing_id' });
        return res.status(200).json(await opDeleteContact(headers, id));
      }
      case 'test-lead': {
        if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
        return res.status(200).json(await opTestLead(headers, locationId));
      }
      default:
        return res.status(400).json({
          error: 'unknown_op',
          available: [
            'health', 'workflows', 'custom-fields', 'pipelines', 'calendars',
            'contact', 'delete-contact', 'test-lead'
          ]
        });
    }
  } catch (err) {
    console.error('[api/admin]', op, err);
    return res.status(502).json({ error: 'upstream', detail: String(err && err.message || err) });
  }
}

function constantTimeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function ghlGet(path, headers) {
  const r = await fetch(GHL_BASE + path, { headers });
  const text = await r.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  return { ok: r.ok, status: r.status, body };
}

async function ghlPost(path, headers, payload) {
  const r = await fetch(GHL_BASE + path, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload || {})
  });
  const text = await r.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  return { ok: r.ok, status: r.status, body };
}

async function ghlDelete(path, headers) {
  const r = await fetch(GHL_BASE + path, { method: 'DELETE', headers });
  const text = await r.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  return { ok: r.ok, status: r.status, body };
}

// ===== Operations =========================================================

async function opCustomFields(headers, locationId) {
  const r = await ghlGet(`/locations/${locationId}/customFields`, headers);
  if (!r.ok) return { ok: false, status: r.status, body: r.body };
  const fields = (r.body && r.body.customFields) || [];
  const byId = new Map(fields.map(f => [f.id, f]));
  const expected = Object.entries(EXPECTED_CUSTOM_FIELDS).map(([key, id]) => {
    const f = byId.get(id);
    return {
      key,
      expected_id: id,
      found: !!f,
      name: f ? f.name : null,
      dataType: f ? f.dataType : null
    };
  });
  return {
    ok: true,
    total: fields.length,
    expected,
    all_field_names: fields.map(f => ({ id: f.id, name: f.name, dataType: f.dataType }))
  };
}

async function opWorkflows(headers, locationId) {
  const r = await ghlGet(`/workflows/?locationId=${locationId}`, headers);
  if (!r.ok) return { ok: false, status: r.status, body: r.body };
  const list = (r.body && r.body.workflows) || [];
  const byName = new Map(list.map(w => [w.name, w]));
  const expected = EXPECTED_WORKFLOWS.map(name => {
    const w = byName.get(name) || findFuzzyWorkflow(list, name);
    return {
      name,
      found: !!w,
      id: w ? w.id : null,
      status: w ? w.status : null,        // 'draft' | 'published'
      version: w ? w.version : null
    };
  });
  return {
    ok: true,
    total: list.length,
    expected,
    note: 'GHL public API exposes workflows read-only. Toggle draft→published in the GHL UI.',
    all: list.map(w => ({ id: w.id, name: w.name, status: w.status }))
  };
}

// GHL workflow names sometimes lose/gain the → arrow vs > vs hyphen in the UI.
// Try a forgiving lookup so a tiny formatting drift doesn't show "not found".
function findFuzzyWorkflow(list, target) {
  const norm = s => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const t = norm(target);
  return list.find(w => norm(w.name) === t) || null;
}

async function opPipelines(headers, locationId) {
  const r = await ghlGet(`/opportunities/pipelines?locationId=${locationId}`, headers);
  if (!r.ok) return { ok: false, status: r.status, body: r.body };
  const list = (r.body && r.body.pipelines) || [];
  const target = list.find(p => p.name === EXPECTED_PIPELINE_NAME) || null;
  const stages = target ? (target.stages || []).map(s => s.name) : [];
  const missingStages = EXPECTED_STAGES.filter(s => !stages.includes(s));
  return {
    ok: true,
    pipeline_found: !!target,
    pipeline_id: target ? target.id : null,
    stages_present: stages,
    stages_missing: missingStages,
    all_pipelines: list.map(p => ({ id: p.id, name: p.name, stage_count: (p.stages || []).length }))
  };
}

async function opCalendars(headers, locationId) {
  const r = await ghlGet(`/calendars/?locationId=${locationId}`, headers);
  if (!r.ok) return { ok: false, status: r.status, body: r.body };
  const list = (r.body && r.body.calendars) || [];
  const target = list.find(c => c.id === EXPECTED_CALENDAR_ID)
              || list.find(c => c.name === EXPECTED_CALENDAR_NAME);
  return {
    ok: true,
    expected_calendar_found: !!target,
    expected_id_matches: !!(target && target.id === EXPECTED_CALENDAR_ID),
    target: target || null,
    all: list.map(c => ({ id: c.id, name: c.name, slug: c.slug, isActive: c.isActive }))
  };
}

async function opContact(headers, id) {
  const r = await ghlGet(`/contacts/${id}`, headers);
  return { ok: r.ok, status: r.status, body: r.body };
}

async function opDeleteContact(headers, id) {
  const r = await ghlDelete(`/contacts/${id}`, headers);
  return { ok: r.ok, status: r.status, body: r.body };
}

async function opTestLead(headers, locationId) {
  // Synthetic lead — unique email each call so we don't trigger the
  // duplicate path and so we can inspect a real contact record afterwards.
  const stamp = Math.floor(Math.random() * 1e9).toString(36);
  const email = `admin-test+${stamp}@branchandrootconsulting.com`;
  const payload = {
    locationId,
    firstName: 'Admin',
    lastName: 'Test',
    email,
    phone: '+19495555555',
    source: 'admin-test',
    tags: ['admin-test'],
    customFields: [
      { id: EXPECTED_CUSTOM_FIELDS.lead_source,            value: 'Admin Test Endpoint' },
      { id: EXPECTED_CUSTOM_FIELDS.lead_magnet_downloaded, value: 'admin-test-marker' },
      { id: EXPECTED_CUSTOM_FIELDS.business_type,          value: 'admin-test-marker' }
    ]
  };
  const created = await ghlPost('/contacts/', headers, payload);
  if (!created.ok) return { ok: false, step: 'create', status: created.status, body: created.body };

  const newId = created.body && (created.body.contact && created.body.contact.id || created.body.id);
  // Fetch back to confirm everything wrote — especially the custom fields.
  const fetched = newId ? await ghlGet(`/contacts/${newId}`, headers) : { ok: false };
  // Then clean up so we don't pollute the database.
  let cleanup = null;
  if (newId) cleanup = await ghlDelete(`/contacts/${newId}`, headers);

  return {
    ok: true,
    email,
    contactId: newId,
    create: { status: created.status },
    fetched: { status: fetched.status, has_custom_fields: !!(fetched.body && fetched.body.contact && (fetched.body.contact.customFields || []).length) },
    cleanup: cleanup ? { status: cleanup.status } : null
  };
}

async function opHealth(headers, locationId) {
  const [fields, workflows, pipelines, calendars] = await Promise.all([
    opCustomFields(headers, locationId),
    opWorkflows(headers, locationId),
    opPipelines(headers, locationId),
    opCalendars(headers, locationId)
  ]);

  const summary = {
    custom_fields: {
      all_found: (fields.expected || []).every(f => f.found),
      missing: (fields.expected || []).filter(f => !f.found).map(f => f.key)
    },
    pipeline: {
      found: pipelines.pipeline_found,
      stages_missing: pipelines.stages_missing || []
    },
    calendar: {
      found: calendars.expected_calendar_found,
      id_matches: calendars.expected_id_matches
    },
    workflows: {
      found: (workflows.expected || []).filter(w => w.found).map(w => w.name),
      missing: (workflows.expected || []).filter(w => !w.found).map(w => w.name),
      drafts: (workflows.expected || []).filter(w => w.found && w.status === 'draft').map(w => w.name),
      published: (workflows.expected || []).filter(w => w.found && w.status === 'published').map(w => w.name)
    }
  };

  const ready_for_traffic =
    summary.custom_fields.all_found &&
    summary.pipeline.found &&
    summary.pipeline.stages_missing.length === 0 &&
    summary.calendar.found &&
    summary.workflows.missing.length === 0 &&
    summary.workflows.drafts.length === 0;

  return {
    ok: true,
    ready_for_traffic,
    summary,
    detail: { fields, workflows, pipelines, calendars }
  };
}
