import { promises as fsPromises, rename } from "fs";
import * as _ from 'lodash';
import * as chalk from 'chalk';
import { Command } from 'commander';
import { MONTH_LIST } from "./constants";

const DOWNLOADS_DIR = `/Users/brianparrish/Downloads`
const FINANCE_DIR = `/Users/brianparrish/Documents/Finance`;
 
async function getFileFromDownloads(fileName) {
  const files = await fsPromises.readdir(DOWNLOADS_DIR);
  const matches = files.filter((file) => file === fileName);
  if (matches.length > 1) throw new Error(`more than one download matching ${fileName}`)
  else if (matches.length === 0) throw new Error(`could not find any downloads matching ${fileName}`);
  else return matches[0];
}

async function checkForFiles() {
  const errors = [];
  const handleErr = (err) => errors.push(err.message);
  await getFileFromDownloads("bk_download.csv").catch(handleErr)
  await getFileFromDownloads("activity.csv").catch(handleErr)
  await getFileFromDownloads("Chase9859.csv").catch(handleErr);
  if (errors.length) {
    throw new Error(errors.join("\n"))
  } else {
    return true;
  }
}

async function makeDirForMonth(year: string, month: string) {
  const yearDir = `${FINANCE_DIR}/${year}`;
  const monthNum = MONTH_LIST.indexOf(month.toLowerCase()) + 1;
  const monthDirname = `${monthNum} - ${_.capitalize(month)}`;
  const newDir = `${yearDir}/${monthDirname}`
  return fsPromises.mkdir(newDir).then(() => newDir)
}

async function main() {
  const program = new Command();
  program
    .requiredOption('-y, --year <year>', 'year directory')
    .requiredOption('-m, --month <month>', 'month directory')
  program.parse(process.argv);
  const options = program.opts();
  // const files = await checkForFiles().catch((err) => {
  //   console.error(chalk.red(`ERRORS:\n`, err.message));
  //   process.exit(0)
  // });
  const newMonthDir = await makeDirForMonth(options.year, options.month)
  console.log('dir', newMonthDir);
  // console.log('files', files);
}

main();