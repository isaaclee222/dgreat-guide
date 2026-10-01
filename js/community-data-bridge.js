/*
  Community additions bridge.
  Load this after the normal data files and after data-community-additions.js,
  but before page scripts like matchup-helper.js, tier-list.js, unit-counter.js,
  strategy-database.js, or race-guides-page.js.

  It preserves the existing data file formats by applying append-only additions
  and patches in memory. Admin exports replace /js/data-community-additions.js
  for permanence.
*/
(function () {
  'use strict';

  const LOCAL_KEY = 'DSA_COMMUNITY_PATCHES_V3';
  const API_PUBLIC_ENDPOINT = '/api/admin/public';
  const SERVER_CACHE_KEY = 'DSA_SERVER_COMMUNITY_CACHE_V1';
  const SERVER_CACHE_TS_KEY = 'DSA_SERVER_COMMUNITY_CACHE_TS_V1';
  const DEFAULT_CACHE_HOURS = 1;

  /*
    Live-throttled mode:
    - Public pages use the static /js/data-community-additions.js file plus cached server data immediately.
    - They also sync from Netlify at most once per DEFAULT_CACHE_HOURS per browser.
    - This keeps public strategy updates live without calling a Function on every page load.
    - To force a sync for testing, visit any page with ?syncCommunity=1.
    - To disable public backend syncing in a browser, run:
        localStorage.setItem('DSA_DISABLE_PUBLIC_BACKEND_SYNC', 'true')
    - Admin pages still use the backend directly through admin.js.
  */

  function clone(value) {
    try { return JSON.parse(JSON.stringify(value || null)); }
    catch (err) { return value; }
  }

  function loadLocalStore() {
    try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || 'null'); }
    catch (err) { return null; }
  }

  function loadServerCache() {
    try {
      const raw = localStorage.getItem(SERVER_CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (err) { return null; }
  }

  function saveServerCache(data) {
    try {
      localStorage.setItem(SERVER_CACHE_KEY, JSON.stringify(data || {}));
      localStorage.setItem(SERVER_CACHE_TS_KEY, String(Date.now()));
    } catch (err) {}
  }

  function shouldFetchServerData(force) {
    if (force) return true;
    const params = new URLSearchParams(window.location.search || '');
    if (params.get('syncCommunity') === '1') return true;
    if (params.get('backendSync') === '1') return true;
    if (String(localStorage.getItem('DSA_DISABLE_PUBLIC_BACKEND_SYNC') || '').toLowerCase() === 'true') return false;
    const last = Number(localStorage.getItem(SERVER_CACHE_TS_KEY) || 0);
    const maxAgeMs = DEFAULT_CACHE_HOURS * 60 * 60 * 1000;
    return !last || Date.now() - last > maxAgeMs;
  }

  function emptyStore() {
    return {
      version: 4,
      generatedAt: '',
      generatedBy: '',
      changelog: [],
      users: { patches: [], deleted: [] },
      patches: { threatResponses: [], tierList: [], units: [], generalMatchups: [] },
      additions: { threatResponses: [], communityGuides: [], feedback: [], raceGuides: [], worstBuilds: [] }
    };
  }

  function normalizeStore(raw) {
    const base = emptyStore();
    raw = raw || {};
    return {
      version: raw.version || base.version,
      generatedAt: raw.generatedAt || '',
      generatedBy: raw.generatedBy || '',
      changelog: Array.isArray(raw.changelog) ? raw.changelog : [],
      users: {
        patches: Array.isArray(raw.users?.patches) ? raw.users.patches : [],
        deleted: Array.isArray(raw.users?.deleted) ? raw.users.deleted : []
      },
      patches: {
        threatResponses: Array.isArray(raw.patches?.threatResponses) ? raw.patches.threatResponses : [],
        tierList: Array.isArray(raw.patches?.tierList) ? raw.patches.tierList : [],
        units: Array.isArray(raw.patches?.units) ? raw.patches.units : [],
        generalMatchups: Array.isArray(raw.patches?.generalMatchups) ? raw.patches.generalMatchups : []
      },
      additions: {
        threatResponses: Array.isArray(raw.additions?.threatResponses) ? raw.additions.threatResponses : [],
        communityGuides: Array.isArray(raw.additions?.communityGuides) ? raw.additions.communityGuides : [],
        feedback: Array.isArray(raw.additions?.feedback) ? raw.additions.feedback : [],
        raceGuides: Array.isArray(raw.additions?.raceGuides) ? raw.additions.raceGuides : [],
        worstBuilds: Array.isArray(raw.additions?.worstBuilds) ? raw.additions.worstBuilds : []
      }
    };
  }

  function mergeStores(a, b) {
    a = normalizeStore(a);
    b = normalizeStore(b);
    return {
      version: Math.max(Number(a.version || 0), Number(b.version || 0), 4),
      generatedAt: b.generatedAt || a.generatedAt,
      generatedBy: b.generatedBy || a.generatedBy,
      changelog: dedupeById([...(a.changelog || []), ...(b.changelog || [])], 'changeId'),
      users: {
        patches: dedupeById([...(a.users.patches || []), ...(b.users.patches || [])], 'editorId'),
        deleted: Array.from(new Set([...(a.users.deleted || []), ...(b.users.deleted || [])]))
      },
      patches: {
        threatResponses: dedupeByCompound([...(a.patches.threatResponses || []), ...(b.patches.threatResponses || [])], patchThreatKey),
        tierList: dedupeByCompound([...(a.patches.tierList || []), ...(b.patches.tierList || [])], p => norm(p.targetName || p.after?.unit || p.after?.name)),
        units: dedupeByCompound([...(a.patches.units || []), ...(b.patches.units || [])], p => norm(p.targetName || p.after?.name || p.after?.unit)),
        generalMatchups: dedupeByCompound([...(a.patches.generalMatchups || []), ...(b.patches.generalMatchups || [])], patchGeneralKey)
      },
      additions: {
        threatResponses: dedupeByCompound([...(a.additions.threatResponses || []), ...(b.additions.threatResponses || [])], threatKey),
        communityGuides: dedupeById([...(a.additions.communityGuides || []), ...(b.additions.communityGuides || [])], 'id'),
        feedback: dedupeById([...(a.additions.feedback || []), ...(b.additions.feedback || [])], 'id'),
        raceGuides: dedupeById([...(a.additions.raceGuides || []), ...(b.additions.raceGuides || [])], 'id'),
        worstBuilds: dedupeById([...(a.additions.worstBuilds || []), ...(b.additions.worstBuilds || [])], 'id')
      }
    };
  }

  function dedupeById(list, idKey) {
    const out = [];
    const seen = new Map();
    (list || []).forEach((item, i) => {
      const key = item?.[idKey] || item?.changeId || item?.id || `row-${i}`;
      seen.set(key, item);
    });
    seen.forEach(v => out.push(v));
    return out;
  }

  function dedupeByCompound(list, keyFn) {
    const seen = new Map();
    (list || []).forEach((item, i) => {
      const key = keyFn(item) || `row-${i}`;
      seen.set(key, item);
    });
    return Array.from(seen.values());
  }

  function norm(value) {
    return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
  }

  function slug(value) {
    return String(value || '').toLowerCase().trim()
      .replace(/&/g, ' and ')
      .replace(/\s*\/\s*/g, '-')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'unknown';
  }

  function afterOf(patch) {
    return patch?.after || patch?.payload?.after || patch || {};
  }

  function threatKey(row) {
    row = afterOf(row);
    return [
      norm(row.myRace),
      norm(row.enemyRaceContext || row.enemyRace),
      norm(row.positionContext || row.position || 'Any'),
      norm(row.enemyThreat || row.threat || row.targetName)
    ].join('|');
  }

  function patchThreatKey(patch) {
    const after = afterOf(patch);
    return threatKey(after);
  }

  function generalKey(row) {
    row = afterOf(row);
    return [norm(row.myRace), norm(row.enemyRace), norm(row.position || 'Any')].join('|');
  }

  function patchGeneralKey(patch) {
    return generalKey(afterOf(patch));
  }

  function priorityWeight(priority) {
    const p = norm(priority);
    if (p.includes('critical')) return 95;
    if (p.includes('high')) return 78;
    if (p.includes('medium')) return 52;
    if (p.includes('low')) return 24;
    return 36;
  }

  function skillWeight(skill) {
    const s = norm(skill);
    if (s.includes('expert')) return 12;
    if (s.includes('high')) return 10;
    if (s.includes('medium')) return 6;
    return 2;
  }

  function textUrgency(row) {
    const joined = [
      row.responseText, row.warning, row.notes,
      Array.isArray(row.avoid) ? row.avoid.join(' ') : row.avoid,
      row.responseTiming, row.scoutTiming
    ].join(' ').toLowerCase();
    const words = [
      'must', 'never', 'critical', 'huge', 'immediately', 'dominates',
      'rolled', 'punish', 'punishes', 'warning', 'perfect', 'leak',
      'losing', 'lose', 'timing', 'storm', 'mothership', 'battlecruiser',
      'edge', 'do not', "don't", 'danger'
    ];
    return words.reduce((score, w) => score + (joined.includes(w) ? 4 : 0), 0);
  }

  function scoreThreat(row) {
    return priorityWeight(row.priority || row.importance) + skillWeight(row.skillCap || row.skillLevel) + textUrgency(row);
  }

  function mergeRow(list, row, keyFn, mergeMode) {
    const key = keyFn(row);
    const idx = list.findIndex(existing => keyFn(existing) === key);
    if (idx >= 0) {
      list[idx] = Object.assign({}, list[idx], row);
    } else if (mergeMode !== 'patch-only') {
      list.push(row);
    }
  }

  function normalizeThreat(row) {
    row = Object.assign({}, row || {});
    row.myRace = row.myRace || row.race || 'Any';
    row.enemyThreat = row.enemyThreat || row.threat || row.targetName || row.unit || '';
    row.enemyRaceContext = row.enemyRaceContext || row.enemyRace || row.unitRace || 'Any';
    row.unitRace = row.unitRace || row.enemyRace || row.enemyRaceContext || 'Any';
    row.positionContext = row.positionContext || row.position || 'Any';
    row.counterUnits = Array.isArray(row.counterUnits) ? row.counterUnits.filter(Boolean) : String(row.counterUnits || '').split(',').map(x => x.trim()).filter(Boolean);
    row.avoid = Array.isArray(row.avoid) ? row.avoid.filter(Boolean) : String(row.avoid || '').split(/\n|,/).map(x => x.trim()).filter(Boolean);
    row.hasResponse = row.hasResponse !== false && Boolean(row.responseText || row.warning || row.notes || row.counterUnits.length);
    row.id = row.id || `${slug(row.enemyThreat)}__${slug(row.myRace)}__${slug(row.enemyRaceContext)}__${slug(row.positionContext)}`;
    row.sortScore = Number(row.sortScore || row.score || scoreThreat(row));
    row.importance = row.importance || row.priority || (row.sortScore > 90 ? 'Critical' : row.sortScore > 70 ? 'High' : row.sortScore > 45 ? 'Medium' : 'Low');
    return row;
  }

  function applyThreatResponses(store) {
    if (!Array.isArray(window.DSA_THREAT_RESPONSES)) return;
    const list = window.DSA_THREAT_RESPONSES.slice();

    (store.patches.threatResponses || []).forEach(patch => {
      const row = normalizeThreat(afterOf(patch));
      mergeRow(list, row, threatKey);
    });
    (store.additions.threatResponses || []).forEach(add => {
      const row = normalizeThreat(add);
      mergeRow(list, row, threatKey);
    });

    list.sort((a, b) => (Number(b.sortScore || 0) - Number(a.sortScore || 0)) || String(a.enemyThreat).localeCompare(String(b.enemyThreat)));
    window.DSA_THREAT_RESPONSES = list;
    if (window.DSA_MATCHUP_DATA) window.DSA_MATCHUP_DATA.threatResponses = list;

    const sorting = list.map(row => ({
      id: row.id,
      enemyThreat: row.enemyThreat,
      myRace: row.myRace,
      unitRace: row.unitRace,
      score: Number(row.sortScore || scoreThreat(row)),
      importance: row.importance || row.priority || 'Medium',
      priority: row.priority || row.importance || 'Medium',
      skillCap: row.skillCap || row.skillLevel || 'Medium',
      reasons: row.source === 'community' ? ['community update'] : []
    })).sort((a, b) => b.score - a.score);
    window.DSA_THREAT_SORTING = sorting;
    if (window.DSA_MATCHUP_DATA) window.DSA_MATCHUP_DATA.threatSorting = sorting;

    const unitMap = new Map();
    list.forEach(row => {
      const k = norm(row.enemyThreat);
      if (row.enemyThreat && !unitMap.has(k)) unitMap.set(k, { name: row.enemyThreat, race: row.unitRace || row.enemyRaceContext || 'Any' });
    });
    window.DSA_ALL_THREAT_UNITS = Array.from(unitMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    if (window.DSA_MATCHUP_DATA) window.DSA_MATCHUP_DATA.allThreatUnits = window.DSA_ALL_THREAT_UNITS;
  }

  function applyGeneralMatchups(store) {
    if (!Array.isArray(window.DSA_GENERAL_MATCHUPS)) return;
    const list = window.DSA_GENERAL_MATCHUPS.slice();
    (store.patches.generalMatchups || []).forEach(patch => {
      const row = Object.assign({}, afterOf(patch));
      mergeRow(list, row, generalKey);
    });
    window.DSA_GENERAL_MATCHUPS = list;
    if (window.DSA_MATCHUP_DATA) window.DSA_MATCHUP_DATA.general = list;
  }

  function applyTierList(store) {
    if (!Array.isArray(window.DSA_TIERLIST)) return;
    const list = window.DSA_TIERLIST.slice();
    (store.patches.tierList || []).forEach(patch => {
      const after = Object.assign({}, afterOf(patch));
      if (!after.unit && patch.targetName) after.unit = patch.targetName;
      const key = norm(after.unit || after.name || patch.targetName);
      const idx = list.findIndex(row => norm(row.unit || row.name) === key);
      if (idx >= 0) list[idx] = Object.assign({}, list[idx], after);
    });
    window.DSA_TIERLIST = list;
  }

  function applyUnits(store) {
    if (!Array.isArray(window.DSA_UNITS)) return;
    const list = window.DSA_UNITS.slice();
    (store.patches.units || []).forEach(patch => {
      const after = Object.assign({}, afterOf(patch));
      if (!after.name && patch.targetName) after.name = patch.targetName;
      const key = norm(after.name || after.unit || patch.targetName);
      const idx = list.findIndex(row => norm(row.name || row.unit) === key);
      if (idx >= 0) list[idx] = Object.assign({}, list[idx], after);
    });

    // Mirror tier patches into unit rows when the unit exists in both datasets.
    (store.patches.tierList || []).forEach(patch => {
      const after = Object.assign({}, afterOf(patch));
      const key = norm(after.unit || after.name || patch.targetName);
      const idx = list.findIndex(row => norm(row.name || row.unit) === key);
      if (idx >= 0) {
        list[idx] = Object.assign({}, list[idx], {
          tier: after.tier || list[idx].tier,
          earlyTier: after.earlyTier || list[idx].earlyTier,
          lateTier: after.lateTier || list[idx].lateTier,
          role: after.role || list[idx].role,
          summary: after.notes || after.summary || list[idx].summary,
          tierNotes: after.notes || list[idx].tierNotes
        });
      }
    });
    window.DSA_UNITS = list;
  }

  function applyGuides(store) {
    const baseGuides = Array.isArray(window.DSA_STRATEGY_GUIDES) ? window.DSA_STRATEGY_GUIDES.slice() : [];
    const guideMap = new Map();
    baseGuides.concat(store.additions.communityGuides || []).forEach((guide, i) => {
      const id = guide.id || `guide-${i}-${slug(guide.title)}`;
      guideMap.set(id, Object.assign({ id }, guide));
    });
    window.DSA_STRATEGY_GUIDES = Array.from(guideMap.values());

    const baseRaceGuides = Array.isArray(window.DSA_RACE_GUIDES) ? window.DSA_RACE_GUIDES.slice() : [];
    const raceMap = new Map();
    baseRaceGuides.concat(store.additions.raceGuides || []).forEach((section, i) => {
      const id = section.id || `${section.page || 'page'}-${i}-${slug(section.title)}`;
      raceMap.set(id, Object.assign({ id }, section));
    });
    window.DSA_RACE_GUIDES = Array.from(raceMap.values()).sort((a, b) => Number(a.order || 10) - Number(b.order || 10));

    window.DSA_WORST_BUILDS = (store.additions.worstBuilds || []).slice().sort((a, b) => {
      const av = Number(a.votes?.up || 0) - Number(a.votes?.down || 0);
      const bv = Number(b.votes?.up || 0) - Number(b.votes?.down || 0);
      return (bv - av) || String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
    });
  }

  function applyUsers(store) {
    if (!Array.isArray(window.DSA_ADMIN_USERS)) return;
    const deleted = new Set(store.users.deleted || []);
    const map = new Map();
    window.DSA_ADMIN_USERS.forEach(user => { if (!deleted.has(user.editorId)) map.set(user.editorId, user); });
    (store.users.patches || []).forEach(user => {
      if (user && user.editorId && !deleted.has(user.editorId)) {
        map.set(user.editorId, Object.assign({}, map.get(user.editorId) || {}, user));
      }
    });
    window.DSA_ADMIN_USERS = Array.from(map.values());
  }

  function applyCommunityAdditions() {
    const shipped = normalizeStore(window.DSA_COMMUNITY_ADDITIONS || {});
    const cachedServer = window.DSA_SERVER_COMMUNITY_DATA || loadServerCache() || {};
    const server = normalizeStore(cachedServer);
    const local = normalizeStore(loadLocalStore() || {});
    const store = mergeStores(mergeStores(shipped, server), local);

    applyUsers(store);
    applyThreatResponses(store);
    applyGeneralMatchups(store);
    applyTierList(store);
    applyUnits(store);
    applyGuides(store);

    window.DSA_COMMUNITY_MERGED = store;
    window.DSA_GET_COMMUNITY_DATA = function () { return clone(store); };
    try {
      document.dispatchEvent(new CustomEvent('dsa-community-data-ready', { detail: { store } }));
    } catch (err) {}
    return store;
  }

  async function fetchServerCommunityData(options) {
    const force = Boolean(options && options.force);
    if (!shouldFetchServerData(force)) return null;
    try {
      const url = force ? `${API_PUBLIC_ENDPOINT}?_=${Date.now()}` : API_PUBLIC_ENDPOINT;
      const res = await fetch(url, { cache: force ? 'no-store' : 'default' });
      if (!res.ok) return null;
      const data = await res.json();
      const normalized = normalizeStore(data);
      window.DSA_SERVER_COMMUNITY_DATA = normalized;
      saveServerCache(normalized);
      applyCommunityAdditions();
      try {
        document.dispatchEvent(new CustomEvent('dsa-community-server-data-ready', { detail: { store: window.DSA_COMMUNITY_MERGED } }));
      } catch (err) {}
      return normalized;
    } catch (err) {
      // Static fallback: the shipped data-community-additions.js remains enough for non-Netlify hosting.
      return null;
    }
  }

  window.DSA_APPLY_COMMUNITY_ADDITIONS = applyCommunityAdditions;
  window.DSA_FETCH_SERVER_COMMUNITY_DATA = fetchServerCommunityData;
  window.DSA_FORCE_PUBLIC_BACKEND_SYNC = function () { return fetchServerCommunityData({ force: true }); };
  applyCommunityAdditions();
  fetchServerCommunityData();
})();
