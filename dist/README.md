# SVG MCP Server - Windows Build

## Usage

Run the server:
```
svg-mcp.exe
```

## Claude Desktop Configuration

Add to your Claude Desktop settings:

```json
{
  "mcpServers": {
    "svg-converter": {
      "command": "D:\code\svg-mcp\dist\windows-x64\svg-mcp.exe",
      "args": []
    }
  }
}
```

## Testing

From the project root:
```
cargo run --bin test
```
