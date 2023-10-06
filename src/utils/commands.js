import os from 'os';
import { exec } from 'child_process';
import inquirer from 'inquirer';

import * as git from './git.js';

/**
 * Propose l'installation de PNPM
 * 
 * @returns {Promise}
 */
async function installPNPM() {
  const questions = [
    {
        type: 'confirm',
        name: 'pnpm',
        message: 'Voulez-vous installer PNPM ?',
        default: true,
    },
  ];

  return inquirer.prompt(questions)
    .then((answers) => {
      if (answers.pnpm) {
        return new Promise((resolve) => {
          const command = `npm install -g pnpm`;
          exec(command, (error) => {
            if (error) {
              console.error('Erreur lors de l\'installation de PNPM :', error.message);
              resolve('npm');
            }
      
            resolve('pnpm');
          });
        });
      }

      return 'npm';
    });
}

/**
 * Retourne le nom du package manager
 * 
 * @returns {Promise}
 */
function getPackageName() {
  return new Promise((resolve) => {
    const command = `pnpm --version`;
    exec(command, (error) => {
      if (error) {
        // resolve('npm');
        resolve(installPNPM());
      }

      resolve('pnpm');
    });
  });
}

/**
 * Installe les dépendances avec PNPM ou NPM
 * 
 * @param {string} pckName 'pnpm' || 'npm' 
 * @returns {Promise}
 */
function install(pckName) {
  return new Promise((resolve, reject) => {
    const command = `${pckName} install`;
    exec(command, (error) => {
      if (error) {
        reject(error);
      }

      resolve(true);
    });
  });
}

/**
 * Crée le premier commit et le publie
 * 
 * @returns {Promise}
 */
function commit() {
  return new Promise((resolve, reject) => {
    return git.init()
      .then(() => git.add())
      .then(() => git.commit('Install Vite'))
      .then(() => git.push())
      .then(() => resolve(true))
      .catch((error) => reject(error));
  });
}

/**
 * Ouvre le projet dans VS Code
 * 
 * @returns {Promise}
 */
function code() {
  return new Promise((resolve, reject) => {
    const command = `code .`;
    exec(command, (error) => {
      if (error) {
        reject(error);
      }

      resolve(true);
    });
  });
}

/**
 * Lance le serveur de développement de Vite
 * 
 * @param {string} pckName 'pnpm' || 'npm' 
 * @returns {Promise}
 */
function serve(pckName) {
  return new Promise((resolve, reject) => {
    const command = `${pckName} run dev --open`;
    exec(command, (error) => {
      if (error) {
        reject(error);
      }
    });

    resolve(true);
  });
}

/**
 * Retourne le processus qui tourne sur le port donné (5173 : défaut de Vite)
 * 
 * @param {number} [port=5173] 
 * @returns {Promise}
 */
function getProcessPID(port = 5173) {
  return new Promise((resolve, reject) => {
    const command = `netstat -ano | ${os.platform() === 'win32' ? 'findstr' : 'grep'} :${port}`;
    exec(command, (error, stdout) => {
      if (error) {
        reject(error);
      }
      
      const lines = stdout.split('\n');
      const lineWithPID = lines.find((line) => line.includes(`:${port}`));

      if (lineWithPID) {
        const PID = lineWithPID.trim().split(/\s+/).pop();
        resolve(PID);
      }
      
      resolve(null);
    });
  });
}

/**
 * Quitte le serveur Vite
 * 
 * @returns {Promise}
 */
async function quit() {
  const PID = await getProcessPID();
  
  return new Promise((resolve, reject) => {
    const command = os.platform() === 'win32' ? `taskkill /F /PID ${PID}` : `kill -9 ${PID}`;
    exec(command, (error) => {
      if (error) {
        reject(error);
      }
      
      resolve(true);
    });
  });
}

export {
  getPackageName,
  install,
  commit,
  code,
  serve,
  quit,
}