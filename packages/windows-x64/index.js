const path = require('path');

// Export the path to the binary for this platform
module.exports = {
  getBinaryPath: () => {
    return path.join(__dirname, 'bin', 'svg-mcp.exe');
  }
};
