#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 平台配置
const platforms = [
  {
    name: 'win32-x64',
    buildTarget: 'x86_64-pc-windows-msvc',
    executable: 'svg-mcp.exe',
    downloadName: 'windows-x64'
  },
  {
    name: 'linux-x64',
    buildTarget: 'x86_64-unknown-linux-gnu',
    executable: 'svg-mcp',
    downloadName: 'linux-x64'
  },
  {
    name: 'darwin-x64',
    buildTarget: 'x86_64-apple-darwin',
    executable: 'svg-mcp',
    downloadName: 'macos-x64'
  },
  {
    name: 'darwin-arm64',
    buildTarget: 'aarch64-apple-darwin',
    executable: 'svg-mcp',
    downloadName: 'macos-arm64'
  }
];

function buildForPlatform(platform, release = false) {
  console.log(`\n🔨 Building for ${platform.name} (${platform.buildTarget})...`);
  
  try {
    // 构建Rust二进制文件
    const buildCmd = `cargo build --target ${platform.buildTarget}${release ? ' --release' : ''}`;
    console.log(`Running: ${buildCmd}`);
    execSync(buildCmd, { stdio: 'inherit' });
    
    const buildType = release ? 'release' : 'debug';
    const sourceExe = path.join('target', platform.buildTarget, buildType, platform.executable);
    
    if (!fs.existsSync(sourceExe)) {
      throw new Error(`Built executable not found: ${sourceExe}`);
    }
    
    // 复制二进制文件到对应的包目录
    const packageDir = path.join('packages', platform.name);
    const binDir = path.join(packageDir, 'bin');
    const destExe = path.join(binDir, platform.executable);
    
    // 确保目录存在
    if (!fs.existsSync(binDir)) {
      fs.mkdirSync(binDir, { recursive: true });
    }
    
    // 复制文件
    fs.copyFileSync(sourceExe, destExe);
    
    // 在Unix系统上设置执行权限
    if (platform.executable !== 'svg-mcp.exe') {
      try {
        execSync(`chmod +x "${destExe}"`);
      } catch (error) {
        console.warn(`Warning: Could not set execute permission on ${destExe}`);
      }
    }
    
    const fileSize = fs.statSync(destExe).size;
    const fileSizeMB = (fileSize / 1024 / 1024).toFixed(2);
    
    console.log(`✅ Successfully built ${platform.name}: ${fileSizeMB} MB`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to build ${platform.name}: ${error.message}`);
    return false;
  }
}

function updatePackageVersions(version) {
  console.log(`\n📝 Updating package versions to ${version}...`);
  
  // 更新主包版本
  const mainPackageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  mainPackageJson.version = version;
  
  // 更新 optionalDependencies 版本
  for (const platform of platforms) {
    const packageName = `@svg-mcp/${platform.name}`;
    if (mainPackageJson.optionalDependencies && mainPackageJson.optionalDependencies[packageName]) {
      mainPackageJson.optionalDependencies[packageName] = version;
    }
  }
  
  fs.writeFileSync('package.json', JSON.stringify(mainPackageJson, null, 2) + '\n');
  console.log('✅ Updated main package.json');
  
  // 更新每个平台包的版本
  for (const platform of platforms) {
    const packageDir = path.join('packages', platform.name);
    const packageJsonPath = path.join(packageDir, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      packageJson.version = version;
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
      console.log(`✅ Updated ${platform.name}/package.json`);
    }
  }
}

function publishPlatformPackages(dryRun = false) {
  console.log(`\n📦 Publishing platform packages${dryRun ? ' (dry run)' : ''}...`);
  
  const results = {
    published: [],
    failed: []
  };
  
  for (const platform of platforms) {
    const packageDir = path.join('packages', platform.name);
    const packageName = `@svg-mcp/${platform.name}`;
    
    try {
      console.log(`Publishing ${packageName}...`);
      const publishCmd = `npm publish${dryRun ? ' --dry-run' : ' --access public'}`;
      
      execSync(publishCmd, { 
        cwd: packageDir, 
        stdio: 'inherit' 
      });
      
      console.log(`✅ Successfully published ${packageName}`);
      results.published.push(packageName);
    } catch (error) {
      console.error(`❌ Failed to publish ${packageName}: ${error.message}`);
      results.failed.push(packageName);
    }
  }
  
  return results;
}

function publishMainPackage(dryRun = false) {
  console.log(`\n📦 Publishing main package${dryRun ? ' (dry run)' : ''}...`);
  
  try {
    const publishCmd = `npm publish${dryRun ? ' --dry-run' : ''}`;
    execSync(publishCmd, { stdio: 'inherit' });
    console.log('✅ Successfully published svg-mcp');
    return true;
  } catch (error) {
    console.error(`❌ Failed to publish svg-mcp: ${error.message}`);
    return false;
  }
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'build': {
      const release = args.includes('--release');
      const platformFilter = args.find(arg => arg.startsWith('--platform='))?.split('=')[1];
      
      const targetPlatforms = platformFilter 
        ? platforms.filter(p => p.name === platformFilter)
        : platforms;
        
      console.log('🚀 Building platform packages...');
      console.log(`Build type: ${release ? 'release' : 'debug'}`);
      
      const results = {
        built: [],
        failed: []
      };
      
      for (const platform of targetPlatforms) {
        if (buildForPlatform(platform, release)) {
          results.built.push(platform.name);
        } else {
          results.failed.push(platform.name);
        }
      }
      
      console.log('\n📊 Build Summary:');
      console.log('================');
      if (results.built.length > 0) {
        console.log(`✅ Successfully built: ${results.built.join(', ')}`);
      }
      if (results.failed.length > 0) {
        console.log(`❌ Failed to build: ${results.failed.join(', ')}`);
      }
      
      break;
    }
    
    case 'version': {
      const version = args[1];
      if (!version) {
        console.error('❌ Version required. Usage: node scripts/package-manager.js version 1.2.3');
        process.exit(1);
      }
      
      updatePackageVersions(version);
      break;
    }
    
    case 'publish': {
      const dryRun = args.includes('--dry-run');
      const skipPlatforms = args.includes('--skip-platforms');
      const skipMain = args.includes('--skip-main');
      
      if (!skipPlatforms) {
        const platformResults = publishPlatformPackages(dryRun);
        
        if (platformResults.failed.length > 0 && !dryRun) {
          console.error('❌ Some platform packages failed to publish. Aborting main package publish.');
          process.exit(1);
        }
      }
      
      if (!skipMain) {
        if (!dryRun) {
          console.log('\n⏳ Waiting for platform packages to be available...');
          // 在真实发布中等待一段时间让平台包在npm上可用
          setTimeout(() => {
            publishMainPackage(dryRun);
          }, 30000);
          return;
        }
        
        publishMainPackage(dryRun);
      }
      
      break;
    }
    
    case 'test': {
      console.log('🧪 Testing package installation...');
      
      // 简单测试：检查所有包是否有二进制文件
      let allGood = true;
      
      for (const platform of platforms) {
        const packageDir = path.join('packages', platform.name);
        const binPath = path.join(packageDir, 'bin', platform.executable);
        
        if (fs.existsSync(binPath)) {
          console.log(`✅ ${platform.name}: Binary exists`);
        } else {
          console.log(`❌ ${platform.name}: Binary missing`);
          allGood = false;
        }
      }
      
      if (allGood) {
        console.log('🎉 All packages look good!');
      } else {
        console.log('❌ Some packages are missing binaries');
        process.exit(1);
      }
      
      break;
    }
    
    default:
      console.log(`
🚀 SVG MCP Package Manager

Usage:
  node scripts/package-manager.js <command> [options]

Commands:
  build                     Build all platform packages
    --release               Build in release mode
    --platform=<name>       Build specific platform only

  version <version>         Update all package versions
    
  publish                   Publish packages to npm
    --dry-run               Test publish without actually publishing
    --skip-platforms        Skip platform packages
    --skip-main             Skip main package
    
  test                      Test package integrity

Examples:
  node scripts/package-manager.js build --release
  node scripts/package-manager.js version 1.2.3
  node scripts/package-manager.js publish --dry-run
  node scripts/package-manager.js build --platform=win32-x64
`);
      break;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  platforms,
  buildForPlatform,
  updatePackageVersions,
  publishPlatformPackages,
  publishMainPackage
};
