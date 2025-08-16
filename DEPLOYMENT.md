# Deployment Guide

## 🚀 Automated CI/CD Deployment

This project uses GitHub Actions for fully automated building and publishing of both GitHub releases and npm packages.

## 📋 Prerequisites

### 1. NPM Token Setup

To publish to npm automatically, you need to set up an NPM access token:

#### Step 1: Create NPM Token
```bash
# Login to npm (if not already logged in)
npm login

# Generate an automation token
npm token create --type=automation
```

#### Step 2: Add Token to GitHub Secrets
```bash
# Using GitHub CLI
gh secret set NPM_TOKEN --body "your_npm_token_here"

# Or via GitHub Web UI:
# 1. Go to your repository on GitHub
# 2. Click Settings → Secrets and variables → Actions
# 3. Click "New repository secret"
# 4. Name: NPM_TOKEN
# 5. Value: your_npm_token_here
```

## 🔄 Release Process

### Automatic Release (Recommended)

1. **Create a Release**:
   ```bash
   # Create and push a version tag
   git tag v1.0.1
   git push origin v1.0.1
   
   # Or create a GitHub release
   gh release create v1.0.1 --title "Release v1.0.1" --notes "Release notes here"
   ```

2. **CI/CD Pipeline Automatically**:
   - ✅ Builds binaries for all platforms (Windows, Linux, macOS Intel/ARM)
   - ✅ Creates GitHub release with platform-specific archives
   - ✅ Downloads binaries and creates platform-specific npm packages
   - ✅ Publishes platform packages: `@svg-mcp/win32-x64`, `@svg-mcp/linux-x64`, etc.
   - ✅ Publishes main package: `svg-mcp` with platform dependencies
   - ✅ All packages use the same version number

### Manual Workflow Dispatch

You can also trigger the workflow manually:

```bash
# Using GitHub CLI
gh workflow run build.yml --field version=v1.0.1 --field create_release=true

# Or via GitHub Web UI:
# 1. Go to Actions tab
# 2. Select "Build and Release" workflow
# 3. Click "Run workflow"
# 4. Enter version (e.g., v1.0.1)
```

## 🏗️ CI/CD Architecture

### Build Matrix
The CI builds for all supported platforms in parallel:

| Platform | Target | Binary Name |
|----------|--------|-------------|
| Windows x64 MSVC | `x86_64-pc-windows-msvc` | `svg-mcp.exe` |
| Windows x64 GNU | `x86_64-pc-windows-gnu` | `svg-mcp.exe` |
| Linux x64 | `x86_64-unknown-linux-gnu` | `svg-mcp` |
| macOS Intel | `x86_64-apple-darwin` | `svg-mcp` |
| macOS ARM64 | `aarch64-apple-darwin` | `svg-mcp` |

### Publishing Pipeline

1. **Build Job**: Creates cross-platform binaries
2. **Release Job**: Creates GitHub release with platform archives  
3. **Platform Packages Job**: Downloads binaries and publishes platform-specific npm packages
4. **Main Package Job**: Publishes main `svg-mcp` package with platform dependencies

### Package Architecture

```
svg-mcp@1.0.1 (main package)
├── optionalDependencies:
│   ├── @svg-mcp/win32-x64@1.0.1
│   ├── @svg-mcp/linux-x64@1.0.1
│   ├── @svg-mcp/darwin-x64@1.0.1
│   └── @svg-mcp/darwin-arm64@1.0.1
├── index.js (platform detection & loading)
└── scripts/postinstall.js (verification)
```

## 🛠️ Local Development

### Package Management Scripts

For local development and testing:

```bash
# Build all platform packages locally (requires cross-compilation setup)
node scripts/package-manager.js build

# Update all package versions
node scripts/package-manager.js version 1.0.2

# Test package structure
node scripts/package-manager.js test

# Publish packages (requires npm login)
node scripts/package-manager.js publish

# PowerShell wrapper (Windows)
.\package-manager.ps1 build
.\package-manager.ps1 test
```

### Cross-Compilation Setup

If you want to build locally for all platforms:

```bash
# Install Rust targets
rustup target add x86_64-pc-windows-msvc
rustup target add x86_64-pc-windows-gnu
rustup target add x86_64-unknown-linux-gnu
rustup target add x86_64-apple-darwin
rustup target add aarch64-apple-darwin

# Install cross-compilation dependencies (Linux/macOS)
# For Windows targets on Unix systems
sudo apt-get install gcc-mingw-w64  # Ubuntu/Debian
brew install mingw-w64              # macOS
```

## 🔍 Monitoring Deployments

### Check CI/CD Status
```bash
# List recent workflow runs
gh run list --limit 5

# View specific run
gh run view <run-id>

# Watch live run
gh run watch <run-id>

# View logs
gh run view <run-id> --log
```

### Verify NPM Packages
```bash
# Check main package
npm view svg-mcp

# Check platform packages
npm view @svg-mcp/win32-x64
npm view @svg-mcp/linux-x64
npm view @svg-mcp/darwin-x64
npm view @svg-mcp/darwin-arm64

# Check all versions
npm view svg-mcp versions --json
```

### Verify GitHub Release
```bash
# List releases
gh release list

# View specific release
gh release view v1.0.1

# Download release assets
gh release download v1.0.1
```

## 🐛 Troubleshooting

### Common Issues

#### 1. NPM Token Issues
```bash
# Error: "npm error code E401"
# Solution: Check NPM_TOKEN secret is set correctly
gh secret list
gh secret set NPM_TOKEN --body "your_new_token"
```

#### 2. Cross-Compilation Failures
```bash
# Error: "linker `x86_64-w64-mingw32-gcc` not found"
# Solution: Install cross-compilation tools (handled by CI)
```

#### 3. Platform Package Publishing Order
```bash
# Error: "Package not found"
# Solution: Platform packages must publish before main package
# This is handled automatically by job dependencies
```

#### 4. Version Mismatch
```bash
# Error: optionalDependencies version mismatch
# Solution: All packages use the same version from git tag
# Check that Cargo.toml and package.json versions match
```

### Manual Recovery

If CI fails, you can manually recover:

```bash
# 1. Fix the issue in code
# 2. Delete the failed release
gh release delete v1.0.1 --cleanup-tag

# 3. Create a new release with a patch version
gh release create v1.0.2 --title "Release v1.0.2" --notes "Fix deployment issue"
```

## 📊 Deployment Metrics

### Package Sizes
- **Individual Platform Package**: ~5-6MB
- **Main Package**: ~1KB (metadata only)
- **Total User Download**: ~5-6MB (vs ~25MB for monolithic package)

### Build Times (CI)
- **Per Platform**: ~3-5 minutes
- **Total Pipeline**: ~10-15 minutes (parallel builds)
- **Platform Package Publishing**: ~2-3 minutes
- **Main Package Publishing**: ~1-2 minutes

### Rollout Strategy
1. ✅ Platform packages published first
2. ✅ Verification that all platform packages are available
3. ✅ Main package published last with references to platform packages
4. ✅ Atomic update: users get all platforms or none

## 🔐 Security

### Secrets Management
- **NPM_TOKEN**: Automation token with publish scope only
- **GITHUB_TOKEN**: Automatically provided by GitHub Actions
- **No hardcoded secrets**: All sensitive data in GitHub Secrets

### Package Verification
- **Source verification**: All binaries built from tagged source code
- **Checksum verification**: GitHub releases include checksums
- **CI-only builds**: No local builds in published packages

### Access Control
- **Repository permissions**: Only maintainers can create releases
- **NPM organization**: Platform packages under `@svg-mcp/` scope
- **Automated auditing**: npm audit runs on all packages

## 📈 Future Improvements

### Planned Enhancements
- **Binary signing**: Code signing for Windows/macOS binaries
- **Registry mirrors**: Support for private npm registries  
- **Performance monitoring**: Build time and package size tracking
- **Rollback automation**: Automated rollback on critical failures

### Monitoring Integration
- **Slack notifications**: Success/failure notifications
- **Grafana dashboards**: Build and deployment metrics
- **Error tracking**: Sentry integration for runtime errors
