import os from 'os';
import { exec } from 'child_process';

import * as git from './git.js';

/**
 * Installe les dépendances avec Yarn
 * 
 * @returns {Promise}
 */
function install() {
  return new Promise((resolve, reject) => {
    const command = `yarn`;
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
  return new Promise(async (resolve, reject) => {
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
 * @returns {Promise}
 */
function serve() {
  return new Promise((resolve, reject) => {
    const command = `yarn dev --open`;
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
  install,
  commit,
  code,
  serve,
  quit,
}