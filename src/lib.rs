use rmcp::{
    ServerHandler,
    model::{ServerInfo, ServerCapabilities, ErrorData as McpError, ErrorCode},
};
use serde_json::json;
use schemars::JsonSchema;
use base64::{Engine as _, engine::general_purpose};
use std::io::Write;
use image::ImageEncoder;
use tempfile::NamedTempFile;

#[derive(Debug, serde::Serialize, serde::Deserialize, JsonSchema)]
pub struct SvgToPngRequest {
    pub svg_content: String,
    pub width: Option<u32>,
    pub height: Option<u32>,
    /// Whether to return base64 data instead of file path (default: false)
    pub return_base64: Option<bool>,
}

#[derive(Debug, serde::Serialize, serde::Deserialize, JsonSchema)]
pub struct SvgToJpegRequest {
    pub svg_content: String,
    pub width: Option<u32>,
    pub height: Option<u32>,
    pub quality: Option<u8>,
    /// Whether to return base64 data instead of file path (default: false)
    pub return_base64: Option<bool>,
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct ConversionResult {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub file_path: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub base64_data: Option<String>,
    pub mime_type: String,
}

pub struct SvgConverter;

impl SvgConverter {
    pub fn new() -> Self {
        Self
    }

    pub fn convert_svg_to_png(&self, svg_content: &str, width: Option<u32>, height: Option<u32>, return_base64: bool) -> Result<ConversionResult, Box<dyn std::error::Error>> {
        // Parse SVG with proper options
        let opt = usvg::Options::default();
        let tree = usvg::Tree::from_str(svg_content, &opt, &usvg::fontdb::Database::new())?;
        
        // Get SVG size or use provided dimensions
        let svg_size = tree.size();
        let final_width = width.unwrap_or(svg_size.width() as u32);
        let final_height = height.unwrap_or(svg_size.height() as u32);
        
        // Create pixmap
        let mut pixmap = tiny_skia::Pixmap::new(final_width, final_height)
            .ok_or("Failed to create pixmap")?;
        
        // Calculate transform to fit SVG into the target size
        let scale_x = final_width as f32 / svg_size.width();
        let scale_y = final_height as f32 / svg_size.height();
        let transform = tiny_skia::Transform::from_scale(scale_x, scale_y);
        
        // Render SVG to pixmap
        resvg::render(&tree, transform, &mut pixmap.as_mut());
        
        // Get PNG data
        let png_data = pixmap.encode_png()?;
        
        if return_base64 {
            // Return base64 data
            let base64_data = general_purpose::STANDARD.encode(&png_data);
            Ok(ConversionResult {
                file_path: None,
                base64_data: Some(base64_data),
                mime_type: "image/png".to_string(),
            })
        } else {
            // Create temporary file with .png suffix
            let mut temp_file = NamedTempFile::with_suffix(".png")?;
            temp_file.write_all(&png_data)?;
            let file_path = temp_file.path().to_string_lossy().to_string();
            
            // Keep temp file alive by forgetting it
            std::mem::forget(temp_file);
            
            Ok(ConversionResult {
                file_path: Some(file_path),
                base64_data: None,
                mime_type: "image/png".to_string(),
            })
        }
    }

    pub fn convert_svg_to_jpeg(&self, svg_content: &str, width: Option<u32>, height: Option<u32>, quality: u8, return_base64: bool) -> Result<ConversionResult, Box<dyn std::error::Error>> {
        // Parse SVG with proper options
        let opt = usvg::Options::default();
        let tree = usvg::Tree::from_str(svg_content, &opt, &usvg::fontdb::Database::new())?;
        
        // Get SVG size or use provided dimensions
        let svg_size = tree.size();
        let final_width = width.unwrap_or(svg_size.width() as u32);
        let final_height = height.unwrap_or(svg_size.height() as u32);
        
        // Create pixmap
        let mut pixmap = tiny_skia::Pixmap::new(final_width, final_height)
            .ok_or("Failed to create pixmap")?;
        
        // Calculate transform to fit SVG into the target size
        let scale_x = final_width as f32 / svg_size.width();
        let scale_y = final_height as f32 / svg_size.height();
        let transform = tiny_skia::Transform::from_scale(scale_x, scale_y);
        
        // Render SVG to pixmap
        resvg::render(&tree, transform, &mut pixmap.as_mut());
        
        // Convert to image crate format
        let image_buffer = image::RgbaImage::from_raw(final_width, final_height, pixmap.data().to_vec())
            .ok_or("Failed to create image buffer")?;
        
        // Convert RGBA to RGB for JPEG
        let rgb_image = image::DynamicImage::ImageRgba8(image_buffer).to_rgb8();
        
        // Encode as JPEG with quality
        let mut jpeg_data = Vec::new();
        {
            let mut cursor = std::io::Cursor::new(&mut jpeg_data);
            let encoder = image::codecs::jpeg::JpegEncoder::new_with_quality(&mut cursor, quality);
            encoder.write_image(
                rgb_image.as_raw(),
                final_width,
                final_height,
                image::ColorType::Rgb8.into(),
            )?;
        }
        
        if return_base64 {
            // Return base64 data
            let base64_data = general_purpose::STANDARD.encode(&jpeg_data);
            Ok(ConversionResult {
                file_path: None,
                base64_data: Some(base64_data),
                mime_type: "image/jpeg".to_string(),
            })
        } else {
            // Create temporary file with .jpg suffix
            let mut temp_file = NamedTempFile::with_suffix(".jpg")?;
            temp_file.write_all(&jpeg_data)?;
            let file_path = temp_file.path().to_string_lossy().to_string();
            
            // Keep temp file alive by forgetting it
            std::mem::forget(temp_file);
            
            Ok(ConversionResult {
                file_path: Some(file_path),
                base64_data: None,
                mime_type: "image/jpeg".to_string(),
            })
        }
    }
}

impl ServerHandler for SvgConverter {
    fn get_info(&self) -> ServerInfo {
        ServerInfo {
            capabilities: ServerCapabilities::builder()
                .enable_tools()
                .build(),
            instructions: Some("This server provides SVG to image conversion tools. You can convert SVG text content to PNG or JPEG images.".to_string()),
            ..Default::default()
        }
    }

    async fn call_tool(
        &self,
        request: rmcp::model::CallToolRequestParam,
        _context: rmcp::service::RequestContext<rmcp::RoleServer>,
    ) -> Result<rmcp::model::CallToolResult, McpError> {
        match request.name.as_ref() {
            "svg_to_png" => {
                let args = request.arguments.as_ref()
                    .ok_or_else(|| McpError::new(ErrorCode::INVALID_PARAMS, "Missing arguments".to_string(), None))?;
                
                let svg_content = args.get("svg_content")
                    .and_then(|v| v.as_str())
                    .ok_or_else(|| McpError::new(ErrorCode::INVALID_PARAMS, "Missing svg_content".to_string(), None))?;
                
                let width = args.get("width").and_then(|v| v.as_u64()).map(|v| v as u32);
                let height = args.get("height").and_then(|v| v.as_u64()).map(|v| v as u32);
                let return_base64 = args.get("return_base64").and_then(|v| v.as_bool()).unwrap_or(false);
                
                let result = self.convert_svg_to_png(svg_content, width, height, return_base64)
                    .map_err(|e| McpError::new(ErrorCode::INTERNAL_ERROR, format!("PNG conversion failed: {}", e), None))?;
                
                Ok(rmcp::model::CallToolResult {
                    content: vec![rmcp::model::Content::text(json!(result).to_string())],
                    is_error: Some(false),
                })
            }
            "svg_to_jpeg" => {
                let args = request.arguments.as_ref()
                    .ok_or_else(|| McpError::new(ErrorCode::INVALID_PARAMS, "Missing arguments".to_string(), None))?;
                
                let svg_content = args.get("svg_content")
                    .and_then(|v| v.as_str())
                    .ok_or_else(|| McpError::new(ErrorCode::INVALID_PARAMS, "Missing svg_content".to_string(), None))?;
                
                let width = args.get("width").and_then(|v| v.as_u64()).map(|v| v as u32);
                let height = args.get("height").and_then(|v| v.as_u64()).map(|v| v as u32);
                let quality = args.get("quality").and_then(|v| v.as_u64()).map(|v| v as u8).unwrap_or(85);
                let return_base64 = args.get("return_base64").and_then(|v| v.as_bool()).unwrap_or(false);
                
                let result = self.convert_svg_to_jpeg(svg_content, width, height, quality, return_base64)
                    .map_err(|e| McpError::new(ErrorCode::INTERNAL_ERROR, format!("JPEG conversion failed: {}", e), None))?;
                
                Ok(rmcp::model::CallToolResult {
                    content: vec![rmcp::model::Content::text(json!(result).to_string())],
                    is_error: Some(false),
                })
            }
            _ => Err(McpError::new(
                ErrorCode::METHOD_NOT_FOUND,
                format!("Unknown tool: {}", request.name),
                None,
            ))
        }
    }

    async fn list_tools(
        &self,
        _request: Option<rmcp::model::PaginatedRequestParam>,
        _context: rmcp::service::RequestContext<rmcp::RoleServer>,
    ) -> Result<rmcp::model::ListToolsResult, McpError> {
        use schemars::schema::RootSchema;
        
        fn schema_to_json_object(schema: RootSchema) -> rmcp::model::JsonObject {
            let json_value = serde_json::to_value(schema).unwrap();
            json_value.as_object().unwrap().clone()
        }
        
        Ok(rmcp::model::ListToolsResult {
            tools: vec![
                rmcp::model::Tool {
                    name: "svg_to_png".into(),
                    description: Some("Convert SVG text to PNG image".into()),
                    input_schema: std::sync::Arc::new(schema_to_json_object(schemars::schema_for!(SvgToPngRequest))),
                    annotations: None,
                },
                rmcp::model::Tool {
                    name: "svg_to_jpeg".into(),
                    description: Some("Convert SVG text to JPEG image".into()),
                    input_schema: std::sync::Arc::new(schema_to_json_object(schemars::schema_for!(SvgToJpegRequest))),
                    annotations: None,
                },
            ],
            next_cursor: None,
        })
    }
}
