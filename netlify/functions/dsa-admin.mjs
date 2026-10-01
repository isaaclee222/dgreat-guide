import { getStore } from '@netlify/blobs';
import crypto from 'node:crypto';

const STORE_NAME = 'direct-strike-academy-admin';
const STORE_KEY = 'community-additions-v1.json';
const TOKEN_TTL_MS = 1000 * 60 * 60 * 12;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store'
};

const schemaPermissions = new Set([
  'all', 'users', 'threat', 'tier', 'unit', 'guides', 'racePages', 'feedback', 'builds', 'export', 'clear'
]);

function env(name) {
  try {
    if (globalThis.Netlify?.env?.get) return globalThis.Netlify.env.get(name) || process.env[name] || '';
  } catch (err) {}
  return process.env[name] || '';
}

function json(statusCode, body, headers = {}) {
  return { statusCode, headers: { ...CORS_HEADERS, ...headers }, body: JSON.stringify(body, null, 2) };
}

function text(statusCode, body, contentType = 'text/plain; charset=utf-8') {
  return { statusCode, headers: { ...CORS_HEADERS, 'Content-Type': contentType, 'Cache-Control': 'no-store' }, body };
}

function now() { return new Date().toISOString(); }
function base64url(input) { return Buffer.from(input).toString('base64url'); }
function unbase64url(input) { return Buffer.from(input, 'base64url').toString('utf8'); }
function slug(value) { return String(value || '').toLowerCase().trim().replace(/&/g, ' and ').replace(/\s*\/\s*/g, '-').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'unknown'; }
function norm(value) { return String(value || '').trim().toLowerCase().replace(/\s+/g, ' '); }
function id(prefix) { return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`; }

function sha256(input) {
  return crypto.createHash('sha256').update(String(input || ''), 'utf8').digest('hex');
}

function passwordHash(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(String(password || ''), salt, 120000, 32, 'sha256').toString('hex');
  return `pbkdf2$sha256$120000$${salt}$${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored) return false;
  if (stored.startsWith('sha256:')) return `sha256:${sha256(password)}` === stored;
  const parts = stored.split('$');
  if (parts.length === 5 && parts[0] === 'pbkdf2') {
    const [, algo, iter, salt, expected] = parts;
    if (algo !== 'sha256') return false;
    const actual = crypto.pbkdf2Sync(String(password || ''), salt, Number(iter), 32, 'sha256').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(actual, 'hex'), Buffer.from(expected, 'hex'));
  }
  return false;
}

function tokenSecret() {
  const secret = env('DSA_SESSION_SECRET') || env('DSA_OWNER_PASSWORD_HASH') || env('DSA_OWNER_PASSWORD');
  if (!secret) throw new Error('Missing DSA_SESSION_SECRET or owner password environment variable.');
  return secret;
}

function sign(payload) {
  const body = base64url(JSON.stringify(payload));
  const sig = crypto.createHmac('sha256', tokenSecret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verifyToken(token) {
  if (!token || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', tokenSecret()).update(body).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const payload = JSON.parse(unbase64url(body));
  if (!payload.exp || Date.now() > payload.exp) return null;
  return payload;
}

function emptyStore() {
  return {
    version: 5,
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
    version: Number(raw.version || base.version),
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

async function blobStore() {
  return getStore(STORE_NAME);
}

async function readStore() {
  const store = await blobStore();
  const value = await store.get(STORE_KEY, { type: 'json', consistency: 'strong' });
  return normalizeStore(value || {});
}

async function writeStore(data) {
  const store = await blobStore();
  const normalized = normalizeStore(data);
  normalized.generatedAt = now();
  await store.setJSON(STORE_KEY, normalized, { metadata: { updatedAt: normalized.generatedAt } });
  return normalized;
}

function ownerUser() {
  return {
    editorId: env('DSA_OWNER_ID') || 'isaac',
    displayName: env('DSA_OWNER_NAME') || 'Isaac',
    role: 'owner',
    scopeRace: 'All',
    permissions: ['all']
  };
}

function publicUser(user) {
  if (!user) return null;
  const { passwordHash: _passwordHash, passHash: _passHash, password: _password, ...safe } = user;
  return safe;
}

function getUsers(store) {
  const owner = ownerUser();
  const deleted = new Set(store.users.deleted || []);
  const map = new Map([[owner.editorId, owner]]);
  (store.users.patches || []).forEach(user => {
    if (!user?.editorId || deleted.has(user.editorId)) return;
    map.set(user.editorId, { ...map.get(user.editorId), ...user });
  });
  if (deleted.has(owner.editorId)) map.set(owner.editorId, owner);
  return Array.from(map.values());
}

function publicStore(store) {
  const clone = normalizeStore(JSON.parse(JSON.stringify(store || {})));
  clone.users = { patches: [], deleted: [] };
  return clone;
}

function safeAdminState(store) {
  const clone = normalizeStore(JSON.parse(JSON.stringify(store || {})));
  clone.users.patches = clone.users.patches.map(publicUser);
  clone.adminUsers = getUsers(store).map(publicUser);
  return clone;
}

function getBearer(event) {
  const header = event.headers.authorization || event.headers.Authorization || '';
  return header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : '';
}

async function requireUser(event) {
  const payload = verifyToken(getBearer(event));
  if (!payload?.editorId) return null;
  const store = await readStore();
  const users = getUsers(store);
  const user = users.find(u => u.editorId === payload.editorId);
  if (!user) return null;
  if (user.role !== 'owner' && (store.users.deleted || []).includes(user.editorId)) return null;
  return { user, store };
}

function hasPerm(user, perm) {
  const permissions = user?.permissions || [];
  return permissions.includes('all') || permissions.includes(perm);
}
function isOwner(user) { return user?.role === 'owner' || hasPerm(user, 'users'); }
function isRaceEditor(user) { return user?.role === 'race-editor' && ['Zerg', 'Terran', 'Protoss'].includes(user.scopeRace); }

function rowScopeError(user, area, row) {
  if (!user) return 'Not logged in.';
  if (!hasPerm(user, area)) return `${user.displayName || user.editorId} does not have permission for ${area}.`;
  if (!isRaceEditor(user)) return '';
  const race = user.scopeRace;
  if (area === 'threat') {
    return [row.myRace, row.enemyRaceContext, row.enemyRace, row.unitRace].includes(race)
      ? ''
      : `Your ${race} password can only save threat rows where at least one race field is ${race}.`;
  }
  if (area === 'tier' || area === 'unit') return row.race === race ? '' : `Your ${race} password can only patch existing ${race} units.`;
  if (area === 'guides') return row.race === 'Any' || row.race === race ? '' : `Your ${race} password can only add ${race} or Any guides.`;
  if (area === 'racePages') {
    if (race === 'Terran' && row.page !== 'tvt') return 'Terran editors can only fill TvT page sections.';
    if (race === 'Protoss' && row.page !== 'pvp') return 'Protoss editors can only fill PvP page sections.';
    if (race === 'Zerg') return 'Zerg editors cannot fill TvT/PvP pages unless the owner changes their abilities.';
  }
  return '';
}

function datasetPermission(dataset, bucket) {
  if (dataset === 'threatResponses') return 'threat';
  if (dataset === 'tierList') return 'tier';
  if (dataset === 'units') return 'unit';
  if (dataset === 'communityGuides') return 'guides';
  if (dataset === 'raceGuides') return 'racePages';
  if (dataset === 'feedback') return 'feedback';
  if (dataset === 'worstBuilds') return 'builds';
  if (dataset === 'generalMatchups') return 'threat';
  return bucket === 'patches' ? 'threat' : 'feedback';
}

function rowFromChange(body) {
  const payload = body.payload || {};
  return payload.after || payload;
}

function validateChange(user, body) {
  const bucket = body.bucket || 'additions';
  const dataset = body.dataset;
  const note = String(body.note || '').trim();
  if (!note) return 'A short changelog note is required.';
  if (!['additions', 'patches'].includes(bucket)) return 'Invalid change bucket.';
  if (!dataset || !emptyStore()[bucket]?.hasOwnProperty(dataset)) return 'Invalid dataset.';
  const perm = datasetPermission(dataset, bucket);
  const row = rowFromChange(body);
  const err = rowScopeError(user, perm, row);
  if (err) return err;
  if (bucket === 'patches' && dataset === 'tierList' && !row.unit && !body.payload?.targetName) return 'Tier patches need an existing unit name.';
  return '';
}

function addChange(store, user, body) {
  const changeId = id('change');
  const timestamp = now();
  const entry = {
    changeId,
    timestamp,
    editorId: user.editorId,
    editorName: user.displayName,
    editorRole: user.role,
    scopeRace: user.scopeRace,
    dataset: body.dataset,
    action: body.action || 'save change',
    target: body.target || body.payload?.targetName || body.payload?.title || body.dataset,
    note: String(body.note || '').trim()
  };
  const wrapped = {
    ...(body.payload || {}),
    changeId,
    timestamp,
    editorId: user.editorId,
    editorName: user.displayName,
    note: entry.note
  };
  store[body.bucket || 'additions'][body.dataset].push(wrapped);
  store.changelog.unshift(entry);
  store.generatedBy = user.editorId;
  return { entry, wrapped };
}

async function auth(event) {
  const body = JSON.parse(event.body || '{}');
  const editorId = String(body.editorId || '').trim();
  const password = String(body.password || '');
  const store = await readStore();
  const users = getUsers(store);
  const user = users.find(u => u.editorId === editorId);
  if (!user) return json(401, { error: 'Login failed.' });

  let ok = false;
  if (user.editorId === ownerUser().editorId) {
    const ownerHash = env('DSA_OWNER_PASSWORD_HASH');
    const ownerPassword = env('DSA_OWNER_PASSWORD');
    ok = Boolean(ownerHash && verifyPassword(password, ownerHash)) || Boolean(ownerPassword && password === ownerPassword);
  } else {
    ok = verifyPassword(password, user.passwordHash);
  }
  if (!ok) return json(401, { error: 'Login failed.' });
  const token = sign({ editorId: user.editorId, exp: Date.now() + TOKEN_TTL_MS });
  return json(200, { token, user: publicUser(user), state: safeAdminState(store) });
}

async function adminState(event) {
  const ctx = await requireUser(event);
  if (!ctx) return json(401, { error: 'Not authorized.' });
  return json(200, { user: publicUser(ctx.user), state: safeAdminState(ctx.store) });
}

async function publicData() {
  const store = await readStore();
  const pub = publicStore(store);
  pub.adminUsers = getUsers(store).map(user => ({ editorId: user.editorId, displayName: user.displayName, scopeRace: user.scopeRace }));
  return json(200, pub, {
    // Public pages use a browser-side hourly throttle plus a short CDN cache.
    // This keeps the site live without firing a Function on every page load.
    'Cache-Control': 'public, max-age=300, stale-while-revalidate=1800',
    'Netlify-CDN-Cache-Control': 'public, max-age=300, stale-while-revalidate=1800'
  });
}

async function loginUsersData() {
  const store = await readStore();
  const adminUsers = getUsers(store).map(user => ({
    editorId: user.editorId,
    displayName: user.displayName,
    role: user.role,
    scopeRace: user.scopeRace,
    permissions: user.permissions || []
  }));
  return json(200, { ok: true, generatedAt: store.generatedAt || now(), adminUsers }, {
    // Login user lists must not be cached, otherwise newly-created passwords only appear on the owner's browser.
    'Cache-Control': 'no-store, max-age=0',
    'Netlify-CDN-Cache-Control': 'no-store'
  });
}

async function saveChange(event) {
  const ctx = await requireUser(event);
  if (!ctx) return json(401, { error: 'Not authorized.' });
  const body = JSON.parse(event.body || '{}');
  const err = validateChange(ctx.user, body);
  if (err) return json(400, { error: err });
  const result = addChange(ctx.store, ctx.user, body);
  const saved = await writeStore(ctx.store);
  return json(200, { ok: true, change: result.entry, state: safeAdminState(saved), publicState: publicStore(saved) });
}

async function saveUser(event) {
  const ctx = await requireUser(event);
  if (!ctx || !isOwner(ctx.user)) return json(403, { error: 'Only owner/master can manage passwords.' });
  const body = JSON.parse(event.body || '{}');
  const action = body.action || 'upsert';
  const note = String(body.note || '').trim();
  if (!note) return json(400, { error: 'A short changelog note is required.' });

  if (action === 'delete') {
    const editorId = String(body.editorId || '').trim();
    if (!editorId || editorId === ctx.user.editorId || editorId === ownerUser().editorId) return json(400, { error: 'Choose a non-owner editor to delete.' });
    if (!ctx.store.users.deleted.includes(editorId)) ctx.store.users.deleted.push(editorId);
    const change = {
      changeId: id('change'), timestamp: now(), editorId: ctx.user.editorId, editorName: ctx.user.displayName,
      editorRole: ctx.user.role, scopeRace: ctx.user.scopeRace, dataset: 'users', action: 'delete user', target: editorId, note
    };
    ctx.store.changelog.unshift(change);
    ctx.store.generatedBy = ctx.user.editorId;
    const saved = await writeStore(ctx.store);
    return json(200, { ok: true, change, state: safeAdminState(saved) });
  }

  const user = body.user || {};
  const editorId = slug(user.editorId || '');
  if (!editorId) return json(400, { error: 'Editor ID is required.' });
  const permissions = Array.isArray(user.permissions) ? user.permissions.filter(p => schemaPermissions.has(p)) : [];
  if (!permissions.length) return json(400, { error: 'Choose at least one ability.' });
  const existing = getUsers(ctx.store).find(u => u.editorId === editorId);
  const patch = {
    editorId,
    displayName: String(user.displayName || editorId).trim(),
    role: String(user.role || 'race-editor'),
    scopeRace: ['All', 'Zerg', 'Terran', 'Protoss'].includes(user.scopeRace) ? user.scopeRace : 'All',
    permissions
  };
  if (user.password) patch.passwordHash = passwordHash(user.password);
  else if (existing?.passwordHash) patch.passwordHash = existing.passwordHash;
  else return json(400, { error: 'New users need a password.' });

  const patches = ctx.store.users.patches.filter(u => u.editorId !== editorId);
  patches.push(patch);
  ctx.store.users.patches = patches;
  ctx.store.users.deleted = (ctx.store.users.deleted || []).filter(id => id !== editorId);
  const change = {
    changeId: id('change'), timestamp: now(), editorId: ctx.user.editorId, editorName: ctx.user.displayName,
    editorRole: ctx.user.role, scopeRace: ctx.user.scopeRace, dataset: 'users', action: existing ? 'update user' : 'add user', target: patch.displayName, note
  };
  ctx.store.changelog.unshift(change);
  ctx.store.generatedBy = ctx.user.editorId;
  const saved = await writeStore(ctx.store);
  return json(200, { ok: true, change, state: safeAdminState(saved) });
}


function currentWeekId(date = new Date()) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

function buildScore(build) {
  const votes = build.votes || {};
  return Number(votes.up || 0) - Number(votes.down || 0);
}

function cleanWorstBuild(build) {
  return {
    id: build.id,
    week: build.week || currentWeekId(),
    title: String(build.title || 'Untitled build').slice(0, 100),
    race: build.race || 'Any',
    matchup: build.matchup || '',
    buildText: String(build.buildText || '').slice(0, 700),
    whyBad: String(build.whyBad || '').slice(0, 700),
    submittedBy: String(build.submittedBy || 'Anonymous').slice(0, 40),
    createdAt: build.createdAt || now(),
    votes: { up: Number(build.votes?.up || 0), down: Number(build.votes?.down || 0) },
    status: build.status || 'published'
  };
}

function publicWorstBuildPayload(store) {
  const builds = (store.additions.worstBuilds || [])
    .map(cleanWorstBuild)
    .filter(b => b.status !== 'deleted')
    .sort((a, b) => (buildScore(b) - buildScore(a)) || String(b.createdAt).localeCompare(String(a.createdAt)));
  const weeks = Array.from(new Set(builds.map(b => b.week))).sort().reverse();
  const currentWeek = currentWeekId();
  const top = builds.filter(b => b.week === currentWeek).slice(0, 3);
  return { ok: true, currentWeek, weeks, top: top.length ? top : builds.slice(0, 3), builds };
}

async function getWorstBuilds() {
  const store = await readStore();
  return json(200, publicWorstBuildPayload(store), {
    'Cache-Control': 'public, max-age=120, stale-while-revalidate=600',
    'Netlify-CDN-Cache-Control': 'public, max-age=120, stale-while-revalidate=600'
  });
}

async function submitWorstBuild(event) {
  const body = JSON.parse(event.body || '{}');
  const title = String(body.title || '').trim();
  const buildText = String(body.buildText || '').trim();
  if (title.length < 3) return json(400, { error: 'Give the build a short title.' });
  if (buildText.length < 8) return json(400, { error: 'Describe the build enough for players to recognize it.' });
  const store = await readStore();
  const build = cleanWorstBuild({
    id: id('worstbuild'),
    week: body.week || currentWeekId(),
    title,
    race: ['Any', 'Zerg', 'Terran', 'Protoss'].includes(body.race) ? body.race : 'Any',
    matchup: String(body.matchup || '').slice(0, 40),
    buildText,
    whyBad: String(body.whyBad || '').trim(),
    submittedBy: String(body.submittedBy || 'Anonymous').trim(),
    createdAt: now(),
    votes: { up: 1, down: 0 },
    status: 'published'
  });
  store.additions.worstBuilds.push(build);
  store.changelog.unshift({ changeId: id('change'), timestamp: now(), editorId: 'public', editorName: build.submittedBy || 'Public', editorRole: 'public', scopeRace: build.race, dataset: 'worstBuilds', action: 'submit worst build', target: build.title, note: `Public submission: ${build.title}` });
  const saved = await writeStore(store);
  return json(200, { ok: true, build, publicState: publicStore(saved), worstBuilds: publicWorstBuildPayload(saved) });
}

async function voteWorstBuild(event) {
  const body = JSON.parse(event.body || '{}');
  const buildId = String(body.buildId || '').trim();
  const direction = body.direction === 'down' ? 'down' : 'up';
  const store = await readStore();
  const idx = (store.additions.worstBuilds || []).findIndex(b => b.id === buildId);
  if (idx < 0) return json(404, { error: 'Build not found.' });
  const build = cleanWorstBuild(store.additions.worstBuilds[idx]);
  build.votes[direction] = Number(build.votes[direction] || 0) + 1;
  build.latestVoteAt = now();
  store.additions.worstBuilds[idx] = build;
  const saved = await writeStore(store);
  return json(200, { ok: true, build, worstBuilds: publicWorstBuildPayload(saved), publicState: publicStore(saved) });
}

async function exportData(event, kind) {
  const ctx = await requireUser(event);
  if (!ctx || !hasPerm(ctx.user, 'export')) return json(403, { error: 'No export permission.' });
  const store = await readStore();
  if (kind === 'js') {
    const data = JSON.stringify(publicStore(store), null, 2).replace(/<\//g, '<\\/');
    return text(200, `window.DSA_COMMUNITY_ADDITIONS = ${data};\n`, 'text/javascript; charset=utf-8');
  }
  if (kind === 'md') {
    const md = ['# Direct Strike Academy Changelog', ''].concat((store.changelog || []).map(c => `- **${c.target}** — ${c.action} by ${c.editorName} (${new Date(c.timestamp).toLocaleString('en-US')})\n  - ${c.note}`)).join('\n');
    return text(200, md, 'text/markdown; charset=utf-8');
  }
  return json(200, safeAdminState(store));
}

async function clearData(event) {
  const ctx = await requireUser(event);
  if (!ctx || !hasPerm(ctx.user, 'clear')) return json(403, { error: 'Only owner can clear admin data.' });
  const blank = emptyStore();
  blank.generatedBy = ctx.user.editorId;
  blank.changelog.unshift({ changeId: id('change'), timestamp: now(), editorId: ctx.user.editorId, editorName: ctx.user.displayName, editorRole: ctx.user.role, scopeRace: ctx.user.scopeRace, dataset: 'system', action: 'clear backend data', target: 'Admin backend store', note: 'Cleared backend admin store.' });
  const saved = await writeStore(blank);
  return json(200, { ok: true, state: safeAdminState(saved) });
}

function routeFrom(event) {
  const raw = event.rawUrl || event.path || '';
  const url = new URL(raw, 'https://local.example');
  const parts = url.pathname.split('/').filter(Boolean);
  const idx = parts.findIndex(p => p === 'dsa-admin' || p === 'admin');
  if (idx >= 0) return '/' + parts.slice(idx + 1).join('/');
  const apiIdx = parts.findIndex(p => p === 'api');
  if (apiIdx >= 0) return '/' + parts.slice(apiIdx + 2).join('/');
  return '/';
}

async function lambdaHandler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  try {
    const route = routeFrom(event);
    if (event.httpMethod === 'GET' && (route === '/' || route === '/health')) {
      return json(200, { ok: true, service: 'dsa-admin', route, message: 'Direct Strike Academy admin function is responding.' });
    }
    if (event.httpMethod === 'GET' && (route === '/public' || route === '/public-data')) return await publicData();
    if (event.httpMethod === 'GET' && (route === '/login-users' || route === '/users-public')) return await loginUsersData();
    if (event.httpMethod === 'GET' && route === '/worst-builds') return await getWorstBuilds();
    if (event.httpMethod === 'POST' && route === '/worst-builds/submit') return await submitWorstBuild(event);
    if (event.httpMethod === 'POST' && route === '/worst-builds/vote') return await voteWorstBuild(event);
    if (event.httpMethod === 'POST' && route === '/auth') return await auth(event);
    if (event.httpMethod === 'GET' && route === '/state') return await adminState(event);
    if (event.httpMethod === 'POST' && route === '/change') return await saveChange(event);
    if (event.httpMethod === 'POST' && route === '/users') return await saveUser(event);
    if (event.httpMethod === 'GET' && route === '/export-js') return await exportData(event, 'js');
    if (event.httpMethod === 'GET' && route === '/export-json') return await exportData(event, 'json');
    if (event.httpMethod === 'GET' && route === '/export-md') return await exportData(event, 'md');
    if (event.httpMethod === 'POST' && route === '/clear') return await clearData(event);
    return json(404, { error: `Unknown admin API route: ${route}`, method: event.httpMethod, path: event.path, rawUrl: event.rawUrl });
  } catch (err) {
    console.error(err);
    return json(500, { error: err.message || 'Server error.' });
  }
}


function headersToObject(headers) {
  const out = {};
  try {
    headers.forEach((value, key) => { out[key.toLowerCase()] = value; });
  } catch (err) {}
  return out;
}

function lambdaResponseToWeb(result) {
  const headers = result.headers || {};
  return new Response(result.body || '', {
    status: result.statusCode || 200,
    headers
  });
}

export default async function dsaAdminFunction(request, context) {
  const body = request.method === 'GET' || request.method === 'HEAD' ? '' : await request.text();
  const url = new URL(request.url);
  const event = {
    httpMethod: request.method,
    headers: headersToObject(request.headers),
    rawUrl: request.url,
    path: url.pathname,
    body,
    queryStringParameters: Object.fromEntries(url.searchParams.entries())
  };
  const result = await lambdaHandler(event, context);
  return lambdaResponseToWeb(result);
}

export const config = {
  path: ['/api/admin/*']
};
