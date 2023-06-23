import * as chalk from 'chalk';
import * as _ from 'lodash';
import { promises as fsPromises } from "fs";

import { MONTH_LIST } from "./constants";
import { FilePaths } from "./server/models";

const DOWNLOADS_DIR = `/Users/brianparrish/Downloads`
const FINANCE_DIR = `/Users/brianparrish/Documents/Finance`;

 
async function getFileFromDownloads(fileName) {
  const files = await fsPromises.readdir(DOWNLOADS_DIR);
  const matches = files.filter((file) => file === fileName);
  if (matches.length > 1) throw new Error(`more than one download matching ${fileName}`)
  else if (matches.length === 0) throw new Error(`could not find any downloads matching ${fileName}`);
  else return matches[0];
}

async function checkForFiles(): Promise<FilePaths> {
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

async function moveFiles(year: string, month: string, files: FilePaths): Promise<FilePaths> {
  const newMonthDir = await makeDirForMonth(year, month)
  const errors = [];
  const handleErr = (err) => errors.push(err.message);
  const usaa = await moveFileToDir(`${DOWNLOADS_DIR}/${files.usaa}`, 'usaa.csv', newMonthDir).catch(handleErr)
  const amex = await moveFileToDir(`${DOWNLOADS_DIR}/${files.amex}`, 'amex.csv', newMonthDir).catch(handleErr)
  const chase = await moveFileToDir(`${DOWNLOADS_DIR}/${files.chase}`, 'chase.csv', newMonthDir).catch(handleErr)
  if (errors.length) {
    throw new Error(errors.join("\n"))
  }
  return { usaa, amex, chase }
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
  const fileDownloadPaths = await checkForFiles().catch((err) => {
    console.error(chalk.red(`ERRORS:\n`, err.message));
    process.exit(0)
  });

  const fileMovedPaths = await moveFiles(year, month, fileDownloadPaths).catch((err) => {
    console.error(chalk.red(`ERRORS:\n`, err.message));
    process.exit(0)
  })

  return fileMovedPaths;
}