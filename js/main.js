// =============================================
// StudyNest — Js/main.js  (ES Module)
// Shared utilities, constants, UI components
// =============================================

export const SUBJECTS = ['Mathematics','Physics','Chemistry','Biology','ICT','English','Bangla','History','Economics','Geography'];
export const SUBJ_ICONS = { Mathematics:'📐', Physics:'⚛️', Chemistry:'🧪', Biology:'🔬', ICT:'💻', English:'📖', Bangla:'✍️', History:'📜', Economics:'📊', Geography:'🌍' };
export const AVATAR_COLORS = ['#2563EB','#DC2626','#059669','#D97706','#7C3AED','#DB2777','#0891B2','#EA580C'];

export function escHtml(str) {
  if (str == null) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

export function formatDate(val) {
  if (!val) return '';
  const d = val?.toDate ? val.toDate() : new Date(val);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (isNaN(diff)) return '';
  if (diff < 60)     return 'just now';
  if (diff < 3600)   return Math.floor(diff/60) + 'm ago';
  if (diff < 86400)  return Math.floor(diff/3600) + 'h ago';
  if (diff < 604800) return Math.floor(diff/86400) + 'd ago';
  return d.toLocaleDateString('en-BD', { day:'numeric', month:'short', year:'numeric' });
}

export function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2,7);
}

export function getUrlParam(p) {
  return new URLSearchParams(location.search).get(p);
}

export function avatarColor(id) {
  const n = (id||'').split('').reduce((a,c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

export function initial(name) {
  return name ? name.charAt(0).toUpperCase() : '?';
}

// ---- Toast ----
export function toast(msg, type = 'success') {
  const icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
  let tc = document.getElementById('toast-container');
  if (!tc) { tc = document.createElement('div'); tc.id='toast-container'; document.body.appendChild(tc); }
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icons[type]||''}</span><span>${escHtml(msg)}</span>`;
  tc.appendChild(el);
  setTimeout(() => { el.classList.add('hide'); setTimeout(() => el.remove(), 320); }, 3000);
}

// ---- Modal ----
export function openModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
export function closeModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.remove('open'); document.body.style.overflow = ''; }
}
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// ---- Navbar ----
export function renderNavbar(active, userData) {
  const links = [
    { href:'index.html',     label:'🏠 Home',   id:'home'      },
    { href:'notes.html',     label:'📚 Notes',  id:'notes'     },
    { href:'questions.html', label:'❓ Q&A',    id:'questions' },
    { href:'quiz.html',      label:'📝 Quiz',   id:'quiz'      },
    { href:'notice.html',    label:'📢 Notice', id:'notice'    },
  ];
  const linksHtml = links.map(l =>
    `<a href="${l.href}" class="nav-link ${active===l.id?'active':''}">${l.label}</a>`
  ).join('');
  const rightHtml = userData
    ? `<a href="profile.html" class="nav-avatar" style="background:${avatarColor(userData.uid)}" title="${escHtml(userData.name)}">
        ${userData.photoUrl ? `<img src="${escHtml(userData.photoUrl)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>` : initial(userData.name)}
       </a>
       <button class="btn btn-ghost btn-sm" id="logout-btn">Logout</button>`
    : `<a href="login.html" class="btn btn-primary btn-sm">Login</a>`;

  const el = document.getElementById('navbar');
  if (!el) return;
  el.innerHTML = `
  <nav class="navbar">
    <div class="nav-inner">
      <a href="index.html" class="nav-logo">📚 StudyNest</a>
      <div class="nav-links" id="navlinks">${linksHtml}</div>
      <div class="nav-right">
        <div class="nav-search">
          <span class="nav-search-icon">🔍</span>
          <input id="gsearch" type="text" placeholder="Search…" autocomplete="off"/>
        </div>
        ${rightHtml}
      </div>
      <button class="hamburger" id="hbg">☰</button>
    </div>
  </nav>`;

  document.getElementById('hbg')?.addEventListener('click', () =>
    document.getElementById('navlinks').classList.toggle('open'));
  document.getElementById('gsearch')?.addEventListener('keydown', e => {
    if (e.key==='Enter' && e.target.value.trim())
      location.href = `notes.html?q=${encodeURIComponent(e.target.value.trim())}`;
  });
  document.getElementById('logout-btn')?.addEventListener('click', async () => {
    const { fbLogout } = await import('./firebase.js');
    fbLogout();
  });
}

// ---- Scroll to top ----
export function initScrollTop() {
  const btn = Object.assign(document.createElement('button'), {
    className:'scroll-top', innerHTML:'↑', title:'Back to top'
  });
  btn.onclick = () => scrollTo({ top:0, behavior:'smooth' });
  document.body.appendChild(btn);
  addEventListener('scroll', () => btn.classList.toggle('show', scrollY > 300));
}

// ---- Imgbb upload ----
export function getImgbbKey() { return localStorage.getItem('sn_imgbb_key') || ''; }
export function saveImgbbKey(k) { localStorage.setItem('sn_imgbb_key', k.trim()); }

export async function uploadImageToImgbb(file) {
  const key = getImgbbKey();
  if (!key) { toast('Set your Imgbb API key in Profile → Settings!', 'error'); return null; }
  if (!file?.type.startsWith('image/')) { toast('Please select a valid image.', 'error'); return null; }
  if (file.size > 5*1024*1024) { toast('Image must be under 5MB.', 'error'); return null; }
  const form = new FormData();
  form.append('image', file);
  try {
    const res  = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, { method:'POST', body:form });
    const data = await res.json();
    if (data.success) return data.data.url;
    toast('Upload failed: ' + (data.error?.message||'Unknown'), 'error');
    return null;
  } catch { toast('Upload failed. Check internet.', 'error'); return null; }
}
