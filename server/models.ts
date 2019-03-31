import { Moment } from "moment";
import { Row } from "./row";

/*************************************************
 * INTERNAL 
 *************************************************/

export interface TEST {
  hello: string;
  world: string;
}

export type CatMap = { [key: string]: string[] };

/*************************************************
 * GOOGLE SHEETS API
 *************************************************/

export interface BatchUpdate {
  spreadsheetId?: string | number;
  includeValuesInResponse?: boolean;
  resource: {
    valueInputOption: 'USER_ENTERED' | 'RAW';
    data: any[]
  }
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