# SVG MCP Server

A Model Context Protocol (MCP) server written in Rust that provides SVG to image conversion tools.

## Features

- **svg_to_png**: Convert SVG text content to PNG image format
- **svg_to_jpeg**: Convert SVG text content to JPEG image format
- **Automatic size detection**: Uses SVG canvas size by default, with optional custom dimensions
- **Flexible output**: Choose between temporary file paths (default) or base64 encoded data
- Supports custom dimensions and JPEG quality settings
- High-performance SVG rendering using resvg and tiny-skia

## Quick Start

### Option 1: NPM (Recommended)

```bash
# Install globally
npm install -g svg-mcp

# Or run directly with npx (no installation needed)
npx svg-mcp
```

All platform binaries are automatically included - **no additional downloads required**.

### Option 2: Download Pre-built Binaries

Download from [GitHub Releases](https://github.com/lihongjie0209/svg-mcp/releases):

- **Windows x64**: `svg-mcp-windows-x64.zip` (MSVC build - recommended)
- **Windows x64 GNU**: `svg-mcp-windows-x64-gnu.zip` (GNU build - alternative)  
- **Linux x64**: `svg-mcp-linux-x64.tar.gz`
- **macOS Intel**: `svg-mcp-macos-x64.tar.gz`
- **macOS Apple Silicon**: `svg-mcp-macos-arm64.tar.gz`

All binaries are built automatically via **GitHub Actions CI/CD** for consistent quality.

### Option 3: Build from Source

```bash
# Clone the repository
git clone https://github.com/lihongjie0209/svg-mcp.git
cd svg-mcp

# Build for your platform
cargo build --release

# The binary will be at: target/release/svg-mcp (or .exe on Windows)
```

For detailed build instructions, see [BUILD_GUIDE.md](BUILD_GUIDE.md).

## Usage with Claude Desktop

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

### Using local binary

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

## Installation Methods Comparison

| Method | Pros | Cons |
|--------|------|------|
| **NPM** | ✅ Easy installation<br/>✅ Auto-updates<br/>✅ Cross-platform<br/>✅ No manual setup<br/>✅ CI-built quality | ❌ Requires Node.js<br/>❌ Larger package size |
| **GitHub Binary** | ✅ No dependencies<br/>✅ Smallest footprint<br/>✅ CI-built quality | ❌ Manual updates<br/>❌ Platform-specific download |
| **Build from Source** | ✅ Latest features<br/>✅ Customizable<br/>✅ Minimal size | ❌ Requires Rust toolchain<br/>❌ Build time<br/>❌ Manual updates |

### Build Quality Assurance

🏗️ **All binaries are built using GitHub Actions CI/CD**:
- ✅ **Clean Environment**: Built in fresh CI runners
- ✅ **Consistent**: Same build process across all platforms  
- ✅ **Tested**: Automated testing before release
- ✅ **Reproducible**: Source code exactly matches releases
- ✅ **Secure**: Built in GitHub's secure infrastructure

## Available Tools

### svg_to_png

Converts SVG text to PNG image format.

**Parameters:**
- `svg_content` (string): SVG content as XML string
- `width` (optional number): Output image width (uses SVG canvas width if not specified)
- `height` (optional number): Output image height (uses SVG canvas height if not specified)
- `return_base64` (optional boolean): Whether to return base64 data instead of file path (default: false)

**Returns:**
```json
{
  "file_path": "path/to/temporary/file.png",
  "mime_type": "image/png"
}
```

Or when `return_base64` is true:
```json
{
  "base64_data": "base64-encoded-png-data",
  "mime_type": "image/png"
}
```

### svg_to_jpeg

Converts SVG text to JPEG image format.

**Parameters:**
- `svg_content` (string): SVG content as XML string
- `width` (optional number): Output image width (uses SVG canvas width if not specified)
- `height` (optional number): Output image height (uses SVG canvas height if not specified)
- `quality` (optional number): JPEG quality 1-100 (default: 85)
- `return_base64` (optional boolean): Whether to return base64 data instead of file path (default: false)

**Returns:**
```json
{
  "file_path": "path/to/temporary/file.jpg",
  "mime_type": "image/jpeg"
}
```

Or when `return_base64` is true:
```json
{
  "base64_data": "base64-encoded-jpeg-data",
  "mime_type": "image/jpeg"
}
```

## Example Usage

### Sample SVG Content

```xml
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="80" fill="blue" stroke="red" stroke-width="4"/>
  <text x="100" y="110" text-anchor="middle" fill="white" font-family="Arial" font-size="16">Hello SVG!</text>
</svg>
```

### Converting to PNG (using SVG original size)

```json
{
  "tool": "svg_to_png",
  "arguments": {
    "svg_content": "<svg width=\"200\" height=\"200\">...</svg>"
  }
}
```

### Converting to PNG with custom size

```json
{
  "tool": "svg_to_png",
  "arguments": {
    "svg_content": "<svg>...</svg>",
    "width": 400,
    "height": 400
  }
}
```

### Converting to PNG with base64 output

```json
{
  "tool": "svg_to_png",
  "arguments": {
    "svg_content": "<svg>...</svg>",
    "return_base64": true
  }
}
```

### Converting to JPEG (using SVG original size)

```json
{
  "tool": "svg_to_jpeg",
  "arguments": {
    "svg_content": "<svg width=\"200\" height=\"200\">...</svg>",
    "quality": 90
  }
}
```

### Converting to JPEG with custom size and base64 output

```json
{
  "tool": "svg_to_jpeg",
  "arguments": {
    "svg_content": "<svg>...</svg>",
    "width": 600,
    "height": 600,
    "quality": 95,
    "return_base64": true
  }
}
```

## Technical Details

### Architecture

- **MCP Protocol**: Implements Model Context Protocol for tool integration
- **SVG Rendering**: Uses resvg and usvg for high-quality SVG rendering
- **Automatic Sizing**: Extracts canvas dimensions from SVG viewBox or width/height attributes
- **Smart Scaling**: Applies proper scaling transforms when custom dimensions are specified
- **Image Encoding**: Supports PNG and JPEG output formats
- **Async Runtime**: Built on Tokio for efficient async processing

### Dependencies

- `rmcp`: Rust MCP SDK for protocol implementation
- `resvg`: SVG rendering engine
- `usvg`: SVG parsing and optimization
- `tiny-skia`: 2D graphics rendering
- `image`: Image encoding and processing
- `base64`: Base64 encoding for data return
- `tempfile`: Temporary file management with proper file extensions

### Size Detection Logic

1. **Default behavior**: Extract dimensions from SVG's `width` and `height` attributes or `viewBox`
2. **Custom dimensions**: When specified, the SVG is scaled to fit the target size
3. **Aspect ratio**: Maintains proper scaling transforms to preserve SVG appearance

### Performance

- Fast SVG parsing and rendering
- Memory-efficient pixel buffer handling
- Optimized encoding for both PNG and JPEG formats
- Scalable to handle various image sizes
- Automatic size detection eliminates guesswork
- Temporary files include proper file extensions (.png, .jpg)

## Development

### Local Development

```bash
# Check code
cargo check
cargo clippy

# Run tests
cargo test

# Run locally
cargo run

# Build for your platform
cargo build --release
```

### CI/CD and Releases

**All production builds use GitHub Actions CI/CD:**

- 🏗️ **Automated Building**: Every push and PR triggers builds
- 🔖 **Version Releases**: Git tags automatically create releases
- 📦 **NPM Publishing**: Releases automatically publish to NPM  
- 🧪 **Quality Testing**: All builds include automated testing
- 🌐 **Multi-Platform**: Builds for Windows, Linux, and macOS simultaneously

See [BUILD_GUIDE.md](BUILD_GUIDE.md) for complete CI/CD details.

### Code Structure

- `src/lib.rs`: Core conversion logic and MCP server implementation
- `src/main.rs`: Server entry point and CLI interface
- `src/test.rs`: Test program for functionality verification
- `.github/workflows/build.yml`: CI/CD pipeline definition

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes  
4. Add tests if needed
5. Submit a pull request

The CI system will automatically build and test your changes across all platforms.

## Documentation

- 📖 [Build Guide](BUILD_GUIDE.md) - CI/CD and development setup
- 📦 [NPM Usage](NPM_USAGE.md) - Detailed NPM package usage
- 🔧 [Usage Guide](USAGE.md) - MCP server configuration and usage

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Support

- 🐛 **Issues**: Report bugs via [GitHub Issues](https://github.com/lihongjie0209/svg-mcp/issues)
- 📥 **Downloads**: Get binaries from [GitHub Releases](https://github.com/lihongjie0209/svg-mcp/releases)
- 📦 **NPM**: Install via [npm package](https://www.npmjs.com/package/svg-mcp)
