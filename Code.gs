function doGet(e) {
  if (e.parameter.page == 'main') {
    return HtmlService.createTemplateFromFile('main').evaluate();
  } else {
    var html = HtmlService.createTemplateFromFile('index');
    html.options = getClosers();
    return html.evaluate();
  }
}

function getClosers() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Llamadas');
  var closers = sheet.getRange('H2:H' + sheet.getLastRow()).getValues();
  var uniqueClosers = [...new Set(closers.flat())];
  Logger.log("Unique values: ", uniqueClosers); // Log for debugging
  return uniqueClosers.filter(Boolean); // Filter out any empty values
}

function processCloser(closerName) {
  var userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('selectedCloser', closerName);
}

function getSelectedCloser() {
  var userProperties = PropertiesService.getUserProperties();
  return userProperties.getProperty('selectedCloser');
}

function loadMainPage() {
  return HtmlService.createTemplateFromFile('main').evaluate().getContent();
}

function getLogs() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Logs');
  if (!sheet) {
    Logger.log("Sheet 'Logs' not found!");
    return null;
  }
  
  var data = sheet.getRange('A2:C' + sheet.getLastRow()).getValues();
  if (data.length === 0) {
    Logger.log("No data found in 'Logs' sheet!");
    return null;
  }
  
  var logs = data.map(function(row) {
    return {
      date: row[0],
      closer: row[1],
      state: row[2]
    };
  });
  
  Logger.log("Logs data: " + JSON.stringify(logs)); // Log para depurar
  return JSON.stringify(logs); // Make sure to return the logs data
}



function getInitialData() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Llamadas');
  // Assuming the closer is logged in and we fetch their first row for simplicity
  var data = sheet.getRange('A2:M2').getValues()[0];
  return {
    closer: data[7],
    phone: data[8],
    agendacion: data[0],
    state: data[9],
    called: data[10],
    tracking: data[11],
    comments: data[12]
  };
}

function updateSheet(closer, phone, state, called, tracking, comments) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Llamadas');
  // Find the row of the closer
  var data = sheet.getRange('H2:H' + sheet.getLastRow()).getValues().flat();
  var row = data.indexOf(closer) + 2;

  if (row > 1) {
    sheet.getRange('I' + row).setValue(phone);
    sheet.getRange('J' + row).setValue(state);
    sheet.getRange('K' + row).setValue(called);
    sheet.getRange('L' + row).setValue(tracking);
    sheet.getRange('M' + row).setValue(comments);

    // Update the log sheet
    var logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Logs');
    logSheet.appendRow([new Date(), closer, state]);
  }
}

function getEmailsForCloser(closer) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Llamadas');
  var data = sheet.getDataRange().getValues();
  var emails = [];
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][7] == closer) { // Columna H es la columna 7 (0-indexed)
      emails.push(data[i][1]); // Columna B es la columna 1 (0-indexed)
    }
  }
  
  return emails;
}

function getDataForEmail(email) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var dataRange = sheet.getDataRange();
  var data = dataRange.getValues();
  var rowData = {};
  
  // Saltar la fila de encabezados
  for (var i = 1; i < data.length; i++) {
    if (data[i][1] == email) { // Asumo que la columna de email es la segunda columna
      rowData.agendacion = data[i][0];
      rowData.phone = data[i][8];
      rowData.state = data[i][9];
      rowData.called = data[i][10];
      rowData.tracking = data[i][11];
      rowData.comments = data[i][12];
      break;
    }
  }
  
  return { email: email, data: JSON.stringify(rowData, null, 2) };
}


// var email = "vilintinsosi7@imiil.iom";
// var result = getDataForEmail(email); // Llama a la función y pasa el valor de email como parámetro
// console.log(result); // Imprime el resultado


function updateSheet(closer, email, phone, state, called, tracking, comments) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Llamadas');
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][1] == email) { // Columna B es la columna 1 (0-indexed)
      sheet.getRange(i+1, 9).setValue(phone); // Columna I es la columna 8 (0-indexed)
      sheet.getRange(i+1, 10).setValue(state); // Columna J es la columna 9 (0-indexed)
      sheet.getRange(i+1, 11).setValue(called); // Columna K es la columna 10 (0-indexed)
      sheet.getRange(i+1, 12).setValue(tracking); // Columna L es la columna 11 (0-indexed)
      sheet.getRange(i+1, 13).setValue(comments); // Columna M es la columna 12 (0-indexed)
      
      // Actualizar la hoja de Logs
      var logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Logs');
      logSheet.appendRow([new Date(), closer, state]);
      break;
    }
  }
}
