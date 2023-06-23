import { FilePaths, RawChaseTransaction, RawTransaction } from "./server/models";
import { AMEXTransaction, ChaseTransaction, Transaction, USAATransaction } from "./server/transaction";
const csv = require("csvtojson");

function isTransfer(transaction: RawTransaction) {
  return [
    "chase credit crd epay",
    "amex epayment",
    "usaa funds transfer",
    "usaa transfer",
    "online payment",
    "payment thank you - web",
    "american express credit card",
    "chase credit card"
  ].some((desc) => transaction.Description.toLowerCase().includes(desc))
}

type TransactionConverter = (trx: RawTransaction) => Transaction;

export function getTransactionsFromCSV(
  filePath: string | number,
  parseParams: { [key: string]: unknown } = { noheader: false }
): (transactionConverter: TransactionConverter) => Promise<Transaction[]> {
  return (transactionConverter) =>
    csv(parseParams)
      .fromFile(filePath)
      .then((rawTransactions: RawTransaction[]) =>
        rawTransactions
          .filter((rawTrx) => !isTransfer(rawTrx))
          .map((rawTrx) => transactionConverter(rawTrx))
      );
}

export default async function main(filePaths: FilePaths): Promise<Transaction[]> {
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

  const usaa = await getTransactionsFromCSV(filePaths.usaa, usaaParser)((trx) => new USAATransaction(trx));
  const amex = await getTransactionsFromCSV(filePaths.amex)((trx) => new AMEXTransaction(trx));
  const chase = await getTransactionsFromCSV(filePaths.chase)((trx: RawChaseTransaction) => new ChaseTransaction(trx));

  return [...usaa, ...amex, ...chase];
}
