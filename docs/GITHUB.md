# Auf GitHub stellen

## Variante A – einfach im Browser

1. Auf GitHub `New repository` wählen.
2. Name z. B. `edinburgh-trip-app`.
3. Für die reine Datenbasis am besten zunächst **Private** wählen.
4. Repository erstellen.
5. Den Inhalt dieses Ordners hochladen.
6. Commit-Nachricht z. B. `Initial Edinburgh data set`.

## Variante B – mit Git

Im Projektordner:

```bash
git init
git add .
git commit -m "Initial Edinburgh trip data"
git branch -M main
git remote add origin https://github.com/DEIN-NAME/edinburgh-trip-app.git
git push -u origin main
```

Das Ziel-Repository auf GitHub vorher leer erstellen, wenn du diese Variante benutzt.

## Variante C – GitHub CLI

```bash
git init
git add .
git commit -m "Initial Edinburgh trip data"
gh repo create edinburgh-trip-app --private --source=. --remote=origin --push
```

## Später: HTML-App über GitHub Pages

Wenn `index.html`, CSS und JavaScript hinzukommen:

1. Repository -> `Settings`
2. `Pages`
3. Unter `Build and deployment`: `Deploy from a branch`
4. Branch `main`
5. Ordner `/ (root)` auswählen
6. Speichern

Bei einem öffentlichen Repository mit GitHub Free kann GitHub Pages die statische HTML/CSS/JS-App direkt ausliefern.

## WICHTIG: private Daten

Nicht committen:
- Buchungsnummern
- Versicherungsnummern
- Reisepassdaten
- persönliche medizinische Angaben
- private Telefonnummern

Dafür `config/private.json` verwenden. Diese Datei steht bereits in `.gitignore`.

Für eine öffentlich erreichbare GitHub-Pages-App sollten persönliche Daten entweder gar nicht eingebaut
oder ausschließlich lokal auf dem Endgerät gespeichert werden.
