window.DSA_ADMIN_SCHEMA = {
  version: 3,
  races: ['Zerg', 'Terran', 'Protoss'],
  positions: ['First', 'Second', 'Third', 'Any'],
  priorities: ['Low', 'Medium', 'High', 'Critical'],
  skillCaps: ['Low', 'Medium', 'High', 'Expert'],
  tiers: ['S', 'A', 'B', 'C', 'D', 'F'],
  permissions: [
    { id: 'users', label: 'Manage passwords/users' },
    { id: 'threat', label: 'Edit threat responses' },
    { id: 'tier', label: 'Edit existing tier rows' },
    { id: 'unit', label: 'Patch unit notes' },
    { id: 'matchup', label: 'Patch general matchup notes' },
    { id: 'guides', label: 'Add strategy database guides' },
    { id: 'racePages', label: 'Add TvT/PvP page sections' },
    { id: 'feedback', label: 'Submit feedback/site ideas' },
    { id: 'builds', label: 'Moderate Worst Build submissions' },
    { id: 'export', label: 'Export permanent publish file' },
    { id: 'clear', label: 'Clear local drafts' }
  ],
  guideCategories: ['Build Order', 'Timing', 'Counter Guide', 'Macro', 'Micro', 'Team Strategy', 'Meta Note', 'Cheese', 'Lategame'],
  racePages: [
    { value: 'tvt', label: 'TvT Strategy Page' },
    { value: 'pvp', label: 'PvP Strategy Page' }
  ]
};
