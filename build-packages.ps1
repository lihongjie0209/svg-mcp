# PowerShell wrapper for build-packages.js
param(
    [switch]$Release = $false,
    [switch]$Publish = $false,
    [switch]$DryRun = $false,
    [string]$Platform = ""
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 SVG MCP Server Package Builder" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# 构建参数
$args = @()

if ($Release) {
    $args += "--release"
    Write-Host "Build type: Release" -ForegroundColor Yellow
} else {
    Write-Host "Build type: Debug" -ForegroundColor Yellow
}

if ($Publish) {
    $args += "--publish"
    Write-Host "Publish mode: Enabled" -ForegroundColor Yellow
}

if ($DryRun) {
    $args += "--dry-run"
    Write-Host "Dry run: Enabled" -ForegroundColor Yellow
}

if ($Platform) {
    $args += "--platform=$Platform"
    Write-Host "Platform filter: $Platform" -ForegroundColor Yellow
}

Write-Host ""

# 检查Node.js
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# 检查Cargo
try {
    $cargoVersion = cargo --version
    Write-Host "Cargo version: $cargoVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Cargo not found. Please install Rust toolchain first." -ForegroundColor Red
    exit 1
}

Write-Host ""

# 运行构建脚本
try {
    node scripts/build-packages.js @args
    Write-Host ""
    Write-Host "🎉 Build completed successfully!" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
