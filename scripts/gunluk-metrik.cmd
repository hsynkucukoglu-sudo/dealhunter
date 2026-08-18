@echo off
REM Gunluk metrik toplayici — Windows Gorev Zamanlayici bunu cagirir.
REM Ayri .cmd olmasinin sebebi: repo yolunda bosluk ve Turkce karakter var,
REM schtasks'a dogrudan verildiginde tirnaklama bozuluyor.
setlocal
cd /d "%~dp0.."
node scripts\gunluk-metrik.mjs >> "%TEMP%\dealhunter-gunluk.log" 2>&1
exit /b %ERRORLEVEL%
