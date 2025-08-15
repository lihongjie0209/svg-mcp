# SVG MCP 服务器使用指南

这是一个基于 Rust 开发的 MCP (Model Context Protocol) 服务器，提供 SVG 文本到 PNG/JPEG 图片的转换功能。

## 功能特性

- 将 SVG 文本内容转换为 PNG 图片格式
- 将 SVG 文本内容转换为 JPEG 图片格式
- 返回临时文件路径和 Base64 编码数据
- 支持自定义图片尺寸和 JPEG 质量

## 安装和运行

### 前置要求

- Rust 1.70+
- Cargo

### 编译和运行

1. 克隆或下载项目到本地
2. 在项目目录中运行：

```bash
# 编译项目
cargo build --release

# 运行 MCP 服务器
cargo run --bin svg-mcp
```

### 作为 Claude Desktop 插件使用

在 Claude Desktop 的配置文件中添加以下配置：

```json
{
  "mcpServers": {
    "svg-converter": {
      "command": "path/to/your/svg-mcp.exe",
      "args": []
    }
  }
}
```

## 工具说明

### svg_to_png

将 SVG 文本转换为 PNG 格式图片。

**参数：**
- `svg_content`: String - SVG 内容（XML 字符串）
- `width`: Option<u32> - 输出图片宽度（可选，默认 800）
- `height`: Option<u32> - 输出图片高度（可选，默认 600）

**返回值：**
```json
{
  "file_path": "临时文件路径",
  "base64_data": "Base64编码的PNG数据",
  "mime_type": "image/png"
}
```

### svg_to_jpeg

将 SVG 文本转换为 JPEG 格式图片。

**参数：**
- `svg_content`: String - SVG 内容（XML 字符串）
- `width`: Option<u32> - 输出图片宽度（可选，默认 800）
- `height`: Option<u32> - 输出图片高度（可选，默认 600）
- `quality`: Option<u8> - JPEG 质量 1-100（可选，默认 85）

**返回值：**
```json
{
  "file_path": "临时文件路径",
  "base64_data": "Base64编码的JPEG数据",
  "mime_type": "image/jpeg"
}
```

## 示例用法

### SVG 内容示例

```xml
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="80" fill="blue" stroke="red" stroke-width="4"/>
  <text x="100" y="110" text-anchor="middle" fill="white" font-family="Arial" font-size="16">Hello SVG!</text>
</svg>
```

### 调用示例

使用 Claude 或其他 MCP 客户端时，可以这样调用：

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

## 技术架构

### 主要依赖

- **rmcp**: Rust MCP SDK，用于实现 MCP 协议
- **resvg/usvg**: SVG 解析和渲染
- **tiny-skia**: 2D 图形渲染引擎
- **image**: 图片编码处理
- **tokio**: 异步运行时

### 转换流程

1. 解析 SVG 文本内容
2. 使用 usvg 创建 SVG 树结构
3. 创建指定尺寸的像素缓冲区
4. 使用 resvg 渲染 SVG 到缓冲区
5. 根据目标格式编码为 PNG 或 JPEG
6. 创建临时文件并生成 Base64 编码
7. 返回文件路径和编码数据

## 注意事项

1. **临时文件管理**: 转换生成的临时文件会被保留，可能需要定期清理
2. **内存使用**: 大尺寸图片转换会消耗较多内存
3. **字体支持**: 文本渲染依赖系统字体，某些字体可能无法正确显示
4. **SVG 兼容性**: 支持大部分 SVG 1.1 特性，但不是所有特性都支持

## 开发和测试

### 运行测试

```bash
# 运行内置测试
cargo run --bin test

# 运行单元测试
cargo test
```

### 开发模式

```bash
# 启用调试日志运行
RUST_LOG=debug cargo run --bin svg-mcp
```

## 故障排除

### 常见问题

1. **编译错误**: 确保 Rust 版本 1.70+
2. **运行时错误**: 检查 SVG 内容是否有效
3. **内存不足**: 降低图片尺寸或质量设置

### 日志调试

设置环境变量启用详细日志：

```bash
RUST_LOG=svg_mcp=debug,rmcp=debug
```

## 许可证

本项目基于 MIT 许可证开源。详情请参阅 LICENSE 文件。
