use anyhow::Result;
use rmcp::{ServiceExt, transport::stdio};
use svg_mcp::SvgConverter;
use tracing_subscriber::prelude::*;

#[tokio::main]
async fn main() -> Result<()> {
    // 初始化日志
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info".to_string().into()),
        )
        .with(tracing_subscriber::fmt::layer().with_writer(std::io::stderr))
        .init();

    // 创建SVG转换服务器
    let service = SvgConverter::new();
    
    // 启动服务器
    tracing::info!("Starting SVG converter MCP server...");
    let server = service.serve(stdio()).await?;
    
    // 等待服务器运行
    server.waiting().await?;

    Ok(())
}
