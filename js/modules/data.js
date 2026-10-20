export const catalog = {
  camisa: {name:"Camisa básica", minutes:18, processes:8},
  bermuda: {name:"Bermuda social", minutes:24, processes:10},
  "camisa-social": {name:"Camisa social", minutes:31, processes:14},
  bolso: {name:"Bolso aplicado", minutes:7, processes:3},
  punho: {name:"Punho", minutes:5, processes:2}
};

export function estimate({product, quantity, processes, minutes, hourly}) {
  const item = catalog[product];
  const q = Number(quantity) || 0;
  const p = Number(processes) || item?.processes || 0;
  const m = Number(minutes) || item?.minutes || 0;
  const h = Number(hourly) || 0;
  const hours = (q * m) / 60;
  return {
    value: hours * h,
    hours,
    processes: q * p,
    units: q
  };
}
