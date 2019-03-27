import { Moment } from "moment";

/*************************************************
 * INTERNAL 
 *************************************************/

export interface TEST {
  hello: string;
  world: string;
}

export class Transaction {
  public source: string;
	public date: Moment | string;
	public displayDate: string;
	public name: string;
	public amount: number;
	public type: TransactionType;
	public category: any;
}

export type TransactionType = 'income' | 'expense';

export type CatMap = { [key: string]: string[] };

/*************************************************
 * GOOGLE SHEETS API
 *************************************************/

export interface BatchUpdate {
  spreadsheetId?: string | number;
  valueInputOption: 'USER_ENTERED' | 'RAW';
  includeValuesInResponse?: boolean;
  data: ValueRange[]
}

export interface ValueRange {
  range: string;
  majorDimension: 'ROWS' | 'COLUMNS';
  values: any[];
}

export interface SpreadSheet {
  properties: any,
  data: GridData[],
  merges?: any[],
  conditionalFormats?: any[],
  filterViews?: any[],
  protectedRanges?: any[],
  basicFilter?: any,
  charts?: any[],
  bandedRanges?: any[],
  developerMetadata?: any[],
  rowGroups?: any[],
  columnGroups?: any[]
}

export interface Sheet {
  properties: any,
  data: GridData[]
}

export interface GridData {
  startRow: number,
  startColumn: number,
  rowData: RowData[]
}

export interface RowData {
  values: any[]
}