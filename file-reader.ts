import { FilePaths, RawTransaction } from "./server/models";
import { AMEXTransaction, ChaseTransaction, USAATransaction } from "./server/transaction";
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
  ].some((desc) => {
    if (transaction.Description.toLowerCase().includes(desc)) {
      console.log('IS TRANSFER', transaction.Description);
      return true;
    }
    else return false;
  })
}

export function getTransactionsFromCSV(
  filePath,
  parseParams: { [key: string]: unknown } = { noheader: false }
): (transactionConstructor: Function) => Promise<RawTransaction> {
  return (transactionConstructor) =>
    csv(parseParams)
      .fromFile(filePath)
      .then((rawTransactions: RawTransaction[]) =>
        rawTransactions
          .filter((rawTrx) => !isTransfer(rawTrx))
          .map((rawTrx) => transactionConstructor(rawTrx))
      );
}

export default async function main(filePaths: FilePaths): Promise<any> {
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
    usaa: await getTransactionsFromCSV(filePaths.usaa, usaaParser)((trx) => new USAATransaction(trx)),
    amex: await getTransactionsFromCSV(filePaths.amex)((trx) => new AMEXTransaction(trx)),
    chase: await getTransactionsFromCSV(filePaths.chase)((trx) => new ChaseTransaction(trx))
  }
}
