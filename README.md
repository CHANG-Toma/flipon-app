# FlipOn Mobile

FlipOn aide a choisir rapidement une activite en solo, duo ou groupe.

## Dev — Expo Go

1. Installe [Expo Go](https://expo.dev/go) sur ton telephone (iPhone ou Android)
2. Lance l’API si besoin (`cd flipon && npm run db:up && npm run dev`)
3. Dans l’app :

```bash
cd flipon-app
cp .env.example .env   # renseigner Clerk + URLs
npx expo start
# si le QR ne charge pas (Wi‑Fi different) :
npx expo start --tunnel
```

4. Scanne le QR avec Expo Go

### URLs API dans `.env`

- Prod / simple : `EXPO_PUBLIC_API_URL=https://flipon.vercel.app`
- API locale (meme Wi‑Fi) : `EXPO_PUBLIC_API_URL=http://IP_DU_PC:3000`
