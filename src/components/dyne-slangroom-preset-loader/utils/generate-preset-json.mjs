import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { glob } from 'glob';
import { Array as A, pipe, Record as R, String as S, Option as O } from 'effect';
import degit from 'degit';

// -- Config -- //

const SLANGROOM_REPO = 'github:dyne/slangroom';
const SLANGROOM_DIR = 'slangroom';
const EXAMPLES_DIR = 'examples';
const PRESETS_FILE = 'slangroom-presets.json';
const BROWSER_LIB = 'pkg/browser/package.json';

// -- Instructions -- //

await cloneRepo(SLANGROOM_REPO, getTempSlangroomPath());

const browserModules = getSlangroomBrowserModules();
pipe(
  await getExamplesFilesPaths(browserModules),
  processAndParseExamplesPaths,
  serialize,
  writePresetFile,
);

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
      contract: readFileAsString(contractData.contract),
      keys: readFileAsString(contractData.keys),
      data: readFileAsString(contractData.data),
      meta: JSON.parse(readFileAsString(contractData.meta)),
    })),

    R.toEntries,
    A.groupBy(([_, contractData]) => contractData.group),
    R.map(R.fromEntries),
  );
}

/** @param {string[]} folders */
function getExamplesFilesPaths(folders = []) {
  const f = folders.length === 0 ? '**' : `{${folders.join(',')}}`;
  return glob(path.join(getTempSlangroomPath(), EXAMPLES_DIR, f, '*'));
}

/** @param {string} data */
function writePresetFile(data) {
  return fs.writeFileSync(getPresetFilePath(), data);
}

function getSlangroomBrowserModules() {
  return pipe(
    getSlangroomBrowserModulePackageJson(),
    packageJson => packageJson.dependencies,
    R.toEntries,
    A.map(A.get(0)),
    A.map(O.map(S.replace('@slangroom/', ''))),
    A.map(O.getOrThrow),
  );
}

/** @typedef {Object.<string, string>} StringRecord */
/** @returns {{dependencies: StringRecord}} browserLibPackageJson */
function getSlangroomBrowserModulePackageJson() {
  return pipe(getBrowserLibFilePath(), readFileAsString, JSON.parse);
}

// -- Utils: fs, cloning -- //

/**
 * @param {string} repo
 * @param {string} dest
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

/** @param {string} path */
function readFileAsString(path) {
  return fs.readFileSync(path).toString();
}

/** @param {string} data */
function serialize(data) {
  return JSON.stringify(data, null, 4);
}

/** @param {string} dir */
function deleteFolder(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

// -- Paths -- //

function cwd() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  return __dirname;
}

function getTempSlangroomPath() {
  return path.join(cwd(), SLANGROOM_DIR);
}

function getPresetFilePath() {
  return path.join(cwd(), PRESETS_FILE);
}

function getBrowserLibFilePath() {
  return path.join(getTempSlangroomPath(), BROWSER_LIB);
}
