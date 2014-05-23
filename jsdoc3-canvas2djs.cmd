@echo off
title GENERAR JSDOC CANVAS2DJS
C:

set jsdocdir=%ROBER%\_EXTRAS\SDK\jsdoc 3
set sourcesDir=%ROBER%\canvas2djs\Canvas2DJS\
set outputDir=%ROBER%\stormcolor-gae\war\CONTENT\Canvas2DJS-1.0-API-Doc


cd /D %jsdocdir%
echo GENERANDO DOCUMENTACION
jsdoc -t templates/docstrap-master/template -c confCanvas2DJS.json -d %outputDir% %sourcesDir%Canvas2DJS.class.js %sourcesDir%Canvas2DNode.class.js %sourcesDir%Canvas2DUtils.class.js

ren %outputDir%\index.html index.jsp

echo.
echo.
echo DOCUMENTACION GENERADA
pause

chrome.exe %outputDir%\Canvas2DJS.html

