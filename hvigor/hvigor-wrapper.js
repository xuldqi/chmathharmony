// Hvigor wrapper loader
// This file is automatically included in the project

const path = require('path');

// Set project root directory
process.env.HVIGOR_PROJECT_ROOT = path.resolve(__dirname, '..');

// Load hvigor wrapper
const HVIGOR_INST_PATH = process.env.HVIGOR_INST_PATH || '/Applications/DevEco-Studio.app/Contents/tools/hvigor';
const wrapperPath = path.join(HVIGOR_INST_PATH, 'bin', 'hvigorw.js');

try {
    require(wrapperPath);
} catch (e) {
    console.error('Failed to load hvigor wrapper:', e.message);
    process.exit(1);
}