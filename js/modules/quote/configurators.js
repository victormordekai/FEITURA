// FEITURA · configuradores de métodos de cronoanálise e produtos especiais.
// Um configurador descreve: campos do formulário, como derivar o tempo e,
// quando o método traz tarifa própria, como derivar o valor unitário.
// Ligados ao banco pelo ID do registro (MET-xxx / REF-xxx), nunca pelo texto exibido.

const num = (v, key) => Math.max(0, Number(v[key]) || 0);

const field = (key, label, unit, step = "0.01", extra = {}) => ({ key, label, unit, type: "number", step, ...extra });

const PRODUCT = { key: "product", label: "Nome do produto", type: "text", placeholder: "Nome do produto" };
const STRUCTURE = [
  field("processes", "Quantidade de processos", "PROCESSOS", "1", { value: "1" }),
  field("machines", "Quantidade de máquinas", "MÁQUINAS", "1", { value: "1" }),
  field("quantity", "Quantidade do lote", "UN.", "1", { value: "1" })
];
const REFERENCE_TIME = field("referenceTime", "Tempo de referência", "MIN./UN.");

const METHODS = {
  "MET-001": { // Perímetro de costura
    fields: [field("perimeter", "Perímetro de costura", "CM"), field("speed", "Velocidade efetiva", "CM/MIN.")],
    minutes: v => (num(v, "perimeter") && num(v, "speed") ? num(v, "perimeter") / num(v, "speed") : 0)
  },
  "MET-002": { // Tempo de máquina estimado
    fields: [field("machineTime", "Tempo de máquina estimado", "MIN./UN.")],
    minutes: v => num(v, "machineTime")
  },
  "MET-003": { // Aproximação por pontos
    fields: [field("length", "Comprimento de costura", "CM"), field("pointsPerCm", "Pontos por cm", "PONTOS/CM"), field("pointsPerMin", "Pontos por minuto", "PONTOS/MIN.")],
    minutes: v => (num(v, "length") && num(v, "pointsPerCm") && num(v, "pointsPerMin") ? (num(v, "length") * num(v, "pointsPerCm")) / num(v, "pointsPerMin") : 0)
  },
  "MET-004": { // Tempo normal
    fields: [field("cycleAverage", "Média dos ciclos observados", "MIN./UN."), field("paceFactor", "Fator de ritmo", "FATOR", "0.001", { placeholder: "Ex.: 1,00" })],
    minutes: v => num(v, "cycleAverage") * (num(v, "paceFactor") || 1)
  },
  "MET-005": { // Tempo padrão
    fields: [field("normalTime", "Tempo normal", "MIN./UN."), field("tolerance", "Tolerância", "%")],
    minutes: v => num(v, "normalTime") * (1 + num(v, "tolerance") / 100)
  },
  "MET-006": { // Tempo por unidade em lote
    fields: [field("variableTime", "Tempo variável por peça", "MIN./UN."), field("setupTime", "Setup do lote", "MIN."), field("lotSize", "Quantidade do lote de referência", "UN.", "1")],
    minutes: v => (num(v, "variableTime") && num(v, "lotSize") ? num(v, "variableTime") + num(v, "setupTime") / num(v, "lotSize") : 0)
  },
  "MET-007": { // Preço estimado de facção — a tarifa por minuto define o valor unitário
    fields: [field("standardTime", "Tempo padrão", "MIN./UN."), field("tariff", "Tarifa efetiva", "R$/MIN.", "0.0001")],
    minutes: v => num(v, "standardTime"),
    unitPrice: (v, minutes) => minutes * num(v, "tariff")
  },
  "MET-008": { // Validação de cronoanálise
    fields: [field("cycles", "Quantidade de ciclos observados", "CICLOS", "1"), REFERENCE_TIME],
    minutes: v => num(v, "referenceTime")
  },
  "MET-009": { // Unidade e escopo
    fields: [{ key: "unit", label: "Unidade de escopo", type: "text", placeholder: "Ex.: unidade, par, metro linear" }, field("referenceTime", "Tempo de referência", "MIN./UNIDADE")],
    minutes: v => num(v, "referenceTime")
  }
};

const GENERIC = { fields: [REFERENCE_TIME], minutes: v => num(v, "referenceTime") };

const METHOD_NOTE = "Informe somente as variáveis necessárias para esta referência. Processos e máquinas identificam a estrutura produtiva do cálculo; não são convertidos automaticamente em tempo.";

/** Devolve o configurador de um registro de método ou produto especial. */
export function configuratorFor(record) {
  if (record.group === "methods") {
    const method = METHODS[record.id] || GENERIC;
    return {
      eyebrow: "Método de cronoanálise",
      title: record.term,
      description: `${record.rule} ${METHOD_NOTE}`,
      methodName: record.term,
      fields: [PRODUCT, ...method.fields, ...STRUCTURE],
      minutes: method.minutes,
      unitPrice: method.unitPrice || null
    };
  }
  return {
    eyebrow: record.category || "Produto especial",
    title: record.name,
    description: `${record.notes} Descreva o produto pelas variáveis abaixo e informe o tempo de referência conhecido.`,
    methodName: "REFERÊNCIA ESPECIAL",
    fields: [{ ...PRODUCT, value: record.name }, ...record.variables, REFERENCE_TIME, ...STRUCTURE],
    minutes: GENERIC.minutes,
    unitPrice: null
  };
}

/** Texto curto "Rótulo: valor UNIDADE · …" para nomear a linha no documento. */
export function describeValues(fields, values) {
  return fields
    .filter(f => !["product", "quantity", "processes", "machines"].includes(f.key) && values[f.key] !== "" && values[f.key] != null)
    .map(f => `${f.label}: ${values[f.key]}${f.unit ? ` ${f.unit}` : ""}`)
    .join(" · ");
}
