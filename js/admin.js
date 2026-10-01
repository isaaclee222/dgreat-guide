(function () {
  'use strict';
  const schema = window.DSA_ADMIN_SCHEMA || {};
  const STORAGE_KEY = 'DSA_COMMUNITY_PATCHES_V3';
  const SESSION_KEY = 'DSA_ADMIN_SESSION_V3';
  const API_BASE = '/api/admin';
  const races = schema.races || ['Zerg', 'Terran', 'Protoss'];
  const $ = id => document.getElementById(id);
  const val = id => ($(id)?.value || '').trim();
  const setVal = (id, value) => { const el = $(id); if (el) el.value = value == null ? '' : String(value); };
  let users = window.DSA_ADMIN_USERS || [];
  let authToken = loadJSON(SESSION_KEY)?.token || '';
  let currentUser = null;
  let store = normalizeStore(window.DSA_GET_COMMUNITY_DATA?.() || {});
  let editingGuideId = '';
  let editingRacePageId = '';

  function loadJSON(key) { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } }
  function saveJSON(key, data) { try { localStorage.setItem(key, JSON.stringify(data)); } catch {} }
  function escapeHTML(input) { return String(input ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function slug(value) { return String(value || '').toLowerCase().replace(/&/g,' and ').replace(/\s*\/\s*/g,'-').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'unknown'; }
  function norm(value) { return String(value || '').trim().toLowerCase().replace(/\s+/g, ' '); }
  function lines(value) { return String(value || '').split(/\n|,/).map(x => x.trim()).filter(Boolean); }
  function makeId(prefix) { return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`; }
  function toast(msg) { const el=$('toast'); if(!el) return; el.textContent=msg; el.classList.add('show'); clearTimeout(toast.t); toast.t=setTimeout(()=>el.classList.remove('show'),3200); }
  function now() { return new Date().toISOString(); }

  function normalizeStore(raw) {
    raw = raw || {};
    return {
      version: Number(raw.version || 6),
      generatedAt: raw.generatedAt || '',
      generatedBy: raw.generatedBy || '',
      changelog: Array.isArray(raw.changelog) ? raw.changelog : [],
      users: { patches: raw.users?.patches || [], deleted: raw.users?.deleted || [] },
      patches: {
        threatResponses: raw.patches?.threatResponses || [],
        tierList: raw.patches?.tierList || [],
        units: raw.patches?.units || [],
        generalMatchups: raw.patches?.generalMatchups || []
      },
      additions: {
        threatResponses: raw.additions?.threatResponses || [],
        communityGuides: raw.additions?.communityGuides || [],
        feedback: raw.additions?.feedback || [],
        raceGuides: raw.additions?.raceGuides || [],
        worstBuilds: raw.additions?.worstBuilds || []
      },
      adminUsers: raw.adminUsers || []
    };
  }

  async function api(path, options = {}) {
    const headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
    if (authToken) headers.Authorization = `Bearer ${authToken}`;
    const res = await fetch(`${API_BASE}${path}`, Object.assign({}, options, { headers, cache: 'no-store' }));
    const type = res.headers.get('content-type') || '';
    const payload = type.includes('application/json') ? await res.json() : await res.text();
    if (!res.ok) throw new Error(payload?.error || payload || `API error ${res.status}`);
    return payload;
  }

  async function downloadFromApi(path, fallbackName) {
    const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
    const res = await fetch(`${API_BASE}${path}`, { headers, cache:'no-store' });
    const text = await res.text();
    if (!res.ok) {
      let msg = text;
      try { msg = JSON.parse(text).error || msg; } catch {}
      throw new Error(msg);
    }
    exportText(fallbackName, text, res.headers.get('content-type') || 'text/plain');
  }

  function applyServerState(serverState) {
    if (!serverState) return;
    store = normalizeStore(serverState);
    if (Array.isArray(serverState.adminUsers)) users = serverState.adminUsers;
    saveJSON(STORAGE_KEY, store);
    window.DSA_SERVER_COMMUNITY_DATA = store;
    if (typeof window.DSA_APPLY_COMMUNITY_ADDITIONS === 'function') window.DSA_APPLY_COMMUNITY_ADDITIONS();
    renderLoginUsers();
    fillAllControls(false);
    renderAll();
  }

  async function loadBackendPublicState() {
    try {
      const data = await api('/public?_=' + Date.now());
      window.DSA_SERVER_COMMUNITY_DATA = data;
      applyServerState(data);
      setBackendStatus('Live backend data loaded from Netlify Blobs.', true);
      return true;
    } catch (err) {
      setBackendStatus('Backend unavailable. Check Netlify Functions if saves fail.', false);
      return false;
    }
  }
  async function loadBackendPrivateState() {
    const data = await api('/state?_=' + Date.now());
    if (data.user) currentUser = data.user;
    applyServerState(data.state);
    return data;
  }
  async function loadLoginUsers() {
    try {
      const data = await api('/login-users?_=' + Date.now());
      if (Array.isArray(data.adminUsers)) users = data.adminUsers;
      renderLoginUsers(); renderUsersPanel();
      setBackendStatus('User list refreshed from backend.', true);
      return true;
    } catch (err) {
      setBackendStatus('Could not refresh users. Type the exact editor ID if needed.', false);
      return false;
    }
  }
  function setBackendStatus(message, good) {
    const box = $('backend-status');
    if (box) box.innerHTML = `<span class="pill ${good ? 'tier-s' : 'danger'}">${good ? 'Backend online' : 'Backend issue'}</span> ${escapeHTML(message || '')}`;
  }

  function fillSelect(id, opts, selected) {
    const el = $(id); if (!el) return;
    const old = selected != null ? selected : el.value;
    el.innerHTML = (opts || []).map(o => `<option value="${escapeHTML(o.value ?? o)}">${escapeHTML(o.label ?? o)}</option>`).join('');
    if (old && Array.from(el.options).some(opt => opt.value === old)) el.value = old;
  }
  function fillDatalist(id, opts) {
    const el = $(id); if (!el) return;
    el.innerHTML = (opts || []).map(o => `<option value="${escapeHTML(o.value ?? o)}" label="${escapeHTML(o.label ?? o)}"></option>`).join('');
  }
  function allUnits() {
    const map = new Map();
    (window.DSA_TIERLIST || []).forEach(u => { if (u?.unit) map.set(slug(u.unit), { name:u.unit, race:u.race || 'Any', image:u.image, tierRow:u }); });
    (window.DSA_UNITS || []).forEach(u => { if (u?.name) map.set(slug(u.name), Object.assign(map.get(slug(u.name)) || {}, { name:u.name, race:u.race || 'Any', unitRow:u })); });
    return Array.from(map.values()).sort((a,b) => a.name.localeCompare(b.name));
  }
  function scopedUnits() {
    const scope = currentUser?.scopeRace || 'All';
    return allUnits().filter(u => scope === 'All' || u.race === scope || u.race === 'Any');
  }
  function unitByName(name) { return allUnits().find(u => norm(u.name) === norm(name)); }
  function hasPerm(p) { return currentUser && ((currentUser.permissions || []).includes(p) || (currentUser.permissions || []).includes('all')); }
  function isOwner() { return currentUser?.role === 'owner' || hasPerm('users'); }
  function isRaceEditor() { return currentUser?.role === 'race-editor' && races.includes(currentUser.scopeRace); }
  function scopeError(area, row) {
    if (!currentUser) return 'Log in first.';
    if (!hasPerm(area)) return `${currentUser.displayName} does not have permission for this panel.`;
    if (!isRaceEditor()) return '';
    const race = currentUser.scopeRace;
    if (area === 'threat') return [row.myRace, row.enemyRaceContext, row.enemyRace, row.unitRace].includes(race) ? '' : `Your ${race} password can only save threat rows where at least one race field is ${race}.`;
    if (area === 'tier' || area === 'unit') return row.race === race ? '' : `Your ${race} password can only patch existing ${race} units.`;
    if (area === 'guides') return row.race === 'Any' || row.race === race ? '' : `Your ${race} password can only add ${race} or Any strategy guides.`;
    if (area === 'racePages') {
      if (race === 'Terran' && row.page !== 'tvt') return 'Terran editors can only fill TvT page sections.';
      if (race === 'Protoss' && row.page !== 'pvp') return 'Protoss editors can only fill PvP page sections.';
      if (race === 'Zerg') return 'Zerg editors cannot fill TvT/PvP pages unless the owner changes their abilities.';
    }
    return '';
  }
  function requireNote(id) { const n = val(id); if (!n) { toast('A short changelog note is required.'); $(id)?.focus(); return ''; } return n; }

  function renderLoginUsers() {
    const list = users && users.length ? users.slice().sort((a,b)=>String(a.displayName||a.editorId).localeCompare(String(b.displayName||b.editorId))) : [{ editorId:'isaac', displayName:'Isaac / Owner', scopeRace:'All' }];
    fillSelect('editor-select', list.map(u => ({ value:u.editorId, label:`${u.displayName || u.editorId} — ${u.editorId} (${u.scopeRace || 'All'})` })), $('editor-id')?.value || list[0]?.editorId);
    fillDatalist('editor-id-list', list.map(u => ({ value:u.editorId, label:`${u.displayName || u.editorId} (${u.scopeRace || 'All'})` })));
    const input = $('editor-id');
    if (input && !input.value) input.value = list[0]?.editorId || 'isaac';
  }
  async function login() {
    const id = val('editor-id'), pass = val('editor-pass');
    if (!id || !pass) { toast('Editor and password are required.'); return; }
    try {
      const data = await api('/auth', { method:'POST', body: JSON.stringify({ editorId:id, password:pass }) });
      authToken = data.token;
      currentUser = data.user;
      saveJSON(SESSION_KEY, { editorId:id, token:authToken });
      setVal('editor-pass','');
      applyServerState(data.state);
      applyLoginState();
      setBackendStatus('Logged in. Saves persist through Netlify Functions.', true);
    } catch (err) { toast(`Login failed: ${err.message}`); }
  }
  function logout() { currentUser = null; authToken = ''; localStorage.removeItem(SESSION_KEY); applyLoginState(); }
  async function restoreSession() {
    const s = loadJSON(SESSION_KEY);
    if (!s?.token) return;
    authToken = s.token;
    try { const data = await loadBackendPrivateState(); currentUser = data.user; applyLoginState(); }
    catch { authToken=''; currentUser=null; localStorage.removeItem(SESSION_KEY); setBackendStatus('Session expired. Log in again.', false); }
  }
  function applyLoginState() {
    document.body.classList.toggle('locked', !currentUser);
    $('login-form-wrap')?.classList.toggle('hidden', !!currentUser);
    $('logged-in-wrap')?.classList.toggle('hidden', !currentUser);
    if (currentUser && $('login-status')) $('login-status').innerHTML = `Logged in as <strong>${escapeHTML(currentUser.displayName)}</strong><br><span class="mini">Scope: ${escapeHTML(currentUser.scopeRace)} · Role: ${escapeHTML(currentUser.role)}</span>`;
    fillAllControls(true);
    renderAll();
  }

  async function recordChange({ dataset, action, target, note, payload, bucket='additions' }) {
    if (!authToken) { toast('Log in first.'); return; }
    try {
      const data = await api('/change', { method:'POST', body: JSON.stringify({ dataset, action, target, note, payload, bucket }) });
      applyServerState(data.state);
      const entry = data.change;
      if ($('live-preview')) $('live-preview').innerHTML = `<strong>${escapeHTML(entry.target)}</strong><br><span>${escapeHTML(entry.note)}</span>`;
      toast('Saved permanently and updated live.');
    } catch (err) { toast(`Save failed: ${err.message}`); }
  }

  function renderRoleSummary() {
    const el = $('role-summary'); if (!el) return;
    if (!currentUser) { el.innerHTML = '<p class="mini">Log in to see permissions.</p>'; return; }
    const text = isOwner() ? 'Owner/master access: manage users and all data.' : isRaceEditor() ? `Race lock: saves must involve ${escapeHTML(currentUser.scopeRace)}.` : 'Reviewer access: limited to assigned panels.';
    el.innerHTML = `<div class="role-banner"><strong>${escapeHTML(currentUser.displayName)}</strong><p class="mini">${text}</p></div><div class="pill-row">${(currentUser.permissions||[]).map(p=>`<span class="pill">${escapeHTML(p)}</span>`).join('')}</div>`;
    ['threat-role-notice','tier-role-notice'].forEach(id => { const box=$(id); if(box) box.textContent = isOwner() ? 'Owner: all rows editable.' : isRaceEditor() ? `${currentUser.scopeRace} lock is active.` : 'Your role may not save this panel.'; });
  }
  function renderPermissionChecks() {
    const box = $('permission-checks'); if (!box) return;
    box.innerHTML = (schema.permissions || []).map(p => `<label><input type="checkbox" value="${escapeHTML(p.id)}"> ${escapeHTML(p.label)}</label>`).join('');
  }
  function selectedPermissions(){ return Array.from(document.querySelectorAll('#permission-checks input:checked')).map(x=>x.value); }
  function renderUsersPanel(){
    renderPermissionChecks();
    const list=$('user-list'); if(!list) return;
    const rows = (users || []).slice().sort((a,b)=>String(a.displayName||a.editorId).localeCompare(String(b.displayName||b.editorId)));
    list.innerHTML = rows.length ? rows.map(u => `<div class="user-row"><div><strong>${escapeHTML(u.displayName)}</strong><br><em>${escapeHTML(u.editorId)} · ${escapeHTML(u.role)} · ${escapeHTML(u.scopeRace)}</em><div class="pill-row">${(u.permissions||[]).map(p=>`<span class="pill">${escapeHTML(p)}</span>`).join('')}</div></div><button class="admin-button ghost" type="button" data-load-user="${escapeHTML(u.editorId)}">Load</button></div>`).join('') : '<p class="mini">No backend users loaded yet.</p>';
    list.querySelectorAll('[data-load-user]').forEach(btn => btn.addEventListener('click', () => loadUser(btn.dataset.loadUser)));
  }
  function loadUser(id){
    const u=(users || []).find(x=>x.editorId===id); if(!u) return;
    setVal('user-editor-id', u.editorId); setVal('user-display-name', u.displayName); setVal('user-role', u.role); setVal('user-scope', u.scopeRace); setVal('user-password','');
    document.querySelectorAll('#permission-checks input').forEach(ch => { ch.checked=(u.permissions||[]).includes(ch.value); });
  }
  async function saveUser(){
    if(!isOwner()){ toast('Only owner/master can manage passwords.'); return; }
    const note=requireNote('user-note'); if(!note) return;
    const user={ editorId:slug(val('user-editor-id')), displayName:val('user-display-name'), role:val('user-role'), scopeRace:val('user-scope'), permissions:selectedPermissions(), password:val('user-password') };
    try { const data=await api('/users',{method:'POST', body:JSON.stringify({ action:'upsert', user, note })}); applyServerState(data.state); await loadLoginUsers(); setVal('user-note',''); setVal('user-password',''); toast('Password/abilities saved.'); }
    catch(err){ toast(`User save failed: ${err.message}`); }
  }
  async function deleteUser(){
    if(!isOwner()){ toast('Only owner/master can delete passwords.'); return; }
    const note=requireNote('user-note'); if(!note) return;
    const editorId=slug(val('user-editor-id'));
    if(!editorId || editorId===currentUser.editorId){ toast('Choose another editor ID; do not delete yourself.'); return; }
    try { const data=await api('/users',{method:'POST', body:JSON.stringify({ action:'delete', editorId, note })}); applyServerState(data.state); await loadLoginUsers(); setVal('user-note',''); toast('Editor deleted.'); }
    catch(err){ toast(`Delete failed: ${err.message}`); }
  }

  function fillAllControls(preserve=true){
    fillSelect('threat-my-race', races, preserve ? undefined : null);
    fillSelect('threat-enemy-race', races, preserve ? undefined : null);
    fillSelect('threat-position', schema.positions || ['Any'], preserve ? undefined : null);
    fillSelect('threat-priority', schema.priorities || ['Low','Medium','High','Critical']);
    fillSelect('threat-skill', schema.skillCaps || ['Low','Medium','High','Expert']);
    refreshThreatUnitOptions();
    ['counter-1','counter-2','counter-3'].forEach(id=>fillSelect(id, [{value:'',label:'None'}].concat(allUnits().map(u=>({value:u.name,label:u.name})))));
    fillSelect('tier-unit', scopedUnits().map(u=>({value:u.name,label:`${u.name} (${u.race})`})));
    fillSelect('tier-early', schema.tiers || []); fillSelect('tier-late', schema.tiers || []);
    fillSelect('guide-category-edit', schema.guideCategories || []);
    fillSelect('race-page', schema.racePages || []);
    fillSelect('race-page-priority', schema.priorities || []); fillSelect('race-page-skill', schema.skillCaps || []);
    fillSelect('feedback-priority', schema.priorities || []);
    renderGuideOptions(); renderRacePageOptions(); renderQuizAdmin(); populateTierForm(); renderUsersPanel(); renderWorstBuildAdmin();
  }

  function mergedThreats() { return (window.DSA_THREAT_RESPONSES || []).slice(); }
  function threatKeyParts(row) { return [norm(row.myRace), norm(row.enemyRaceContext || row.enemyRace), norm(row.positionContext || row.position || 'Any'), norm(row.enemyThreat || row.threat || row.targetName)].join('|'); }
  function refreshThreatUnitOptions(){
    const enemyRace = val('threat-enemy-race') || races[0];
    const units = allUnits().filter(u => u.race === enemyRace || u.race === 'Any');
    const seen = new Map();
    units.forEach(u => seen.set(u.name, { value:u.name, label:`${u.name} (${u.race})` }));
    mergedThreats().filter(t => (t.unitRace || t.enemyRaceContext) === enemyRace).forEach(t => { if (t.enemyThreat) seen.set(t.enemyThreat, { value:t.enemyThreat, label:`${t.enemyThreat} (${t.unitRace || enemyRace})` }); });
    fillSelect('threat-unit', Array.from(seen.values()).sort((a,b)=>a.value.localeCompare(b.value)));
    refreshExistingThreatOptions();
  }
  function refreshExistingThreatOptions(){
    const my=val('threat-my-race'), enemy=val('threat-enemy-race'), unit=val('threat-unit');
    const rows = mergedThreats().filter(r => r.myRace===my && (r.enemyRaceContext||r.enemyRace)===enemy && r.enemyThreat===unit);
    const opts = [{value:'', label: rows.length ? 'Auto: best matching row' : 'No existing row for this exact pick'}]
      .concat(rows.map(r => ({ value: threatKeyParts(r), label:`${r.positionContext || 'Any'} · ${r.priority || 'Priority'} · ${String(r.responseText || '').slice(0,60)}` })));
    fillSelect('threat-existing', opts);
    populateThreatForm();
  }
  function findSelectedThreat(){
    const my=val('threat-my-race'), enemy=val('threat-enemy-race'), pos=val('threat-position'), unit=val('threat-unit'), selected=val('threat-existing');
    const rows = mergedThreats().filter(r => r.myRace===my && (r.enemyRaceContext||r.enemyRace)===enemy && r.enemyThreat===unit);
    if (selected) return rows.find(r => threatKeyParts(r)===selected) || null;
    return rows.find(r => (r.positionContext||'Any')===pos) || rows.find(r => (r.positionContext||'Any')==='Any') || rows[0] || null;
  }
  function populateThreatForm(){
    const row = findSelectedThreat();
    if (!row) { clearThreatText(); return; }
    if (val('threat-existing')) setVal('threat-position', row.positionContext || row.position || val('threat-position') || 'Any');
    setVal('threat-priority', row.priority || 'Medium'); setVal('threat-skill', row.skillCap || row.skillLevel || 'Medium');
    const c = Array.isArray(row.counterUnits) ? row.counterUnits : lines(row.counterUnits);
    setVal('counter-1', c[0] || ''); setVal('counter-2', c[1] || ''); setVal('counter-3', c[2] || '');
    setVal('threat-response', row.responseText || row.response || row.notes || '');
    setVal('threat-scout', row.scoutTiming || ''); setVal('threat-timing', row.responseTiming || '');
    setVal('threat-avoid', Array.isArray(row.avoid) ? row.avoid.join('\n') : (row.avoid || ''));
    setVal('threat-warning', row.warning || '');
    if ($('live-preview')) $('live-preview').innerHTML = `<strong>${escapeHTML(row.myRace)} vs ${escapeHTML(row.enemyRaceContext)}: ${escapeHTML(row.enemyThreat)}</strong><br><span>${escapeHTML(row.responseText || 'Existing row loaded.')}</span>`;
  }
  function clearThreatText(){
    ['threat-response','threat-scout','threat-timing','threat-avoid','threat-warning'].forEach(id=>setVal(id,''));
    ['counter-1','counter-2','counter-3'].forEach(id=>setVal(id,''));
  }
  function saveThreat(){
    const enemy=val('threat-unit'); const found=unitByName(enemy);
    const after={ myRace:val('threat-my-race'), enemyRaceContext:val('threat-enemy-race'), positionContext:val('threat-position'), enemyThreat:enemy, unitRace: found?.race || val('threat-enemy-race'), priority:val('threat-priority'), skillCap:val('threat-skill'), counterUnits:[val('counter-1'),val('counter-2'),val('counter-3')].filter(Boolean), responseText:val('threat-response'), scoutTiming:val('threat-scout'), responseTiming:val('threat-timing'), avoid:lines(val('threat-avoid')), warning:val('threat-warning'), hasResponse:true, source:'community' };
    const err=scopeError('threat', after); if(err){ toast(err); return; }
    const note=requireNote('threat-note'); if(!note) return;
    if(!after.enemyThreat || !after.responseText){ toast('Threat and main response are required.'); return; }
    recordChange({ dataset:'threatResponses', bucket:'patches', action:'save threat response', target:`${after.myRace} vs ${after.enemyRaceContext}: ${enemy}`, note, payload:{ targetName:enemy, after } });
    setVal('threat-note','');
  }

  function populateTierForm(){
    const unitName=val('tier-unit'); const row=(window.DSA_TIERLIST||[]).find(u=>u.unit===unitName); if(!row) return;
    setVal('tier-early', row.earlyTier || row.tier || 'B'); setVal('tier-late', row.lateTier || row.tier || 'B'); setVal('tier-notes', row.notes || row.role || '');
  }
  function saveTier(){
    const unitName=val('tier-unit'); const row=(window.DSA_TIERLIST||[]).find(u=>u.unit===unitName);
    if(!row){ toast('Select an existing tier-list unit.'); return; }
    const after={ unit:unitName, race:row.race, earlyTier:val('tier-early'), lateTier:val('tier-late'), notes:val('tier-notes'), role:val('tier-notes') || row.role };
    const err=scopeError('tier', after); if(err){ toast(err); return; }
    const note=requireNote('tier-note'); if(!note) return;
    recordChange({ dataset:'tierList', bucket:'patches', action:'patch tier row', target:unitName, note, payload:{ targetName:unitName, after } }); setVal('tier-note','');
  }

  function allGuides(){ return (window.DSA_STRATEGY_GUIDES || []).slice().sort((a,b)=>String(a.title).localeCompare(String(b.title))); }
  function renderGuideOptions(){
    const opts=[{value:'',label:'Create new guide'}].concat(allGuides().map(g=>({value:g.id,label:`${g.title} (${g.race || 'Any'} / ${g.matchup || 'Any'})`})));
    fillSelect('guide-existing', opts, editingGuideId);
  }
  function populateGuideForm(){
    const id=val('guide-existing'); editingGuideId=id;
    const g=allGuides().find(x=>x.id===id);
    if(!g){ ['guide-title','guide-matchup','guide-summary','guide-body','guide-tags'].forEach(x=>setVal(x,'')); setVal('guide-race-edit','Any'); return; }
    setVal('guide-title', g.title || ''); setVal('guide-race-edit', g.race || 'Any'); setVal('guide-matchup', g.matchup || 'Any'); setVal('guide-category-edit', g.category || 'Counter Guide'); setVal('guide-summary', g.summary || ''); setVal('guide-body', g.body || ''); setVal('guide-tags', Array.isArray(g.tags) ? g.tags.join(', ') : (g.tags || ''));
  }
  function saveGuide(){
    const guide={ id: editingGuideId || makeId('guide'), title:val('guide-title'), race:val('guide-race-edit'), matchup:val('guide-matchup') || 'Any', category:val('guide-category-edit'), summary:val('guide-summary'), body:val('guide-body'), tags:lines(val('guide-tags')), author:currentUser.displayName, updatedAt:now() };
    const err=scopeError('guides', guide); if(err){ toast(err); return; }
    const note=requireNote('guide-note'); if(!note) return;
    if(!guide.title || !guide.body){ toast('Guide title and body are required.'); return; }
    recordChange({ dataset:'communityGuides', bucket:'additions', action: editingGuideId ? 'update strategy guide' : 'add strategy guide', target:guide.title, note, payload:guide }); setVal('guide-note',''); editingGuideId=guide.id;
  }
  function newGuide(){ editingGuideId=''; setVal('guide-existing',''); populateGuideForm(); }

  function allRaceSections(){
    return (window.DSA_RACE_GUIDES || [])
      .filter(s => !String(s.title || '').includes('Expert Notes Needed') && s.category !== 'Admin Seed')
      .sort((a,b)=>Number(a.order||10)-Number(b.order||10));
  }
  function renderRacePageOptions(){
    const page=val('race-page') || 'tvt';
    const opts=[{value:'',label:'Create new section'}].concat(allRaceSections().filter(s=>s.page===page).map(s=>({value:s.id,label:`${s.order || 10}. ${s.title}`})));
    fillSelect('race-page-existing', opts, editingRacePageId);
  }
  function renderQuizAdmin(){
    const box=$('race-page-quiz-admin'); if(!box) return;
    box.innerHTML = [0,1,2].map(i => `<div class="quiz-admin-card" data-quiz-index="${i}"><strong>Question ${i+1}</strong><div class="form-grid"><label class="wide">Question<input id="quiz-q-${i}" placeholder="What should you do when..."></label><div class="quiz-answer-grid"><label>A<input id="quiz-a-${i}-0"></label><label>B<input id="quiz-a-${i}-1"></label><label>C<input id="quiz-a-${i}-2"></label><label>D<input id="quiz-a-${i}-3"></label></div><label>Correct answer<select id="quiz-correct-${i}"><option value="0">A</option><option value="1">B</option><option value="2">C</option><option value="3">D</option></select></label><label>Explanation<input id="quiz-explain-${i}" placeholder="Why this answer is correct"></label></div></div>`).join('');
  }
  function populateRacePageForm(){
    const id=val('race-page-existing'); editingRacePageId=id;
    const section=allRaceSections().find(s=>s.id===id);
    if(!section){ ['race-page-title','race-page-category','race-page-summary','race-page-body','race-page-points','race-page-mistakes'].forEach(x=>setVal(x,'')); setVal('race-page-order','10'); clearQuizFields(); return; }
    setVal('race-page-order', section.order || 10); setVal('race-page-title', section.title || ''); setVal('race-page-category', section.category || ''); setVal('race-page-priority', section.priority || 'Medium'); setVal('race-page-skill', section.skillLevel || 'Medium'); setVal('race-page-summary', section.summary || ''); setVal('race-page-body', section.body || ''); setVal('race-page-points', Array.isArray(section.keyPoints) ? section.keyPoints.join('\n') : (section.keyPoints || '')); setVal('race-page-mistakes', Array.isArray(section.commonMistakes) ? section.commonMistakes.join('\n') : (section.commonMistakes || ''));
    clearQuizFields();
    (section.quizQuestions || []).slice(0,3).forEach((q,i)=>{ setVal(`quiz-q-${i}`, q.question || ''); (q.answers || []).slice(0,4).forEach((a,j)=>setVal(`quiz-a-${i}-${j}`, a)); setVal(`quiz-correct-${i}`, q.correctIndex ?? 0); setVal(`quiz-explain-${i}`, q.explanation || ''); });
  }
  function clearQuizFields(){ for(let i=0;i<3;i++){ setVal(`quiz-q-${i}`,''); setVal(`quiz-explain-${i}`,''); setVal(`quiz-correct-${i}`,0); for(let j=0;j<4;j++) setVal(`quiz-a-${i}-${j}`,''); } }
  function collectQuizQuestions(){
    const out=[];
    for(let i=0;i<3;i++){
      const q=val(`quiz-q-${i}`); if(!q) continue;
      const answers=[0,1,2,3].map(j=>val(`quiz-a-${i}-${j}`)).filter(Boolean);
      if(answers.length < 2) continue;
      out.push({ question:q, answers, correctIndex:Math.min(Number(val(`quiz-correct-${i}`)||0), answers.length-1), explanation:val(`quiz-explain-${i}`) });
    }
    return out;
  }
  function saveRacePage(){
    const section={ id:editingRacePageId || makeId('racepage'), page:val('race-page'), order:Number(val('race-page-order')||10), title:val('race-page-title'), category:val('race-page-category'), priority:val('race-page-priority'), skillLevel:val('race-page-skill'), summary:val('race-page-summary'), body:val('race-page-body'), keyPoints:lines(val('race-page-points')), commonMistakes:lines(val('race-page-mistakes')), quizQuestions:collectQuizQuestions(), updatedBy:currentUser.displayName, updatedAt:now() };
    const err=scopeError('racePages', section); if(err){ toast(err); return; }
    const note=requireNote('race-page-note'); if(!note) return;
    if(!section.title || !section.body){ toast('Section title and body are required.'); return; }
    recordChange({ dataset:'raceGuides', bucket:'additions', action:editingRacePageId ? 'update page section' : 'add page section', target:`${section.page.toUpperCase()}: ${section.title}`, note, payload:section }); setVal('race-page-note',''); editingRacePageId=section.id;
  }
  function newRacePage(){ editingRacePageId=''; setVal('race-page-existing',''); populateRacePageForm(); }

  function saveFeedback(){
    const fb={ id:makeId('feedback'), type:val('feedback-type'), priority:val('feedback-priority'), text:val('feedback-text'), author:currentUser.displayName, createdAt:now() };
    const err=scopeError('feedback', fb); if(err){ toast(err); return; }
    const note=requireNote('feedback-note'); if(!note) return; if(!fb.text){ toast('Feedback text is required.'); return; }
    recordChange({ dataset:'feedback', bucket:'additions', action:'submit feedback', target:fb.type, note, payload:fb }); setVal('feedback-note','');
  }
  function renderWorstBuildAdmin(){
    const el=$('worst-build-admin-list'); if(!el) return;
    const builds=(store.additions.worstBuilds || []).slice().sort((a,b)=>Number((b.votes?.up||0)-(b.votes?.down||0))-Number((a.votes?.up||0)-(a.votes?.down||0)));
    el.innerHTML = builds.length ? builds.slice(0,40).map(b=>`<article class="admin-list-row"><strong>${escapeHTML(b.title || 'Untitled build')}</strong><span>${escapeHTML(b.week || '')} · ${escapeHTML(b.race || 'Any')} · score ${(b.votes?.up||0)-(b.votes?.down||0)}</span><p class="mini">${escapeHTML(b.buildText || b.description || '')}</p></article>`).join('') : '<p class="mini">No public Worst Build submissions yet.</p>';
  }

  function renderChangelog(){
    const el=$('changelog-list'); if(!el) return;
    const rows=(store.changelog || []).slice(0,100);
    el.innerHTML=rows.length ? rows.map(c=>`<article class="change-row"><strong>${escapeHTML(c.target||c.dataset)}</strong><span>${escapeHTML(c.editorName || c.editorId || 'Public')} · ${escapeHTML(c.action)} · ${c.timestamp ? new Date(c.timestamp).toLocaleString() : ''}</span><p class="mini">${escapeHTML(c.note||'')}</p></article>`).join('') : '<p class="mini">No saves yet.</p>';
  }
  function renderAll(){ renderRoleSummary(); renderUsersPanel(); renderChangelog(); renderWorstBuildAdmin(); }
  function exportText(filename, text, type='text/plain'){
    const blob=new Blob([text],{type}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),500);
  }
  async function exportJS(){ if(!hasPerm('export')){ toast('No export permission.'); return; } try{ await downloadFromApi('/export-js','data-community-additions.js'); }catch(err){ toast(`Export failed: ${err.message}`); } }
  async function exportJSON(){ try{ await downloadFromApi('/export-json',`dsa-admin-audit-${new Date().toISOString().slice(0,10)}.json`); }catch(err){ toast(`Export failed: ${err.message}`); } }
  async function exportMD(){ try{ await downloadFromApi('/export-md','direct-strike-academy-changelog.md'); }catch(err){ toast(`Export failed: ${err.message}`); } }
  async function clearLocal(){ if(!hasPerm('clear')){ toast('Only owner can clear backend data.'); return; } if(!confirm('Clear backend admin data? Download a backup first if needed.')) return; try{ const data=await api('/clear',{method:'POST', body:'{}'}); applyServerState(data.state); toast('Backend store cleared.'); }catch(err){ toast(`Clear failed: ${err.message}`); } }

  function initPanels(){
    document.querySelectorAll('[data-panel]').forEach(btn=>btn.addEventListener('click',()=>{
      document.querySelectorAll('[data-panel]').forEach(x=>x.classList.remove('active')); btn.classList.add('active');
      document.querySelectorAll('.admin-panel').forEach(p=>p.classList.remove('active')); $(btn.dataset.panel)?.classList.add('active');
    }));
  }
  function initEvents(){
    $('editor-select')?.addEventListener('change', e=>setVal('editor-id', e.target.value));
    $('editor-id')?.addEventListener('input', e=>{ const sel=$('editor-select'); if(sel && Array.from(sel.options).some(o=>o.value===e.target.value)) sel.value=e.target.value; });
    $('refresh-users-btn')?.addEventListener('click', loadLoginUsers);
    $('login-btn')?.addEventListener('click', login); $('editor-pass')?.addEventListener('keydown', e=>{ if(e.key==='Enter') login(); }); $('logout-btn')?.addEventListener('click', logout);
    $('save-user-btn')?.addEventListener('click', saveUser); $('delete-user-btn')?.addEventListener('click', deleteUser);
    ['threat-my-race','threat-enemy-race','threat-position','threat-unit'].forEach(id=>$(id)?.addEventListener('change', () => { if(id==='threat-enemy-race') refreshThreatUnitOptions(); else refreshExistingThreatOptions(); }));
    $('threat-existing')?.addEventListener('change', populateThreatForm); $('clear-threat-form-btn')?.addEventListener('click', clearThreatText); $('save-threat-btn')?.addEventListener('click', saveThreat);
    $('tier-unit')?.addEventListener('change', populateTierForm); $('save-tier-btn')?.addEventListener('click', saveTier);
    $('guide-existing')?.addEventListener('change', populateGuideForm); $('new-guide-btn')?.addEventListener('click', newGuide); $('save-guide-btn')?.addEventListener('click', saveGuide);
    $('race-page')?.addEventListener('change', () => { editingRacePageId=''; renderRacePageOptions(); populateRacePageForm(); }); $('race-page-existing')?.addEventListener('change', populateRacePageForm); $('new-race-page-btn')?.addEventListener('click', newRacePage); $('save-race-page-btn')?.addEventListener('click', saveRacePage);
    $('save-feedback-btn')?.addEventListener('click', saveFeedback);
    $('export-js-btn')?.addEventListener('click', exportJS); $('export-json-btn')?.addEventListener('click', exportJSON); $('export-md-btn')?.addEventListener('click', exportMD); $('clear-local-btn')?.addEventListener('click', clearLocal);
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderLoginUsers(); renderQuizAdmin(); initPanels(); initEvents(); fillAllControls(false); applyLoginState();
    loadLoginUsers().then(() => loadBackendPublicState()).then(() => restoreSession());
  });
  document.addEventListener('dsa-community-data-ready', () => { fillAllControls(true); renderAll(); });
})();
