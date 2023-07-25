import chalk from 'chalk';
import boxen from 'boxen';

/**
 * Affiche un message dans le terminal
 * 
 * @param {string} msg Le message à afficher
 * @param {string} [specifier=''] Le texte à remplacer dans `msg`
 * 
 * @example
 * // retourne 'Hello Dave'
 * log('Hello %s', 'Dave');
 * @example
 * // retourne 'Hello Dave'
 * log('Hello Dave');
 * @example
 * // retourne 'Hello Dave'
 * log('Hello', 'Dave');
 */
export function log(msg, specifier = '') {
  console.log(msg, specifier);
}

/**
 * Affiche un message d'erreur dans le terminal
 * 
 * @param {string} msg 
 */
export function error(msg) {
  log(chalk.red('✖ %s'), msg);
}

/**
 * Affiche un message d'information dans le terminal
 * 
 * @param {string} msg 
 */
export function info(msg) {
  log(chalk.blue('ℹ %s'), msg);
}

/**
 * Affiche un message de succès dans le terminal
 * 
 * @param {string} msg 
 */
export function success(msg) {
  log(chalk.green.bold('✔ %s'), msg);
}

/**
 * Affiche un message d'avertissement dans le terminal
 * 
 * @param {string} msg 
 */
export function warning(msg) {
  log(chalk.yellow('⚠ %s'), msg);
}

/**
 * Récupère un chalk avec un style personnalisé
 *
 * @param {string} msg Le message à récupérer
 * @param {string[]} options Le nom des _modifiers_ et/ou _colors_ à appliquer
 *
 * @see https://github.com/chalk/chalk#styles
 * 
 * @example
 * // retourne 'Une erreur est survenue' en rouge et gras
 * paint('Une erreur est survenue', ['red', 'bold']);
 * @example
 * // retourne 'Une erreur est survenue' en blanc sur fond rouge
 * paint('Une erreur est survenue', ['white', 'bgRed']);
 */
export function get(msg, options = []) {
  const custom = options.reduce((prev, cur) => prev[cur], chalk);

  return custom(msg);
}

/**
 * Affiche un message avec un style personnalisé dans le terminal
 *
 * @param {string} msg Le message à afficher
 * @param {string[]} options Le nom des _modifiers_ et/ou _colors_ à appliquer
 *
 * @see https://github.com/chalk/chalk#styles
 * 
 * @example
 * // affiche 'Une erreur est survenue' en rouge et gras
 * paint('Une erreur est survenue', ['red', 'bold']);
 * @example
 * // affiche 'Une erreur est survenue' en blanc sur fond rouge
 * paint('Une erreur est survenue', ['white', 'bgRed']);
 */
export function paint(msg, options = []) {
  log(get(msg, options));
}

export function banner(msg) {
  const text = boxen(msg, {
    borderColor: 'cyan',
    borderStyle: 'round',
    dimBorder: true,
    margin: 1,
    padding: 1,
    textAlignment: 'center',
  });
  log(text);
}
