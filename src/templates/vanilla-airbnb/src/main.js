import logo from './assets/logo.svg';

import './styles/main.css';

document.querySelector('#app').innerHTML = `
  <header class="app-header">
    <img src=${logo} class="app-logo" alt="logo" />

    <p>
      Edit <code>src/main.js</code> and save to reload.
    </p>

    <a
      class="app-link"
      href="https://react.dev/"
      target="_blank"
      rel="noopener noreferrer"
    >
      Learn JavaScript
    </a>
  </header>
`;
