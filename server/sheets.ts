import { BatchUpdate } from "./models";
import { Row, HeaderRow, DataRow, CalculationRow } from "./row";
import { sortByDate } from "./data";
import { Transaction } from "./transaction";

const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const util = require('util');

export class SheetsHelper {
  public service: any;
  public sheet: string;

  constructor(accessToken) {
    const auth = new OAuth2Client();
    auth.credentials = { access_token: accessToken };
    this.service = google.sheets({version: 'v4', auth });
  }

  updateSpreadsheet(title) {
    this.sheet = title;
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
      includeValuesInResponse: true,
      resource: {
        valueInputOption: 'USER_ENTERED',
        data: this._constructTables(transactionData)
      }
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

  private _constructTables(transactionData: Transaction[]): Row[] {
    const headers = ['Date', 'Amount', 'Description', 'Category']
    let result = [];

    const expenseHeaderRow: HeaderRow = new HeaderRow('expense', this.sheet, 1, headers);
    const expenses = sortByDate(transactionData.filter((trs) => trs.type === 'expense'));
    const expenseRows = expenses.map((trs, idx) => new DataRow(trs.type, this.sheet, idx+2, trs));

    const incomeHeaderRow: HeaderRow = new HeaderRow('income', this.sheet, 1, headers);
    const incomes = sortByDate(transactionData.filter((trs) => trs.type === 'income'));
    const incomeRows = incomes.map((trs, idx) => new DataRow(trs.type, this.sheet, idx+2, trs));

    result = [
      expenseHeaderRow,
      incomeHeaderRow,
      ...expenseRows,
      ...incomeRows
    ];

    if (expenseRows.length > 0) {
      result.push(new CalculationRow('expense', this.sheet, expenseRows.length+2));
    }

    if (incomeRows.length > 0) {
      result.push(new CalculationRow('income', this.sheet, incomeRows.length+2));
    }
    
    return result;
  }
}