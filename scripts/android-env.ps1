# Charge ANDROID_HOME + JAVA_HOME pour Expo / adb / émulateur (Windows).
$ErrorActionPreference = "Stop"

$sdk = Join-Path $env:LOCALAPPDATA "Android\Sdk"
if (-not (Test-Path $sdk)) {
  Write-Error "Android SDK introuvable: $sdk. Installe Android Studio (Standard + Virtual Device)."
}

$env:ANDROID_HOME = $sdk
$env:ANDROID_SDK_ROOT = $sdk

# JDK 17+ requis par sdkmanager / emulator récents
$jdkCandidates = @(
  (Join-Path $env:LOCALAPPDATA "FlipOn-JDK\jdk-17.0.14+7"),
  (Join-Path ${env:ProgramFiles} "Microsoft\jdk-17*"),
  (Join-Path ${env:ProgramFiles} "Android\Android Studio\jbr")
)
foreach ($pattern in $jdkCandidates) {
  $match = Get-Item $pattern -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($match -and (Test-Path (Join-Path $match.FullName "bin\java.exe"))) {
    $env:JAVA_HOME = $match.FullName
    $env:Path = "$(Join-Path $env:JAVA_HOME 'bin');$env:Path"
    break
  }
}

$paths = @(
  (Join-Path $sdk "platform-tools"),
  (Join-Path $sdk "emulator"),
  (Join-Path $sdk "cmdline-tools\latest\bin")
)
foreach ($p in $paths) {
  if ((Test-Path $p) -and ($env:Path -notlike "*$p*")) {
    $env:Path = "$p;$env:Path"
  }
}

Write-Host "ANDROID_HOME=$env:ANDROID_HOME"
if ($env:JAVA_HOME) { Write-Host "JAVA_HOME=$env:JAVA_HOME" }
