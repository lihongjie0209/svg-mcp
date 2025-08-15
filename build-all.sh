#!/bin/bash

# Cross-platform build script for SVG MCP Server
# This script builds the SVG MCP server for multiple platforms

set -e

# Parse command line arguments
RELEASE=false
while [[ $# -gt 0 ]]; do
    case $1 in
        --release)
            RELEASE=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Define target platforms
declare -a TARGETS=(
    "windows-x64:x86_64-pc-windows-msvc:svg-mcp.exe"
    "windows-x64-gnu:x86_64-pc-windows-gnu:svg-mcp.exe"
    "linux-x64:x86_64-unknown-linux-gnu:svg-mcp"
    "macos-x64:x86_64-apple-darwin:svg-mcp"
    "macos-arm64:aarch64-apple-darwin:svg-mcp"
)

# Create dist directory
DIST_DIR="dist"
rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

# Build configuration
if [ "$RELEASE" = true ]; then
    BUILD_TYPE="release"
    BUILD_FLAG="--release"
else
    BUILD_TYPE="debug"
    BUILD_FLAG=""
fi

echo "Building SVG MCP Server for multiple platforms..."
echo "Build type: $BUILD_TYPE"
echo ""

# Track successful builds
SUCCESSFUL_BUILDS=()
FAILED_BUILDS=()

for target_info in "${TARGETS[@]}"; do
    IFS=':' read -r name target exe <<< "$target_info"
    
    echo "Building for $name ($target)..."
    
    # Build for target platform
    if cargo build --target "$target" $BUILD_FLAG; then
        # Create platform-specific directory
        platform_dir="$DIST_DIR/$name"
        mkdir -p "$platform_dir"
        
        # Copy executable
        source_exe="target/$target/$BUILD_TYPE/$exe"
        dest_exe="$platform_dir/$exe"
        
        if [ -f "$source_exe" ]; then
            cp "$source_exe" "$dest_exe"
            
            # Get file size
            if command -v stat >/dev/null 2>&1; then
                if [[ "$OSTYPE" == "darwin"* ]]; then
                    file_size=$(stat -f%z "$dest_exe")
                else
                    file_size=$(stat -c%s "$dest_exe")
                fi
                file_size_mb=$(echo "scale=2; $file_size / 1024 / 1024" | bc -l 2>/dev/null || echo "N/A")
                echo "✓ Built successfully: $dest_exe (${file_size_mb}MB)"
            else
                echo "✓ Built successfully: $dest_exe"
            fi
            
            SUCCESSFUL_BUILDS+=("$name")
        else
            echo "✗ Executable not found: $source_exe"
            FAILED_BUILDS+=("$name")
        fi
    else
        echo "✗ Failed to build for $name"
        FAILED_BUILDS+=("$name")
    fi
    
    echo ""
done

echo "Build Summary:"
echo "============="

for build in "${SUCCESSFUL_BUILDS[@]}"; do
    echo "✓ $build"
done

for build in "${FAILED_BUILDS[@]}"; do
    echo "✗ $build"
done

echo ""
echo "Successfully built for ${#SUCCESSFUL_BUILDS[@]} out of ${#TARGETS[@]} platforms"
echo "Output directory: $DIST_DIR"

# Create README for distribution
cat > "$DIST_DIR/README.md" << 'EOF'
# SVG MCP Server - Cross-Platform Builds

This directory contains pre-built binaries for the SVG MCP Server.

## Available Platforms

EOF

for target_info in "${TARGETS[@]}"; do
    IFS=':' read -r name target exe <<< "$target_info"
    dest_exe="$DIST_DIR/$name/$exe"
    
    if [ -f "$dest_exe" ]; then
        if command -v stat >/dev/null 2>&1; then
            if [[ "$OSTYPE" == "darwin"* ]]; then
                file_size=$(stat -f%z "$dest_exe")
            else
                file_size=$(stat -c%s "$dest_exe")
            fi
            file_size_mb=$(echo "scale=2; $file_size / 1024 / 1024" | bc -l 2>/dev/null || echo "N/A")
            echo "- **$name** ($target): ${file_size_mb}MB" >> "$DIST_DIR/README.md"
        else
            echo "- **$name** ($target)" >> "$DIST_DIR/README.md"
        fi
    fi
done

cat >> "$DIST_DIR/README.md" << 'EOF'

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
EOF

echo "Created distribution README: $DIST_DIR/README.md"
