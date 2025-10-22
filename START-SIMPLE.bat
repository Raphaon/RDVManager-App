@echo off
echo ========================================
echo    DEMARRAGE APPLICATION RDV MANAGER
echo ========================================
echo.
echo Nettoyage du cache...
if exist .expo rmdir /s /q .expo
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo.
echo Installation des dependances...
call npm install --legacy-peer-deps

echo.
echo ========================================
echo    DEMARRAGE EN MODE TUNNEL
echo ========================================
echo.
echo INSTRUCTIONS:
echo 1. Attendez que le QR code s'affiche
echo 2. Ouvrez Expo Go sur votre telephone
echo 3. Scannez le QR code
echo 4. Attendez 30-60 secondes
echo.
echo Demarrage...
echo.

call npx expo start --tunnel --clear

pause
