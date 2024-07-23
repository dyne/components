import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { glob } from 'glob';
import { Array as A, pipe, Record as R, String as S } from 'effect';
import degit from 'degit';

// -- Config -- //

const SLANGROOM_REPO = 'github:dyne/slangroom';
const SLANGROOM_DIR = 'slangroom';
const EXAMPLES_DIR = 'examples';
const PRESETS_FILE = 'slangroom-presets.json';

// -- Instructions -- //

await cloneRepo(SLANGROOM_REPO, getTempSlangroomPath());
pipe(await getAllExamplesFilesPaths(), processAndParseExamplesPaths, serialize, writePresetFile);
deleteFolder(getTempSlangroomPath());

// -- Functions -- //

/**
 *
 * @param {string[]} paths
 * @returns
 */
function processAndParseExamplesPaths(paths) {
  return pipe(
    paths,

    A.filter(p => fs.lstatSync(p).isFile()),
    A.groupBy(p => path.basename(p).split('.').at(0)),

    R.map(paths => ({
      contract: paths.find(S.includes('.slang')),
      keys: paths.find(S.includes('.keys.')),
      data: paths.find(S.includes('.data.')),
      meta: paths.find(S.includes('.meta.')),
    })),

    R.map(contractData => ({
      group: path.dirname(contractData.contract).split('/').at(-1),
      ...contractData,
    })),

    R.map(contractData => ({
      group: contractData.group,
      contract: fs.readFileSync(contractData.contract).toString(),
      keys: fs.readFileSync(contractData.keys).toString(),
      data: fs.readFileSync(contractData.data).toString(),
      meta: JSON.parse(fs.readFileSync(contractData.meta).toString()),
    })),

    R.toEntries,
    A.groupBy(([_, contractData]) => contractData.group),
    R.map(R.fromEntries),
  );
}

function getAllExamplesFilesPaths() {
  return glob(path.join(getTempSlangroomPath(), EXAMPLES_DIR, '**', '*'));
}

function cwd() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  return __dirname;
}

/**
 *
 * @param {string} repo
 * @param {string} dest
 * @returns
 */
function cloneRepo(repo, dest) {
  return new Promise((resolve, reject) => {
    const emitter = degit(repo, {
      cache: true,
      force: true,
      verbose: true,
    });

    emitter.clone(dest).then(() => {
      resolve();
    });
  });
}

/**
 *
 * @param {unknown} data
 * @returns
 */
function serialize(data) {
  return JSON.stringify(data, null, 4);
}

function getTempSlangroomPath() {
  return path.join(cwd(), SLANGROOM_DIR);
}

function getPresetFilePath() {
  return path.join(cwd(), PRESETS_FILE);
}

/**
 *
 * @param {string} data
 * @returns
 */
function writePresetFile(data) {
  return fs.writeFileSync(getPresetFilePath(), data);
}

/**
 *
 * @param {string} path
 */
function deleteFolder(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}
