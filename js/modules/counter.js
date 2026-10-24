const COUNTER_ENDPOINT = "";

export function initVisitorCounter() {
  const nodes = document.querySelectorAll("[data-visitor-count]");
  if (!nodes.length || !COUNTER_ENDPOINT) return;

  fetch(COUNTER_ENDPOINT, { method: "GET", mode: "cors", cache: "no-store" })
    .then(response => {
      if (!response.ok) throw new Error("counter unavailable");
      return response.json();
    })
    .then(data => {
      const value = Number(data.visits);
      if (!Number.isFinite(value)) return;
      nodes.forEach(node => {
        node.textContent = value.toLocaleString("pt-BR");
        node.closest(".visitor-counter")?.removeAttribute("hidden");
      });
    })
    .catch(() => {});
}
