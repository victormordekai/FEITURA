# FEITURA — Modelo de conteúdo

## Entidades principais

### Product
- name
- category
- process_count
- time_per_unit
- reference_value
- confidence

### ProductionCapacity
- professional_id
- location
- products
- processes
- hours_per_day
- days_per_week
- desired_monthly_income
- computed_hourly_reference

### Demand
- requester
- product
- quantity
- process_count
- target_date
- estimated_hours
- estimated_value

### Match
- demand_id
- capacity_id
- geographic_distance
- process_fit
- availability
- value_fit
- status

### ProductionRecord
Todo cálculo ou cadastro pode gerar um registro anonimizado para evolução da base produtiva.

## Localização

Primeira versão:
Brazil / states / city.

Arquitetura preparada para:
Latin America / country / region / city / currency.

## Idioma

Primeira versão:
pt-BR.

Arquitetura preparada para:
pt-BR / es / en.

## Moeda

Primeira versão:
BRL.

Arquitetura preparada para múltiplas moedas.
