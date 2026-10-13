// functions/api/prayers.js
// Handles prayer request submit (POST) and list (GET)
// Bound to D1 as env.DB and secret env.PRAYER_PASSCODE

export async function onRequestPost(context) {
  const { request, env } = context;

  // Read form data (works with HTMX form posts)
  const formData = await request.formData();
  const passcode = formData.get("passcode");
  const prayer   = formData.get("prayer")?.trim();
  const name     = formData.get("name")?.trim() || null;

  // Simple auth
  if (passcode !== env.PRAYER_PASSCODE) {
    return htmlResponse(`<div class="error">Invalid passcode</div>`, 401);
  }

  if (!prayer) {
    return htmlResponse(`<div class="error">Prayer request is required</div>`, 400);
  }

  // Insert into D1
  await env.DB.prepare(
    "INSERT INTO prayer_requests (request, name) VALUES (?, ?)"
  ).bind(prayer, name).run();

  // Return the updated list so HTMX can swap it in
  return await renderPrayerList(env, passcode);
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const passcode = new URL(request.url).searchParams.get("passcode");

  if (passcode !== env.PRAYER_PASSCODE) {
    return htmlResponse(`<div class="error">Invalid passcode</div>`, 401);
  }

  return await renderPrayerList(env, passcode);
}

// helpers 

async function renderPrayerList(env, passcode) {
  const { results } = await env.DB.prepare(
    `SELECT id, request, name, created_at 
     FROM prayer_requests 
     ORDER BY created_at DESC 
     LIMIT 50`
  ).all();

  if (!results.length) {
    return htmlResponse("<p>No prayer requests yet.</p>");
  }

  const html = results.map(row => `
    <div class="prayer">
      <p>${escapeHtml(row.request)}</p>
      ${row.name ? `<small>— ${escapeHtml(row.name)}</small>` : ""}
      <small class="timestamp">${formatDate(row.created_at)}</small>
    </div>
  `).join("");

  return htmlResponse(html);
}

function htmlResponse(html, status = 200) {
  return new Response(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}