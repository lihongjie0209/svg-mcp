# Simplified cross-platform build script for SVG MCP Server
# This script focuses on builds that work in the current environment

param(
    [switch]$Release = $false
)

$ErrorActionPreference = "Stop"

# Define target platforms that work without additional toolchains
$targets = @(
    @{
        name = "windows-x64"
        target = "x86_64-pc-windows-msvc"
        exe = "svg-mcp.exe"
        description = "Windows 64-bit (MSVC)"
    }
)

# Add optional targets with error handling
$optionalTargets = @(
    @{
        name = "windows-x64-gnu"
        target = "x86_64-pc-windows-gnu"
        exe = "svg-mcp.exe"
        description = "Windows 64-bit (GNU/MinGW)"
    }
)

# Create dist directory
$distDir = "dist"
if (Test-Path $distDir) {
    Remove-Item $distDir -Recurse -Force
}
New-Item -ItemType Directory -Path $distDir | Out-Null

# Build configuration
$buildType = if ($Release) { "release" } else { "debug" }
$buildFlag = if ($Release) { "--release" } else { "" }

Write-Host "Building SVG MCP Server..." -ForegroundColor Green
Write-Host "Build type: $buildType" -ForegroundColor Yellow
Write-Host ""

$successfulBuilds = @()
$failedBuilds = @()

# Build core targets
foreach ($target in $targets) {
    Write-Host "Building for $($target.name) ($($target.description))..." -ForegroundColor Cyan
    
    try {
        # Build for target platform
        $buildCmd = "cargo build --target $($target.target) $buildFlag"
        Write-Host "Running: $buildCmd" -ForegroundColor Gray
        Invoke-Expression $buildCmd
        
        if ($LASTEXITCODE -eq 0) {
            # Create platform-specific directory
            $platformDir = Join-Path $distDir $target.name
            New-Item -ItemType Directory -Path $platformDir | Out-Null
            
            # Copy executable
            $sourceExe = Join-Path "target" $target.target $buildType $target.exe
            $destExe = Join-Path $platformDir $target.exe
            
            if (Test-Path $sourceExe) {
                Copy-Item $sourceExe $destExe
                
                # Get file size
                $fileSize = (Get-Item $destExe).Length
                $fileSizeMB = [math]::Round($fileSize / 1MB, 2)
                Write-Host "✓ Built successfully: $($target.name) ($fileSizeMB MB)" -ForegroundColor Green
                $successfulBuilds += $target
            } else {
                Write-Host "✗ Executable not found: $sourceExe" -ForegroundColor Red
                $failedBuilds += $target
            }
        } else {
            Write-Host "✗ Build failed for $($target.name)" -ForegroundColor Red
            $failedBuilds += $target
        }
    }
    catch {
        Write-Host "✗ Failed to build for $($target.name): $($_.Exception.Message)" -ForegroundColor Red
        $failedBuilds += $target
    }
    
    Write-Host ""
}

# Try optional targets
foreach ($target in $optionalTargets) {
    Write-Host "Attempting optional build for $($target.name) ($($target.description))..." -ForegroundColor Yellow
    
    try {
        # Check if target is installed
        $targetCheck = rustup target list | Where-Object { $_ -match "$($target.target).*installed" }
        if (-not $targetCheck) {
            Write-Host "Installing target $($target.target)..." -ForegroundColor Gray
            rustup target add $target.target
        }
        
        # Build for target platform
        $buildCmd = "cargo build --target $($target.target) $buildFlag"
        Write-Host "Running: $buildCmd" -ForegroundColor Gray
        Invoke-Expression $buildCmd
        
        if ($LASTEXITCODE -eq 0) {
            # Create platform-specific directory
            $platformDir = Join-Path $distDir $target.name
            New-Item -ItemType Directory -Path $platformDir | Out-Null
            
            # Copy executable
            $sourceExe = Join-Path "target" $target.target $buildType $target.exe
            $destExe = Join-Path $platformDir $target.exe
            
            if (Test-Path $sourceExe) {
                Copy-Item $sourceExe $destExe
                
                # Get file size
                $fileSize = (Get-Item $destExe).Length
                $fileSizeMB = [math]::Round($fileSize / 1MB, 2)
                Write-Host "✓ Optional build successful: $($target.name) ($fileSizeMB MB)" -ForegroundColor Green
                $successfulBuilds += $target
            } else {
                Write-Host "✗ Executable not found: $sourceExe" -ForegroundColor Yellow
            }
        } else {
            Write-Host "⚠ Optional build failed for $($target.name) (this is expected)" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "⚠ Optional build failed for $($target.name): $($_.Exception.Message)" -ForegroundColor Yellow
    }
    
    Write-Host ""
}

Write-Host "Build Summary:" -ForegroundColor Green
Write-Host "=============" -ForegroundColor Green

foreach ($build in $successfulBuilds) {
    $platformDir = Join-Path $distDir $build.name
    $destExe = Join-Path $platformDir $build.exe
    
    if (Test-Path $destExe) {
        $fileSize = (Get-Item $destExe).Length
        $fileSizeMB = [math]::Round($fileSize / 1MB, 2)
        Write-Host "✓ $($build.name): $fileSizeMB MB" -ForegroundColor Green
    }
}

if ($failedBuilds.Count -gt 0) {
    Write-Host ""
    Write-Host "Failed builds:" -ForegroundColor Red
    foreach ($build in $failedBuilds) {
        Write-Host "✗ $($build.name)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Successfully built for $($successfulBuilds.Count) platform(s)" -ForegroundColor Yellow
Write-Host "Output directory: $distDir" -ForegroundColor Yellow

# Create usage instructions
$instructionsContent = @"
# SVG MCP Server - Build Instructions

## Available Builds

"@

foreach ($build in $successfulBuilds) {
    $platformDir = Join-Path $distDir $build.name
    $destExe = Join-Path $platformDir $build.exe
    
    if (Test-Path $destExe) {
        $fileSize = (Get-Item $destExe).Length
        $fileSizeMB = [math]::Round($fileSize / 1MB, 2)
        $instructionsContent += "- **$($build.name)**: $($build.description) - $fileSizeMB MB`n"
    }
}

$instructionsContent += @"

## Usage

### Running the Server

Navigate to the appropriate platform directory and run:

``````
# Windows
cd dist/windows-x64
./svg-mcp.exe

# Test functionality
cd ../..
cargo run --bin test
``````

### Claude Desktop Integration

Add the full path to your chosen binary in Claude Desktop configuration:

``````json
{
  "mcpServers": {
    "svg-converter": {
      "command": "C:/path/to/svg-mcp/dist/windows-x64/svg-mcp.exe",
      "args": []
    }
  }
}
``````

## Cross-Platform Building

For full cross-platform builds, consider using:

1. **GitHub Actions**: The included workflow builds for all platforms
2. **Docker**: Use multi-platform Docker builds
3. **Native builds**: Build on each target platform directly

### GitHub Actions

Push to GitHub with a tag to trigger automatic cross-platform builds:

``````bash
git tag v1.0.0
git push origin v1.0.0
``````

This will create releases for:
- Windows (x64 MSVC & GNU)
- Linux (x64)
- macOS (Intel & Apple Silicon)

## Development

### Local Testing
``````bash
# Build and test current platform
cargo build --release
cargo run --bin test

# Build with this script
./build-simple.ps1 -Release
``````

### Cross-compilation Setup (Advanced)

For Linux/macOS targets on Windows, you need:

1. **Linux**: Cross-compilation toolchain (complex on Windows)
2. **macOS**: Xcode tools (not available on Windows)
3. **Alternative**: Use CI/CD or native builds

## Features

- SVG to PNG/JPEG conversion
- Automatic size detection from SVG canvas
- Base64 or file path output options
- High-performance rendering with resvg
- MCP protocol integration for Claude Desktop

## Support

- **Issues**: Create issues on GitHub repository
- **Documentation**: See README.md for detailed usage
- **Examples**: Run ``cargo run --bin test`` for examples
"@

$instructionsPath = Join-Path $distDir "BUILD_INSTRUCTIONS.md"
$instructionsContent | Out-File -FilePath $instructionsPath -Encoding UTF8

Write-Host "Created build instructions: $instructionsPath" -ForegroundColor Green
