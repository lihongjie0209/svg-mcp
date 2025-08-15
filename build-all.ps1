# Cross-platform build script for SVG MCP Server
# This script builds the SVG MCP server for multiple platforms

param(
    [switch]$Release = $false
)

$ErrorActionPreference = "Stop"

# Define target platforms
$targets = @(
    @{
        name = "windows-x64"
        target = "x86_64-pc-windows-msvc"
        exe = "svg-mcp.exe"
    },
    @{
        name = "windows-x64-gnu"
        target = "x86_64-pc-windows-gnu"
        exe = "svg-mcp.exe"
    },
    @{
        name = "linux-x64"
        target = "x86_64-unknown-linux-gnu"
        exe = "svg-mcp"
    },
    @{
        name = "macos-x64"
        target = "x86_64-apple-darwin"
        exe = "svg-mcp"
    },
    @{
        name = "macos-arm64"
        target = "aarch64-apple-darwin"
        exe = "svg-mcp"
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

Write-Host "Building SVG MCP Server for multiple platforms..." -ForegroundColor Green
Write-Host "Build type: $buildType" -ForegroundColor Yellow
Write-Host ""

foreach ($target in $targets) {
    Write-Host "Building for $($target.name) ($($target.target))..." -ForegroundColor Cyan
    
    try {
        # Build for target platform
        $buildCmd = "cargo build --target $($target.target) $buildFlag"
        Write-Host "Running: $buildCmd" -ForegroundColor Gray
        Invoke-Expression $buildCmd
        
        if ($LASTEXITCODE -ne 0) {
            throw "Build failed for $($target.name)"
        }
        
        # Create platform-specific directory
        $platformDir = Join-Path $distDir $target.name
        New-Item -ItemType Directory -Path $platformDir | Out-Null
        
        # Copy executable
        $sourceExe = Join-Path "target" $target.target $buildType $target.exe
        $destExe = Join-Path $platformDir $target.exe
        
        if (Test-Path $sourceExe) {
            Copy-Item $sourceExe $destExe
            Write-Host "✓ Built successfully: $destExe" -ForegroundColor Green
            
            # Get file size
            $fileSize = (Get-Item $destExe).Length
            $fileSizeMB = [math]::Round($fileSize / 1MB, 2)
            Write-Host "  Size: $fileSizeMB MB" -ForegroundColor Gray
        } else {
            Write-Host "✗ Executable not found: $sourceExe" -ForegroundColor Red
        }
        
        Write-Host ""
    }
    catch {
        Write-Host "✗ Failed to build for $($target.name): $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
    }
}

Write-Host "Build Summary:" -ForegroundColor Green
Write-Host "=============" -ForegroundColor Green

$builtPlatforms = @()
foreach ($target in $targets) {
    $platformDir = Join-Path $distDir $target.name
    $destExe = Join-Path $platformDir $target.exe
    
    if (Test-Path $destExe) {
        $fileSize = (Get-Item $destExe).Length
        $fileSizeMB = [math]::Round($fileSize / 1MB, 2)
        Write-Host "✓ $($target.name): $fileSizeMB MB" -ForegroundColor Green
        $builtPlatforms += $target.name
    } else {
        Write-Host "✗ $($target.name): Failed" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Successfully built for $($builtPlatforms.Count) out of $($targets.Count) platforms" -ForegroundColor Yellow
Write-Host "Output directory: $distDir" -ForegroundColor Yellow

# Create README for distribution
$readmeContent = @"
# SVG MCP Server - Cross-Platform Builds

This directory contains pre-built binaries for the SVG MCP Server.

## Available Platforms

"@

foreach ($target in $targets) {
    $platformDir = Join-Path $distDir $target.name
    $destExe = Join-Path $platformDir $target.exe
    
    if (Test-Path $destExe) {
        $fileSize = (Get-Item $destExe).Length
        $fileSizeMB = [math]::Round($fileSize / 1MB, 2)
        $readmeContent += "- **$($target.name)** ($($target.target)): $fileSizeMB MB`n"
    }
}

$readmeContent += @"

## Usage

1. Choose the appropriate binary for your platform
2. Copy the executable to your desired location
3. Run the server:
   ```
   ./svg-mcp  # Unix-like systems
   svg-mcp.exe  # Windows
   ```

## Integration with Claude Desktop

Add the path to your chosen binary in your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "svg-converter": {
      "command": "/path/to/svg-mcp",
      "args": []
    }
  }
}
```

## Features

- Convert SVG to PNG/JPEG formats
- Automatic size detection from SVG canvas
- Optional custom dimensions
- Base64 or file path output
- High-performance rendering

## Support

For issues and documentation, visit: https://github.com/your-repo/svg-mcp
"@

$readmePath = Join-Path $distDir "README.md"
$readmeContent | Out-File -FilePath $readmePath -Encoding UTF8

Write-Host "Created distribution README: $readmePath" -ForegroundColor Green
