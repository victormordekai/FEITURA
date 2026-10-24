import {catalog, estimate} from "./data.js";

const money = value => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(value);

export function initEstimators() {
  document.querySelectorAll("[data-estimate-form]").forEach(form => {
    const product = form.querySelector("[name=product]");
    const minutes = form.querySelector("[name=minutes]");
    const processes = form.querySelector("[name=processes]");

    const syncCatalog = () => {
      const item = catalog[product.value];
      if (!item) return;
      if (minutes && !minutes.dataset.edited) minutes.value = item.minutes;
      if (processes && !processes.dataset.edited) processes.value = item.processes;
    };

    [minutes, processes].forEach(input => input?.addEventListener("input", () => input.dataset.edited = "true"));
    product?.addEventListener("change", syncCatalog);
    syncCatalog();

    form.addEventListener("submit", event => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const result = estimate(data);
      form.closest(".estimator-layout,.workspace-grid")?.querySelector("[data-result-value]")?.replaceChildren(document.createTextNode(money(result.value)));
      form.closest(".estimator-layout,.workspace-grid")?.querySelector("[data-result-hours]")?.replaceChildren(document.createTextNode(`${result.hours.toFixed(1)}h`));
      form.closest(".estimator-layout,.workspace-grid")?.querySelector("[data-result-processes]")?.replaceChildren(document.createTextNode(result.processes.toLocaleString("pt-BR")));
      form.closest(".estimator-layout,.workspace-grid")?.querySelector("[data-result-units]")?.replaceChildren(document.createTextNode(result.units.toLocaleString("pt-BR")));
    });
  });
}
