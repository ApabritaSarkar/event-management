// utils/validators.js
const isIsoDate = (str) => !isNaN(Date.parse(str));

function validateEventInput({ title, datetime, location, capacity }) {
  if (!title?.trim()) return { ok: false, msg: "Title is required" };
  if (!isIsoDate(datetime)) return { ok: false, msg: "Invalid ISO date/time" };
  if (!location?.trim()) return { ok: false, msg: "Location is required" };
  if (!Number.isInteger(capacity) || capacity <= 0 || capacity > 1000) {
    return { ok: false, msg: "Capacity must be 1‑1000" };
  }
  return { ok: true };
}

module.exports = { validateEventInput };
