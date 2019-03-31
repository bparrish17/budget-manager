import { Transaction } from "./transaction";
import { EXPENSE_AMOUNT_COL, INCOME_AMOUNT_COL } from "./constants";

export class Row {
  public majorDimension = 'COLUMNS';
  public range: string;
  public values: any;

  constructor(type, sheet, row, col?) {
    this.range = this.setRange(type, sheet, row);
  }

  setRange(type: 'expense' | 'income', sheet: string, row: number): string {
    const colStart = type === 'expense' ? 'A' : 'F';
    const colEnd = type === 'expense' ? 'D' : 'I';
    return `${sheet}!${colStart}${row}:${colEnd}${row}`;
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
