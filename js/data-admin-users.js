/*
  Login display hints only.
  Real passwords, roles, and abilities are handled by Netlify Functions + Netlify Blobs.
  The backend returns the current safe editor list after deployment.
*/
window.DSA_ADMIN_USERS = window.DSA_ADMIN_USERS || [
  { editorId: 'isaac', displayName: 'Isaac / Owner', role: 'owner', scopeRace: 'All', permissions: ['all'] },
  { editorId: 'zerg-editor', displayName: 'Zerg Editor', role: 'race-editor', scopeRace: 'Zerg', permissions: ['threat', 'tier', 'guides', 'feedback'] },
  { editorId: 'terran-editor', displayName: 'Terran Editor', role: 'race-editor', scopeRace: 'Terran', permissions: ['threat', 'tier', 'guides', 'racePages', 'feedback'] },
  { editorId: 'protoss-editor', displayName: 'Protoss Editor', role: 'race-editor', scopeRace: 'Protoss', permissions: ['threat', 'tier', 'guides', 'racePages', 'feedback'] },
  { editorId: 'reviewer', displayName: 'Strategy Reviewer', role: 'reviewer', scopeRace: 'All', permissions: ['guides', 'feedback'] }
];
