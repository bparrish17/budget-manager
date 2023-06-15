import { Append } from "./models";
import { sortByDate } from "./data";
import { Transaction } from "./transaction";

const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');

const TEST_SHEET_ID = '1iRHLWOk7E_SPFO_n6Ok0xci__SUtApQGhseuOzz0ThI';
const SHEET_ID = '18rJL09ZmrN85mEGMVtRVsqNsyWPp_Vz2HB3d76pmaM8';

export class SheetsHelper {
  public service: any;

  constructor(accessToken) {
    const auth = new OAuth2Client();
    auth.credentials = { access_token: accessToken };
    this.service = google.sheets({version: 'v4', auth });
  }

  public appendValues(transactionData: Transaction[]) {
    const investments = sortByDate(transactionData.filter((trs) => trs.type === 'investment'));
    const expenses = sortByDate(transactionData.filter((trs) => trs.type === 'expense'));
    const incomes = sortByDate(transactionData.filter((trs) => trs.type === 'income'));
    const expensesRequest = this._getAppendValuesRequest(expenses, 'expenses');
    const incomesRequest = this._getAppendValuesRequest(incomes, 'incomes');
    const investmentsRequest = this._getAppendValuesRequest(investments, 'investments');
    return Promise.all([expensesRequest, incomesRequest, investmentsRequest]);
  }

  private _getAppendValuesRequest(transactionData: Transaction[], type: 'expenses' | 'incomes' | 'investments'): Promise<any> {
    const request: Append = {
      spreadsheetId: SHEET_ID,
      insertDataOption: 'INSERT_ROWS',
      range: `${type}!A1`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: this._getTransactionValues(transactionData)
      }
    }
    return new Promise((resolve, reject) => {
      this.service.spreadsheets.values.append(request, (err, res) => {
        if (err) reject(err);
        if (res) resolve('Success');
      })
    })
  }

  private _getTransactionValues(transactionData: Transaction[]) {
    return transactionData.map((transaction: Transaction) => {
      const { displayDate: date, amount, name: description, category } = transaction;
      return [date, amount, description, category]
    })
  }
}