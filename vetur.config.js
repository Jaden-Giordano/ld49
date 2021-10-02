const path = require('path');

module.exports = {
  settings: {
    "vetur.useWorkspaceDependencies": true,
    "typescript.tsdk": path.resolve(__dirname, '.yarn/sdks/typescript/bin'),
  },
};
