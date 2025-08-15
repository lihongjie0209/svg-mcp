const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// 获取平台和架构信息
const platform = process.platform;
const arch = process.arch;

// 映射到我们的发布文件名
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
  process.exit(1);
}

// 特殊处理Windows的MSVC版本
let targetName;
if (platform === 'win32') {
  targetName = `svg-mcp-windows-${mappedArch}`;
} else {
  targetName = `svg-mcp-${mappedPlatform}-${mappedArch}`;
}

const executableName = platform === 'win32' ? 'svg-mcp.exe' : 'svg-mcp';

console.log(`Installing svg-mcp for ${platform}-${arch}...`);

async function downloadAndExtract() {
  try {
    // 获取最新release信息
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
    const version = packageJson.version;
    
    const downloadUrl = `https://github.com/lihongjie0209/svg-mcp/releases/download/v${version}/${targetName}.${platform === 'win32' ? 'zip' : 'tar.gz'}`;
    
    console.log(`Downloading from: ${downloadUrl}`);
    
    // 创建bin目录
    const binDir = path.join(__dirname, 'bin');
    if (!fs.existsSync(binDir)) {
      fs.mkdirSync(binDir, { recursive: true });
    }
    
    // 下载文件
    const archivePath = path.join(__dirname, `archive.${platform === 'win32' ? 'zip' : 'tar.gz'}`);
    
    await downloadFile(downloadUrl, archivePath);
    
    // 解压文件
    if (platform === 'win32') {
      // Windows使用PowerShell解压
      execSync(`powershell -command "Expand-Archive -Path '${archivePath}' -DestinationPath '${binDir}' -Force"`, { stdio: 'inherit' });
    } else {
      // Unix系统使用tar
      execSync(`tar -xzf "${archivePath}" -C "${binDir}"`, { stdio: 'inherit' });
    }
    
    // 移动可执行文件到正确位置
    const extractedExe = path.join(binDir, executableName);
    const targetExe = path.join(binDir, 'svg-mcp' + (platform === 'win32' ? '.exe' : ''));
    
    if (fs.existsSync(extractedExe) && extractedExe !== targetExe) {
      fs.renameSync(extractedExe, targetExe);
    }
    
    // 设置执行权限 (Unix系统)
    if (platform !== 'win32') {
      fs.chmodSync(targetExe, 0o755);
    }
    
    // 清理临时文件
    fs.unlinkSync(archivePath);
    
    console.log('Installation completed successfully!');
    
  } catch (error) {
    console.error('Installation failed:', error.message);
    console.log('You can manually download the binary from:');
    console.log(`https://github.com/lihongjie0209/svg-mcp/releases`);
    process.exit(1);
  }
}

function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    
    https.get(url, (response) => {
      // 处理重定向
      if (response.statusCode === 302 || response.statusCode === 301) {
        return downloadFile(response.headers.location, outputPath).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlink(outputPath, () => {}); // 删除部分下载的文件
        reject(err);
      });
    }).on('error', reject);
  });
}

downloadAndExtract();
