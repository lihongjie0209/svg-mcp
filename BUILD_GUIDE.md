# Build Guide for SVG MCP Server

SVG MCP Server 使用 **GitHub Actions CI/CD** 进行自动化构建和发布。这确保了所有平台的二进制文件都是在干净、一致的环境中构建的。

## 🚀 自动化构建流程

### 支持的平台

项目自动为以下平台构建二进制文件：

- **Windows x64 (MSVC)** - 推荐的 Windows 版本
- **Windows x64 (GNU)** - 备用 Windows 版本
- **Linux x64** - 通用 Linux 发行版
- **macOS Intel (x64)** - Intel 芯片的 Mac
- **macOS Apple Silicon (ARM64)** - M1/M2/M3 芯片的 Mac

### 构建触发条件

GitHub Actions 会在以下情况下自动构建：

1. **推送到主分支**
   ```bash
   git push origin main
   ```

2. **创建 Pull Request**
   ```bash
   # PR 会触发构建验证
   ```

3. **创建版本标签**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

4. **手动触发**
   - 在 GitHub 仓库页面
   - 进入 "Actions" 选项卡
   - 选择 "Build and Release" workflow
   - 点击 "Run workflow"

## 📦 发布流程

### 自动发布

当创建版本标签时，系统会自动：

1. **构建所有平台的二进制文件**
2. **创建 GitHub Release**
3. **上传平台特定的压缩包**
4. **发布到 NPM**

```bash
# 创建新版本
git tag v1.2.3
git push origin v1.2.3

# 系统会自动：
# 1. 构建 5 个平台的二进制文件
# 2. 创建 GitHub Release v1.2.3
# 3. 上传 svg-mcp-windows-x64.zip 等文件
# 4. 发布 svg-mcp@1.2.3 到 NPM
```

### 手动发布

也可以通过 GitHub 界面手动触发发布：

1. 进入 GitHub 仓库的 "Actions" 页面
2. 选择 "Build and Release" workflow
3. 点击 "Run workflow"
4. 输入版本号（如 `v1.2.3`）
5. 选择是否创建 GitHub Release
6. 点击 "Run workflow"

## 📋 构建产物

### GitHub Release 文件

每次发布会创建以下文件：

```
svg-mcp-windows-x64.zip       # Windows MSVC 版本
svg-mcp-windows-x64-gnu.zip   # Windows GNU 版本
svg-mcp-linux-x64.tar.gz     # Linux 版本
svg-mcp-macos-x64.tar.gz     # macOS Intel 版本
svg-mcp-macos-arm64.tar.gz   # macOS Apple Silicon 版本
```

### NPM 包

NPM 包 `svg-mcp` 包含所有平台的二进制文件，会根据用户的操作系统自动选择合适的版本。

## 🔧 开发者指南

### 本地开发

对于本地开发和测试，仍然可以使用标准的 Rust 工具：

```bash
# 安装依赖
cargo check

# 本地构建（当前平台）
cargo build

# 运行测试
cargo test

# 本地运行
cargo run
```

### 测试构建

在推送代码前，建议本地测试：

```bash
# 检查代码
cargo check
cargo clippy
cargo fmt --check

# 运行测试
cargo test

# 构建发布版本
cargo build --release
```

### 版本管理

1. **更新版本号**
   ```bash
   # 更新 Cargo.toml 中的版本
   # 更新 package.json 中的版本
   ```

2. **提交更改**
   ```bash
   git add .
   git commit -m "Release v1.2.3"
   git push origin main
   ```

3. **创建标签**
   ```bash
   git tag v1.2.3
   git push origin v1.2.3
   ```

## 🔍 监控构建

### 查看构建状态

1. 访问 GitHub 仓库的 "Actions" 页面
2. 查看最新的 workflow 运行状态
3. 点击具体的运行查看详细日志

### 常见问题

**Q: 构建失败了怎么办？**
A: 查看 GitHub Actions 的错误日志，通常是：
- 依赖问题
- 代码编译错误
- 测试失败

**Q: 如何修复失败的构建？**
A: 
1. 本地修复问题
2. 提交并推送修复
3. 重新创建标签或手动触发构建

**Q: NPM 发布失败？**
A: 检查：
- NPM_TOKEN 是否正确设置
- 版本号是否已存在
- GitHub Release 是否成功创建

## 🎯 最佳实践

1. **版本控制**
   - 使用语义化版本号（如 v1.2.3）
   - 在发布前充分测试

2. **代码质量**
   - 确保所有测试通过
   - 使用 `cargo clippy` 检查代码质量
   - 使用 `cargo fmt` 格式化代码

3. **发布频率**
   - 功能稳定后再发布
   - 重要修复及时发布
   - 保持发布说明清晰

## 📚 相关文档

- [GitHub Actions Workflow](.github/workflows/build.yml)
- [Cargo 配置](Cargo.toml)
- [NPM 配置](package.json)
- [使用指南](USAGE.md)

---

通过这个自动化的构建和发布流程，确保了所有用户都能获得高质量、一致的二进制文件，而不需要开发者手动维护复杂的本地构建环境。
