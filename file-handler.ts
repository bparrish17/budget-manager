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
  const usaa = await getFileFromDownloads("bk_download.csv").catch(handleErr)
  const amex = await getFileFromDownloads("activity.csv").catch(handleErr)
  const chase = await getFileFromDownloads("Chase9859.csv").catch(handleErr);
  if (errors.length) {
    throw new Error(errors.join("\n"))
  } else {
    return { usaa, amex, chase };
  }
}

async function makeDirForMonth(year: string, month: string) {
  const yearDir = `${FINANCE_DIR}/${year}`;
  const monthNum = MONTH_LIST.indexOf(month.toLowerCase()) + 1;
  const monthDirname = `${monthNum} - ${_.capitalize(month)}`;
  const newDir = `${yearDir}/${monthDirname}`
  return fsPromises.mkdir(newDir).then(() => newDir)
}

async function moveFileToDir(filePath: string, targetName: string, targetDir: string) {
  const newPath = `${targetDir}/${targetName}`
  return fsPromises.rename(filePath, newPath).then(() => newPath);
}

async function reset(year, month) {
  const yearDir = `${FINANCE_DIR}/${year}`;
  const monthNum = MONTH_LIST.indexOf(month.toLowerCase()) + 1;
  const monthDirname = `${monthNum} - ${_.capitalize(month)}`;
  const newDir = `${yearDir}/${monthDirname}`
  await moveFileToDir(`${newDir}/usaa.csv`, `bk_download.csv`, DOWNLOADS_DIR);
  await moveFileToDir(`${newDir}/amex.csv`, `activity.csv`, DOWNLOADS_DIR);
  await moveFileToDir(`${newDir}/chase.csv`, `Chase9859.csv`, DOWNLOADS_DIR);
  await fsPromises.rmdir(newDir)
}

async function main() {
  const program = new Command();
  program
    .requiredOption('-y, --year <year>', 'year directory')
    .requiredOption('-m, --month <month>', 'month directory')
    .option('-r', '--reset', 'Reset files back to original places')
  program.parse(process.argv);
  const options = program.opts();

  console.log('options', options);
  if (options.r) {
    console.log('reseting')
    await reset(options.year, options.month);
    process.exit(0)
  }
  const files = await checkForFiles().catch((err) => {
    console.error(chalk.red(`ERRORS:\n`, err.message));
    process.exit(0)
  });
  const newMonthDir = await makeDirForMonth(options.year, options.month)
  await moveFileToDir(`${DOWNLOADS_DIR}/${files.usaa}`, 'usaa.csv', newMonthDir)
  await moveFileToDir(`${DOWNLOADS_DIR}/${files.amex}`, 'amex.csv', newMonthDir)
  await moveFileToDir(`${DOWNLOADS_DIR}/${files.chase}`, 'chase.csv', newMonthDir)

  console.log('dir', newMonthDir);
  // console.log('files', files);

}

main();