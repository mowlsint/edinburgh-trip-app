const CATEGORY_META = {
  pub:["🍺","Pubs"], whisky_bar:["🥃","Whisky"], cafe:["☕","Cafés"],
  restaurant:["🍽","Essen"], cemetery:["⚰️","Friedhöfe"], church:["⛪","Kirchen"],
  castle:["🏰","Burgen"], ruin:["🧱","Ruinen"], museum:["🏛","Museen"],
  shop:["🛍","Shops"], park:["🌳","Parks"], nature:["🌲","Natur"],
  viewpoint:["🌄","Aussicht"], tour:["🚶","Touren"], experience:["✨","Erlebnisse"],
  whimsical:["🔮","Whimsical"]
};

const CATEGORY_ORDER = ["whimsical","pub","whisky_bar","restaurant","cafe","shop","museum","cemetery","church","castle","ruin","park","nature","viewpoint","tour","experience"];

const CATEGORY_COLORS = {
  whimsical: "#7E22CE",
  pub: "#B45309",
  whisky_bar: "#6D28D9",
  restaurant: "#B91C1C",
  cafe: "#9A3412",
  shop: "#BE185D",
  museum: "#1D4ED8",
  cemetery: "#475569",
  church: "#0F766E",
  castle: "#92400E",
  ruin: "#6B7280",
  park: "#15803D",
  nature: "#166534",
  viewpoint: "#0369A1",
  tour: "#C2410C",
  experience: "#A21CAF"
};

function categoryColor(cat){
  return CATEGORY_COLORS[cat] || "#334155";
}

function markerCategory(p){
  if(activeCategories.size===1 && activeCategories.has("whimsical") && p.categories?.includes("whimsical")){
    return "whimsical";
  }
  return p.primary_category;
}

function poiMarkerRadius(){
  if(window.matchMedia?.("(max-width: 640px)").matches) return 11;
  if(window.matchMedia?.("(pointer: coarse)").matches) return 10;
  return 8;
}

let master = null;
let emergency = null;
let transit = null;
let pois = [];
let filtered = [];
let activeCategories = new Set();
let activeFilters = new Set();
let referencePoint = null;
let markers = new Map();
let referenceMarker = null;

const map = L.map("map", {
  preferCanvas: true,
  zoomControl: true
}).setView([55.9533,-3.1883], 13);

const baseTiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
  className: "base-map-tiles",
  updateWhenIdle: false,
  updateWhenZooming: false,
  updateInterval: 150,
  keepBuffer: 3,
  referrerPolicy: "strict-origin-when-cross-origin"
}).addTo(map);

const layer = L.layerGroup().addTo(map);

let tileErrorCount = 0;
let mapRetryTimer = null;
let autoRetryUsed = false;

function setMapStatus(text){
  const el = document.getElementById("mapLoadStatus");
  if(el) el.textContent = text;
}

baseTiles.on("loading", () => setMapStatus("Kartenteile werden geladen …"));
baseTiles.on("load", () => {
  tileErrorCount = 0;
  autoRetryUsed = false;
  setMapStatus("Karte vollständig geladen");
});
baseTiles.on("tileerror", () => {
  tileErrorCount += 1;
  if(!autoRetryUsed){
    setMapStatus(`Kartenteil fehlt (${tileErrorCount}) – ein Neuversuch …`);
    autoRetryUsed = true;
    if(!mapRetryTimer){
      mapRetryTimer = setTimeout(() => {
        mapRetryTimer = null;
        map.invalidateSize({pan:false});
        baseTiles.redraw();
      }, 1800);
    }
  } else {
    setMapStatus(`Kartenteile fehlen (${tileErrorCount}) – „Karte neu laden“ antippen`);
  }
});

function refreshMap(){
  tileErrorCount = 0;
  autoRetryUsed = false;
  setMapStatus("Karte wird neu aufgebaut …");
  map.invalidateSize({pan:false});
  baseTiles.redraw();
  setTimeout(() => map.invalidateSize({pan:false}), 250);
}

function crowdLabel(value){
  return ({low:"🟢 ruhig",medium:"🟡 mittel",high:"🟠 belebt",very_high:"🔴 voll"})[value] || "–";
}
function currentCrowd(p){
  const h = new Date().getHours();
  const slot = h < 15 ? "12_15" : h < 18 ? "15_18" : h < 21 ? "18_21" : "21_00";
  return crowdLabel(p.crowd_estimate?.[slot]);
}
function km(a,b){
  if(!a || !b) return null;
  const R=6371, dLat=(b.lat-a.lat)*Math.PI/180, dLon=(b.lon-a.lon)*Math.PI/180;
  const x=Math.sin(dLat/2)**2 + Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(x));
}
function categoryLabel(cat){
  const m=CATEGORY_META[cat] || ["📍",cat];
  return `${m[0]} ${m[1]}`;
}
function safe(v,fallback="–"){ return (v===null || v===undefined || v==="") ? fallback : v; }

async function loadData(){
  const [m,e,t] = await Promise.all([
    fetch("data/edinburgh_master_v1_2.json?v=0.1.5").then(r=>r.json()),
    fetch("data/emergency_contacts.json?v=0.1.5").then(r=>r.json()),
    fetch("data/transit.json?v=0.1.5").then(r=>r.json())
  ]);
  master=m; emergency=e; transit=t; pois=m.pois || [];
  buildCategoryButtons();
  buildEmergency();
  buildTransit();
  applyFilters();
  document.getElementById("statusText").textContent = "Datenstand v1.2 · App v0.1.6";
  setTimeout(() => map.invalidateSize({pan:false}), 80);
  setTimeout(() => map.invalidateSize({pan:false}), 500);
}

function buildCategoryButtons(){
  const host=document.getElementById("categoryButtons");
  const counts={};
  pois.forEach(p=>{
    const cats=p.categories?.length ? p.categories : [p.primary_category];
    cats.forEach(cat=>counts[cat]=(counts[cat]||0)+1);
  });
  Object.keys(counts).sort((a,b)=>{
    const ai=CATEGORY_ORDER.indexOf(a), bi=CATEGORY_ORDER.indexOf(b);
    if(ai!==-1 || bi!==-1){
      if(ai===-1) return 1;
      if(bi===-1) return -1;
      return ai-bi;
    }
    return (CATEGORY_META[a]?.[1]||a).localeCompare(CATEGORY_META[b]?.[1]||b);
  }).forEach(cat=>{
    const b=document.createElement("button");
    b.className="chip category-chip";
    b.dataset.category=cat;
    b.style.setProperty("--category-color", categoryColor(cat));
    b.textContent=`${categoryLabel(cat)} · ${counts[cat]}`;
    b.onclick=()=>{
      activeCategories.has(cat)?activeCategories.delete(cat):activeCategories.add(cat);
      b.classList.toggle("active");
      applyFilters();
    };
    host.appendChild(b);
  });
}

function matchesQuickFilters(p){
  for(const f of activeFilters){
    if(f==="food" && !p.food_available) return false;
    if(f==="whisky" && (p.whisky_score_0_5||0)<3) return false;
    if(f==="quiet" && (p.quiet_score_0_5||0)<4) return false;
    if(f==="rain" && !p.rain_option) return false;
    if(f==="historic" && (p.historic_score_0_5||0)<4) return false;
    if(f==="creepy" && (p.creepy_score_0_5||0)<3) return false;
  }
  return true;
}

function applyFilters(){
  filtered=pois.filter(p=>{
    const cats=p.categories?.length ? p.categories : [p.primary_category];
    if(activeCategories.size && ![...activeCategories].some(cat=>cats.includes(cat))) return false;
    return matchesQuickFilters(p);
  }).map(p=>({...p,_distance:referencePoint?km(referencePoint,{lat:p.lat,lon:p.lon}):null}));

  const sort=document.getElementById("sortSelect").value;
  filtered.sort((a,b)=>{
    if(sort==="distance"){
      if(referencePoint) return (a._distance??9999)-(b._distance??9999);
      return a.name.localeCompare(b.name);
    }
    if(sort==="quiet") return (b.quiet_score_0_5||0)-(a.quiet_score_0_5||0) || a.name.localeCompare(b.name);
    if(sort==="historic") return (b.historic_score_0_5||0)-(a.historic_score_0_5||0) || a.name.localeCompare(b.name);
    if(sort==="whisky") return (b.whisky_score_0_5||0)-(a.whisky_score_0_5||0) || a.name.localeCompare(b.name);
    return a.name.localeCompare(b.name);
  });
  renderList();
  renderMap();
}

function renderList(){
  const host=document.getElementById("poiList");
  const template=document.getElementById("poiTemplate");
  host.innerHTML="";
  document.getElementById("resultCount").textContent=filtered.length;
  filtered.forEach(p=>{
    const node=template.content.cloneNode(true);
    const card=node.querySelector(".poi-card");
    card.id=`poi-${p.id}`;
    card.dataset.poiId=p.id;
    card.style.setProperty("--poi-category-color", categoryColor(p.primary_category));
    const categoryEl=node.querySelector(".poi-category");
    categoryEl.textContent=categoryLabel(p.primary_category);
    categoryEl.style.color=categoryColor(p.primary_category);
    node.querySelector(".poi-name").textContent=p.name;
    node.querySelector(".poi-address").textContent=p.address;
    node.querySelector(".distance-badge").textContent=p._distance==null?"":`${p._distance.toFixed(1)} km`;
    node.querySelector(".poi-hours").textContent=safe(p.hours_snapshot);
    node.querySelector(".poi-price").textContent=safe(p.price_level || p.entry_or_experience_price);
    node.querySelector(".poi-duration").textContent=p.typical_visit_minutes?`${p.typical_visit_minutes} min`:"–";
    node.querySelector(".poi-crowd").textContent=currentCrowd(p);
    node.querySelector(".poi-notes").textContent=safe(p.notes,"");
    const badges=node.querySelector(".badges");
    const values=[];
    if(p.food_available) values.push("🍽 Essen");
    if((p.whisky_score_0_5||0)>=3) values.push(`🥃 ${p.whisky_score_0_5}/5`);
    if((p.quiet_score_0_5||0)>=4) values.push("🤫 ruhig");
    if((p.historic_score_0_5||0)>=4) values.push("🏚 historisch");
    if((p.creepy_score_0_5||0)>=3) values.push("👻 düster");
    if(p.rain_option) values.push("🌧 Regen");
    if((p.whimsical_score_0_5||0)>=3) values.push(`🔮 Whimsical ${p.whimsical_score_0_5}/5`);
    values.slice(0,7).forEach(t=>{ const s=document.createElement("span"); s.className=t.startsWith("🔮")?"badge whimsical-badge":"badge"; s.textContent=t; badges.appendChild(s); });
    node.querySelector(".map-focus").onclick=()=>focusPoi(p);
    const maps=node.querySelector(".maps-link");
    maps.href=`https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lon}#map=17/${p.lat}/${p.lon}`;
    const linksBtn=node.querySelector(".links-open");
    linksBtn.textContent=`🔗 Links · ${(p.links||[]).length}`;
    linksBtn.onclick=()=>openPoiLinks(p);
    host.appendChild(node);
  });
}


function scrollToPoiCard(poiId){
  const card=document.getElementById(`poi-${poiId}`);
  if(!card) return;

  map.closePopup();
  card.scrollIntoView({
    behavior:"smooth",
    block:"center",
    inline:"nearest"
  });

  card.classList.remove("poi-highlight");
  void card.offsetWidth;
  card.classList.add("poi-highlight");
  setTimeout(()=>card.classList.remove("poi-highlight"), 2200);
}

function renderMap(){
  layer.clearLayers();
  markers.clear();
  const bounds=[];
  filtered.forEach(p=>{
    if(typeof p.lat!=="number" || typeof p.lon!=="number") return;
    const markerCat=markerCategory(p);
    const color=categoryColor(markerCat);
    const marker=L.circleMarker([p.lat,p.lon],{
      radius:poiMarkerRadius(),
      weight:3,
      color:"#ffffff",
      opacity:.96,
      fillColor:color,
      fillOpacity:.9,
      bubblingMouseEvents:false
    }).addTo(layer);

    const popupButton=document.createElement("button");
    popupButton.type="button";
    popupButton.className="map-popup-jump";
    popupButton.style.setProperty("--popup-category-color", color);
    popupButton.innerHTML=`
      <span class="map-popup-dot" aria-hidden="true"></span>
      <span class="map-popup-copy">
        <strong>${p.name}</strong>
        <span>${categoryLabel(p.primary_category)}</span>
        <small>In Liste anzeigen ↓</small>
      </span>
    `;
    popupButton.addEventListener("click",()=>scrollToPoiCard(p.id));

    marker.bindPopup(popupButton,{
      closeButton:true,
      className:"poi-map-popup",
      maxWidth:290,
      autoPan:true
    });
    markers.set(p.id,marker);
    bounds.push([p.lat,p.lon]);
  });
  if(referencePoint) bounds.push([referencePoint.lat,referencePoint.lon]);
  if(bounds.length>1 && filtered.length<60) map.fitBounds(bounds,{padding:[24,24],maxZoom:15});
}

function focusPoi(p){
  map.setView([p.lat,p.lon],16);
  const m=markers.get(p.id); if(m)m.openPopup();
  document.getElementById("map").scrollIntoView({behavior:"smooth",block:"center"});
}

function setReference(lat,lon,label){
  referencePoint={lat,lon,label};
  if(referenceMarker) map.removeLayer(referenceMarker);
  referenceMarker=L.circleMarker([lat,lon],{radius:12,weight:4,color:"#ffffff",fillColor:"#E11D48",fillOpacity:.95}).addTo(map)
    .bindPopup(`<strong>Referenzpunkt</strong>${label}`).openPopup();
  document.getElementById("referenceInfo").textContent=`Referenzpunkt: ${label} · ${lat.toFixed(5)}, ${lon.toFixed(5)}`;
  document.getElementById("sortSelect").value="distance";
  map.setView([lat,lon],14);
  applyFilters();
}

async function searchLocation(){
  const q=document.getElementById("locationInput").value.trim();
  if(!q) return;
  const coord=q.match(/^\s*(-?\d+(?:\.\d+)?)\s*[,; ]\s*(-?\d+(?:\.\d+)?)\s*$/);
  if(coord){
    setReference(parseFloat(coord[1]),parseFloat(coord[2]),"eingegebene Koordinate");
    return;
  }
  document.getElementById("statusText").textContent="Adresse wird gesucht …";
  try{
    const url=`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=gb&q=${encodeURIComponent(q+", Edinburgh")}`;
    const res=await fetch(url,{headers:{"Accept-Language":"de,en"}});
    const items=await res.json();
    if(!items.length) throw new Error("Nicht gefunden");
    setReference(parseFloat(items[0].lat),parseFloat(items[0].lon),items[0].display_name);
    document.getElementById("statusText").textContent="Standort gefunden";
  }catch(err){
    document.getElementById("statusText").textContent="Standort nicht gefunden – Koordinate oder genauere Adresse versuchen.";
  }
}

function useGeolocation(){
  if(!navigator.geolocation){
    document.getElementById("statusText").textContent="Standortfunktion wird vom Browser nicht unterstützt."; return;
  }
  document.getElementById("statusText").textContent="Standort wird ermittelt …";
  navigator.geolocation.getCurrentPosition(pos=>{
    setReference(pos.coords.latitude,pos.coords.longitude,"Mein Standort");
    document.getElementById("statusText").textContent="Standort übernommen";
  },()=>{
    document.getElementById("statusText").textContent="Standortfreigabe fehlgeschlagen.";
  },{enableHighAccuracy:true,timeout:10000});
}


const HOTEL = {
  name: "Alpha Guest House",
  address: "19 Old Dalkeith Road, Edinburgh EH16 4TE, United Kingdom"
};

function googleDirectionsUrl(mode, origin=null){
  const params = new URLSearchParams({
    api: "1",
    destination: HOTEL.address,
    travelmode: mode,
    dir_action: "navigate"
  });
  if(origin) params.set("origin", `${origin.lat},${origin.lon}`);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function hotelMapUrl(){
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(HOTEL.address)}`;
}

function routeToHotel(mode="transit"){
  const status = document.getElementById("hotelLocationStatus");
  if(status) status.textContent = "Standort wird ermittelt …";

  const openRoute = (origin=null) => {
    if(status){
      status.textContent = origin
        ? `Start: ${origin.lat.toFixed(5)}, ${origin.lon.toFixed(5)}`
        : "Standort nicht verfügbar – Maps verwendet den Geräte-Standort, falls möglich.";
    }
    window.location.href = googleDirectionsUrl(mode, origin);
  };

  if(!navigator.geolocation){
    openRoute(null);
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos => openRoute({lat:pos.coords.latitude, lon:pos.coords.longitude}),
    () => openRoute(null),
    {enableHighAccuracy:true, timeout:8000, maximumAge:60000}
  );
}

function buildTransit(){
  if(!transit) return;
  document.getElementById("liveBusLink").href = transit.official.live_times_url;
  document.getElementById("journeyPlannerLink").href = transit.official.journey_planner_url;
  document.getElementById("serviceUpdatesLink").href = transit.official.service_updates_url;

  const host = document.getElementById("busServiceList");
  host.innerHTML = "";
  (transit.relevant_services || []).forEach(s => {
    const card = document.createElement("div");
    card.className = "bus-service-card";

    const num = document.createElement("div");
    num.className = "bus-number";
    num.textContent = s.service;

    const text = document.createElement("div");
    text.className = "bus-service-text";
    text.innerHTML = `<strong>${s.route_snapshot}</strong><span>${s.why_relevant}</span>`;

    const link = document.createElement("a");
    link.href = s.timetable_url;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "Fahrplan";

    card.append(num, text, link);
    host.appendChild(card);
  });
}

function buildEmergency(){
  const host=document.getElementById("emergencySections");
  const sections=[
    ["Unterkunft", emergency.accommodation],
    ["Fähre & Terminal", emergency.ferry],
    ["🚕 Taxi", emergency.taxi],
    ["Medizin", emergency.medical_locations],
    ["Transport, Dokumente & weitere Hilfe", emergency.transport_and_documents]
  ];
  sections.forEach(([title,items])=>{
    const sec=document.createElement("section"); sec.className="emergency-section";
    sec.innerHTML=`<h3>${title}</h3>`;
    (items||[]).forEach(x=>{
      const card=document.createElement("div"); card.className="contact-card";
      const meta=[x.address,x.hours_snapshot,x.when_to_use,x.notes].filter(Boolean).join(" · ");
      card.innerHTML=`<h4>${x.name||x.label}</h4><div class="contact-meta">${meta}</div>`;
      const actions=document.createElement("div"); actions.className="contact-actions";
      if(x.phone) actions.innerHTML+=`<a href="tel:${x.phone.replace(/\s/g,"")}">📞 ${x.phone}</a>`;
      if(x.alternate_phone) actions.innerHTML+=`<a href="tel:${x.alternate_phone.replace(/\s/g,"")}">📞 ${x.alternate_phone}</a>`;
      if(x.emergency_phone_out_of_hours) actions.innerHTML+=`<a href="tel:${x.emergency_phone_out_of_hours.replace(/\s/g,"")}">📞 Bereitschaft</a>`;
      if(x.email) actions.innerHTML+=`<a href="mailto:${x.email}">✉️ E-Mail</a>`;
      if(x.sms) actions.innerHTML+=`<a href="sms:${x.sms}">💬 SMS ${x.sms}</a>`;
      if(x.address) actions.innerHTML+=`<a target="_blank" rel="noopener" href="https://www.openstreetmap.org/search?query=${encodeURIComponent(x.address)}">🗺 Karte</a>`;
      card.appendChild(actions); sec.appendChild(card);
    });
    host.appendChild(sec);
  });

  const guidance=document.createElement("section"); guidance.className="emergency-section";
  guidance.innerHTML="<h3>Gesundheitssystem – Kurzentscheidung</h3>";
  const ul=document.createElement("ul"); ul.className="contact-meta";
  (emergency.healthcare_guidance?.summary_de||[]).forEach(t=>{const li=document.createElement("li");li.textContent=t;ul.appendChild(li)});
  guidance.appendChild(ul);host.appendChild(guidance);
}



const LINK_META = {
  homepage:["🌐","Homepage"],
  info:["ℹ️","Info"],
  menu:["🍽","Menü"],
  booking:["📅","Buchen"],
  tickets:["🎟","Tickets"],
  shop:["🛍","Shop"],
  readings:["🔮","Readings"],
  events:["⭐","Events"],
  map:["🗺","Karte"],
  search:["🔎","Websuche"],
  menu_search:["🔎","Menü suchen"],
  tickets_search:["🔎","Tickets suchen"],
  shop_search:["🔎","Shop suchen"]
};

function openPoiLinks(p){
  const modal=document.getElementById("linksDialog");
  const title=document.getElementById("linksDialogTitle");
  const meta=document.getElementById("linksDialogMeta");
  const host=document.getElementById("linksList");
  title.textContent=p.name;
  meta.textContent=[p.address, p.whimsical_type ? `Whimsical: ${p.whimsical_type.replaceAll("_"," ")}` : null]
    .filter(Boolean).join(" · ");
  host.innerHTML="";
  const seen=new Set();
  (p.links||[]).forEach(link=>{
    if(!link?.url || seen.has(link.url)) return;
    seen.add(link.url);
    const a=document.createElement("a");
    a.className=`useful-link${link.verified?" verified":""}`;
    a.href=link.url;
    a.target="_blank";
    a.rel="noopener";
    const m=LINK_META[link.type] || ["🔗",link.label||"Link"];
    a.innerHTML=`<span class="link-icon">${m[0]}</span><span class="link-text"><span>${link.label||m[1]} ${link.verified?"✓":""}</span><small>${link.verified?"direkt geprüft":"gezielte Suche"}</small></span>`;
    host.appendChild(a);
  });
  openModal(modal);
}

function applyTheme(theme){
  const value = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = value;
  localStorage.setItem("edinburgh-theme", value);
  const btn = document.getElementById("themeBtn");
  if(btn){
    btn.textContent = value === "dark" ? "☀️" : "🌙";
    btn.title = value === "dark" ? "Light Mode einschalten" : "Dark Mode einschalten";
    btn.setAttribute("aria-label", btn.title);
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if(meta) meta.setAttribute("content", value === "dark" ? "#080b10" : "#111827");
}

const initialTheme = document.documentElement.dataset.theme || "light";
applyTheme(initialTheme);

document.getElementById("themeBtn")?.addEventListener("click", () => {
  applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
});

document.getElementById("reloadMapBtn")?.addEventListener("click", refreshMap);

let resizeTimer = null;
function scheduleMapResize(){
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => map.invalidateSize({pan:false}), 180);
}
window.addEventListener("resize", scheduleMapResize, {passive:true});
window.addEventListener("resize", ()=>{
  clearTimeout(window.__poiMarkerResizeTimer);
  window.__poiMarkerResizeTimer=setTimeout(()=>{
    markers.forEach(marker=>marker.setRadius?.(poiMarkerRadius()));
  },240);
},{passive:true});
window.addEventListener("orientationchange", () => {
  setTimeout(() => map.invalidateSize({pan:false}), 200);
  setTimeout(() => map.invalidateSize({pan:false}), 700);
});
window.addEventListener("pageshow", () => setTimeout(() => map.invalidateSize({pan:false}), 120));
document.addEventListener("visibilitychange", () => {
  if(document.visibilityState === "visible") setTimeout(() => map.invalidateSize({pan:false}), 120);
});

document.querySelectorAll(".filter-chip").forEach(b=>b.addEventListener("click",()=>{
  const f=b.dataset.filter;
  activeFilters.has(f)?activeFilters.delete(f):activeFilters.add(f);
  b.classList.toggle("active"); applyFilters();
}));
document.getElementById("sortSelect").addEventListener("change",applyFilters);
document.getElementById("searchBtn").addEventListener("click",searchLocation);
document.getElementById("locationInput").addEventListener("keydown",e=>{if(e.key==="Enter")searchLocation()});
document.getElementById("geoBtn").addEventListener("click",useGeolocation);
document.getElementById("clearBtn").addEventListener("click",()=>{
  activeCategories.clear();activeFilters.clear();
  document.querySelectorAll(".chip.active").forEach(x=>x.classList.remove("active"));
  applyFilters();
});

let modalScrollY = 0;

function openModal(modal){
  if(!modal) return;
  modalScrollY = window.scrollY || window.pageYOffset || 0;
  document.body.style.top = `-${modalScrollY}px`;
  document.body.classList.add("modal-open");
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden","false");
  const close = modal.querySelector(".close-btn");
  setTimeout(()=>close?.focus({preventScroll:true}), 30);
}

function closeModal(modal){
  if(!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden","true");
  document.body.classList.remove("modal-open");
  document.body.style.top = "";
  window.scrollTo(0, modalScrollY);
}

function installModalDismiss(modal){
  if(!modal) return;
  modal.addEventListener("pointerup", e=>{
    if(e.target === modal) closeModal(modal);
  });
  modal.addEventListener("touchend", e=>{
    if(e.target === modal) closeModal(modal);
  }, {passive:true});
}

const busDialog = document.getElementById("busDialog");
document.getElementById("busBtn").addEventListener("click",()=>openModal(busDialog));
document.getElementById("closeBusBtn").addEventListener("click",()=>closeModal(busDialog));
document.getElementById("busToHotelBtn").addEventListener("click",()=>routeToHotel("transit"));

const hotelDialog = document.getElementById("hotelDialog");
document.getElementById("floatingHotelBtn").addEventListener("click",()=>openModal(hotelDialog));
document.getElementById("closeHotelBtn").addEventListener("click",()=>closeModal(hotelDialog));
document.querySelectorAll(".hotel-route-btn[data-mode]").forEach(btn=>{
  btn.addEventListener("click",()=>routeToHotel(btn.dataset.mode));
});
document.getElementById("hotelMapBtn").addEventListener("click",()=>{
  window.location.href = hotelMapUrl();
});

const dialog=document.getElementById("emergencyDialog");
["emergencyBtn","floatingEmergencyBtn"].forEach(id=>document.getElementById(id).addEventListener("click",()=>openModal(dialog)));
document.getElementById("closeEmergencyBtn").addEventListener("click",()=>closeModal(dialog));

const linksDialog=document.getElementById("linksDialog");
document.getElementById("closeLinksBtn").addEventListener("click",()=>closeModal(linksDialog));


[busDialog, hotelDialog, dialog, linksDialog].forEach(installModalDismiss);

document.addEventListener("keydown", e=>{
  if(e.key !== "Escape") return;
  const open = [linksDialog, dialog, hotelDialog, busDialog].find(m=>m?.classList.contains("is-open"));
  if(open) closeModal(open);
});

loadData().catch(err=>{
  console.error(err);
  document.getElementById("statusText").textContent="Daten konnten nicht geladen werden. Auf GitHub Pages oder einem lokalen Webserver öffnen.";
});
