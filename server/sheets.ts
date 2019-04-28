import { BatchUpdate } from "./models";
import { Row, HeaderRow, DataRow, CalculationRow, TitleRow } from "./row";
import { sortByDate } from "./data";
import { Transaction } from "./transaction";
import { TITLE_ROW_IDX, HEADER_ROW_IDX, DATA_ROW_START_IDX, TEST_SHEET_ID } from "./constants";

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
      spreadsheetId: TEST_SHEET_ID,
      resource: {
        requests: [
          { addSheet: addSheetRequest }
        ],  // TODO: Update placeholder value.
      },
    };

    return new Promise((resolve, reject) => {
      this.service.spreadsheets.batchUpdate(batchRequest, (err, res) => {
        if (err) reject(err);
        console.log('res. data', res)
        var spreadsheet = res.data;
        // TODO: Add header rows.
        resolve(spreadsheet);
      })
    })
  }

  updateSpreadsheetValues(transactionData: Transaction[]) {
    const batchRequest: BatchUpdate = {
      spreadsheetId: TEST_SHEET_ID,
      includeValuesInResponse: true,
      resource: {
        valueInputOption: 'USER_ENTERED',
        data: this._constructTables(transactionData)
      }
    }

    return new Promise((resolve, reject) => {
      this.service.spreadsheets.values.batchUpdate(batchRequest, (err, res) => {
        console.log('ERR: ', err, 'RES: ', res);
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

    console.log('expenses')

    const expenseTitleRow = new TitleRow('expense', this.sheet, TITLE_ROW_IDX, 'Expenses')
    const expenseHeaderRow = new HeaderRow('expense', this.sheet, HEADER_ROW_IDX, headers);
    const expenses = sortByDate(transactionData.filter((trs) => trs.type === 'expense'));
    const expenseRows = expenses.map((trs, idx) => new DataRow(trs.type, this.sheet, idx + 3, trs));

    console.log('income')

    const incomeTitleRow = new TitleRow('income', this.sheet, TITLE_ROW_IDX, 'Income')
    const incomeHeaderRow = new HeaderRow('income', this.sheet, HEADER_ROW_IDX, headers);
    const incomes = sortByDate(transactionData.filter((trs) => trs.type === 'income'));
    const incomeRows = incomes.map((trs, idx) => new DataRow(trs.type, this.sheet, idx + 3, trs));

    const totalTitleRow = new TitleRow('total', this.sheet, TITLE_ROW_IDX, 'Totals')
    const totalHeaderRow = new HeaderRow('total', this.sheet, HEADER_ROW_IDX, ['Expenses', 'Income']);

    result = [
      expenseTitleRow,
      expenseHeaderRow,
      incomeTitleRow,
      incomeHeaderRow,
      totalTitleRow,
      totalHeaderRow,
      ...expenseRows,
      ...incomeRows
    ];

    // if (expenseRows.length > 0) {
    //   result.push(new CalculationRow('expense', this.sheet, expenseRows.length+2));
    // }

    // if (incomeRows.length > 0) {
    //   result.push(new CalculationRow('income', this.sheet, incomeRows.length+2));
    // }

    console.log('result', result);
    
    return result;
  }
}