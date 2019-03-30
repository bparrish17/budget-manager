import { BatchUpdate, Transaction } from "./models";
import { Row, HeaderRow, DataRow } from "./row";
import { sortByDate } from "./data";

const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const util = require('util');

export class SheetsHelper {
  public service: any;
  public sheet: string;

  constructor(accessToken, sheet) {
    const auth = new OAuth2Client();
    auth.credentials = { access_token: accessToken };
    this.service = google.sheets({version: 'v4', auth });
    this.sheet = sheet;
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

  updateSpreadsheetValues(transactionData: Transaction[]) {
    const batchRequest: BatchUpdate = {
      spreadsheetId: '1TuFlDkfwQU2galV5swbF3jeQhKmHb5I3AmO5D6oudOs',
      valueInputOption: 'RAW',
      includeValuesInResponse: true,
      data: [{
        majorDimension: 'COLUMNS',
        range: 'Budget!A1',
        values: [
          [123]
        ] 
      }]
    }

    //      data: this._constructTables(transactionData).slice(0, 10)

    // return new Promise((resolve, reject) => {
    //   console.log('REQUEST: ', batchRequest);
    //   resolve(batchRequest);
    // })


    return new Promise((resolve, reject) => {
      this.service.spreadsheets.values.batchUpdate(batchRequest, (err, res) => {
        console.log('ERR', err);
        console.log('RES', res);
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

  private _constructTables(transactionData: Transaction[]): Row[] {
    console.log('here');
    const headers = ['Date', 'Amount', 'Description', 'Category']
    console.log('headers', headers);
    let expenseHeaderRow: HeaderRow = new HeaderRow('expense', this.sheet, 1, headers);
    let incomeHeaderRow: HeaderRow = new HeaderRow('income', this.sheet, 1, headers);
    let incomeRows: Row[] = [];

    let dataRows = sortByDate(transactionData).map((trs, idx) => {
      // console.log(`${idx}: `, trs.name);
      return new DataRow(trs.type, this.sheet, idx+2, trs)
    })
    return [expenseHeaderRow, incomeHeaderRow, ...dataRows];
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