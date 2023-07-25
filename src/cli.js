import arg from 'arg';
import { cwd } from 'process';
import path from 'path';
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
  ERROR_YARN_INSTALL,
  ERROR_GIT_COMMIT,
  INFO_TPL_COPY,
  INFO_YARN_INSTALL,
  INFO_GIT_COMMIT,
  INFO_OPEN_VSCODE,
  INFO_OPEN_BROWSER,
  SUCCESS_INSTALL,
} from './utils/index.js';


function getOptionsFromArguments(rawArgs) {
  console.log(32, rawArgs);
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
    },
    {
      argv: rawArgs.slice(2),
    }
  );
  console.log(52, args);

  return {
    skipPrompts: args['--yes'] || Object.keys(args).length > 1,
    react: args['--react'] || false,
    eslint: args['--eslint'] || false,
    access: args['--access'] || false,
    commit: args['--commit'] || false,
    typescript: args['--typescript'] || false,
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

async function getTargetDirectory(project) {
  if (project === '.') {
    return '';
  }

  if (await fs.exists(project)) {
    msg.error(ERROR_DIR_EXISTS);
    process.exit(1);
  }

  if (project.endsWith('.git')) {
    const exists = await git.exists(project);

    if (!exists) {
      msg.error(ERROR_GIT_EXISTS);
      process.exit(1);
    }

    const cloned = await git.clone(project);

    if (!cloned) {
      msg.error(ERROR_GIT_CLONE);
      process.exit(1);
    }

    return cloned;
  }

  const created = await fs.create(project);

  if (!created) {
    msg.error(ERROR_DIR_CREATE);
    process.exit(1);
  }

  return created;
}

function sayHello(config, targetDirectory) {
  // const choices = (
  //   Object.entries(config)
  //     .map(
  //       ([key, value]) => (
  //         value ? (['project', 'template'].includes(key) ? value : key) : false
  //       )
  //     )
  //     .filter((choice) => choice)
  // );

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

async function copyFiles(config, targetDirectory) {
  return Promise.allSettled([
    template.copyTPL(config, targetDirectory),
    template.copyVSC(targetDirectory),
  ]);
}

function displayNextSteps(targetDirectory) {
  msg.paint('');
  msg.info('La prochaine étape ?');
  msg.paint(`    cd ${targetDirectory}`);
  msg.paint(`    code .`);
  msg.paint(`    yarn dev`);
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

export default async function cli(args) {
  const options = getOptionsFromArguments(args);
  const config = await promptForMissingOptions(options);
  const targetDirectory = await getTargetDirectory(config.project);

  sayHello(config, targetDirectory);

  // on copie les dossiers/fichiers depuis le template
  const copied = await oraPromise(copyFiles(config, targetDirectory), INFO_TPL_COPY);

  if (copied.find(({ status }) => status === 'rejected')) {
    copied[0]._directory = 'template';
    copied[1]._directory = 'vscode';

    msg.error(ERROR_TPL_COPY);
    msg.paint(JSON.stringify(copied, null, 2), ['red', 'dim']);
    process.exit(1);
  }

  // on se met dans le dossier cible pour la suite
  process.chdir(`./${targetDirectory}`);

  // on installe les dépendances
  try {
    await oraPromise(cmd.install(), INFO_YARN_INSTALL);
  } catch (err) {
    msg.error(ERROR_YARN_INSTALL);
    msg.paint(JSON.stringify(err, null, 2), ['red', 'dim']);
    process.exit(1);
  }

  // on valide les modifications
  if (config.commit) {
    try {
      await oraPromise(cmd.commit(), INFO_GIT_COMMIT);
    } catch (err) {
      msg.error(ERROR_GIT_COMMIT);
      msg.paint(JSON.stringify(err, null, 2), ['red', 'dim']);
      process.exit(1);
    }
  }

  // on ouvre le projet dans VS Code et le navigateur
  if (config.access) {
    await oraPromise(cmd.code(), INFO_OPEN_VSCODE);
    await oraPromise(cmd.serve(), INFO_OPEN_BROWSER);
  }
  
  msg.paint('');
  msg.success(SUCCESS_INSTALL);
  
  // message de fin 
  if (!config.access) {
    displayNextSteps(targetDirectory);
  }
  else {
    displayShortcuts();
  }
}
