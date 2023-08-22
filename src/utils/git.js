import { exec, execSync } from 'child_process';
import path from 'path';

/**
 * Vérifie si un dépôt existe en fonction de son adresse SSH
 *
 * @param {string} repo L'adresse SSH du dépôt
 * @returns {Promise<boolean>}
 */
function exists(repo) {
  return new Promise((resolve) => {
    const command = `git ls-remote --exit-code ${repo}`;
    exec(command, (error) => {
      resolve(!error);
    });
  });
}

/**
 * Clone un dépôt Git depuis son adresse SSH et retourne son nom
 *
 * @param {string} repo L'adresse SSH du dépôt
 * @returns {Promise<string | false>} Le nom du dossier de destination ; `false` en cas d'erreur
 */
function clone(repo) {
  return new Promise((resolve) => {
    const command = `git clone ${repo}`;
    exec(command, (error) => {
      if (error) {
        resolve(false);
      }

      resolve(path.basename(repo, '.git'));
    });
  });
}

/**
 * Initialise Git
 * 
 * @returns {Promise}
 */
function init() {
  return new Promise((resolve, reject) => {
    const command = 'git rev-parse --is-inside-work-tree';
    exec(command, (error, stdout, stderr) => {
      if (error || stderr) {
        // Git n'est pas initialisé
        const init = 'git init';

        exec(init, (err) => {
          if (err) {
            reject(err);
          }

          resolve(true);
        })
      } else {
        // Git est déjà initialisé
        resolve(true);
      }
    });
  });
}

/**
 * Ajoute les modifications à la zone de staging
 * 
 * @returns {Promise}
 */
function add() {
  return new Promise((resolve, reject) => {
    const command = 'git add -A';
    exec(command, (error) => {
      if (error) {
        reject(error);
      }

      resolve(true);
    });
  });
}

/**
 * Valide les modifications
 * 
 * @param {string} msg 
 * @returns {Promise}
 */
function commit(msg) {
  return new Promise((resolve, reject) => {
    const command = `git commit -m "${msg}"`;
    exec(command, (error) => {
      if (error) {
        reject(error);
      }

      resolve(true);
    });
  });
}

/**
 * Publie les modifications su le dépôt distant
 * 
 * @returns {Promise}
 */
function push() {
  return new Promise((resolve, reject) => {
    const command = 'git remote';
    exec(command, (error, stdout, stderr) => {
      if (error || stderr) {
        // erreur lors de la vérification du `remote`
        reject(error || stderr);
      } else if (!stdout.trim().length) {
        // pas de `remote`, pas de `push` (mais pas d'erreur)
        resolve(true);
      } else {
        // un `remote`, on push
        const command = 'git push';

        exec(command, (err) => {
          if (err) {
            reject(err);
          }

          resolve(true);
        })
      }
    });
  });
}

/**
 * Récupère l'e-mail associé à Git
 * 
 * @returns {Promise<string | 'inconnu'>}
 */
function getEmail() {  
  return new Promise((resolve) => {
    const command = 'git config --get user.email';
    exec(command, (error, stdout, stderr) => {
      if (error || stderr) {
        resolve('inconnu');
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

export {
  exists,
  clone,
  init,
  add,
  commit,
  push,
  getEmail,
}