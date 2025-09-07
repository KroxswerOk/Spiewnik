
Śpiewnik Harcerski — PWA
=======================

Pliki:
- index.html — główny plik (bez buildu, działa natychmiast)
- styles.css — proste style
- app.js — logika: lista, wyszukiwanie, render ChordPro, transpozycja, import/eksport
- manifest.json — manifest PWA
- sw.js — service worker (cache offline)
- data/songs.json — przykładowe piosenki (public domain demo)
- icons/* — ikony aplikacji

Instrukcja deploy (GitHub Pages, Netlify, Vercel) — darmowo:
1. Utwórz repo na GitHub i wrzuć zawartość katalogu (możesz przeciągnąć pliki).
2. W ustawieniach repo → Pages → wybierz branch `main` i folder `/` → zapisz. Po chwili strona będzie dostępna pod `https://<twojanazwa>.github.io/<repo>`.
3. Otwórz link na iPhonie Safari → Udostępnij → 'Dodaj do ekranu początkowego'.

Uwagi prawne:
- Dodawaj tylko utwory, do których masz prawa, lub które są w domenie publicznej.
- Możesz importować/eksportować JSON, ale publikując publicznie repo, nie dodawaj tam materiałów chronionych.

Chcesz:
- żebym przygotował już gotowe repo i wypchnął ZIP do pobrania?
- czy wolisz, żebym dodał funkcje: autoscroll, playlisty, eksport PDF?
