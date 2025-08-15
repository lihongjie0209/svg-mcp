# Makefile for SVG MCP Server

.PHONY: all build build-release clean test help install-targets

# Default target
all: build

# Build for current platform (debug)
build:
	cargo build

# Build for current platform (release)
build-release:
	cargo build --release

# Build for all platforms (debug)
build-all:
ifeq ($(OS),Windows_NT)
	powershell -ExecutionPolicy Bypass -File build-all.ps1
else
	./build-all.sh
endif

# Build for all platforms (release)
build-all-release:
ifeq ($(OS),Windows_NT)
	powershell -ExecutionPolicy Bypass -File build-all.ps1 -Release
else
	./build-all.sh --release
endif

# Install cross-compilation targets
install-targets:
	rustup target add x86_64-unknown-linux-gnu
	rustup target add x86_64-apple-darwin
	rustup target add aarch64-apple-darwin
	rustup target add x86_64-pc-windows-gnu

# Test the application
test:
	cargo test
	cargo run --bin test

# Clean build artifacts
clean:
	cargo clean
	rm -rf dist

# Package releases
package: build-all-release
	@echo "Creating release packages..."
	cd dist && for dir in */; do \
		platform=$${dir%/}; \
		if [ -d "$$platform" ]; then \
			echo "Packaging $$platform..."; \
			tar -czf "svg-mcp-$$platform.tar.gz" -C "$$platform" .; \
		fi; \
	done
	@echo "Release packages created in dist/"

# Install locally (requires cargo install)
install:
	cargo install --path .

# Show help
help:
	@echo "SVG MCP Server Build System"
	@echo ""
	@echo "Available targets:"
	@echo "  build              - Build for current platform (debug)"
	@echo "  build-release      - Build for current platform (release)"
	@echo "  build-all          - Build for all platforms (debug)"
	@echo "  build-all-release  - Build for all platforms (release)"
	@echo "  install-targets    - Install cross-compilation targets"
	@echo "  test              - Run tests"
	@echo "  clean             - Clean build artifacts"
	@echo "  package           - Create release packages"
	@echo "  install           - Install locally with cargo"
	@echo "  help              - Show this help"

# Individual platform builds
build-windows:
	cargo build --target x86_64-pc-windows-msvc --release

build-linux:
	cargo build --target x86_64-unknown-linux-gnu --release

build-macos-intel:
	cargo build --target x86_64-apple-darwin --release

build-macos-arm:
	cargo build --target aarch64-apple-darwin --release
