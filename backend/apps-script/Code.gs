/**
 * FEITURA® | contador agregado de visitas
 *
 * Deploy como Web App:
 * Execute as: Me
 * Who has access: Anyone
 *
 * A planilha usada pelo script deve ser privada.
 * O frontend recebe somente o total agregado.
 */
const SHEET_NAME = 'visitas';

function doGet() {
  const sheet = getSheet_();
  const cell = sheet.getRange('B2');
  const current = Number(cell.getValue()) || 0;
  const next = current + 1;
  cell.setValue(next);

  return ContentService
    .createTextOutput(JSON.stringify({ visits: next }))
    .setMimeType(ContentService.MimeType.JSON);
}

function setup() {
  const sheet = getSheet_();
  sheet.getRange('A1:B2').setValues([
    ['metric', 'value'],
    ['visits', 0]
  ]);
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (!sheet.getRange('A1').getValue()) setup();
  return sheet;
}
