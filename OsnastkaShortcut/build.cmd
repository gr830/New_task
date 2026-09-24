@echo off
chcp 65001 >nul
cd /d "%~dp0"

set "CSC="

if exist "%WINDIR%\Microsoft.NET\Framework64\v4.0.30319\csc.exe" (
    set "CSC=%WINDIR%\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
)

if not defined CSC (
    if exist "%WINDIR%\Microsoft.NET\Framework\v4.0.30319\csc.exe" (
        set "CSC=%WINDIR%\Microsoft.NET\Framework\v4.0.30319\csc.exe"
    )
)

if not defined CSC (
    echo Не найден csc.exe.
    echo Обычно он находится в составе .NET Framework 4.x.
    pause
    exit /b 1
)

set "ICONFLAG="
if exist "app.ico" set "ICONFLAG=/win32icon:app.ico"

if exist "osnastka.exe" del "osnastka.exe"

"%CSC%" /nologo /codepage:65001 /optimize+ /target:winexe /out:osnastka.exe %ICONFLAG% /r:System.dll /r:System.Core.dll /r:System.Windows.Forms.dll /r:System.Drawing.dll OsnastkaShortcut.cs

if exist "osnastka.exe" (
    echo.
    echo Готово: osnastka.exe
    echo.
) else (
    echo.
    echo Ошибка сборки.
    echo.
)

pause