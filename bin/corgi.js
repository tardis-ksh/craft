#!/usr/bin/env node

// No log files generated
process.env.FS_LOGGER = 'none';
require('../dist/cli');
