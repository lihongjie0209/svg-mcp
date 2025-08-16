# 测试npm包发布成功的脚本

Write-Host "🧪 Testing NPM Package Deployment..." -ForegroundColor Green

# 检查平台特定包
$platforms = @(
    "@svg-mcp/win32-x64",
    "@svg-mcp/linux-x64", 
    "@svg-mcp/darwin-x64",
    "@svg-mcp/darwin-arm64"
)

Write-Host "`n📦 Checking platform packages..." -ForegroundColor Yellow
foreach ($package in $platforms) {
    Write-Host "Checking $package..." -NoNewline
    try {
        $result = npm view $package version 2>$null
        if ($result) {
            Write-Host " ✅ v$result" -ForegroundColor Green
        } else {
            Write-Host " ❌ Not found" -ForegroundColor Red
        }
    } catch {
        Write-Host " ❌ Error: $_" -ForegroundColor Red
    }
}

# 检查主包
Write-Host "`n📦 Checking main package..." -ForegroundColor Yellow
Write-Host "Checking svg-mcp..." -NoNewline
try {
    $result = npm view svg-mcp version 2>$null
    if ($result) {
        Write-Host " ✅ v$result" -ForegroundColor Green
    } else {
        Write-Host " ❌ Not found" -ForegroundColor Red
    }
} catch {
    Write-Host " ❌ Error: $_" -ForegroundColor Red
}

# 测试安装
Write-Host "`n🔽 Testing installation..." -ForegroundColor Yellow
Write-Host "Testing npx svg-mcp..." -NoNewline
try {
    # 创建临时目录进行测试
    $tempDir = New-TemporaryFile | ForEach-Object { Remove-Item $_; New-Item -ItemType Directory -Path $_ }
    Push-Location $tempDir
    
    # 测试npx安装
    $output = npx svg-mcp --help 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✅ Installation works" -ForegroundColor Green
    } else {
        Write-Host " ❌ Installation failed" -ForegroundColor Red
        Write-Host "Output: $output" -ForegroundColor Gray
    }
    
    Pop-Location
    Remove-Item -Recurse -Force $tempDir
} catch {
    Write-Host " ❌ Error: $_" -ForegroundColor Red
}

Write-Host "`n🎉 Test completed!" -ForegroundColor Green
