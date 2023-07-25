import path from 'path';
import { readFileSync } from 'fs';
import { access, mkdir } from 'fs/promises';

/**
 * Retourne la version de O'vite depuis le `package.json`
 * 
 * @returns {string}
 */
function appVersion() {
  const { version } = JSON.parse(
    readFileSync(new URL('../../package.json', import.meta.url)).toString(),
  );
  return version;
}

/**
 * Vérifie si un dossier existe
 *
 * @param {string} directory Le nom du projet
 * @returns {Promise<boolean>}
 */
function exists(directory) {
  const target = path.basename(directory, '.git');

  return access(target)
    .then(() => true)
    .catch(() => false);
}

/**
 * Crée un dossier en fonction du nom du projet
 *
 * @param {string} name Le nom du projet
 * @returns {Promise<string | false>} Le nom du dossier de destination ; `false` en cas d'erreur
 */
function create(name) {
  return mkdir(name, { recursive: true })
    .then(() => name)
    .catch(() => false);
}

export {
  appVersion,
  exists,
  create,
}