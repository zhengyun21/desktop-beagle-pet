@echo off
chcp 65001 >nul
title 桌面宠物 - 安装和启动
color 0E

echo.
echo ========================================================
echo                   桌面宠物 - 一键启动
echo ========================================================
echo.

cd /d "%~dp0"

:CHECK_NODE
echo [1/5] 检查 Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [错误] 未检测到 Node.js！
    echo.
    echo 请先安装 Node.js：
    echo   1. 访问 https://nodejs.org/
    echo   2. 下载并安装 LTS 版本（推荐）
    echo.
    pause
    exit /b 1
)
echo [成功] Node.js 已安装
node -v
npm -v
echo.

:CHECK_MODULES
echo [2/5] 检查依赖包...
if not exist "node_modules" (
    echo [提示] 首次运行，正在安装依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [错误] 依赖安装失败！
        echo.
        pause
        exit /b 1
    )
) else (
    echo [成功] 依赖已安装
)
echo.

:CREATE_ASSETS
echo [3/5] 创建图标素材...
if not exist "assets\tray-icon.png" (
    node assets\create-icons.js
) else (
    echo [成功] 图标素材已存在
)
echo.

:CHECK_PACKAGE
echo [4/5] 检查 package.json...
if not exist "package.json" (
    echo [错误] package.json 不存在！
    pause
    exit /b 1
)
echo [成功] 项目文件完整
echo.

:START_APP
echo [5/5] 启动桌面宠物...
echo.
echo ========================================================
echo.
echo 提示：
echo   - 拖拽移动宠物
echo   - 点击宠物播放声音
echo   - 双击宠物打开设置
echo   - 右键托盘图标可退出
echo.
echo ========================================================
echo.
call npm start

if %errorlevel% neq 0 (
    echo.
    echo [错误] 程序异常退出！
    pause
)
