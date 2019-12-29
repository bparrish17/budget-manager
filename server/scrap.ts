/*

================= Routes.ts ==================

router.post('/createSpreadsheet', (req, res) => {
	const accessToken = req.session.data['access_token'];
	const form = new formidable.IncomingForm();
	let startDate;
	let endDate;
	let startMYY;
	let endMYY;
	let sheetName = 'Budget';
	
	form.multiples = true;
	form.parse(req);

	form.on('field', (name, value) => {
		if (name === 'startDate') {
			startDate = value;
			startMYY = moment(startDate).format('M/YY');
			sheetName += ` (${startMYY}`;
		}
		if (name === 'endDate') {
			endDate = value;
			endMYY = moment(endDate).format('M/YY');
			sheetName += ` - ${endMYY})`
		}
	})

	const sheetsHelper = new SheetsHelper(accessToken);

	let requests = [];
	form.on('file', (name, file) => {
		const noheader = name === 'usaa' ? true : false;
		requests.push(
			convertCSVtoJSON(file.path, noheader).then((jsonData) => mapTransactions(name, startDate, endDate, jsonData))
		);
	});

	form.on('end', () => {
		let result = [];
		Promise.all(requests).then((fileData) => {
			fileData.forEach((data) => {
				if (data.length) {
					result = [...result, ...data].filter((val) => !!val);
				}
			});

			// result = sortByDate(result);

			sheetsHelper.updateSpreadsheet(sheetName)
				.then(() => sheetsHelper.updateSpreadsheetValues(result))
				.then((spreadsheetVals) => res.send(spreadsheetVals))
				.catch((err) => {
					res.send('ERROR UPDATING SPREADSHEET VALS', err);
				})
		}).catch((err) => {
			res.send('ERROR AT CONVERSION PROMISE', err);
		})
	})
})







===================== Sheets.ts =======================


private _getLastColumnIndex(type: 'expenses' | 'incomes') {
  const column = type === 'expenses' ? 'A' : 'E';
  const request = {
    spreadsheetId: NEW_SHEET_ID,
    range: `${type}!${column}1:${column}100000000`
  }

  return new Promise((resolve, reject) => {
    this.service.spreadsheets.values.get(request, (err, res) => {
      const lastIndex = res.data.values.length + 1 || 1;
      if (err) reject('Error Getting Spreadsheet Vals');
      resolve(`${column}${lastIndex}`);
    })
  })
}


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







===================== Row.ts =======================

import { Transaction } from "./transaction";
import { EXPENSE_AMOUNT_COL, INCOME_AMOUNT_COL, EXPENSE_FIRST_COL, INCOME_FIRST_COL, EXPENSE_LAST_COL, INCOME_LAST_COL, TOTAL_FIRST_COL, TOTAL_LAST_COL } from "./constants";

export class Row {
  public majorDimension = 'COLUMNS';
  public range: string;
  public values: any;

  constructor(type, sheet, row, col?) {
    this.range = this.setRange(type, sheet, row);
  }

  setRange(type: 'expense' | 'income' | 'total', sheet: string, row: number): string {
    let colStart;
    let colEnd;
    // switch (type) {
    //   case 'expense':
        // colStart = EXPENSE_FIRST_COL;
        // colEnd = EXPENSE_LAST_COL;
    //     break;
    //   case 'income':
        // colStart = INCOME_FIRST_COL;
        // colEnd = EXPENSE_LAST_COL;
    //     break;
    //   case 'total':
    //     colStart = TOTAL_FIRST_COL;
    //     colEnd = TOTAL_LAST_COL;
    //     break;
    //   default:
    //     break;
    // }
    if (type === 'expense') {
      colStart = EXPENSE_FIRST_COL;
      colEnd = EXPENSE_LAST_COL;
    } else if (type === 'income') {
      colStart = INCOME_FIRST_COL;
      colEnd = INCOME_LAST_COL;
    } else if (type === 'total') {
      colStart = TOTAL_FIRST_COL;
      colEnd = TOTAL_LAST_COL;
    } else {
      colStart = EXPENSE_FIRST_COL;
      colEnd = EXPENSE_LAST_COL;
    }
    // const colStart = type === 'expense' ? 'A' : 'E';
    // const colEnd = type === 'expense' ? 'D' : 'H';
    console.log(`${sheet}!${colStart}${row}:${colEnd}${row}`);
    return `${colStart}${row}:${colEnd}${row}`;
  }
}

export class TitleRow extends Row {
  public values: any;

  constructor(type, sheet, row, val) {
    super(type, sheet, row)
    this.values = [[val]];
  }
}

export class HeaderRow extends Row {
  public values: any;

  constructor(type, sheet, row, headers: string[]) {
    super(type, sheet, row)
    this.values = this.setCellValues(headers);
  }

  setCellValues(headers) {
    return headers.map((header) => [header]);
  }
}

export class DataRow extends Row {
  public values: any;

  constructor(type, sheet, row, transaction: Transaction) {
    super(type, sheet, row);
    this.values = this.setCellValues(transaction);
  }
  // ['date', 'amount', 'name', 'category']

  setCellValues(transaction: Transaction) {
    const { displayDate: date, amount, name: description, category } = transaction;
    console.log(date, amount, description, category);
    return [[date], [amount], [description], [category]]
  }
}

export class CalculationRow extends Row {
  public values: any;

  constructor(type, sheet, row) {
    super(type, sheet, row);
    const col = type === 'expense' ? EXPENSE_AMOUNT_COL: INCOME_AMOUNT_COL;
    this.range = `${sheet}!${col}${row}`
    this.values = [[`=SUM(${col}2:${col}${row - 1})`]];
  }
}














===================== Data.ts =======================



export function mapTransactions(type, startDate, endDate, data) {
	return data.map(transaction => {
		let result;
		switch (type) {
			case 'amex':
				result = createAMEXTransaction(transaction);
				break;
			case 'usaa':
				result = createUSAATransaction(transaction);
				break;
			case 'venmo':
				result = createVenmoTransaction(transaction);
				break;
			default:
				break;
		}
		const isNull = !result || result === null || result === undefined;
		const isOutsideDateParams = isNull || result.date < moment(startDate) || result.date > moment(endDate)
		return (isNull || isOutsideDateParams) ? null : result; 
	});
};

*/