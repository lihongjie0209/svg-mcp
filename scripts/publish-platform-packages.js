#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * 发布平台特定的包
 */
async function publishPlatformPackages() {
  try {
    // 从环境变量获取版本
    const version = process.env.VERSION;
    if (!version) {
      throw new Error('VERSION environment variable is required');
    }

    console.log(`Publishing platform packages for version: ${version}`);

    const distPath = path.join(process.cwd(), 'dist');
    const packagesPath = path.join(process.cwd(), 'packages');

    // 检查dist目录是否存在
    if (!fs.existsSync(distPath)) {
      throw new Error('dist directory not found. Make sure artifacts are downloaded.');
    }

    // 列出dist目录下的所有artifact目录
    const artifactDirs = fs.readdirSync(distPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    console.log('Found artifacts:', artifactDirs);

    for (const artifactDir of artifactDirs) {
      // 提取平台名称，例如 "svg-mcp-windows-x64" -> "windows-x64"
      const platformName = artifactDir.replace('svg-mcp-', '');

      console.log(`\nProcessing ${platformName} -> svg-mcp-${platformName}`);

      const packageDir = path.join(packagesPath, platformName);
      const artifactPath = path.join(distPath, artifactDir);
      
      // 检查包目录是否存在
      if (!fs.existsSync(packageDir)) {
        console.warn(`Package directory not found: ${packageDir}, skipping...`);
        continue;
      }

      // 创建bin目录
      const binDir = path.join(packageDir, 'bin');
      if (!fs.existsSync(binDir)) {
        fs.mkdirSync(binDir, { recursive: true });
      }

      // 复制二进制文件
      const artifactFiles = fs.readdirSync(artifactPath);
      for (const file of artifactFiles) {
        const srcPath = path.join(artifactPath, file);
        const destPath = path.join(binDir, file);
        
        console.log(`Copying ${srcPath} -> ${destPath}`);
        fs.copyFileSync(srcPath, destPath);
        
        // 在Unix系统上设置可执行权限
        if (process.platform !== 'win32' && !file.endsWith('.exe')) {
          fs.chmodSync(destPath, '755');
        }
      }

      // 更新package.json版本
      const packageJsonPath = path.join(packageDir, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      packageJson.version = version;
      
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
      console.log(`Updated ${packageJsonPath} to version ${version}`);

      // 发布包
      console.log(`Publishing svg-mcp-${platformName}@${version}...`);
      try {
        execSync('npm publish', { 
          cwd: packageDir, 
          stdio: 'inherit',
          env: { ...process.env }
        });
        console.log(`✅ Successfully published svg-mcp-${platformName}@${version}`);
      } catch (error) {
        console.error(`❌ Failed to publish svg-mcp-${platformName}:`, error.message);
        // 不要因为单个包发布失败就终止整个流程
      }
    }

    console.log('\n✅ Platform package publishing completed!');
    
  } catch (error) {
    console.error('❌ Error publishing platform packages:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  publishPlatformPackages();
}

module.exports = { publishPlatformPackages };
