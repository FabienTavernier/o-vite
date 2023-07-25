/**
 * @typedef {Object} Config
 * @property {boolean} skipPrompts
 * @property {boolean} react
 * @property {boolean} eslint
 * @property {boolean} airbnb
 * @property {boolean} commit
 * @property {boolean} typescript
 * @property {string} project
 * @property {string} template
 */

import path from 'path';
import fse from 'fs-extra';
import { fileURLToPath } from 'url';

import { create } from './fs.js';

const { copy, CopyOptions } = fse;

const scriptName = fileURLToPath(import.meta.url);
const srcDir = path.dirname(scriptName);

/**
 * Retrouve le chemin du template en fonction des réponses
 *
 * @param {Config} config
 * @returns {string}
 */
function get(config) {
  const { eslint, template, typescript } = config;

  const tpl = [template];

  if (typescript) {
    tpl.push('ts');
  }

  if (eslint) {
    tpl.push('airbnb');
  }

  return path.resolve(srcDir, '../templates', tpl.join('-'));
}

/**
 * Copie le template dans le dossier de destination
 *
 * @param {Config} config
 * @param {string} dest
 * @returns {Promise<boolean>}
 */
function copyTPL(config, dest) {
  const template = get(config);

  return copyDir(template, `./${dest}`, { overwrite: false });
}

/**
 * Copie le dossier `.vscode` dans le dossier de destination
 *
 * @param {string} parent
 * @returns {Promise<boolean>}
 */
async function copyVSC(parent) {
  const source = path.resolve(srcDir, '../vscode');
  const dest = await create(`${parent}/.vscode`);

  return copyDir(source, `./${dest}`, { overwrite: false });
}

/**
 * Copie un dossier dans le dossier de destination
 *
 * @param {string} source
 * @param {string} dest
 * @param {CopyOptions} options
 * @returns {Promise<boolean>}
 */
function copyDir(source, dest, options) {
  return copy(source, dest, options)
    .then(() => true)
    .catch(() => false);
}

export {
  copyTPL,
  copyVSC,
}