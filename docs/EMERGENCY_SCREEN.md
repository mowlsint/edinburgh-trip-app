# Emergency Screen – UI-Spezifikation

## Grundprinzip

Der Notfallbereich muss von jeder Ansicht mit **einem Klick** erreichbar sein.

### Oberer Bereich – große Sofortbuttons

1. **ROT: 999 / 112 – NOTRUF**
   - `tel:999`
   - Untertext: Ambulanz · Polizei · Feuerwehr · Küstenwache

2. **BLAU: NHS 24 – 111**
   - `tel:111`
   - Untertext: dringend, aber nicht lebensbedrohlich

3. **POLIZEI – 101**
   - `tel:101`
   - Untertext: nicht-akute Polizeifälle

## Karten darunter

- Unterkunft
- DFDS / beide Terminals
- Krankenhaus A&E
- Minor Injuries Unit
- GP-Praxis
- Apotheke
- Zahnnotdienst
- British Transport Police
- Deutsches Generalkonsulat
- Karten-/Zahlungsmittel-Sperre
- persönliche Reiseversicherung (nur lokal/private config)

Jede Karte kann je nach vorhandenen Daten Buttons anzeigen:
`Anrufen`, `E-Mail`, `SMS`, `Auf Karte`, `Adresse kopieren`.

## Gesundheitsentscheidung

Kurze Entscheidungshilfe:

- Lebensbedrohlich / schwere Verletzung -> **999**
- Dringend, aber nicht lebensbedrohlich -> **111**
- Kleinere Beschwerden -> **Apotheke**
- Werktags normale medizinische Behandlung -> **GP anrufen**
- Kleine Verletzung -> **111 vor Minor Injuries Unit**
- Zahnnotfall -> **Chalmers; außerhalb der Zeiten 111**

## Offline

Die Notfalldaten müssen mit der App ausgeliefert werden und ohne Internet lesbar sein.
Telefonlinks (`tel:`) funktionieren unabhängig von Kartendaten, sofern Mobilfunk verfügbar ist.

## Datenschutz

Persönliche Versicherungs-, Buchungs- oder Gesundheitsdaten niemals in `data/*.json` eines öffentlichen
Repositories speichern. Für die spätere App: lokale Speicherung im Browser/Endgerät oder privater Build.
