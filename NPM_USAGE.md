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

The `svg-mcp` npm package uses a **platform-specific package strategy**:

1. **Smart Installation**: The main package automatically detects your platform and downloads only the required binary package
2. **Minimal Download**: Users only download binaries for their platform (~5-6MB instead of ~25MB)
3. **Platform Packages**: Each platform has its own npm package (e.g., `@svg-mcp/win32-x64`, `@svg-mcp/linux-x64`)
4. **Auto-Detection**: The package automatically selects the correct binary for your OS and architecture
5. **CI/CD Built**: All binaries are built automatically using GitHub Actions CI/CD

## Platform Packages

The main `svg-mcp` package automatically installs one of these platform-specific packages:

- ✅ **@svg-mcp/win32-x64** - Windows 64-bit (MSVC build)
- ✅ **@svg-mcp/linux-x64** - Linux 64-bit (Universal)
- ✅ **@svg-mcp/darwin-x64** - macOS Intel 64-bit
- ✅ **@svg-mcp/darwin-arm64** - macOS Apple Silicon (M1/M2/M3)

**Package Sizes**: ~5-6MB each (only your platform is downloaded)  
**Quality Assurance**: All binaries are built in clean CI environments with automated testing

## Installation Process

When you install `svg-mcp`, this happens:

1. **Main Package**: Downloads the lightweight main package (~1KB)
2. **Platform Detection**: Detects your OS (`win32`, `linux`, `darwin`) and architecture (`x64`, `arm64`)
3. **Platform Package**: Automatically downloads the appropriate platform-specific package
4. **Ready to Use**: Binary is immediately available

```bash
npm install svg-mcp
# ↓
# Main package: svg-mcp (~1KB)
# Platform package: @svg-mcp/win32-x64 (~5MB) - only on Windows
# Total download: ~5MB instead of ~25MB
```

## Configuration with Claude Desktop

### Using NPM package (recommended)

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

### Using global installation

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

## Release Process

### Automated Multi-Package Releases

All npm packages are automatically published via GitHub Actions in the following order:

1. **Build Phase**: GitHub CI builds binaries for all platforms
2. **Platform Packages**: Publishes each platform-specific package separately
3. **Main Package**: Publishes the main package that references the platform packages
4. **Version Sync**: All packages use the same version number

### Version Coordination

- **Platform Packages**: `@svg-mcp/win32-x64@1.2.3`, `@svg-mcp/linux-x64@1.2.3`, etc.
- **Main Package**: `svg-mcp@1.2.3` with `optionalDependencies` pointing to platform packages
- **Auto-Updates**: When you update `svg-mcp`, platform packages update automatically

## Troubleshooting

### Platform Package Not Found

If you get an error about a missing platform package:

```bash
# Check what platform was detected
node -e "console.log(process.platform + '-' + process.arch)"

# Check if platform package exists
npm view @svg-mcp/win32-x64  # Replace with your platform

# Reinstall to retry platform detection
npm uninstall svg-mcp
npm install svg-mcp
```

### Unsupported Platform

If your platform isn't supported:

1. **Check Platform Support**: Currently supported combinations:
   - `win32-x64` (Windows 64-bit)
   - `linux-x64` (Linux 64-bit)
   - `darwin-x64` (macOS Intel)
   - `darwin-arm64` (macOS Apple Silicon)

2. **Alternative Options**:
   - Build from source: `cargo build --release`
   - Download binary from [GitHub Releases](https://github.com/lihongjie0209/svg-mcp/releases)
   - Request support by opening an issue

### Installation Issues

If platform package installation fails:

```bash
# Clear npm cache
npm cache clean --force

# Try manual installation of platform package
npm install @svg-mcp/win32-x64  # Replace with your platform

# Check npm registry status
npm ping

# Use different registry if needed
npm install svg-mcp --registry https://registry.npmjs.org/
```

### Permission Issues (Unix Systems)

If you get permission denied errors on Linux/macOS:

```bash
# Check platform package location
npm list -g @svg-mcp/linux-x64  # Replace with your platform

# Fix permissions if needed
find node_modules/@svg-mcp/*/bin/ -name "svg-mcp" -exec chmod +x {} \;
```

## Version Management

### Update to Latest Version

```bash
# Update main package (automatically updates platform package)
npm update -g svg-mcp

# Check current version
npm list -g svg-mcp

# Check latest available version
npm info svg-mcp version
```

### Pin to Specific Version

```bash
# Install specific version
npm install -g svg-mcp@1.2.3

# Use specific version with npx
npx svg-mcp@1.2.3
```

### Check Platform Package Versions

```bash
# Check all platform packages
npm view @svg-mcp/win32-x64 versions --json
npm view @svg-mcp/linux-x64 versions --json
npm view @svg-mcp/darwin-x64 versions --json
npm view @svg-mcp/darwin-arm64 versions --json
```

## Advanced Usage

### Manual Platform Package Installation

If you want to manually install a specific platform package:

```bash
# Install platform package directly
npm install @svg-mcp/win32-x64

# Use it programmatically
node -e "
  const pkg = require('@svg-mcp/win32-x64');
  console.log('Binary path:', pkg.getBinaryPath());
"
```

### Custom Binary Path

If you prefer to manage the binary yourself:

1. Download from [GitHub Releases](https://github.com/lihongjie0209/svg-mcp/releases)
2. Extract the platform-specific archive
3. Update Claude Desktop config with full path:

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

### CI/CD Usage

Perfect for automated environments:

```bash
# In CI scripts - always gets latest
npx svg-mcp --version

# In Docker containers
RUN npm install -g svg-mcp

# In package.json scripts
{
  "scripts": {
    "mcp": "svg-mcp"
  }
}
```

## Package Architecture Benefits

### For Users
- ✅ **Faster Downloads**: Only download your platform (~5MB vs ~25MB)
- ✅ **Cleaner Installation**: No unused binaries cluttering your system
- ✅ **Better Caching**: npm can cache platform packages independently

### For Developers
- ✅ **Easier Maintenance**: Update platforms independently
- ✅ **Better Analytics**: Track usage by platform
- ✅ **Flexible Releases**: Can skip platforms if builds fail

### For CI/CD
- ✅ **Parallel Publishing**: Platform packages can be published simultaneously
- ✅ **Atomic Updates**: Main package only updates when all platforms are ready
- ✅ **Rollback Safety**: Can rollback specific platforms if needed

## FAQ

**Q: Do I need to install platform packages manually?**  
A: No, the main `svg-mcp` package automatically installs the correct platform package.

**Q: What happens if I'm on an unsupported platform?**  
A: Installation succeeds but you'll get a helpful error with alternative options.

**Q: Can I install multiple platform packages?**  
A: Yes, but only the one matching your platform will be used automatically.

**Q: How much bandwidth does this save?**  
A: About 80% - you download ~5MB instead of ~25MB for a full multi-platform package.

**Q: Are the platform packages secure?**  
A: Yes, all binaries are built in GitHub's secure CI environment and can be verified against the source code.

**Q: What if a platform package fails to publish?**  
A: The main package won't be updated until all platform packages are successfully published.

**Q: Can I use this in offline environments?**  
A: Yes, once installed. The packages work offline, but initial installation requires internet.

## Support

- **GitHub Issues**: Report bugs and request features
- **Platform Packages**: Check specific platform package status on npm
- **GitHub Releases**: Download platform-specific binaries directly if needed
