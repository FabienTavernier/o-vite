import logo from './assets/logo.svg';

import './styles/main.css';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <header class="app-header">
    <img src=${logo} class="app-logo" alt="logo" />

    <p>
      Edit <code>src/main.js</code> and save to reload.
    </p>

    <a
      class="app-link"
      href="https://www.typescriptlang.org"
      target="_blank"
      rel="noopener noreferrer"
    >
      Learn TypeScript
    </a>
  </header>
`
