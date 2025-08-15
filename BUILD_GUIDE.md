# Cross-Platform Build Guide for SVG MCP Server

这个指南将帮助您为不同平台构建SVG MCP服务器的可执行文件。

## 快速开始 (Windows)

### 使用PowerShell脚本

```powershell
# 构建发布版本
.\build-windows.ps1 -Release

# 构建调试版本
.\build-windows.ps1
```

### 手动构建

```bash
# 构建当前平台
cargo build --release

# 输出位置
# target/release/svg-mcp.exe (Windows)
```

## 完整跨平台构建

### 1. 使用GitHub Actions (推荐)

项目包含GitHub Actions工作流，会自动为所有平台构建：

1. 推送代码到GitHub
2. 创建标签触发发布：
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. GitHub会自动构建并创建release

支持的平台：
- Windows x64 (MSVC)
- Windows x64 (GNU)
- Linux x64
- macOS Intel (x64)
- macOS Apple Silicon (ARM64)

### 2. 本地跨平台构建

#### 安装目标平台

```bash
# 安装交叉编译目标
rustup target add x86_64-unknown-linux-gnu
rustup target add x86_64-apple-darwin
rustup target add aarch64-apple-darwin
rustup target add x86_64-pc-windows-gnu
```

#### 构建特定平台

```bash
# Windows (当前已支持)
cargo build --release --target x86_64-pc-windows-msvc

# Linux (需要交叉编译工具链)
cargo build --release --target x86_64-unknown-linux-gnu

# macOS Intel (需要交叉编译工具链)
cargo build --release --target x86_64-apple-darwin

# macOS Apple Silicon (需要交叉编译工具链)
cargo build --release --target aarch64-apple-darwin
```

### 3. 平台特定构建

#### Windows
- ✅ **原生支持**: 在Windows上直接构建
- **工具**: Visual Studio Build Tools 或 Visual Studio
- **目标**: `x86_64-pc-windows-msvc`

#### Linux
- **原生构建**: 在Linux系统上构建
- **交叉编译**: 需要Linux交叉编译工具链
- **目标**: `x86_64-unknown-linux-gnu`

#### macOS
- **原生构建**: 在macOS系统上构建
- **交叉编译**: 需要Xcode工具链（仅在macOS上可用）
- **目标**: 
  - Intel: `x86_64-apple-darwin`
  - Apple Silicon: `aarch64-apple-darwin`

## 构建脚本说明

### Windows构建脚本

- `build-windows.ps1`: 简单的Windows构建脚本
- `build-simple.ps1`: 尝试多平台构建（可能需要额外工具）
- `build-all.ps1`: 完整的跨平台构建脚本

### Unix构建脚本

- `build-all.sh`: Linux/macOS构建脚本
- `Makefile`: Make构建系统

## 输出文件结构

```
dist/
├── README.md
├── windows-x64/
│   └── svg-mcp.exe          # Windows可执行文件
├── linux-x64/
│   └── svg-mcp              # Linux可执行文件
├── macos-x64/
│   └── svg-mcp              # macOS Intel可执行文件
└── macos-arm64/
    └── svg-mcp              # macOS Apple Silicon可执行文件
```

## 使用构建的可执行文件

### 1. 直接运行

```bash
# Windows
cd dist/windows-x64
./svg-mcp.exe

# Linux/macOS
cd dist/linux-x64  # 或其他平台目录
./svg-mcp
```

### 2. Claude Desktop配置

将可执行文件的完整路径添加到Claude Desktop配置：

```json
{
  "mcpServers": {
    "svg-converter": {
      "command": "/full/path/to/svg-mcp",
      "args": []
    }
  }
}
```

### 3. 系统路径安装

```bash
# 复制到系统路径 (需要管理员权限)
# Windows
copy dist\windows-x64\svg-mcp.exe C:\Windows\System32\

# Linux/macOS
sudo cp dist/linux-x64/svg-mcp /usr/local/bin/
```

## 故障排除

### 常见问题

1. **交叉编译失败**
   - 解决方案: 使用GitHub Actions或在目标平台上原生构建

2. **依赖问题**
   - 确保安装了所有必需的系统依赖
   - Linux: `pkg-config`, `build-essential`
   - Windows: Visual Studio Build Tools

3. **权限问题**
   - 确保可执行文件有执行权限
   - Linux/macOS: `chmod +x svg-mcp`

### 验证构建

测试构建的可执行文件：

```bash
# 运行测试
cargo run --bin test

# 检查可执行文件
file dist/windows-x64/svg-mcp.exe  # Linux/macOS
```

## 持续集成

项目配置了GitHub Actions工作流：
- `.github/workflows/build.yml`: 自动构建和发布
- 支持标签触发的自动发布
- 生成跨平台二进制文件

## 高级选项

### 自定义构建

```bash
# 优化大小
cargo build --release --target x86_64-pc-windows-msvc
strip target/x86_64-pc-windows-msvc/release/svg-mcp.exe

# 添加调试信息
cargo build --release --target x86_64-pc-windows-msvc --features debug
```

### Docker构建

使用Docker进行跨平台构建：

```dockerfile
# 多阶段构建示例
FROM rust:1.70 as builder
WORKDIR /app
COPY . .
RUN cargo build --release

FROM debian:bullseye-slim
COPY --from=builder /app/target/release/svg-mcp /usr/local/bin/
CMD ["svg-mcp"]
```

## 分发

### 打包发布

```bash
# 创建压缩包
cd dist
tar -czf svg-mcp-windows-x64.tar.gz windows-x64/
zip -r svg-mcp-windows-x64.zip windows-x64/
```

### 校验和

```bash
# 生成校验和
cd dist
sha256sum */svg-mcp* > checksums.sha256
```

这样您就可以为各个平台生成可执行文件了！
