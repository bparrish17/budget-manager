import { BatchUpdate, Append } from "./models";
import { Row, HeaderRow, DataRow, CalculationRow, TitleRow } from "./row";
import { sortByDate } from "./data";
import { Transaction } from "./transaction";
import { TITLE_ROW_IDX, HEADER_ROW_IDX, DATA_ROW_START_IDX, NEW_SHEET_ID, SHEET_ID } from "./constants";

const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const util = require('util');

export class SheetsHelper {
  public service: any;
  public sheet: string = 'Transactions';

  constructor(accessToken) {
    const auth = new OAuth2Client();
    auth.credentials = { access_token: accessToken };
    this.service = google.sheets({version: 'v4', auth });
  }

  public appendValues(transactionData: Transaction[]) {

    const expenses = sortByDate(transactionData.filter((trs) => trs.type === 'expense'));
    const incomes = sortByDate(transactionData.filter((trs) => trs.type === 'income'));
    const expensesRequest = this._getLastColumnIndex('expenses').then((colIdx: string) => {
      console.log('colIdx', colIdx);
      return this._getAppendValuesRequest(expenses, colIdx)
    });
    const incomesRequest = this._getLastColumnIndex('incomes').then((colIdx: string) => {
      console.log('colIdx', colIdx);
      return this._getAppendValuesRequest(incomes, colIdx);
    });
    return Promise.all([expensesRequest, incomesRequest]);
  }

  private _getLastColumnIndex(type: 'expenses' | 'incomes') {
    const column = type === 'expenses' ? 'A' : 'E';
    const request = {
      spreadsheetId: NEW_SHEET_ID,
      range: `Transactions!${column}1:${column}100000000`
    }

    return new Promise((resolve, reject) => {
      this.service.spreadsheets.values.get(request, (err, res) => {
        const lastIndex = res.data.values.length + 1 || 1;
        resolve(`${column}${lastIndex}`);
      })
    })
  }

  private _getAppendValuesRequest(transactionData: Transaction[], columnIndex: string): Promise<any> {
    const request: Append = {
      spreadsheetId: NEW_SHEET_ID,
      insertDataOption: 'INSERT_ROWS',
      range: `Transactions!${columnIndex}`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: this._getTransactionValues(transactionData)
      }
    }
    console.log('REQUEST: ', request);
    return new Promise((resolve, reject) => {
      this.service.spreadsheets.values.append(request, (err, res) => {
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

  private _getTransactionValues(transactionData: Transaction[]) {
    return transactionData.map((transaction: Transaction) => {
      const { displayDate: date, amount, name: description, category } = transaction;
      return [date, amount, description, category]
    })
  }



/*************************************************
 * OLD METHODS
 *************************************************/

  updateSpreadsheetValues(transactionData: Transaction[]) {
    const batchRequest: BatchUpdate = {
      spreadsheetId: NEW_SHEET_ID,
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




  updateSpreadsheet(title) {
    this.sheet = title;
    const addSheetRequest = this._addSheet(title)

    const batchRequest = {
      spreadsheetId: SHEET_ID,
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

  private _constructTables(transactionData: Transaction[]): Row[] {
    const headers = ['Date', 'Amount', 'Description', 'Category']
    let result = [];

    // console.log('expenses')

    const expenseTitleRow = new TitleRow('expense', this.sheet, TITLE_ROW_IDX, 'Expenses')
    const expenseHeaderRow = new HeaderRow('expense', this.sheet, HEADER_ROW_IDX, headers);
    const expenses = sortByDate(transactionData.filter((trs) => trs.type === 'expense'));
    const expenseRows = expenses.map((trs, idx) => new DataRow(trs.type, this.sheet, idx + 3, trs));

    // console.log('income')

    const incomeTitleRow = new TitleRow('income', this.sheet, TITLE_ROW_IDX, 'Income')
    const incomeHeaderRow = new HeaderRow('income', this.sheet, HEADER_ROW_IDX, headers);
    const incomes = sortByDate(transactionData.filter((trs) => trs.type === 'income'));
    const incomeRows = incomes.map((trs, idx) => new DataRow(trs.type, this.sheet, idx + 3, trs));

    const totalTitleRow = new TitleRow('total', this.sheet, TITLE_ROW_IDX, 'Totals')
    const totalHeaderRow = new HeaderRow('total', this.sheet, HEADER_ROW_IDX, ['Expenses', 'Income']);

    result = [
      // expenseTitleRow,
      // expenseHeaderRow,
      // incomeTitleRow,
      // incomeHeaderRow,
      // totalTitleRow,
      // totalHeaderRow,
      ...expenseRows,
      ...incomeRows
    ];

    // if (expenseRows.length > 0) {
    //   result.push(new CalculationRow('expense', this.sheet, expenseRows.length+2));
    // }

    // if (incomeRows.length > 0) {
    //   result.push(new CalculationRow('income', this.sheet, incomeRows.length+2));
    // }

    // console.log('result', result);
    
    return result;
  }
}