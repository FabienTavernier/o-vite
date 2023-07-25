#! /usr/bin/env node

import cli from '../src/cli.js';

cli(process.argv).catch(console.error);
