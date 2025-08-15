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

When you install or run `svg-mcp` via npm:

1. **Platform Detection**: The package automatically detects your platform (Windows, macOS, Linux) and architecture (x64, ARM64)
2. **Binary Download**: Downloads the appropriate pre-compiled binary from GitHub releases
3. **Automatic Setup**: Places the executable in the correct location and sets up permissions
4. **Ready to Use**: The MCP server is ready to run

## Supported Platforms

- ✅ **Windows x64** (MSVC build)
- ✅ **Linux x64** 
- ✅ **macOS Intel (x64)**
- ✅ **macOS Apple Silicon (ARM64)**

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

### Binary Download Failed

If the automatic download fails, you can:

1. **Manual Download**: Visit [GitHub Releases](https://github.com/lihongjie0209/svg-mcp/releases) and download manually
2. **Extract**: Place the executable in `node_modules/svg-mcp/bin/`
3. **Permissions**: On Unix systems, run `chmod +x node_modules/svg-mcp/bin/svg-mcp`

### Platform Not Supported

Currently supported platforms are listed above. If your platform isn't supported:

1. **Build from Source**: See the main README for build instructions
2. **Request Support**: Open an issue on GitHub for your platform

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

### Development/Testing

```bash
# Clone the npm package
npm pack svg-mcp
tar -xzf svg-mcp-*.tgz
cd package
npm install
```

## FAQ

**Q: Do I need Rust installed?**  
A: No, the npm package includes pre-compiled binaries.

**Q: Will this work offline?**  
A: After initial installation, yes. The binary is cached locally.

**Q: How large is the download?**  
A: Approximately 6-8MB depending on platform.

**Q: Can I use this in CI/CD?**  
A: Yes, `npx svg-mcp` works great in automated environments.

**Q: What if I need a specific version?**  
A: Use `npx svg-mcp@1.0.0` to pin to a specific version.
