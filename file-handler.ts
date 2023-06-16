import { promises as fsPromises } from "fs";
import * as _ from 'lodash';
import * as chalk from 'chalk';
import { MONTH_LIST } from "./constants";

const DOWNLOADS_DIR = `/Users/brianparrish/Downloads`
const FINANCE_DIR = `/Users/brianparrish/Documents/Finance`;

interface FileList {
  usaa: string | number;
  amex: string | number;
  chase: string | number;
}
 
async function getFileFromDownloads(fileName) {
  const files = await fsPromises.readdir(DOWNLOADS_DIR);
  const matches = files.filter((file) => file === fileName);
  if (matches.length > 1) throw new Error(`more than one download matching ${fileName}`)
  else if (matches.length === 0) throw new Error(`could not find any downloads matching ${fileName}`);
  else return matches[0];
}

async function checkForFiles(): Promise<FileList> {
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

async function moveFiles(year: string, month: string, files: FileList) {
  const newMonthDir = await makeDirForMonth(year, month)
  const errors = [];
  const handleErr = (err) => errors.push(err.message);
  await moveFileToDir(`${DOWNLOADS_DIR}/${files.usaa}`, 'usaa.csv', newMonthDir).catch(handleErr)
  await moveFileToDir(`${DOWNLOADS_DIR}/${files.amex}`, 'amex.csv', newMonthDir).catch(handleErr)
  await moveFileToDir(`${DOWNLOADS_DIR}/${files.chase}`, 'chase.csv', newMonthDir).catch(handleErr)
  if (errors.length) {
    throw new Error(errors.join("\n"))
  }
}

export async function resetFiles(year, month) {
  const yearDir = `${FINANCE_DIR}/${year}`;
  const monthNum = MONTH_LIST.indexOf(month.toLowerCase()) + 1;
  const monthDirname = `${monthNum} - ${_.capitalize(month)}`;
  const newDir = `${yearDir}/${monthDirname}`
  await moveFileToDir(`${newDir}/usaa.csv`, `bk_download.csv`, DOWNLOADS_DIR);
  await moveFileToDir(`${newDir}/amex.csv`, `activity.csv`, DOWNLOADS_DIR);
  await moveFileToDir(`${newDir}/chase.csv`, `Chase9859.csv`, DOWNLOADS_DIR);
  await fsPromises.rmdir(newDir)
}

export default async function main(year: string, month: string) {
  const files = await checkForFiles().catch((err) => {
    console.error(chalk.red(`ERRORS:\n`, err.message));
    process.exit(0)
  });

  await moveFiles(year, month, files).catch((err) => {
    console.error(chalk.red(`ERRORS:\n`, err.message));
    process.exit(0)
  })
}