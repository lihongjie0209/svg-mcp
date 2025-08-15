use svg_mcp::SvgConverter;
use std::fs;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // 读取测试SVG文件
    let svg_content = fs::read_to_string("test_svg.svg")?;
    
    // 创建转换器
    let converter = SvgConverter::new();
    
    // 测试PNG转换 (使用SVG原始尺寸)
    println!("Testing PNG conversion (SVG original size)...");
    let png_result = converter.convert_svg_to_png(&svg_content, None, None, false)?;
    println!("PNG conversion successful!");
    if let Some(file_path) = &png_result.file_path {
        println!("File path: {}", file_path);
    }
    if let Some(base64_data) = &png_result.base64_data {
        println!("Base64 data length: {} bytes", base64_data.len());
    }
    println!("MIME type: {}", png_result.mime_type);
    
    // 测试PNG转换 (自定义尺寸)
    println!("\nTesting PNG conversion (custom size 400x400)...");
    let png_custom_result = converter.convert_svg_to_png(&svg_content, Some(400), Some(400), false)?;
    println!("PNG custom size conversion successful!");
    if let Some(file_path) = &png_custom_result.file_path {
        println!("File path: {}", file_path);
    }
    println!("MIME type: {}", png_custom_result.mime_type);
    
    // 测试PNG转换 (base64)
    println!("\nTesting PNG conversion (base64)...");
    let png_base64_result = converter.convert_svg_to_png(&svg_content, None, None, true)?;
    println!("PNG base64 conversion successful!");
    if let Some(file_path) = &png_base64_result.file_path {
        println!("File path: {}", file_path);
    }
    if let Some(base64_data) = &png_base64_result.base64_data {
        println!("Base64 data length: {} bytes", base64_data.len());
    }
    println!("MIME type: {}", png_base64_result.mime_type);
    
    // 测试JPEG转换 (使用SVG原始尺寸)
    println!("\nTesting JPEG conversion (SVG original size)...");
    let jpeg_result = converter.convert_svg_to_jpeg(&svg_content, None, None, 90, false)?;
    println!("JPEG conversion successful!");
    if let Some(file_path) = &jpeg_result.file_path {
        println!("File path: {}", file_path);
    }
    if let Some(base64_data) = &jpeg_result.base64_data {
        println!("Base64 data length: {} bytes", base64_data.len());
    }
    println!("MIME type: {}", jpeg_result.mime_type);
    
    // 测试JPEG转换 (自定义尺寸 + base64)
    println!("\nTesting JPEG conversion (custom size 600x600, base64)...");
    let jpeg_base64_result = converter.convert_svg_to_jpeg(&svg_content, Some(600), Some(600), 90, true)?;
    println!("JPEG base64 conversion successful!");
    if let Some(file_path) = &jpeg_base64_result.file_path {
        println!("File path: {}", file_path);
    }
    if let Some(base64_data) = &jpeg_base64_result.base64_data {
        println!("Base64 data length: {} bytes", base64_data.len());
    }
    println!("MIME type: {}", jpeg_base64_result.mime_type);
    
    println!("\nAll tests passed! The SVG converter is working correctly.");
    
    Ok(())
}
