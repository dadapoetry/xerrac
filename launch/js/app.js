/* ═══════════════════════════════════════════════════
   Xerrac! Launch Operations Center — App
   ═══════════════════════════════════════════════════ */

const DATA = {
  LAUNCH_DATE: new Date('2026-09-24T10:00:00'),
  PHASES: [
    { id: 'setup', label: 'Fonaments', start: '2026-07-17', end: '2026-07-30', complete: 100 },
    { id: 'content', label: 'Producció de contingut', start: '2026-07-31', end: '2026-08-20', complete: 0 },
    { id: 'assets', label: 'Creació d\'assets', start: '2026-08-21', end: '2026-09-03', complete: 0 },
    { id: 'prelaunch', label: 'Prellançament', start: '2026-09-04', end: '2026-09-17', complete: 0 },
    { id: 'launch', label: 'Setmana de llançament', start: '2026-09-18', end: '2026-09-24', complete: 0 },
    { id: 'postlaunch', label: 'Postllançament', start: '2026-09-25', end: '2026-12-31', complete: 0 },
  ],
  TODAYS_TASKS: [
    { text: 'Revisar i aprovar el disseny de la portada del nº 1', priority: 'high', done: false },
    { text: 'Confirmar text definitiu de l\'editorial', priority: 'high', done: false },
    { text: 'Enviar correu de premsa a Núvol i Catorze', priority: 'high', done: false },
    { text: 'Programar post d\'Instagram: "Què és Xerrac?"', priority: 'medium', done: true },
    { text: 'Preparar l\'asset del countdown per Stories', priority: 'medium', done: false },
    { text: 'Verificar enllaços i URL definitiva: laxerrac.cat', priority: 'medium', done: true },
    { text: 'Redactar el manifest per la pàgina "Quant a nosaltres"', priority: 'low', done: false },
  ],
  WEEKS: [
    { num: 1, dates: '17 Jul — 23 Jul', phase: 'Fonaments', done: true,
      objectives: 'Setup del projecte: domini, hosting, eines. Definir identitat visual d\'Instagram.',
      deliverables: 'Perfil d\'Instagram creat, Foto de perfil pujada, Bio actualitzada, Domini laxerrac.cat operatiu.',
      instagram: '0', website: 'Configuració Vercel + Turso', press: 'Llista de mitjans', production: 'Scripts i automatitzacions' },
    { num: 2, dates: '24 Jul — 30 Jul', phase: 'Fonaments', done: true,
      objectives: 'Tancar contingut editorial del nº 1. Primera ronda de premsa.',
      deliverables: 'Editorial finalitzat, Seccions tancades, Dossier de premsa preparat.',
      instagram: 'Post 1: "Neix Xerrac!"', website: 'Penjar contingut del nº 1 (privat)', press: 'Dossier de premsa', production: 'Correcció i revisió d\'estil' },
    { num: 3, dates: '31 Jul — 6 Ago', phase: 'Producció de contingut', done: false,
      objectives: 'Enllestir tots els textos del nº 1. Iniciar calendari IG.',
      deliverables: 'Totes les seccions revisades, Calendari IG complet, 3 posts preparats.',
      instagram: 'Post 2: "Contra la xerrameca!"', website: 'Ajustos de disseny', press: '—', production: 'Maquetació del nº 1' },
    { num: 4, dates: '7 Ago — 13 Ago', phase: 'Producció de contingut', done: false,
      objectives: 'Disseny gràfic del nº 1. Creació d\'assets gràfics.',
      deliverables: 'Portada dissenyada, Interior maquetat, Plantilles IG creades.',
      instagram: 'Post 3: "El soroll del silenci"', website: 'Previsualització del nº 1', press: '—', production: 'Disseny de portada' },
    { num: 5, dates: '14 Ago — 20 Ago', phase: 'Producció de contingut', done: false,
      objectives: 'Producció d\'assets visuals. Gravació de vídeos.',
      deliverables: 'Teaser animat, Quotes gràfiques, Fotos d\'autors (si escau).',
      instagram: 'Post 4: Cita de l\'editorial', website: '—', press: '—', production: 'Teaser animat' },
    { num: 6, dates: '21 Ago — 27 Ago', phase: 'Creació d\'assets', done: false,
      objectives: 'Ramp-up d\'Instagram. Enganxar audiència.',
      deliverables: '5 posts programats, Stories diàries.',
      instagram: 'Post 5: "Full Mural" collage + Post 6: "Pàgines Grogues"', website: '—', press: '—', production: 'Assets per xarxes' },
    { num: 7, dates: '28 Ago — 3 Set', phase: 'Creació d\'assets', done: false,
      objectives: 'Preparar materials de premsa. Segona ronda de contactes.',
      deliverables: 'Nota de premsa final, Llista de mitjans actualitzada.',
      instagram: 'Post 7: "Ludita" (crossword)', website: '—', press: 'Enviar nota de premsa', production: 'Dossier complet' },
    { num: 8, dates: '4 Set — 10 Set', phase: 'Prellançament', done: false,
      objectives: 'Campanya de prellançament. Generar expectació.',
      deliverables: 'Countdown actiu, 3 posts pre-llançament.',
      instagram: 'Post 8: "Fadu Català" + Post 9: "Per què Xerrac?"', website: 'Countdown al site', press: 'Follow-up trucades', production: 'Countdown visual' },
    { num: 9, dates: '11 Set — 17 Set', phase: 'Prellançament', done: false,
      objectives: 'Últims preparatius. Assajos tècnics.',
      deliverables: 'Tests de càrrega, URL definitives, Backup del site.',
      instagram: 'Post 10: Countdown final + Post 11: "Què trobareu al nº 1"', website: 'Test de producció', press: 'Recordatori mitjans', production: 'Tests i backups' },
    { num: 10, dates: '18 Set — 24 Set', phase: 'Setmana de llançament', done: false,
      objectives: 'LLANÇAMENT. Publicar el nº 1. Comunicar a tothom.',
      deliverables: 'Nº 1 publicat al site, Posts d\'Instagram, Newsletter de llançament.',
      instagram: 'Post 12: "Ja disponible!" + Stories de llançament', website: 'PUBLICAR el nº 1', press: 'Llançament oficial', production: 'Monitorització' },
    { num: 11, dates: '25 Set — 1 Oct', phase: 'Postllançament', done: false,
      objectives: 'Consolidar. Recollir feedback. Primers resultats.',
      deliverables: 'Post de celebració, Agraïments, Anàlisi de visites.',
      instagram: 'Post 13: Agraïments + Mencions', website: 'Penjar novetats post-llançament', press: 'Nota de seguiment', production: 'Mètriques' },
    { num: 12, dates: '2 Oct — 31 Des', phase: 'Postllançament', done: false,
      objectives: 'Mantenir ritme. Preparar nº 2.',
      deliverables: 'Calendari IG fins desembre, Convocatòria de textos nº 2.',
      instagram: '2 posts/setmana. Manteniment + teasers nº 2', website: 'Secció "Obert" per recepció', press: 'Relacions continues', production: 'Preproducció nº 2' },
  ],
};

/* ─── Helpers ─── */
function daysUntil(d) {
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function currentPhase() {
  const now = new Date();
  for (const p of DATA.PHASES) {
    const s = new Date(p.start);
    const e = new Date(p.end);
    if (now >= s && now <= e) return p;
  }
  return DATA.PHASES[DATA.PHASES.length - 1];
}

function overallProgress() {
  let total = 0;
  let done = 0;
  for (const w of DATA.WEEKS) {
    total++;
    if (w.done) done++;
  }
  return Math.round((done / total) * 100);
}

/* ─── Render functions ─── */
function renderCountdown() {
  const el = document.getElementById('countdown');
  if (!el) return;
  const d = daysUntil(DATA.LAUNCH_DATE);
  const h = Math.floor((DATA.LAUNCH_DATE.getTime() - new Date().getTime()) % (1000*60*60*24) / (1000*60*60));
  el.innerHTML = `
    <div class="countdown-item">
      <div class="num" style="color: var(--red)">${d}</div>
      <div class="label">Dies</div>
    </div>
    <div class="countdown-item">
      <div class="num" style="color: var(--yellow)">${h}</div>
      <div class="label">Hores</div>
    </div>
    <div class="countdown-item">
      <div class="num" style="color: var(--text2)">${overallProgress()}%</div>
      <div class="label">Ready</div>
    </div>
  `;
}

function renderPhase() {
  const el = document.getElementById('current-phase');
  if (!el) return;
  const p = currentPhase();
  let cls = 'phase-blue';
  if (p.id === 'launch') cls = 'phase-red';
  else if (p.id === 'prelaunch' || p.id === 'postlaunch') cls = 'phase-yellow';
  else if (p.id === 'setup') cls = 'phase-green';
  el.innerHTML = `<span class="phase ${cls}">${p.label}</span>`;
}

function renderProgressBar() {
  const el = document.getElementById('progress-fill');
  if (!el) return;
  const pct = overallProgress();
  el.style.width = pct + '%';
  let color = 'blue';
  if (pct > 80) color = 'green';
  else if (pct > 40) color = 'yellow';
  else if (pct > 20) color = 'blue';
  el.className = 'progress-fill ' + color;
}

function renderTodayTasks() {
  const el = document.getElementById('today-tasks');
  if (!el) return;
  el.innerHTML = DATA.TODAYS_TASKS.map(t => `
    <li>
      <span class="check ${t.done ? 'done' : (t.priority === 'high' ? 'pending' : '')}"></span>
      <div>
        <div style="font-size:0.82rem;${t.done?'color:var(--text3)':''}">${t.text}</div>
        ${t.priority === 'high' && !t.done ? '<div class="meta">🔴 Alta prioritat</div>' : ''}
        ${t.done ? '<div class="meta">✓ Fet</div>' : ''}
      </div>
    </li>
  `).join('');
}

function renderThisWeek() {
  const el = document.getElementById('this-week');
  if (!el) return;
  const now = new Date();
  const currentWeek = DATA.WEEKS.find(w => {
    if (!w.dates) return false;
    // First week check by phase match
    return false;
  });
  // Just show next incomplete week
  const next = DATA.WEEKS.find(w => !w.done) || DATA.WEEKS[DATA.WEEKS.length - 1];
  el.innerHTML = `
    <div class="week" style="border:1px solid var(--yellow);border-radius:var(--radius);padding:1rem;background:var(--surface2);margin-bottom:0.75rem;">
      <div style="display:flex;justify-content:space-between;align-items:center;width:100%;">
        <div>
          <div style="font-family:var(--mono);font-size:0.65rem;color:var(--yellow);">Setmana ${next.num}</div>
          <div style="font-size:0.65rem;color:var(--text3);">${next.dates}</div>
        </div>
        <span class="badge badge-yellow">En curs</span>
      </div>
      <div style="margin-top:0.75rem;">
        <div style="font-size:0.72rem;color:var(--text2);"><strong>Objectius:</strong> ${next.objectives}</div>
        <div style="font-size:0.72rem;color:var(--text3);margin-top:0.35rem;"><strong>Deliverables:</strong> ${next.deliverables}</div>
      </div>
      <div class="tags" style="margin-top:0.5rem;">
        ${next.instagram ? `<span class="tag tag-instagram">📷 ${next.instagram}</span>` : ''}
        ${next.website ? `<span class="tag tag-web">🌐 ${next.website}</span>` : ''}
        ${next.press ? `<span class="tag tag-press">📰 ${next.press}</span>` : ''}
        ${next.production ? `<span class="tag tag-production">⚙️ ${next.production}</span>` : ''}
      </div>
    </div>
  `;
}

function renderPendingAssets() {
  const el = document.getElementById('pending-assets');
  if (!el) return;
  const pending = [
    { name: 'Portada del nº 1', deadline: '13 Ago', priority: 'critical' },
    { name: 'Teaser animat 15s', deadline: '20 Ago', priority: 'high' },
    { name: 'Plantilla Stories countdown', deadline: '4 Set', priority: 'medium' },
    { name: 'Quote cards x5', deadline: '20 Ago', priority: 'high' },
    { name: 'Fotos d\'autors (si escau)', deadline: '20 Ago', priority: 'low' },
  ];
  el.innerHTML = pending.map(a => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:0.4rem 0;border-bottom:1px solid var(--border);font-size:0.82rem;">
      <span>${a.name}</span>
      <div style="display:flex;align-items:center;gap:0.5rem;">
        <span class="mono" style="color:var(--text3);font-size:0.65rem;">${a.deadline}</span>
        <span class="badge ${a.priority === 'critical' ? 'badge-red' : a.priority === 'high' ? 'badge-yellow' : 'badge-blue'}">${a.priority}</span>
      </div>
    </div>
  `).join('');
}

/* ─── Init ─── */
document.addEventListener('DOMContentLoaded', () => {
  renderCountdown();
  renderPhase();
  renderProgressBar();
  renderTodayTasks();
  renderThisWeek();
  renderPendingAssets();

  // Highlight current page in sidebar
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.sidebar nav a').forEach(a => {
    if (a.getAttribute('href') === page) a.classList.add('active');
  });

  // Copy buttons
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.copy);
      if (target) {
        const text = target.textContent;
        navigator.clipboard.writeText(text).then(() => {
          const orig = btn.textContent;
          btn.textContent = 'Copiat!';
          setTimeout(() => btn.textContent = orig, 2000);
        });
      }
    });
  });

  // Countdown update every minute
  setInterval(() => {
    renderCountdown();
    renderProgressBar();
  }, 60000);
});
