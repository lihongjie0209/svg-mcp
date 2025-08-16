# PowerShell wrapper for package-manager.js
param(
    [Parameter(Position=0, Mandatory=$true)]
    [string]$Command,
    
    [Parameter(Position=1)]
    [string]$Version,
    
    [switch]$Release = $false,
    [switch]$DryRun = $false,
    [string]$Platform = "",
    [switch]$SkipPlatforms = $false,
    [switch]$SkipMain = $false
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 SVG MCP Package Manager" -ForegroundColor Green
Write-Host "==========================" -ForegroundColor Green

# 构建参数
$nodeArgs = @($Command)

if ($Version) {
    $nodeArgs += $Version
}

if ($Release) {
    $nodeArgs += "--release"
}

if ($DryRun) {
    $nodeArgs += "--dry-run"
}

if ($Platform) {
    $nodeArgs += "--platform=$Platform"
}

if ($SkipPlatforms) {
    $nodeArgs += "--skip-platforms"
}

if ($SkipMain) {
    $nodeArgs += "--skip-main"
}

# 检查Node.js
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# 检查Cargo (仅在build命令时需要)
if ($Command -eq "build") {
    try {
        $cargoVersion = cargo --version
        Write-Host "Cargo version: $cargoVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ Cargo not found. Please install Rust toolchain first." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# 运行包管理脚本
try {
    node scripts/package-manager.js @nodeArgs
    Write-Host ""
    Write-Host "🎉 Command completed successfully!" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "❌ Command failed!" -ForegroundColor Red
    exit 1
}
