// functions/api/prayers.js
export async function onRequestPost(context) {
  const { request, env } = context;
  const formData = await request.formData();
  const passcode = formData.get("passcode");
  const action   = formData.get("action");

  if (passcode !== env.PRAYER_PASSCODE) {
    return htmlResponse(`<div class="error">Invalid passcode</div>`, 401);
  }

  if (action === "create") {
    const prayer = formData.get("prayer")?.trim();
    const name   = formData.get("name")?.trim() || null;
    if (!prayer) return htmlResponse(`<div class="error">Prayer request is required</div>`, 400);

    await env.DB.prepare(
      "INSERT INTO prayer_requests (request, name) VALUES (?, ?)"
    ).bind(prayer, name).run();
  }

  else if (action === "update") {
    const id     = formData.get("id");
    const prayer = formData.get("prayer")?.trim();
    const name   = formData.get("name")?.trim() || null;
    if (!id || !prayer) return htmlResponse(`<div class="error">Missing data</div>`, 400);

    await env.DB.prepare(
      "UPDATE prayer_requests SET request = ?, name = ? WHERE id = ?"
    ).bind(prayer, name, id).run();
  }

  else if (action === "delete") {
    const id = formData.get("id");
    if (!id) return htmlResponse(`<div class="error">Missing id</div>`, 400);

    await env.DB.prepare("DELETE FROM prayer_requests WHERE id = ?").bind(id).run();
  }

  else if (action === "answer") {
    const id          = formData.get("id");
    const answer_note = formData.get("answer_note")?.trim() || null;
    if (!id) return htmlResponse(`<div class="error">Missing id</div>`, 400);

    await env.DB.prepare(
      `UPDATE prayer_requests 
       SET answered = 1, answered_on = datetime('now'), answer_note = ?
       WHERE id = ?`
    ).bind(answer_note, id).run();
  }

  // Always return the fresh list so HTMX can swap it
  return await renderPrayerList(env);
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const passcode = new URL(request.url).searchParams.get("passcode");

  if (passcode !== env.PRAYER_PASSCODE) {
    return htmlResponse(`<div class="error">Invalid passcode</div>`, 401);
  }

  return await renderPrayerList(env);
}

// ---------- helpers ----------

async function renderPrayerList(env) {
  const { results } = await env.DB.prepare(
    `SELECT id, request, name, created_at, answered, answered_on, answer_note
     FROM prayer_requests
     ORDER BY answered ASC, created_at DESC
     LIMIT 50`
  ).all();

  if (!results.length) {
    return htmlResponse("<p>No prayer requests yet.</p>");
  }

  const html = results.map(row => {
    const answered = row.answered ? "answered" : "";
    const answerInfo = row.answered
      ? `<div class="answer-note">
           <p>Answered ${formatDate(row.answered_on)}</p>
           ${row.answer_note ? `<p>${escapeHtml(row.answer_note)}</p>` : ""}
         </div>`
      : "";

    return `
      <div class="prayer ${answered}">
        <p>${escapeHtml(row.request)}</p>
        ${row.name ? `<p>— ${escapeHtml(row.name)}</p>` : ""}
        <p class="timestamp">${formatDate(row.created_at)}</p>
        ${answerInfo}

        <div class="actions">
          <!-- Edit -->
          <form hx-post="/api/prayers" hx-target="#prayer-list" hx-swap="innerHTML" style="display:flex; flex-direction:column;">
            <input type="hidden" name="action" value="update">
            <input type="hidden" name="id" value="${row.id}">
            <input type="text" name="prayer" value="${escapeHtml(row.request)}" required>
            <input type="text" name="name" value="${escapeHtml(row.name || "")}" placeholder="Name">
            <button type="submit">Save</button>
          </form>

          <!-- Mark Answered -->
          ${!row.answered ? `
          <form hx-post="/api/prayers" hx-target="#prayer-list" hx-swap="innerHTML" style="display:flex; flex-direction:column;">
            <input type="hidden" name="action" value="answer">
            <input type="hidden" name="id" value="${row.id}">
            <input type="text" name="answer_note" placeholder="Answer note (optional)">
            <button type="submit">Mark Answered</button>
          </form>` : ""}

          <!-- Delete -->
          <form hx-post="/api/prayers" hx-target="#prayer-list" hx-swap="innerHTML" style="display:flex; flex-direction:column;"
                hx-confirm="Delete this prayer request?">
            <input type="hidden" name="action" value="delete">
            <input type="hidden" name="id" value="${row.id}">
            <button class="deleteButton" type="submit">Delete</button>
          </form>
        </div>
      </div>
    `;
  }).join("");

  return htmlResponse(html);
}

function htmlResponse(html, status = 200) {
  return new Response(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function escapeHtml(str) {
  return String(str ?? "")
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
