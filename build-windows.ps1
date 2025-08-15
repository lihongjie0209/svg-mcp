# Simple build script for Windows
param([switch]$Release)

Write-Host "Building SVG MCP Server for Windows..." -ForegroundColor Green

$buildType = if ($Release) { "release" } else { "debug" }
$buildFlag = if ($Release) { "--release" } else { "" }

# Create dist directory
$distDir = "dist"
if (Test-Path $distDir) { Remove-Item $distDir -Recurse -Force }
New-Item -ItemType Directory -Path $distDir | Out-Null

# Build current platform
Write-Host "Building for Windows x64 (MSVC)..." -ForegroundColor Cyan
cargo build --target x86_64-pc-windows-msvc $buildFlag

if ($LASTEXITCODE -eq 0) {
    # Create platform directory
    $platformDir = Join-Path $distDir "windows-x64"
    New-Item -ItemType Directory -Path $platformDir | Out-Null
    
    # Copy executable
    $sourceExe = "target\x86_64-pc-windows-msvc\$buildType\svg-mcp.exe"
    $destExe = Join-Path $platformDir "svg-mcp.exe"
    
    Copy-Item $sourceExe $destExe
    
    $fileSize = (Get-Item $destExe).Length
    $fileSizeMB = [math]::Round($fileSize / 1MB, 2)
    Write-Host "✓ Built successfully: $fileSizeMB MB" -ForegroundColor Green
    
    # Create simple README
    @"
# SVG MCP Server - Windows Build

## Usage

Run the server:
``````
svg-mcp.exe
``````

## Claude Desktop Configuration

Add to your Claude Desktop settings:

``````json
{
  "mcpServers": {
    "svg-converter": {
      "command": "$(Resolve-Path $destExe)",
      "args": []
    }
  }
}
``````

## Testing

From the project root:
``````
cargo run --bin test
``````
"@ | Out-File -FilePath (Join-Path $distDir "README.md") -Encoding UTF8

    Write-Host "Build completed! Files in: $distDir" -ForegroundColor Green
} else {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}
