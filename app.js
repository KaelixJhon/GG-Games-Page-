const hasSupabase = window.GG_CONFIG &&
  !window.GG_CONFIG.SUPABASE_URL.includes("PEGA_AQUI") &&
  !window.GG_CONFIG.SUPABASE_ANON_KEY.includes("PEGA_AQUI");

const demoAddons = [
  {id:"demo1", name:"Fire Sword V1.1", description:"Una espada de fuego para Minecraft Bedrock.", category:"new", image_url:"assets/placeholder.svg", file_url:"#"},
  {id:"demo2", name:"Elder Dragon", description:"Un dragón para añadir más peligro a tu mundo.", category:"new", image_url:"assets/placeholder.svg", file_url:"#"},
  {id:"demo3", name:"Dungeon Pack", description:"Un pequeño pack de mazmorras para explorar.", category:"featured", image_url:"assets/placeholder.svg", file_url:"#"},
  {id:"demo4", name:"Lucky Blocks", description:"Bloques sorpresa para partidas caóticas.", category:"featured", image_url:"assets/placeholder.svg", file_url:"#"}
];

async function loadAddons() {
  if (!hasSupabase) return demoAddons;
  const client = supabase.createClient(GG_CONFIG.SUPABASE_URL, GG_CONFIG.SUPABASE_ANON_KEY);
  const { data, error } = await client.from("addons").select("*").order("created_at", {ascending:false});
  if (error) throw error;
  return data || [];
}

function card(addon) {
  return `<article class="card">
    <img class="card-image" src="${escapeHtml(addon.image_url || 'assets/placeholder.svg')}" alt="">
    <div class="card-body">
      <h3>${escapeHtml(addon.name)}</h3>
      <p>${escapeHtml(addon.description || "Sin descripción.")}</p>
      <a class="download" href="${escapeHtml(addon.file_url || '#')}" ${addon.file_url && addon.file_url !== '#' ? 'download' : ''}>DOWNLOAD</a>
    </div>
  </article>`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

(async () => {
  document.getElementById("year").textContent = new Date().getFullYear();
  try {
    const addons = await loadAddons();
    const fresh = addons.filter(x => x.category === "new");
    const featured = addons.filter(x => x.category === "featured");
    document.getElementById("newGrid").innerHTML = fresh.length ? fresh.map(card).join("") : "<div class='loading'>No hay publicaciones todavía.</div>";
    document.getElementById("featuredGrid").innerHTML = featured.length ? featured.map(card).join("") : "<div class='loading'>No hay publicaciones todavía.</div>";
    document.getElementById("newCount").textContent = `${fresh.length} publicaciones`;
  } catch (e) {
    console.error(e);
    document.getElementById("newGrid").innerHTML = "<div class='loading'>No se pudo cargar el contenido. Revisa la configuración.</div>";
    document.getElementById("featuredGrid").innerHTML = "";
  }
})();
