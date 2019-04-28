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
    return `${sheet}!${colStart}${row}:${colEnd}${row}`;
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
