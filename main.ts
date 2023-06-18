import { Command } from 'commander';
import fileHandler, { resetFiles } from "./file-handler";
import fileReader from "./file-reader"

async function main() {
  const program = new Command();
  program
    .requiredOption('-y, --year <year>', 'year directory')
    .requiredOption('-m, --month <month>', 'month directory')
    .option('-r, --reset', 'Reset files back to original places', false)

  program.parse(process.argv);
  const options = program.opts();

  if (options.reset === true) {
    await resetFiles(options.year, options.month);
    process.exit(0)
  }

  // const filePaths = await fileHandler(options.year, options.month);
  const filePaths = {
    usaa: '/Users/brianparrish/Documents/Finance/2023/6 - June/usaa.csv',
    amex: '/Users/brianparrish/Documents/Finance/2023/6 - June/amex.csv',
    chase: '/Users/brianparrish/Documents/Finance/2023/6 - June/chase.csv'
  }
  await fileReader(filePaths);
  // console.log('filePaths', filePaths);
}

main();