#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 获取平台和架构信息
const platform = process.platform;
const arch = process.arch;

// 映射到我们的包名
const getPlatformPackageName = (platform, arch) => {
  // 映射 Node.js 平台名称到我们的包名
  const platformMap = {
    'win32': 'windows',
    'darwin': 'macos',
    'linux': 'linux'
  };
  
  const mappedPlatform = platformMap[platform] || platform;
  return `@svg-mcp/${mappedPlatform}-${arch}`;
};

function getBinaryPath() {
  // 构建平台包名
  const platformPackageName = getPlatformPackageName(platform, arch);
  
  try {
    // 尝试加载平台特定的包
    const platformPackage = require(platformPackageName);
    const binaryPath = platformPackage.getBinaryPath();
    
    if (!fs.existsSync(binaryPath)) {
      throw new Error(`Binary not found at ${binaryPath}`);
    }
    
    return binaryPath;
  } catch (error) {
    // 如果平台包不可用，提供有用的错误信息
    const supportedPlatforms = [
      'windows-x64 (Windows 64-bit)',
      'linux-x64 (Linux 64-bit)', 
      'macos-x64 (macOS Intel)',
      'macos-arm64 (macOS Apple Silicon)'
    ];
    
    throw new Error(
      `Platform package ${platformPackageName} not available.\n` +
      `Current platform: ${platform}-${arch}\n` +
      `Supported platforms:\n${supportedPlatforms.map(p => `  - ${p}`).join('\n')}\n\n` +
      `To fix this issue:\n` +
      `1. Check if your platform is supported\n` +
      `2. Try reinstalling: npm install svg-mcp\n` +
      `3. Build from source: cargo build --release\n` +
      `4. Download binary from GitHub releases`
    );
  }
}

function main() {
  try {
    const executablePath = getBinaryPath();
    
    // 启动MCP服务器
    const child = spawn(executablePath, process.argv.slice(2), {
      stdio: 'inherit'
    });

    child.on('exit', (code) => {
      process.exit(code);
    });

    child.on('error', (err) => {
      console.error('Failed to start svg-mcp:', err.message);
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { getBinaryPath, main };
