# O'vite

Seul, ce projet ne sert pas à grand chose :
il permet de créer un projet dans un environnement fiable
([Vite](https://vitejs.dev/)) et pré-configuré.  

## Préambule

> Pourquoi ne pas utiliser directement Vite alors ?

Cet outil répond à 2 objectifs principaux :

1. on peut installer Vite sur un dépôt Git existant, avec des dossiers et fichiers pré-existants
2. on peut facilement utiliser les règles [Airbnb](https://github.com/airbnb/javascript) pour [ESLint](https://eslint.org/)

## Fonctionnalités

### Projet

Comme dit plus haut, il est possible de créer un projet **depuis un dépôt Git existant** ou de partir **de zéro**.

### Templates

Plusieurs templates sont disponibles :

- Vanilla JS ou React
- JavaScript ou TypeScript
- ESlint (Airbnb) ou non

> voir le dossier [templates](./src/templates/)

### Autres

Il est aussi possible de :

- sourcer son code avec Git (`init`, `commit`, `push`)
- d'ouvrir le projet dans VS Code et dans votre navigateur

## Utilisation

Installer cet outil globalement avec NPM :

```bash
npm install -g o-vite
```

Puis le lancer :

```bash
o-vite [options] [nom|SSH]
```

_Voir les [options](#Options) disponibles ci-dessous_

Mais nous vous **recommandons** de l'utiliser depuis NPM directement,
pour être sûr d'avoir la dernière version :

```bash
npm create o-vite
```

Dans les deux cas, il suffit ensuite de suivre les instructions dans le terminal !

Vous pouvez aussi spécifier le template à utiliser et les autres
fonctionnalités depuis les options de la ligne de commandes.  
Exemple : pour un projet React + ESLint + TypeScript et
la génération d'un premier _commit_ et l'ouverture dans VS Code
et le navigateur

```bash
npm create o-vite -react
```

> ATTENTION ici `-react` ne signifie pas « je veux React », mais :
>
> - `r` → React
> - `e` → ESlint (Airbnb)
> - `a` → ouvrir VS Code et le navigateur (_access_ ? action ? à toi de jouer ?)
> - `c` → génère le premier _commit_
> - `t` → TypeScript
>
> donc `-trace` et `-carte` fonctionnent aussi… mais c'est moins marrant !

### Destination

Par défaut, le template est copié dans le dossier où le script est appelé.  
Il est possible de spécifier :

- un nom de projet, pour en créer un nouveau
- une adresse Git (SSH), pour partir sur un dossier avec ressources

#### Nouveau projet

Le dossier de destination peut être personnalisé. Il faut ajouter un second argument
à la commande de base :

```bash
npm create o-vite my-project
npm create o-vite /dev/projects/my-app
```

Comme vous le voyez, vous pouvez renseigner un chemin ; le dossier de destination sera
automatiquement créé.

> ATTENTION si le dossier de destination renseigné existe déjà, une erreur sera levée !

#### Depuis une adresse Git

Seules les adresses SSH sont acceptées, un sous-dossier est crée d'après le nom du dépôt
distant dans le dossier où vous appeler l'outil.

Exemple :

```bash
user@DESKTOP:/var/www/html/S01$ npm create o-vite my-ssh-address.git
```

créera un dossier `/var/www/html/S01/my-ssh-address`

## Options

| _Flag_       | Alias | Défaut  | Option                                                   |
|--------------|-------|---------|----------------------------------------------------------|
| --yes        | -y    |         | Conserve les options par défaut (passe le formulaire)    |
|              |       |         |                                                          |
| --react      | -r    | `false` | Faut-il installer React ?                                |
| --typescript | -t    | `false` | Faut-il installer TypeScript ?                           |
| --eslint     | -e    | `false` | Faut-il installer ESLint (Airbnb) ?                      |
| --commit     | -c    | `false` | Faut-il _commit_ l'installation de Vite ?                |
| --access     | -a    | `false` | Faut-il ouvrir le projet dans VS Code et le navigateur ? |

> si aucune option est passée, le formulaire s'affiche  
> si au moins une option est passée, les autres prennent leur valeur par défaut

## Bonus

L'outil installe automatiquement des recommandations d'extensions VS Code.  
vous trouverez la liste dans le fichier [`extensions.js`](./src/vscode/extensions.json).  
Dans ce dossier, vous trouverez aussi quelques recommandations de configuration
de VS Code.

### ESLint

_Linter_ pour le JavaScript :
vous permet de trouver et de corriger (quelquefois automatiquement) des
erreurs dans votre code.

> <https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint>

`ext install dbaeumer.vscode-eslint`

### Prettier

_Code formatter_ :
impose un style cohérent en analysant votre code et en le réimprimant avec des règles configurées.

> <https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode>

`ext install esbenp.prettier-vscode`

### Error Lens

En combinaison avec EsLint et Prettier, renforce leur diagnostic et améliore
la lisibilité des erreurs et avertissements.

> <https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens>

`ext install usernamehw.errorlens`

### Auto Rename Tag

Renomme automatiquement les balises HTML/JSX jumelées.

> <https://marketplace.visualstudio.com/items?itemName=formulahendry.auto-rename-tag>

`ext install formulahendry.auto-rename-tag`

### Material Icon Theme

Fournit des icônes pour vos fichiers et dossier.

> <https://marketplace.visualstudio.com/items?itemName=pkief.material-icon-theme>

`ext install pkief.material-icon-theme`
