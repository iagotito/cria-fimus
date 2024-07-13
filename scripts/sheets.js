import { SPREADSHEET_ID } from "./config.js";
/**
 * Print the names and majors of students in a sample spreadsheet:
 * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 */
export async function listMajors() {
  let response;
  try {
    // Fetch first 10 files
    response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
      range: 'Class Data!A2:E',
    });
  } catch (err) {
    document.getElementById('content').innerText = err.message;
    return;
  }
  const range = response.result;
  if (!range || !range.values || range.values.length == 0) {
    document.getElementById('content').innerText = 'No values found.';
    return;
  }
  // Flatten to string to display
  const output = range.values.reduce(
    (str, row) => `${str}${row[0]}, ${row[4]}\n`,
    'Name, Major:\n');
  document.getElementById('content').innerText = output;
}

async function getData (sheetName) {
    let params = {
        spreadsheetId: SPREADSHEET_ID,
        range: sheetName + "!A:C"
    }
    try {
        let req = await gapi.client.sheets.spreadsheets.values.get(params);
        let res = JSON.parse(req.body);
        return res.values;
    } catch (e) {
        console.error(e);
        return e;
    }
}

/**
  * Create a sheet with the sheetName, if not already exists.
  */
const headers = ["email", "country", "state", "joy", "hope", "longing"];
export async function createSheet(sheetName, sheetId) {
  try {
    // Fetch the spreadsheet metadata
    const spreadsheet = await gapi.client.sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const sheetExists = spreadsheet.result.sheets.some(sheet => sheet.properties.title === sheetName);

    if (sheetExists) {
      console.log(`Sheet "${sheetName}" already exists.`);

      // Check if the first row contains the headers
      const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A1:F1`,
      });

      const firstRow = response.result.values ? response.result.values[0] : [];
      const headersMatch = headers.every((header, index) => firstRow[index] === header);

      if (!headersMatch) {
        console.log(`Headers do not match, updating headers in sheet "${sheetName}".`);
        await gapi.client.sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${sheetName}!A1:F1`,
          valueInputOption: 'RAW',
          resource: {
            values: [headers],
          },
        });
      } else {
        console.log(`Headers match in sheet "${sheetName}".`);
      }
    } else {
      // Create the sheet if it does not exist
      console.log(`Creating sheet "${sheetName}".`);
      await gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requests: [{
          addSheet: {
            properties: {
              sheetId: sheetId,
              title: sheetName,
            },
          },
        }],
      });

      // Add headers to the new sheet
      await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A1:F1`,
        valueInputOption: 'RAW',
        resource: {
          values: [headers],
        },
      });
    }
  } catch (e) {
    console.error(e);
  }
}

export async function logData(data, sheetName) {
    let range = sheetName + "!A:B";
    let params = {
        spreadsheetId: SPREADSHEET_ID,
        range: range,
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS"
    }
    let reqBody = {
        "range": range,
        "majorDimension": "ROWS",
        "values": [
          data,
        ]
    }
    try {
        let res = await gapi.client.sheets.spreadsheets.values.append(params, reqBody);
    } catch (e) {}
}
