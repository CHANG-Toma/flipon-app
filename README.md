# FlipOn Mobile

FlipOn est une application mobile qui aide a choisir rapidement une activite en solo, duo ou groupe.

## Dev Windows — Android (recommandé)

Sur Windows, l’émulateur **Android** fonctionne nativement. Le Simulateur iOS non (Mac only).  
Tu peux aussi brancher un **vrai iPhone** avec Expo Go — ce n’est pas un simulateur, mais du vrai device.

### 1. Une fois — créer l’émulateur

```bash
cd flipon-app
npm run android:setup
```

(télécharge l’image Android 34 + crée `Pixel_7_API_34`, plusieurs minutes)

Ou via Android Studio → **Device Manager** → Create Device (Pixel).

### 2. Lancer l’app

```bash
npm run android
```

Ça démarre l’émulateur si besoin, puis Expo (Expo Go sur l’AVD).

### iPhone depuis Windows ?

Oui, avec un **iPhone physique** + [Expo Go](https://expo.dev/go) :

```bash
npx expo start --tunnel
```

Puis scanne le QR. Pas besoin de Mac pour ça.

## EAS (builds cloud — plus tard)

Profils dans `eas.json`. Le build `ios-simulator` nécessite un Mac pour **installer** le résultat.

```bash
npm run build:android-dev   # APK test
npm run build:ios-sim       # .app sim — Mac only pour lancer
```
