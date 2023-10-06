/**
 * Table des codes erreur
 * 
 * | code | erreur                                              |
 * |------|-----------------------------------------------------|
 * |  110 | Le dossier de destination existe déjà               |
 * |  120 | Le dépôt Git n'existe pas ou est inaccessible       |
 * |  121 | Échec du clonage du dépôt Git                       |
 * |  130 | Échec lors de la création du dossier de destination |
 * |  210 | Échec lors de la copie du template                  |
 * |  220 | Échec lors de l'installation des dépendances        |
 * |  230 | Échec lors du commit de l'installation              |
 */

import arg from 'arg';
import { cwd } from 'process';
import path from 'path';
import os from 'os';
import readline from 'readline';
import inquirer from 'inquirer';
import { oraPromise } from 'ora';

import {
  cmd,
  fs,
  git,
  msg,
  template,

  ERROR_DIR_CREATE,
  ERROR_DIR_EXISTS,
  ERROR_GIT_CLONE,
  ERROR_GIT_EXISTS,
  ERROR_TPL_COPY,
  ERROR_DEPS_INSTALL,
  ERROR_GIT_COMMIT,
  INFO_TPL_COPY,
  INFO_DEPS_INSTALL,
  INFO_GIT_COMMIT,
  INFO_OPEN_VSCODE,
  INFO_OPEN_BROWSER,
  SUCCESS_INSTALL,
} from './utils/index.js';


function getOptionsFromArguments(rawArgs) {
  const args = arg(
    {
      '--yes': Boolean,
      '--react': Boolean,
      '--eslint': Boolean,
      '--access': Boolean,
      '--commit': Boolean,
      '--typescript': Boolean,
      '-y': '--yes',
      '-r': '--react',
      '-e': '--eslint',
      '-a': '--access',
      '-c': '--commit',
      '-t': '--typescript',

      '--debug': Boolean,
    },
    {
      argv: rawArgs.slice(2),
    }
  );

  return {
    skipPrompts: args['--yes'] || Object.keys(args).length > 1,
    react: args['--react'] || false,
    eslint: args['--eslint'] || false,
    access: args['--access'] || false,
    commit: args['--commit'] || false,
    typescript: args['--typescript'] || false,
    debug: args['--debug'] || false,
    project: args._[0],
  };
}

async function promptForMissingOptions(options) {
  // add a project name/path
  options.project = options.project || '.';
  // add the default template
  options.template = options.react ? 'react' : 'vanilla';

  // return options if `--yes` or any `--[option]`
  if (options.skipPrompts) {
    return options;
  }

  const questions = [];

  // ask for template (Vanilla | React)
  if (!options.react) {
    questions.push({
      type: 'list',
      name: 'template',
      message: 'Merci de spécifier le template à utiliser',
      choices: ['Vanilla', 'React'],
      default: 'Vanilla',
    });
  }

  // ask for TypeScript (no | yes)
  if (!options.typescript) {
    questions.push({
      type: 'confirm',
      name: 'typescript',
      message: 'Veux-tu utiliser TypeScript ?',
      default: false,
    });
  }

  // ask for ESLint (no | yes)
  if (!options.eslint) {
    questions.push({
      type: 'confirm',
      name: 'eslint',
      message: 'Veux-tu ajouter ESLint ?',
      default: false,
    });
  }

  // ask to push a first commit on Github (no | yes)
  if (!options.commit) {
    questions.push({
      type: 'confirm',
      name: 'commit',
      message: 'Veux-tu valider automatiquement l\'installation sur Github (commit) ?',
      default: false,
    });
  }

  // ask for access (open VS Code and the browser) (no | yes)
  if (!options.access) {
    questions.push({
      type: 'confirm',
      name: 'access',
      message: 'Veux-tu ouvrir VS Code et le projet dans le navigateur ?',
      default: false,
    });
  }

  const answers = await inquirer.prompt(questions);

  const useReact = options.react || answers.template === 'React';

  return {
    ...options,
    template: useReact ? 'react' : 'vanilla',
    typescript: options.typescript || answers.typescript,
    eslint: options.eslint || answers.eslint,
    access: options.access || answers.access,
    commit: options.commit || answers.commit,
  };
}

async function getTargetDirectory(project, debug) {
  if (project === '.') {
    return '';
  }

  if (debug) {
    return project.endsWith('.git')
      ? path.basename(project, '.git')
      : project;
  }

  if (await fs.exists(project)) {
    msg.error(ERROR_DIR_EXISTS);
    process.exit(110);
  }

  if (project.endsWith('.git')) {
    const exists = await git.exists(project);

    if (!exists) {
      msg.error(ERROR_GIT_EXISTS);
      process.exit(120);
    }

    const cloned = await git.clone(project);

    if (!cloned) {
      msg.error(ERROR_GIT_CLONE);
      process.exit(121);
    }

    return cloned;
  }

  const created = await fs.create(project);

  if (!created) {
    msg.error(ERROR_DIR_CREATE);
    process.exit(130);
  }

  return created;
}

function sayHello(config, targetDirectory) {
  // on récupère le chemin du dossier final
  const target = path.resolve(cwd(), targetDirectory);
  
  // on récupère le template utilisé
  const tpl = [
    config.template.replace(/^[a-z]/, (match) => match.toUpperCase()),
  ];

  if (config.typescript) {
    tpl.push('TypeScript');
  }

  if (config.eslint) {
    tpl.push('Airbnb');
  }
  
  // on affiche l'en-tête
  msg.banner(
    msg.get("O", ['cyan', 'bold']) +
    msg.get("'", ['red', 'bold']) +
    msg.get("VITE ", ['cyan', 'bold']) +
    msg.get(`v${fs.appVersion()}`, ['grey']) +
    msg.get('\n\n') +
    msg.get('dossier : ', ['white']) +
    msg.get(target, ['grey']) +
    msg.get('\n') +
    msg.get('template : ', ['white']) +
    msg.get(tpl.join(' + '), ['grey'])
  );
}

async function sayDebug(config, targetDirectory)  {
  // on récupère le chemin du dossier final
  const target = path.resolve(cwd(), targetDirectory);
  
  // on récupère les options
  const options = Object.entries(config).map(([key, value]) => `${key}: ${value}`);

  // on récupère la version de Node
  const nodeVersion = process.version;
  const isNodeEven = nodeVersion.match(/v(\d+)/)[1] % 2 === 0;

  // on récupère l'e-mail associé au compte GH
  const email = await git.getEmail();

  // on vérifie si l'adresse SSH correspond à un dépôt Git
  let gitMessage = '';
  if (config.project.endsWith('.git')) {
    const exists = await git.exists(config.project);

    gitMessage = (
      msg.get('\n') +
      msg.get('dépôt Git : ', ['white']) +
      msg.get(exists ? 'vérifié' : 'ERREUR', [exists ? 'green' : 'red'])
    );
  }

  // on vérifie si le dossier de destination existe déjà
  const targetIcon = await fs.exists(target)
    ? msg.get(' ✖', ['red'])
    : msg.get(' ✔', ['green']);

  // OS
  const osData = [
    `os : ${os.type()} ${os.release()}`,
    `terminal : ${process.env.TERM_PROGRAM || process.env.TERM}`,
    `shell : ${process.env.SHELL}`,
  ];
  
  // on affiche l'en-tête
  msg.banner(
    msg.get("O", ['cyan', 'bold']) +
    msg.get("'", ['red', 'bold']) +
    msg.get("VITE ", ['cyan', 'bold']) +
    msg.get(`v${fs.appVersion()}`, ['grey']) +
    msg.get('\n\n') +
    msg.get('— Mode DEBUG —', ['yellow']) +
    msg.get('\n\n') +
    msg.get('node : ', ['white']) +
    msg.get(nodeVersion, [isNodeEven ? 'green' : 'red']) +
    msg.get('\n') +
    msg.get('email : ', ['white']) +
    msg.get(email, [email === 'inconnu' ? 'red' : 'green']) +
    gitMessage +
    msg.get('\n\n') +
    msg.get('dossier : ', ['white']) +
    msg.get(target, ['grey']) +
    targetIcon +
    msg.get('\n\n') +
    msg.get('options : ', ['white']) +
    msg.get('\n') +
    msg.get(options.join('\n'), ['grey']) +
    msg.get('\n\n') +
    msg.get('informations système : ', ['white']) +
    msg.get('\n') +
    msg.get(osData.join('\n'), ['grey'])
  );

  process.exit();
}

async function copyFiles(config, targetDirectory) {
  return Promise.allSettled([
    template.copyTPL(config, targetDirectory),
    template.copyVSC(targetDirectory),
  ]);
}

function displayNextSteps(targetDirectory, pckName) {
  msg.paint('');
  msg.info('La prochaine étape ?');
  msg.paint(`    cd ${targetDirectory}`);
  msg.paint(`    code .`);
  msg.paint(`    ${pckName} run dev`);
}

function displayShortcuts() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.input.on('keypress', (character) => {
    if (character === 'q') {
      cmd.quit()
        .finally(() => {
          process.exit();
        });
    }
  });

  msg.paint('');

  msg.log(
    msg.get('  ➜', ['white']) +
    msg.get('  appuyez sur ', ['grey']) +
    msg.get('q', ['white', 'bold']) +
    msg.get(' pour quitter', ['grey'])
  );
}

function displayErrorOnExit(exitCode) {
  msg.paint('');
  msg.info("Il semble qu'une erreur soit survenue pendant le processus");

  msg.border(
    msg.get(
      "Si tu es bloqué, n'hésite pas à retaper ta commande en y ajoutant ",
      ['grey']
    ) +
    msg.get('--debug', ['yellow']) +
    msg.get(
      ", d'en faire une capture d'écran et de l'envoyer à ton formateur/tuteur avec le code ",
      ['grey']
    ) +
    msg.get(exitCode, ['red', 'bold']) +
    msg.get(
      " ou la dernière erreur retournée",
      ['grey']
    ) +
    msg.get('\n') + 
    msg.get(
      "exemple : npm create o-vite@latest -- -react my-project --debug",
      ['grey']
    )
  );
}

export default async function cli(args) {
  process.on('exit', (exitCode) => {
    if (exitCode) {
      displayErrorOnExit(exitCode);
    }
  });

  let pckName = 'npm';

  const options = getOptionsFromArguments(args);
  const config = await promptForMissingOptions(options);
  const targetDirectory = await getTargetDirectory(config.project, config.debug);

  config.debug
    ? await sayDebug(config, targetDirectory)
    : sayHello(config, targetDirectory);

  // on copie les dossiers/fichiers depuis le template
  const copied = await oraPromise(copyFiles(config, targetDirectory), INFO_TPL_COPY);

  if (copied.find(({ status }) => status === 'rejected')) {
    copied[0]._directory = 'template';
    copied[1]._directory = 'vscode';

    msg.error(ERROR_TPL_COPY);
    msg.paint(JSON.stringify(copied, null, 2), ['red', 'dim']);
    process.exit(210);
  }

  // on se met dans le dossier cible pour la suite
  process.chdir(`./${targetDirectory}`);

  // on installe les dépendances
  try {
    pckName = await cmd.getPackageName();
    await oraPromise(cmd.install(pckName), INFO_DEPS_INSTALL);
  } catch (err) {
    msg.error(ERROR_DEPS_INSTALL);
    console.log(412, err);
    const errorStr = typeof err === 'string'
    ? err
    : JSON.stringify(err, null, 2);
    console.log(416, errorStr);

    msg.paint(errorStr, ['red', 'dim']);
    process.exit(220);
  }

  // on valide les modifications
  if (config.commit) {
    try {
      await oraPromise(cmd.commit(), INFO_GIT_COMMIT);
    } catch (err) {
      msg.error(ERROR_GIT_COMMIT);
      msg.paint(JSON.stringify(err, null, 2), ['red', 'dim']);
      process.exit(230);
    }
  }

  // on ouvre le projet dans VS Code et le navigateur
  if (config.access) {
    await oraPromise(cmd.code(), INFO_OPEN_VSCODE);
    await oraPromise(cmd.serve(pckName), INFO_OPEN_BROWSER);
  }
  
  msg.paint('');
  msg.success(SUCCESS_INSTALL);
  
  // message de fin 
  if (!config.access) {
    displayNextSteps(targetDirectory, pckName);
  }
  else {
    displayShortcuts();
  }
}

if (!('toJSON' in Error.prototype))
Object.defineProperty(Error.prototype, 'toJSON', {
    value: function () {
        const alt = {};

        Object.getOwnPropertyNames(this).forEach(function (key) {
            alt[key] = this[key];
        }, this);

        return alt;
    },
    configurable: true,
    writable: true,
});
