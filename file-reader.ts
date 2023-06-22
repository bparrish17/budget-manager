import { FilePaths, RawTransaction, RawTransactions } from "./server/models";
import { AMEXTransaction, ChaseTransaction, RawChaseTransaction, USAATransaction } from "./server/transaction";
const csv = require("csvtojson");

export function convertCSVtoJSON(
  filePath,
  parseParams: { [key: string]: unknown } = { noheader: false }
): (transactionConverter: Function) => Promise<RawTransaction> {
  return (transactionConverter) =>
    csv(parseParams)
      .fromFile(filePath)
      .then((rawTransactions: RawTransaction[]) =>
        rawTransactions
          .map((rawTrx) => transactionConverter(rawTrx))
          .filter((trx) => trx !== null)
      );
}

function createUSAATransaction(transaction: RawTransaction): USAATransaction {
	if (Object.keys(transaction).length) {
    const hasDesc = (desc: string) => transaction.Description.toLowerCase().includes(desc)
		if (hasDesc('chase credit crd epay')) return null;
		if (hasDesc('amex epayment')) return null;
		if (hasDesc('usaa funds transfer')) return null;
		return new USAATransaction(transaction)
	}
}

function createAMEXTransaction(transaction: RawTransaction): AMEXTransaction {
  console.log('====', transaction.Description);
  if (transaction.Description.toLowerCase().includes('online payment')) return null;
	return new AMEXTransaction(transaction);
}

function createChaseTransaction(transaction: RawChaseTransaction): ChaseTransaction {
	if (transaction.Type === 'Payment') return null;
	return new ChaseTransaction(transaction);
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
    // usaa: await convertCSVtoJSON(filePaths.usaa, usaaParser)(createUSAATransaction),
    amex: await convertCSVtoJSON(filePaths.amex)(createAMEXTransaction),
    // chase: await convertCSVtoJSON(filePaths.chase)(createChaseTransaction)
  }
}
