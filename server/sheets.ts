import { BatchUpdate } from "./models";

const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const util = require('util');

export class SheetsHelper {
  public service: any;

  constructor(accessToken) {
    const auth = new OAuth2Client();
    auth.credentials = { access_token: accessToken };
    this.service = google.sheets({version: 'v4', auth });
  }

  updateSpreadsheet(title) {
    const addSheetRequest = this._addSheet(title)

    const batchRequest = {
      spreadsheetId: '1TuFlDkfwQU2galV5swbF3jeQhKmHb5I3AmO5D6oudOs',
      resource: {
        requests: [
          { addSheet: addSheetRequest }
        ],  // TODO: Update placeholder value.
      },
    };

    return new Promise((resolve, reject) => {
      this.service.spreadsheets.batchUpdate(batchRequest, (err, res) => {
        if (err) reject(err);
        var spreadsheet = res.data;
        // TODO: Add header rows.
        resolve(spreadsheet);
      })
    })
  }

  updateSpreadsheetValues() {
    let data = []
    const batchRequest: BatchUpdate = {
      spreadsheetId: '1TuFlDkfwQU2galV5swbF3jeQhKmHb5I3AmO5D6oudOs',
      valueInputOption: 'USER_ENTERED',
      includeValuesInResponse: true,
      data: [
        {
          majorDimension: 'ROWS',
          range: 'A1:B1',
          values: [[1.55]]
        }
      ]
    }


    return new Promise((resolve, reject) => {
      this.service.spreadsheets.values.batchUpdate(batchRequest, (err, res) => {
        if (err) {
          reject(err);
        }
        var spreadsheet = res.data;
        // TODO: Add header rows.
        resolve(spreadsheet);
      })
    })
  }

  // add sheet
  private _addSheet(title) {
    return {
      properties: {
        title
      }
    }
  }
}

/*

batchUpdate: 
        // A list of updates to apply to the spreadsheet.
        // Requests will be applied in the order they are specified.
        // If any request is not valid, no requests will be applied.

const request = {
  resource: {
    spreadsheetId: '1662177848',
    properties: {
      title: title
    },
    sheets: [
      {
        properties: {
          title: 'Data 2',
          gridProperties: {
            columnCount: 6,
            frozenRowCount: 1
          }
        }
      },
      // TODO: Add more sheets.
    ]
  }
};
*/