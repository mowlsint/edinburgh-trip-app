# Handoff – Edinburgh Trip Navigator

**Stand:** 08.08.2026  
**App-Baseline:** `v0.1.5`  
**Masterdaten:** `v1.2`  
**Geplanter Reisezeitraum:** Februar bis Anfang April 2027  
**Reiseform:** 2 Personen · Donnerstag–Montag · Auto bis IJmuiden · DFDS IJmuiden–Newcastle · danach Zug/ÖPNV · 2 Nächte Edinburgh  
**Unterkunftsoption:** Alpha Guest House, 19 Old Dalkeith Road, Edinburgh EH16 4TE

---

## 1. Ziel des Projekts

Eine mobile, statische HTML-Reise-App für Edinburgh, die unterwegs schneller und nützlicher ist als ein klassischer Reiseführer.

Die App soll gleichzeitig:

- **Kartenansicht und Listenansicht** anbieten.
- POIs über **Kategorie-Schaltflächen** filtern.
- nach Eingabe einer **Straße, Ecke, Adresse oder Koordinate** nach Entfernung sortieren.
- den **aktuellen Gerätestandort** verwenden können.
- Reiseoptionen nach Stimmung und Situation auffindbar machen, z. B.:
  - Whisky
  - mit Essen
  - eher ruhig
  - Regenoption
  - historisch
  - leicht düster / creepy
  - whimsical / witchy / quirky
- einen jederzeit erreichbaren **SOS-/Notfallbereich** besitzen.
- einen festen **🏠 Hotel-Button** zur Rücknavigation zum Alpha Guest House besitzen.
- einen **🚌 Mobilitätsbereich** für Edinburghs Busverkehr besitzen.
- **Dark Mode** unterstützen.
- auf Android und iOS gut bedienbar sein.

Die App läuft ohne Backend als statische Site und ist für **GitHub Pages** vorgesehen.

---

## 2. Aktueller Funktionsstand

### Navigation und POIs

Bereits umgesetzt:

- Leaflet + OpenStreetMap.
- Karte und POI-Liste gleichzeitig.
- Mobile Responsive Layout.
- Standortsuche per:
  - Adresse / Straße / Ecke,
  - Koordinate,
  - Browser-Geolocation.
- Sortierung nach:
  - Entfernung,
  - Name,
  - Ruhefaktor,
  - Historie,
  - Whisky.
- Schnellfilter:
  - Essen,
  - Whisky,
  - ruhig,
  - Regen,
  - historisch,
  - leicht düster.
- Kategorie-Buttons.
- POI-Detailkarten mit:
  - Adresse,
  - Öffnungs-Snapshot,
  - Preis,
  - Besuchsdauer,
  - Crowd-Prognose,
  - Tags / Eigenschaften.
- Kartenfokus und externe Navigation.

### Whimsical Layer

Seit `v0.1.5` existiert **🔮 Whimsical als zusätzliche Kategorie**.

Ein POI kann mehreren Kategorien angehören, z. B.:

- `shop + whimsical`
- `pub + whimsical`
- `museum + whimsical`
- `cemetery + whimsical`

Aktueller Bestand:

- **118 POIs insgesamt**
- **34 Whimsical-Einträge**

Whimsical beinhaltet u. a.:

- Black Moon Botanica – Candlemaker Row
- Black Moon Botanica – Thistle Street
- The Wyrd Shop
- Portal Leith
- Wheel of Fate
- Mr Wood’s Fossils
- Museum of Magic, Fortune-telling & Witchcraft
- Museum Context
- The Witchery
- The Voodoo Rooms
- Panda & Sons
- Dragonfly
- Maison de Moggy
- The Marshmallow Lady
- Witches’ Well
- Canongate Kirkyard
- Dean Village
- Victoria Street
- Edinburgh Dungeon
- Fabhatrix
- Typewronger Books

Zusätzliche Inspirationsquelle:
`https://everyoneshouldliveabroad.com/witchy-edinburgh/`

Einzelne Orte wurden danach soweit möglich nochmals gegen Betreiber-/offizielle Seiten geprüft.

---

## 3. Nützliche Links pro Attraktion

Jeder POI besitzt inzwischen ein `links`-Array.

Unterstützte Linktypen sind u. a.:

- Homepage
- Info
- Menü
- Tickets
- Booking
- Shop
- Readings
- Events
- Karte
- gezielte Websuche

UI:

- Jede POI-Karte besitzt **🔗 Links**.
- Im Popup bedeutet:
  - `✓` = direkt geprüfter Link
  - `🔎` = gezielte Suchverknüpfung, weil noch keine direkte URL verifiziert wurde.

### Noch offen

Viele neu recherchierte Whimsical-Orte haben bereits direkte Links.

Beim älteren POI-Bestand existieren teilweise noch Such-Fallbacks.  
Vor dem Finish sollen **möglichst alle 118 POIs echte direkte Links** zu Homepage, Menü, Tickets, Booking oder offizieller Infoseite erhalten.

---

## 4. Mobilität

### Bus

Die App enthält `data/transit.json`.

Absichtlich **keine gescrapten Live-Abfahrten**.

Stattdessen direkte Verknüpfung zu Lothian Buses:

- Live Times
- Journey Planner
- Service Updates
- relevante Linien / Fahrpläne

Grund: Für eine statische GitHub-Pages-App sind die offiziellen dynamischen Lothian-Daten robuster und aktueller als eine eigene fragile Kopie.

**Wichtig vor Reise 2027:** Buslinien, Nachtbusse und Fahrplanlinks neu verifizieren.

### Rückkehr zum Hotel

Permanenter **🏠 Hotel-Button**.

Ziel:

**Alpha Guest House**  
19 Old Dalkeith Road  
Edinburgh EH16 4TE

Optionen:

- Bus / ÖPNV
- zu Fuß
- Taxi
- Hotel auf Karte

Der aktuelle Smartphone-Standort wird erst beim Start einer Route abgefragt.

---

## 5. Emergency / SOS

Permanenter **SOS-Button**.

Der Bereich enthält u. a.:

- 999 / 112 – echter Notruf
- NHS 24 – 111
- Police Scotland – 101
- Royal Infirmary of Edinburgh / A&E
- Minor Injuries
- GP
- Apotheke
- Zahnnotdienst
- British Transport Police
- Deutsches Generalkonsulat
- DFDS
- Fähren-Terminals
- Alpha Guest House
- Karten-/Zahlungsmittel-Sperrhilfe
- Taxi

Taxi aktuell:

- Central Taxis Edinburgh
- Central Cars

### Datenschutz

**Nie in ein öffentliches Repository committen:**

- Passdaten
- Versicherungsnummer
- medizinische Daten
- private Notfallkontakte
- Hotel-/DFDS-Buchungsreferenzen

Dafür bleibt später eine lokale/private Konfiguration vorgesehen.

---

## 6. iOS / Android

### Android

Bisher gute Darstellung und Bedienung.

### iOS

Native `<dialog>`-Elemente wurden in `v0.1.4` entfernt, weil Schließen und Scrollen unter Safari problematisch waren.

Aktuell verwendet die App eigene Modal-Overlays mit:

- mindestens 44px großen Close-Zielen
- sticky Modal-Header
- Hintergrund-Tap zum Schließen
- `-webkit-overflow-scrolling: touch`
- Safe-Area-Support
- Scroll-Lock und Wiederherstellung der vorherigen Seitenposition

**Bei jedem späteren Release auf iOS UND Android testen.**

---

## 7. Karten-Technik

Leaflet 1.9.4 + OpenStreetMap.

Bereits behobene Probleme:

- falscher Leaflet-CSS-SRI-Hash
- Kartenlayout nach Rotation / Resize / Tab-Wechsel
- teilweise fehlende Tiles
- mobile Overflow-Probleme
- unnötige Marker-Bildrequests

Aktuelle Maßnahmen:

- `map.invalidateSize()`
- kontrollierter Tile-Retry
- manueller `↻ Karte neu laden`-Button
- CircleMarker statt Marker-Icons
- Dark-Mode-Kartenfilter
- Tile-Puffer

### Wichtig

Die öffentlichen OSM-Tile-Server sind **Best Effort**.  
Für den privaten Reisegebrauch ist das zunächst okay.

Falls die App später breiter genutzt werden soll:
- geeigneten Tile-Anbieter wählen oder
- eigene/vertraglich erlaubte Kartenlösung verwenden.

---

## 8. Dark Mode

Umgesetzt:

- 🌙 / ☀️ Umschalter
- Systempräferenz beim ersten Start
- Einstellung in `localStorage`
- Dark UI
- dunkle Darstellung der OSM-Basiskarte
- Notfall-/Mobilitätsdialoge ebenfalls angepasst

---

## 9. Datenmodell – wichtige Felder

POIs enthalten u. a.:

```text
id
name
primary_category
categories[]
address
postcode
lat
lon
geocode_status

hours_snapshot
hours_verified_on
hours_recheck_for_2027

price_level
entry_or_experience_price
food_available
whisky_score_0_5
typical_visit_minutes

indoor
outdoor
rain_option

historic_score_0_5
creepy_score_0_5
quiet_score_0_5
tourist_score_0_5
landscape_score_0_5
feb_mar_fit_0_5

crowd_estimate
crowd_confidence
event_spike

whimsical_type
whimsical_score_0_5
local_made_score_0_5
quirky_score_0_5
dark_score_0_5

tags[]
notes
links[]
```

### Crowd-Daten

`crowd_estimate` ist **keine Live-Auslastung** und keine erfundene Google-Popular-Times-Kopie.

Es ist nur eine Reiseplanungsprognose:

- low
- medium
- high
- very_high

Zusätzliche `event_spike`-Hinweise berücksichtigen z. B. Rugby- oder Fußballtage.

---

## 10. Datenqualität / Geodaten

Der Datensatz enthält aktuell 118 POIs.

Bei einem Teil des ursprünglichen Datenbestands beruhen Koordinaten noch auf Postcode-Zentroiden oder repräsentativen Punkten.

### Vor dem Finish

**Alle POIs mit exakten Standortkoordinaten versehen.**

Zielstatus:

```text
geocode_status = exact
```

Besonders wichtig für:

- Entfernungssortierung
- POIs nahe beieinander
- Navigation
- Kartenmarker in engen Altstadtgassen

---

## 11. Größte offene technische Aufgabe: Öffnungszeiten

Aktuell sind viele Zeiten noch als lesbarer Snapshot gespeichert:

```text
hours_snapshot
```

Das reicht zur Anzeige, aber nicht für zuverlässige Logik.

### Nächster Datenmodell-Schritt

Maschinenlesbare Öffnungszeiten ergänzen, z. B.:

```json
"opening_hours": {
  "mon": [["12:00", "23:00"]],
  "tue": [["12:00", "23:00"]],
  "wed": [["12:00", "23:00"]],
  "thu": [["12:00", "23:00"]],
  "fri": [["12:00", "01:00"]],
  "sat": [["12:00", "01:00"]],
  "sun": [["12:00", "23:00"]]
}
```

Zusätzlich bei Gastro:

```text
kitchen_hours
last_food_order
```

Danach implementieren:

- **Jetzt geöffnet**
- **Küche jetzt offen**
- **öffnet in ≤ 60 Minuten**
- **heute Abend offen**
- **noch mindestens X Minuten geöffnet**

---

## 12. Reisebezogene Aktualisierung vor dem Finish

### DFDS

Noch einmal aktuell recherchieren:

- IJmuiden → Newcastle
- Newcastle → IJmuiden
- exakte Februar–April-2027-Fahrpläne
- Check-in-Zeiten
- Shuttle Newcastle Terminal ↔ Central Station
- Preise
- Kabinen
- Parken IJmuiden
- Buchungs-/Stornoinformationen

### Bahn

Neu prüfen:

- Newcastle Central ↔ Edinburgh Waverley
- reale Advance-Preise
- passende Züge zur tatsächlichen Fähre
- Sicherheitspuffer
- mögliche Streckenarbeiten

### Unterkunft

Alpha Guest House prüfen:

- Verfügbarkeit
- Twin Room
- endgültiger Preis
- Frühstück
- Check-in
- Gepäck
- Telefonnummer / E-Mail
- Busanbindung

### Edinburgh

Für jeden wichtigen POI:

- Öffnungszeiten 2027
- Eintritt
- Bookingpflicht
- Menü
- Schließungen
- saisonale Zeiten
- neue Anschrift
- ggf. dauerhafte Schließung

### Events

Unbedingt gegen das konkrete Wochenende prüfen:

- Six Nations / Murrayfield
- Hearts-Heimspiele
- andere große Sportevents
- Festivals
- besondere Veranstaltungen
- Schulferien / Feiertage

Diese Ereignisse beeinflussen:

- Hotels
- Pub-Auslastung
- Verkehr
- Buslinien
- Zugpreise
- Attraktionsandrang

---

## 13. Safety-spezifische Dinge

### Cramond Island

Die App darf Cramond Island **nie einfach als normal „offen“** behandeln.

Benötigt:

- Tide-Abhängigkeit
- klaren Warnhinweis
- nur sichere Querungsfenster
- vor Reise aktuelle Tide-Quelle prüfen

### Medizin / Emergency

Notfallkontakte kurz vor Reise vollständig aktualisieren.

Notrufnummern nie hinter mehreren UI-Ebenen verstecken.

Keine automatischen Anrufe:
Der Nutzer muss bewusst auf den Telefon-Button tippen.

---

## 14. Empfohlene Finish-Roadmap

### Phase A – Datenrefresh

1. alle 118 POIs auf Existenz prüfen
2. Öffnungszeiten aktualisieren
3. Preise aktualisieren
4. direkte Links vervollständigen
5. exakte Koordinaten setzen
6. geschlossene / umgezogene Orte entfernen oder aktualisieren
7. Fahrpläne / Taxi / Emergency neu prüfen

### Phase B – Logik

1. maschinenlesbare Öffnungszeiten
2. `Jetzt geöffnet`
3. Küchenzeiten
4. zeitabhängige Crowd-Anzeige
5. Radiusfilter, z. B.:
   - 500 m
   - 1 km
   - 2 km
6. geschätzte Gehzeit aus Entfernung
7. bessere Kombifilter

### Phase C – Reiseplanung

Optional sehr sinnvoll:

- ❤️ Favoriten
- „Heute vielleicht“
- „Unbedingt“
- eigene Notizen
- gespeicherte Tagespläne
- Freitag / Samstag / Sonntag
- spontane Alternativen bei Regen
- „Was machen wir jetzt?“

### Phase D – Offline / PWA

Für die Reise sehr wertvoll:

- Web-App installierbar machen
- Manifest
- Service Worker
- HTML/CSS/JS/JSON offline cachen
- Emergency-Daten offline verfügbar
- Favoriten lokal speichern

Karten-Tiles vollständig offline zu cachen erfordert eine gesonderte, lizenzkonforme Lösung.

### Phase E – Abnahme

Testmatrix:

- iPhone Safari
- iPhone als installierte PWA
- Android Chrome
- Android als installierte PWA
- WLAN
- Mobilfunk
- langsame Verbindung
- Dark Mode
- Light Mode
- Standort erlaubt
- Standort verweigert
- Flugmodus / Offline-Fallback

---

## 15. „Nicht kaputtmachen“-Regeln

1. **Keine API-Keys oder privaten Daten in GitHub.**
2. Keine scheinbar präzisen Live-Crowd-Zahlen erfinden.
3. Zeitkritische Daten vor 2027 neu recherchieren.
4. Medizin-/Notfallinformationen bevorzugt aus offiziellen Quellen.
5. Öffnungszeiten und Tickets bevorzugt aus Betreiber-/offiziellen Quellen.
6. Wenn eine direkte URL unsicher ist, lieber Suchfallback als erfundener Link.
7. iOS-Safari bei UI-Änderungen immer mittesten.
8. SOS und Hotel-Rückkehr müssen jederzeit mit wenigen Taps erreichbar bleiben.
9. Karte und Liste bleiben **gleichwertige Ansichten**.
10. Whimsical bleibt eine zusätzliche Kategorie, kein Ersatz für Shop/Pub/Museum usw.

---

## 16. Repository-Baseline

Die folgende Dateikombination bildet den bekannten Stand `v0.1.5`:

- `index.html` — SHA-256 kurz: `3fe85f71d48dee43`
- `styles.css` — SHA-256 kurz: `345282097cdc5320`
- `app.js` — SHA-256 kurz: `b22d8baeceaac877`
- `data/edinburgh_master_v1_2.json` — SHA-256 kurz: `f766f0aeb38ff353`
- `data/emergency_contacts.json` — SHA-256 kurz: `7ddc0acf9b5b4311`
- `data/transit.json` — SHA-256 kurz: `4d8003eb294e0607`
- `WHIMSICAL_RESEARCH.md` — SHA-256 kurz: `00ce108eb674f03e`

Empfohlene Repo-Struktur:

```text
/
├── index.html
├── styles.css
├── app.js
├── README.md
├── HANDOFF.md
├── WHIMSICAL_RESEARCH.md
└── data/
    ├── edinburgh_master_v1_2.json
    ├── emergency_contacts.json
    └── transit.json
```

Die alte `edinburgh_master_v1_1.json` kann als Archiv im Repo bleiben, wird von `v0.1.5` nicht mehr geladen.

---

## 17. Definition of Done vor der Reise

Die App gilt als „reisebereit“, wenn:

- [ ] tatsächlicher Reisetermin steht
- [ ] DFDS gebucht und Fahrzeiten in App / Reiseinfo aktuell
- [ ] Unterkunft gebucht
- [ ] Bahnverbindungen geplant
- [ ] alle wichtigen POIs für 2027 aktualisiert
- [ ] direkte Links größtenteils verifiziert
- [ ] maschinenlesbare Öffnungszeiten funktionieren
- [ ] „Jetzt geöffnet“ funktioniert
- [ ] Taxi-/Emergency-Kontakte aktuell
- [ ] Hotel-Rückroute funktioniert
- [ ] Buslinks / Nachtbus aktuell
- [ ] Cramond-Tide-Hinweis funktioniert
- [ ] iOS-Test bestanden
- [ ] Android-Test bestanden
- [ ] Dark/Light Mode bestanden
- [ ] Offline-Emergency funktioniert
- [ ] GitHub Pages produktiv
- [ ] öffentliche Repo-Inhalte auf private Daten geprüft

---

# Wiederaufnahme-Prompt für einen zukünftigen Chat

Den folgenden Text zusammen mit `HANDOFF.md` und möglichst der aktuellen ZIP-/Repo-Version hochladen:

> Wir setzen das Projekt **Edinburgh Trip Navigator** fort. Lies zuerst die beigefügte `HANDOFF.md` und die aktuellen Projektdateien vollständig. Die bekannte Baseline ist App `v0.1.5` mit Masterdaten `v1.2` vom 08.08.2026. Prüfe zunächst, ob der Repository-Stand noch dieser Baseline entspricht oder inzwischen weiterentwickelt wurde.  
>
> Ziel ist das Finish für unsere Edinburgh-Reise Februar bis Anfang April 2027: zwei Personen, DFDS IJmuiden–Newcastle, danach Bahn/ÖPNV, Unterkunftsoption Alpha Guest House. Die App soll Karte und Liste, Kategorien, Standortsortierung, Dark Mode, SOS, Hotel-Rückkehr, Businformationen und die zusätzliche Kategorie Whimsical unterstützen.  
>
> Beginne **nicht** mit einem Rewrite. Bewahre die bestehende Architektur, sofern kein konkreter technischer Grund dagegen spricht. Arbeite zuerst die Finish-Roadmap in `HANDOFF.md` ab: aktuelle 2027-Daten recherchieren, POI-Links und exakte Koordinaten vervollständigen, Öffnungszeiten maschinenlesbar machen, „Jetzt geöffnet“ implementieren und anschließend PWA/Offline-Funktionen ergänzen.  
>
> Nutze bei zeitkritischen Informationen aktuelle Webquellen und bevorzuge offizielle Betreiber-/Behördenquellen. Keine privaten Reise-, Pass-, Versicherungs- oder Buchungsdaten in öffentliche GitHub-Dateien schreiben.

---

## Kurzfassung für uns selbst

**Erst Daten frisch machen. Dann Logik. Dann Offline/PWA. Dann Reise-Endtest.**

Nicht neu erfinden – **v0.1.5 weiterentwickeln.**
