# Démarre Metro + ouvre Android (émulateur ou device USB).
$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)
. "$PSScriptRoot\android-env.ps1"

$adb = Join-Path $env:ANDROID_HOME "platform-tools\adb.exe"
$emulator = Join-Path $env:ANDROID_HOME "emulator\emulator.exe"

$devices = & $adb devices 2>$null | Select-String "\tdevice$"
if (-not $devices) {
  $avds = & $emulator -list-avds 2>$null
  if (-not $avds) {
    Write-Host @"

Aucun émulateur trouvé.
1. Ouvre Android Studio → Device Manager → Create Device (Pixel 6 / API 34+)
2. Ou lance: npm run android:setup
Puis relance: npm run android

"@
    exit 1
  }
  $name = ($avds | Select-Object -First 1).ToString().Trim()
  Write-Host "Démarrage émulateur: $name"
  Start-Process -FilePath $emulator -ArgumentList @("-avd", $name) -WindowStyle Normal
  Write-Host "Attente du device..."
  & $adb wait-for-device
  $ready = $false
  for ($i = 0; $i -lt 60; $i++) {
    $boot = & $adb shell getprop sys.boot_completed 2>$null
    if ($boot -match "1") { $ready = $true; break }
    Start-Sleep -Seconds 2
  }
  if (-not $ready) {
    Write-Warning "L'émulateur démarre encore — Expo va quand même se lancer."
  }
}

npx expo start --android
