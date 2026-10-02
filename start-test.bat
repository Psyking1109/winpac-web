@echo off
rem Keep this window open no matter what happens, so any message can be read.
if /i not "%~1"=="run" (
  cmd /k ""%~f0" run"
  exit /b
)
title WINPAC website - test launch
cd /d "%~dp0"
echo.
echo  WINPAC website - test launch
echo  Folder: %CD%
echo.

if not exist "package.json" goto notunzipped
if not exist "server\index.js" goto notunzipped

where node >nul 2>nul
if errorlevel 1 goto nonode

node -e "process.exit(+process.versions.node.split('.')[0] >= 22 ? 0 : 1)"
if errorlevel 1 goto oldnode
for /f "delims=" %%v in ('node -v') do echo  Node.js %%v found.

if exist "node_modules\express" goto installed
echo.
echo  Installing the website's parts. This happens only the first time
echo  and needs internet. Please wait a minute...
echo.
call npm install --omit=dev --no-audit --no-fund
if errorlevel 1 goto installfailed
:installed

call node server\setup.js
if errorlevel 1 goto setupfailed

echo.
echo  Starting the website...
start "WINPAC website server - keep this window open" cmd /k node server\index.js
timeout /t 4 /nobreak >nul
start "" http://localhost:8080

echo.
echo  ================================================================
echo   The site is open in your browser at http://localhost:8080
echo.
echo   Getting a free public link now. In 10-20 seconds look below
echo   for a line like:  https://something-random.trycloudflare.com
echo   Share that link to let anyone test the site.
echo.
echo   Keep BOTH windows open. Close them to take the site offline.
echo  ================================================================
echo.
call npx --yes cloudflared tunnel --url http://localhost:8080
echo.
echo  The public link has stopped. The site still works on this computer
echo  at http://localhost:8080 while the other window is open.
goto end

:notunzipped
echo  This file must be run from the UNZIPPED folder.
echo.
echo  1. Close this window.
echo  2. Right-click winpac-web.zip and choose "Extract All...", then "Extract".
echo  3. Open the extracted winpac-web folder and double-click start-test.bat there.
goto end

:nonode
echo  Node.js is not installed, or Windows can't find it yet.
echo.
echo  1. Download the LTS version from https://nodejs.org and install it
echo     with the default options.
echo  2. Restart the computer, then double-click start-test.bat again.
goto end

:oldnode
echo  Your Node.js is too old. Install the LTS version from https://nodejs.org
echo  then double-click start-test.bat again.
goto end

:installfailed
echo.
echo  Installing failed. Check the internet connection and try again.
echo  If it keeps failing, send a screenshot of this window.
goto end

:setupfailed
echo.
echo  Setup did not finish. Double-click start-test.bat to try again.
goto end

:end
echo.
