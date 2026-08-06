# Installe une image système + crée un AVD Pixel_7 (nécessite cmdline-tools).
$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)
. "$PSScriptRoot\android-env.ps1"

$sdkmanager = Join-Path $env:ANDROID_HOME "cmdline-tools\latest\bin\sdkmanager.bat"
$avdmanager = Join-Path $env:ANDROID_HOME "cmdline-tools\latest\bin\avdmanager.bat"
$emulator = Join-Path $env:ANDROID_HOME "emulator\emulator.exe"

if (-not (Test-Path $sdkmanager)) {
  Write-Error "sdkmanager introuvable. Relance le setup ou installe Android Studio (cmdline-tools)."
}

Write-Host "Acceptation licences + téléchargement image (peut prendre plusieurs minutes)..."
$packages = @(
  "platform-tools",
  "emulator",
  "platforms;android-34",
  "system-images;android-34;google_apis;x86_64"
)

# yes to licenses
cmd /c "echo y| `"$sdkmanager`" --licenses" | Out-Null
& $sdkmanager --install $packages

$avdName = "Pixel_7_API_34"
$existing = & $emulator -list-avds 2>$null
if ($existing -contains $avdName) {
  Write-Host "AVD déjà présent: $avdName"
} else {
  Write-Host "Création AVD $avdName..."
  # non-interactive create
  cmd /c "echo no| `"$avdmanager`" create avd -n $avdName -k `"system-images;android-34;google_apis;x86_64`" -d pixel_7 --force"
}

Write-Host ""
Write-Host "OK. Lance: npm run android"
& $emulator -list-avds
