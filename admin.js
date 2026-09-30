const ready = window.GG_CONFIG &&
  !window.GG_CONFIG.SUPABASE_URL.includes("PEGA_AQUI") &&
  !window.GG_CONFIG.SUPABASE_ANON_KEY.includes("PEGA_AQUI");

let client = null;
if (ready) client = supabase.createClient(GG_CONFIG.SUPABASE_URL, GG_CONFIG.SUPABASE_ANON_KEY);

const loginBox = document.getElementById("loginBox");
const dashboard = document.getElementById("dashboard");
const loginMsg = document.getElementById("loginMsg");
const formMsg = document.getElementById("formMsg");

function msg(el, text, ok=false) {
  el.textContent = text;
  el.style.color = ok ? "#6edb65" : "#ffd83d";
}

async function init() {
  if (!ready) {
    msg(loginMsg, "Primero configura config.js con Supabase.");
    document.getElementById("loginBtn").disabled = true;
    return;
  }
  const {data:{session}} = await client.auth.getSession();
  if (session) showDashboard();
  client.auth.onAuthStateChange((_event, session) => session ? showDashboard() : showLogin());
}

function showLogin() {
  loginBox.classList.remove("hidden");
  dashboard.classList.add("hidden");
}
async function showDashboard() {
  loginBox.classList.add("hidden");
  dashboard.classList.remove("hidden");
  await loadAdminList();
}

document.getElementById("loginBtn").onclick = async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  if (!email || !password) return msg(loginMsg, "Completa correo y contraseña.");
  const {error} = await client.auth.signInWithPassword({email,password});
  if (error) msg(loginMsg, error.message);
};

document.getElementById("logoutBtn").onclick = () => client.auth.signOut();

async function uploadFile(file, folder) {
  const ext = file.name.split(".").pop().toLowerCase();
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const {error} = await client.storage.from(GG_CONFIG.STORAGE_BUCKET).upload(path, file, {upsert:false});
  if (error) throw error;
  const {data} = client.storage.from(GG_CONFIG.STORAGE_BUCKET).getPublicUrl(path);
  return {path, url:data.publicUrl};
}

document.getElementById("addonForm").onsubmit = async (e) => {
  e.preventDefault();
  if (!client) return;
  const id = document.getElementById("addonId").value;
  const name = document.getElementById("name").value.trim();
  const description = document.getElementById("description").value.trim();
  const category = document.getElementById("category").value;
  const image = document.getElementById("imageFile").files[0];
  const file = document.getElementById("downloadFile").files[0];

  try {
    msg(formMsg, "Subiendo...");
    let image_url = null, file_url = null, image_path = null, file_path = null;

    if (!id && (!image || !file)) throw new Error("Para una publicación nueva necesitas imagen y archivo.");

    if (image) {
      const result = await uploadFile(image, "images");
      image_url = result.url; image_path = result.path;
    }
    if (file) {
      const result = await uploadFile(file, "files");
      file_url = result.url; file_path = result.path;
    }

    const payload = {name, description, category};
    if (image_url) { payload.image_url = image_url; payload.image_path = image_path; }
    if (file_url) { payload.file_url = file_url; payload.file_path = file_path; }

    let result;
    if (id) result = await client.from("addons").update(payload).eq("id", id);
    else result = await client.from("addons").insert(payload);
    if (result.error) throw result.error;

    msg(formMsg, "¡Publicado correctamente!", true);
    resetForm();
    await loadAdminList();
  } catch (err) {
    console.error(err);
    msg(formMsg, err.message || "Ocurrió un error.");
  }
};

async function loadAdminList() {
  const box = document.getElementById("adminList");
  box.innerHTML = "Cargando...";
  const {data, error} = await client.from("addons").select("*").order("created_at",{ascending:false});
  if (error) return box.textContent = error.message;
  box.innerHTML = data.length ? data.map(a => `
    <div class="admin-item">
      <img src="${escapeHtml(a.image_url || 'assets/placeholder.svg')}" alt="">
      <div><strong>${escapeHtml(a.name)}</strong><br><small>${escapeHtml(a.category)}</small></div>
      <div class="item-actions">
        <button class="gray-btn" onclick="editAddon('${a.id}')">EDITAR</button>
        <button class="danger" onclick="deleteAddon('${a.id}')">BORRAR</button>
      </div>
    </div>`).join("") : "<p>No tienes publicaciones todavía.</p>";
}

window.editAddon = async (id) => {
  const {data, error} = await client.from("addons").select("*").eq("id",id).single();
  if (error) return msg(formMsg,error.message);
  document.getElementById("addonId").value = data.id;
  document.getElementById("name").value = data.name;
  document.getElementById("description").value = data.description || "";
  document.getElementById("category").value = data.category;
  document.getElementById("formTitle").textContent = "EDITAR ADD-ON";
  document.getElementById("cancelEdit").classList.remove("hidden");
  window.scrollTo({top:0,behavior:"smooth"});
};

window.deleteAddon = async (id) => {
  if (!confirm("¿Borrar esta publicación?")) return;
  const {error} = await client.from("addons").delete().eq("id",id);
  if (error) return msg(formMsg,error.message);
  await loadAdminList();
};

function resetForm() {
  document.getElementById("addonForm").reset();
  document.getElementById("addonId").value = "";
  document.getElementById("formTitle").textContent = "NUEVO ADD-ON";
  document.getElementById("cancelEdit").classList.add("hidden");
}
document.getElementById("cancelEdit").onclick = resetForm;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

init();
