import { promises as fsPromises } from "fs";

async function getFileFromDownloads(fileName) {
  const files = await fsPromises.readdir(`/Users/brianparrish/Downloads`);
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
    throw new Error(errors.join(", "))
  } else {
    return true;
  }
}

async function main() {
  const files = await checkForFiles();
  console.log('files', files);
}

main();