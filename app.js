const hasSupabase = window.GG_CONFIG &&
  !window.GG_CONFIG.SUPABASE_URL.includes("PEGA_AQUI") &&
  !window.GG_CONFIG.SUPABASE_ANON_KEY.includes("PEGA_AQUI");

const client = hasSupabase ? supabase.createClient(GG_CONFIG.SUPABASE_URL, GG_CONFIG.SUPABASE_ANON_KEY) : null;

const demoAddons = [
  {id:"demo1", name:"Fire Sword V1.1", description:"Una espada de fuego para Minecraft Bedrock.", category:"new", image_url:"placeholder.svg", file_url:"#"},
  {id:"demo2", name:"Elder Dragon", description:"Un dragón para añadir más peligro a tu mundo.", category:"new", image_url:"placeholder.svg", file_url:"#"},
  {id:"demo3", name:"Dungeon Pack", description:"Un pequeño pack de mazmorras para explorar.", category:"featured", image_url:"placeholder.svg", file_url:"#"},
  {id:"demo4", name:"Lucky Blocks", description:"Bloques sorpresa para partidas caóticas.", category:"featured", image_url:"placeholder.svg", file_url:"#"}
];

const I18N = {
  es: {
    navNew:"NOVEDADES", navFeatured:"DESTACADOS", navAbout:"ACERCA DE",
    heroTitle:"NOVEDADES", heroText:"Add-ons, mapas y creaciones de GG Games.",
    newTitle:"NOVEDADES", featuredTitle:"ADD-ONS DESTACADOS",
    aboutTitle:"Hecho para Bedrock.", aboutText:"Un pequeño portal para publicar nuestros add-ons, mapas y archivos descargables.",
    adminBtn:"PANEL ADMIN", settingsTitle:"AJUSTES", lang:"Idioma", fontSize:"Tamaño de letra",
    discord:"Únete a nuestro Discord", download:"DESCARGAR", noDesc:"Sin descripción.",
    loading:"CARGANDO...", empty:"No hay publicaciones todavía.", error:"No se pudo cargar el contenido.",
    count:n=>`${n} publicaciones`
  },
  en: {
    navNew:"NEW CONTENT", navFeatured:"FEATURED", navAbout:"ABOUT",
    heroTitle:"NEW CONTENT", heroText:"Add-ons, maps and creations from GG Games.",
    newTitle:"NEW CONTENT", featuredTitle:"FEATURED ADD-ONS",
    aboutTitle:"Made for Bedrock.", aboutText:"A small portal to publish our add-ons, maps and downloadable files.",
    adminBtn:"ADMIN PANEL", settingsTitle:"SETTINGS", lang:"Language", fontSize:"Font size",
    discord:"Join our Discord", download:"DOWNLOAD", noDesc:"No description.",
    loading:"LOADING...", empty:"Nothing published yet.", error:"Could not load the content.",
    count:n=>`${n} posts`
  }
};

function store(key, value) { try { if (value === undefined) return localStorage.getItem(key); localStorage.setItem(key, value); } catch (e) {} return null; }
let lang = store("gg_lang") === "en" ? "en" : "es";
let size = ["sm","md","lg"].includes(store("gg_size")) ? store("gg_size") : "md";
const t = k => I18N[lang][k];
let allAddons = null, loadFailed = false;

async function loadAddons() {
  if (!hasSupabase) return demoAddons;
  const { data, error } = await client.from("addons").select("*").order("created_at", {ascending:false});
  if (error) throw error;
  return data || [];
}

async function loadDiscord() {
  let url = window.GG_CONFIG && window.GG_CONFIG.DISCORD_URL || "";
  if (hasSupabase) {
    const { data } = await client.from("site_settings").select("value").eq("key","discord_url").maybeSingle();
    if (data) url = data.value || "";
  }
  const link = document.getElementById("discordLink");
  if (/^https?:\/\//i.test(url)) { link.href = url; link.classList.remove("hidden"); }
  else link.classList.add("hidden");
}

function card(addon) {
  return `<article class="card">
    <img class="card-image" src="${escapeHtml(addon.image_url || 'placeholder.svg')}" alt="">
    <div class="card-body">
      <h3>${escapeHtml(addon.name)}</h3>
      <p>${escapeHtml(addon.description || t("noDesc"))}</p>
      <a class="download" href="${escapeHtml(addon.file_url || '#')}" ${addon.file_url && addon.file_url !== '#' ? 'download' : ''}>${t("download")}</a>
    </div>
  </article>`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

function renderAddons() {
  const newGrid = document.getElementById("newGrid"), featGrid = document.getElementById("featuredGrid");
  if (loadFailed) { newGrid.innerHTML = `<div class='loading'>${t("error")}</div>`; featGrid.innerHTML = ""; return; }
  if (!allAddons) { newGrid.innerHTML = featGrid.innerHTML = `<div class='loading'>${t("loading")}</div>`; return; }
  const fresh = allAddons.filter(x => x.category === "new");
  const featured = allAddons.filter(x => x.category === "featured");
  const empty = `<div class='loading'>${t("empty")}</div>`;
  newGrid.innerHTML = fresh.length ? fresh.map(card).join("") : empty;
  featGrid.innerHTML = featured.length ? featured.map(card).join("") : empty;
  document.getElementById("newCount").textContent = t("count")(fresh.length);
}

function applySettings() {
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.getElementById("langSelect").value = lang;
  document.body.classList.remove("fs-sm","fs-md","fs-lg");
  document.body.classList.add("fs-" + size);
  document.querySelectorAll(".size-btn").forEach(b => b.classList.toggle("active", b.dataset.size === size));
  renderAddons();
}

document.getElementById("settingsBtn").onclick = e => { e.stopPropagation(); document.getElementById("settingsPanel").classList.toggle("hidden"); };
document.addEventListener("click", e => {
  const p = document.getElementById("settingsPanel");
  if (!p.contains(e.target)) p.classList.add("hidden");
});
document.getElementById("langSelect").onchange = e => { lang = e.target.value; store("gg_lang", lang); applySettings(); };
document.querySelectorAll(".size-btn").forEach(b => b.onclick = () => { size = b.dataset.size; store("gg_size", size); applySettings(); });

(async () => {
  document.getElementById("year").textContent = new Date().getFullYear();
  applySettings();
  loadDiscord().catch(console.error);
  try { allAddons = await loadAddons(); }
  catch (e) { console.error(e); loadFailed = true; }
  renderAddons();
})();
