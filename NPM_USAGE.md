# NPM Package Usage Guide

## Installation

### Global Installation
```bash
npm install -g svg-mcp
```

### Direct Usage (No Installation)
```bash
npx svg-mcp
```

## How it Works

The `svg-mcp` npm package includes pre-compiled binaries for all supported platforms:

1. **Platform Detection**: The package automatically detects your platform (Windows, macOS, Linux) and architecture (x64, ARM64)
2. **Binary Selection**: Selects the appropriate pre-included binary for your platform
3. **Ready to Use**: The MCP server runs immediately without any downloads

## Included Binaries

The npm package contains the following pre-compiled binaries:

- ✅ **Windows x64 MSVC** (`svg-mcp-windows-x64.exe`)
- ✅ **Windows x64 GNU** (`svg-mcp-windows-x64-gnu.exe`) - backup option
- ✅ **Linux x64** (`svg-mcp-linux-x64`)
- ✅ **macOS Intel x64** (`svg-mcp-macos-x64`)
- ✅ **macOS Apple Silicon ARM64** (`svg-mcp-macos-arm64`)

**Package Size**: ~25-30MB (includes all platform binaries)

## Configuration with Claude Desktop

Add this to your Claude Desktop MCP configuration:

```json
{
  "mcpServers": {
    "svg-converter": {
      "command": "npx",
      "args": ["svg-mcp"]
    }
  }
}
```

Or if globally installed:

```json
{
  "mcpServers": {
    "svg-converter": {
      "command": "svg-mcp",
      "args": []
    }
  }
}
```

## Troubleshooting

### Unsupported Platform

If you get a "Unsupported platform" error:

1. **Check Platform Support**: Currently supported platforms are listed above
2. **Build from Source**: See the main README for build instructions
3. **Request Support**: Open an issue on GitHub for your platform

### Permission Issues (Unix Systems)

If you get permission denied errors on Linux/macOS:

```bash
# Check if binary has execute permissions
ls -la node_modules/svg-mcp/bin/

# If needed, fix permissions
chmod +x node_modules/svg-mcp/bin/svg-mcp-*
```

### Node.js Version

- **Minimum**: Node.js 14.0.0 or higher
- **Recommended**: Node.js 18.0.0 or higher

## Version Management

### Update to Latest Version

```bash
# If globally installed
npm update -g svg-mcp

# If using npx, it automatically uses the latest version
npx svg-mcp@latest
```

### Check Version

```bash
npm list -g svg-mcp  # Global installation
npm info svg-mcp version  # Latest available version
```

## Advanced Usage

### Custom Binary Location

If you prefer to manage the binary yourself:

1. Download from GitHub releases
2. Place in your preferred location
3. Update Claude Desktop config to use the full path

### Package Size

The npm package is relatively large (~25-30MB) because it includes binaries for all platforms. This ensures:

- ✅ **Offline Installation**: Works without internet after download
- ✅ **Fast Startup**: No runtime downloads or compilation
- ✅ **Reliable**: No dependency on external download sources

## FAQ

**Q: Do I need Rust installed?**  
A: No, the npm package includes pre-compiled binaries.

**Q: Will this work offline?**  
A: Yes, all binaries are included in the package.

**Q: Why is the package so large?**  
A: It includes binaries for all supported platforms (~5-6MB each).

**Q: Can I use this in CI/CD?**  
A: Yes, `npx svg-mcp` works great in automated environments.

**Q: What if I need a specific version?**  
A: Use `npx svg-mcp@1.0.0` to pin to a specific version.
