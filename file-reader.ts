import { FilePaths, RawTransaction, RawTransactions } from "./server/models";
const csv = require("csvtojson");

export function convertCSVtoJSON(
  filePath,
  parseParams: { [key: string]: unknown } = { noheader: false }
): Promise<RawTransaction> {
  return csv(parseParams).fromFile(filePath);
}

export default async function main(filePaths: FilePaths): Promise<RawTransactions> {
  const usaaParser = {
    colParser: {
      Date: "string",
      Description: "string",
      "Original Description": "omit",
      Category: "string",
      Amount: "number",
      Status: "omit",
    },
  };

  return {
    usaa: await convertCSVtoJSON(filePaths.usaa, usaaParser),
    amex: await convertCSVtoJSON(filePaths.amex),
    chase: await convertCSVtoJSON(filePaths.chase)
  }
}
