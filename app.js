const CATEGORY_META = {
  pub:["🍺","Pubs"], whisky_bar:["🥃","Whisky"], cafe:["☕","Cafés"],
  restaurant:["🍽","Essen"], cemetery:["⚰️","Friedhöfe"], church:["⛪","Kirchen"],
  castle:["🏰","Burgen"], ruin:["🧱","Ruinen"], museum:["🏛","Museen"],
  shop:["🛍","Shops"], park:["🌳","Parks"], nature:["🌲","Natur"],
  viewpoint:["🌄","Aussicht"], tour:["🚶","Touren"], experience:["✨","Erlebnisse"]
};

let master = null;
let emergency = null;
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
  const [m,e] = await Promise.all([
    fetch("data/edinburgh_master_v1_1.json").then(r=>r.json()),
    fetch("data/emergency_contacts.json").then(r=>r.json())
  ]);
  master=m; emergency=e; pois=m.pois || [];
  buildCategoryButtons();
  buildEmergency();
  applyFilters();
  document.getElementById("statusText").textContent = "Datenstand v1.1 · App v0.1.2";
  setTimeout(() => map.invalidateSize({pan:false}), 80);
  setTimeout(() => map.invalidateSize({pan:false}), 500);
}

function buildCategoryButtons(){
  const host=document.getElementById("categoryButtons");
  const counts={};
  pois.forEach(p=>counts[p.primary_category]=(counts[p.primary_category]||0)+1);
  Object.keys(counts).sort((a,b)=>(CATEGORY_META[a]?.[1]||a).localeCompare(CATEGORY_META[b]?.[1]||b)).forEach(cat=>{
    const b=document.createElement("button");
    b.className="chip category-chip";
    b.dataset.category=cat;
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
    if(activeCategories.size && !activeCategories.has(p.primary_category)) return false;
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
    node.querySelector(".poi-category").textContent=categoryLabel(p.primary_category);
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
    values.slice(0,6).forEach(t=>{ const s=document.createElement("span"); s.className="badge"; s.textContent=t; badges.appendChild(s); });
    node.querySelector(".map-focus").onclick=()=>focusPoi(p);
    const maps=node.querySelector(".maps-link");
    maps.href=`https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lon}#map=17/${p.lat}/${p.lon}`;
    const src=node.querySelector(".source-link");
    if(p.source_url){src.href=p.source_url}else{src.remove()}
    host.appendChild(node);
  });
}

function renderMap(){
  layer.clearLayers();
  markers.clear();
  const bounds=[];
  filtered.forEach(p=>{
    if(typeof p.lat!=="number" || typeof p.lon!=="number") return;
    const marker=L.circleMarker([p.lat,p.lon],{
      radius:5, weight:2, opacity:.9, fillOpacity:.72
    }).addTo(layer)
      .bindPopup(`<strong>${p.name}</strong>${categoryLabel(p.primary_category)}<br>${p.address}`);
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
  referenceMarker=L.circleMarker([lat,lon],{radius:8,weight:3,fillOpacity:.8}).addTo(map)
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

function buildEmergency(){
  const host=document.getElementById("emergencySections");
  const sections=[
    ["Unterkunft", emergency.accommodation],
    ["Fähre & Terminal", emergency.ferry],
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
const dialog=document.getElementById("emergencyDialog");
["emergencyBtn","floatingEmergencyBtn"].forEach(id=>document.getElementById(id).addEventListener("click",()=>dialog.showModal()));
document.getElementById("closeEmergencyBtn").addEventListener("click",()=>dialog.close());

loadData().catch(err=>{
  console.error(err);
  document.getElementById("statusText").textContent="Daten konnten nicht geladen werden. Auf GitHub Pages oder einem lokalen Webserver öffnen.";
});
