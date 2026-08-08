# Edinburgh Trip App – Datenbasis

Datenbestand für eine spätere HTML-App zur Edinburgh-Reise 2027.

## Inhalt

- `data/edinburgh_master_v1_1.json` – kompletter POI-Masterdatensatz inkl. Emergency-&-Help-Bereich
- `data/emergency_contacts.json` – kompakter Datensatz nur für den Notfall-Screen
- `config/private.example.json` – Vorlage für persönliche Reisedaten
- `docs/EMERGENCY_SCREEN.md` – UI-Spezifikation des Notfallbuttons
- `docs/GITHUB.md` – Upload und GitHub-Pages-Anleitung

## Datenschutz

**Keine persönlichen Daten in ein öffentliches Repository committen.**
`config/private.json`, Buchungsunterlagen, Passdaten, Versicherungsnummern oder medizinische Informationen
werden durch `.gitignore` ausgeschlossen.

Öffentliche Kontaktinformationen wie NHS, Polizei, DFDS-Terminals oder die öffentliche Telefonnummer
der Unterkunft können im Repository liegen.

## Datenqualität

Öffnungszeiten und Kontaktdaten sind ein Snapshot vom 08.08.2026 und müssen kurz vor der Reise 2027
nochmals geprüft werden. Crowd-Werte im POI-Datensatz sind Planungsprognosen, keine Live-Daten.
