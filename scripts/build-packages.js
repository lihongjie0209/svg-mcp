#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 平台配置
const platforms = [
  {
    name: 'windows-x64',
    target: 'x86_64-pc-windows-msvc',
    exe: 'svg-mcp.exe',
    packageName: '@svg-mcp/windows-x64'
  },
  {
    name: 'linux-x64',
    target: 'x86_64-unknown-linux-gnu',
    exe: 'svg-mcp',
    packageName: '@svg-mcp/linux-x64'
  },
  {
    name: 'macos-x64',
    target: 'x86_64-apple-darwin',
    exe: 'svg-mcp',
    packageName: '@svg-mcp/macos-x64'
  },
  {
    name: 'macos-arm64',
    target: 'aarch64-apple-darwin',
    exe: 'svg-mcp',
    packageName: '@svg-mcp/macos-arm64'
  }
];

function buildForPlatform(platform, release = false) {
  console.log(`\n🔨 Building for ${platform.name} (${platform.target})...`);
  
  try {
    // 构建Rust二进制文件
    const buildCmd = `cargo build --target ${platform.target}${release ? ' --release' : ''}`;
    console.log(`Running: ${buildCmd}`);
    execSync(buildCmd, { stdio: 'inherit' });
    
    const buildType = release ? 'release' : 'debug';
    const sourceExe = path.join('target', platform.target, buildType, platform.exe);
    
    if (!fs.existsSync(sourceExe)) {
      throw new Error(`Built executable not found: ${sourceExe}`);
    }
    
    // 复制二进制文件到对应的包目录
    const packageDir = path.join('packages', platform.name);
    const binDir = path.join(packageDir, 'bin');
    const destExe = path.join(binDir, platform.exe);
    
    // 确保目录存在
    if (!fs.existsSync(binDir)) {
      fs.mkdirSync(binDir, { recursive: true });
    }
    
    // 复制文件
    fs.copyFileSync(sourceExe, destExe);
    
    // 在Unix系统上设置执行权限
    if (platform.exe !== 'svg-mcp.exe') {
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

function publishPlatformPackage(platform, dryRun = false) {
  console.log(`\n📦 Publishing ${platform.packageName}...`);
  
  try {
    const packageDir = path.join('packages', platform.name);
    const publishCmd = `npm publish${dryRun ? ' --dry-run' : ''}`;
    
    console.log(`Running: ${publishCmd} in ${packageDir}`);
    execSync(publishCmd, { 
      cwd: packageDir, 
      stdio: 'inherit' 
    });
    
    console.log(`✅ Successfully published ${platform.packageName}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to publish ${platform.packageName}: ${error.message}`);
    return false;
  }
}

function main() {
  const args = process.argv.slice(2);
  const release = args.includes('--release');
  const publish = args.includes('--publish');
  const dryRun = args.includes('--dry-run');
  const platformFilter = args.find(arg => arg.startsWith('--platform='))?.split('=')[1];
  
  console.log('🚀 Building SVG MCP Server packages...');
  console.log(`Build type: ${release ? 'release' : 'debug'}`);
  
  if (publish) {
    console.log(`Publish mode: ${dryRun ? 'dry-run' : 'real'}`);
  }
  
  const targetPlatforms = platformFilter 
    ? platforms.filter(p => p.name === platformFilter)
    : platforms;
    
  if (targetPlatforms.length === 0) {
    console.error(`❌ Platform '${platformFilter}' not found. Available platforms: ${platforms.map(p => p.name).join(', ')}`);
    process.exit(1);
  }
  
  const results = {
    built: [],
    failed: [],
    published: [],
    publishFailed: []
  };
  
  // 构建阶段
  for (const platform of targetPlatforms) {
    if (buildForPlatform(platform, release)) {
      results.built.push(platform.name);
    } else {
      results.failed.push(platform.name);
    }
  }
  
  // 发布阶段
  if (publish && results.built.length > 0) {
    console.log('\n📦 Publishing packages...');
    
    for (const platformName of results.built) {
      const platform = platforms.find(p => p.name === platformName);
      if (publishPlatformPackage(platform, dryRun)) {
        results.published.push(platform.packageName);
      } else {
        results.publishFailed.push(platform.packageName);
      }
    }
  }
  
  // 总结报告
  console.log('\n📊 Build Summary:');
  console.log('================');
  
  if (results.built.length > 0) {
    console.log(`✅ Successfully built: ${results.built.join(', ')}`);
  }
  
  if (results.failed.length > 0) {
    console.log(`❌ Failed to build: ${results.failed.join(', ')}`);
  }
  
  if (publish) {
    console.log('\n📦 Publish Summary:');
    console.log('==================');
    
    if (results.published.length > 0) {
      console.log(`✅ Successfully published: ${results.published.join(', ')}`);
    }
    
    if (results.publishFailed.length > 0) {
      console.log(`❌ Failed to publish: ${results.publishFailed.join(', ')}`);
    }
  }
  
  const hasFailures = results.failed.length > 0 || results.publishFailed.length > 0;
  if (hasFailures) {
    process.exit(1);
  }
  
  console.log('\n🎉 All operations completed successfully!');
}

if (require.main === module) {
  main();
}
