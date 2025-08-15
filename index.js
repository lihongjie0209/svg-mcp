#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// 获取可执行文件路径
const platform = process.platform;
const executableName = platform === 'win32' ? 'svg-mcp.exe' : 'svg-mcp';
const executablePath = path.join(__dirname, 'bin', executableName);

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
