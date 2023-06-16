import { Command } from 'commander';
import fileHandler, { resetFiles } from "./file-handler";

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

  await fileHandler(options.year, options.month);
}

main();