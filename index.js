#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 获取平台和架构信息
const platform = process.platform;
const arch = process.arch;

// 映射到我们的二进制文件名
const platformMap = {
  'win32': 'windows',
  'darwin': 'macos',
  'linux': 'linux'
};

const archMap = {
  'x64': 'x64',
  'arm64': 'arm64'
};

const mappedPlatform = platformMap[platform];
const mappedArch = archMap[arch];

if (!mappedPlatform || !mappedArch) {
  console.error(`Unsupported platform: ${platform}-${arch}`);
  console.error('Supported platforms: windows-x64, linux-x64, macos-x64, macos-arm64');
  process.exit(1);
}

// 确定可执行文件路径
let executableName;
if (platform === 'win32') {
  // Windows支持两个版本，优先使用MSVC版本
  executableName = `svg-mcp-windows-${mappedArch}.exe`;
  const msvcPath = path.join(__dirname, 'bin', executableName);
  const gnuPath = path.join(__dirname, 'bin', `svg-mcp-windows-${mappedArch}-gnu.exe`);
  
  if (fs.existsSync(msvcPath)) {
    executablePath = msvcPath;
  } else if (fs.existsSync(gnuPath)) {
    executablePath = gnuPath;
  } else {
    console.error(`No Windows executable found for ${arch} architecture`);
    process.exit(1);
  }
} else {
  executableName = `svg-mcp-${mappedPlatform}-${mappedArch}`;
  executablePath = path.join(__dirname, 'bin', executableName);
}

// 检查可执行文件是否存在
if (!fs.existsSync(executablePath)) {
  console.error(`Executable not found: ${executablePath}`);
  console.error(`Platform: ${platform}-${arch}`);
  console.error('Available files in bin/:');
  const binDir = path.join(__dirname, 'bin');
  if (fs.existsSync(binDir)) {
    fs.readdirSync(binDir).forEach(file => {
      console.error(`  ${file}`);
    });
  } else {
    console.error('  bin/ directory not found');
  }
  process.exit(1);
}

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
