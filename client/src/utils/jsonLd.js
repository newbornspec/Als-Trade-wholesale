// Adds, updates, or removes a JSON-LD structured-data <script> in the page head.
// Pass null/undefined `data` to remove it.
export function setJsonLd(id, data) {
  if (typeof document === 'undefined') return;
  let el = document.getElementById(id);
  if (!data) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export function removeJsonLd(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}
