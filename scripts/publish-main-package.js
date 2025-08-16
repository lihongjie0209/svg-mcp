#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * 检查npm包是否可用
 */
async function checkPackageAvailable(packageName, version, maxAttempts = 30) {
  for (let i = 1; i <= maxAttempts; i++) {
    try {
      execSync(`npm view "${packageName}@${version}" version`, { 
        stdio: 'pipe',
        timeout: 10000 
      });
      console.log(`✅ ${packageName}@${version} is available`);
      return true;
    } catch (error) {
      if (i === maxAttempts) {
        console.error(`❌ ${packageName}@${version} not available after ${maxAttempts} attempts`);
        return false;
      }
      console.log(`Waiting for ${packageName}@${version}... (attempt ${i}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 10000)); // 等待10秒
    }
  }
  return false;
}

/**
 * 发布主包
 */
async function publishMainPackage() {
  try {
    // 从环境变量获取版本
    const version = process.env.VERSION;
    if (!version) {
      throw new Error('VERSION environment variable is required');
    }

    console.log(`Publishing main package for version: ${version}`);

    // 定义所有平台包
    const platformPackages = [
      'svg-mcp-windows-x64',
      'svg-mcp-linux-x64', 
      'svg-mcp-macos-x64',
      'svg-mcp-macos-arm64'
    ];

    // 更新主包的package.json
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // 更新版本
    packageJson.version = version;
    
    // 更新optionalDependencies中的平台包版本
    if (packageJson.optionalDependencies) {
      Object.keys(packageJson.optionalDependencies).forEach(dep => {
        if (dep.startsWith('svg-mcp-')) {
          packageJson.optionalDependencies[dep] = version;
        }
      });
    }

    // 写回package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log(`Updated main package to version ${version}`);
    console.log('Updated optional dependencies:', packageJson.optionalDependencies);

    // 验证JSON格式
    try {
      JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      console.log('✅ Valid JSON in package.json');
    } catch (error) {
      console.error('❌ Invalid JSON in package.json');
      console.log(fs.readFileSync(packageJsonPath, 'utf8'));
      throw error;
    }

    // 等待所有平台包可用
    console.log('\nWaiting for platform packages to be available on npm...');
    let allAvailable = true;
    
    for (const packageName of platformPackages) {
      const available = await checkPackageAvailable(packageName, version);
      if (!available) {
        allAvailable = false;
      }
    }

    if (!allAvailable) {
      console.warn('⚠️  Some platform packages are not available yet, but continuing with main package publication');
    }

    // 发布主包
    console.log('\nPublishing main svg-mcp package...');
    try {
      execSync('npm publish', { 
        stdio: 'inherit',
        env: { ...process.env }
      });
      console.log(`✅ Published svg-mcp@${version}`);
    } catch (error) {
      console.error('❌ Failed to publish main package:', error.message);
      throw error;
    }

    console.log('\n✅ Main package publishing completed!');
    
  } catch (error) {
    console.error('❌ Error publishing main package:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  publishMainPackage();
}

module.exports = { publishMainPackage };
