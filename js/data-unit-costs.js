/*
  Direct Strike standard-mode unit mineral costs.
  Source: Isaac, from official patch history (ds-rating.com),
  last standard changes 2024-11-30 / 2024-12-16.
  Keyed by image slug (same slug() convention as the rest of the site).
  Used by scenario-theater.js for per-side cost chips.
*/
window.DSA_UNIT_COSTS = window.DSA_UNIT_COSTS || {
  /* Terran */
  'marine': 50,
  'marauder': 100,
  'reaper': 70,
  'hellion': 100,
  'hellbat': 80,
  'ghost': 230,
  'widow-mine': 105,
  'cyclone': 140,
  'medivac': 120,
  'banshee': 150,
  'viking': 150,
  'raven': 225,
  'siege-tank': 260,
  'liberator': 235,
  'thor': 425,
  'battlecruiser': 500,
  /* Protoss */
  'zealot': 80,
  'adept': 90,
  'stalker': 115,
  'sentry': 125,
  'dark-templar': 175,
  'high-templar': 265,
  'archon': 265,           /* shares HT slot cost */
  'immortal': 245,
  'colossus': 300,
  'disruptor': 250,
  'observer': 125,
  'oracle': 140,
  'phoenix': 135,
  'void-ray': 240,
  'carrier': 475,
  'tempest': 325,
  'mothership': 700,
  /* Zerg */
  'zergling': 20,
  'baneling': 45,
  'roach': 80,
  'ravager': 180,
  'hydralisk': 100,
  'lurker': 315,
  'queen': 160,
  'infestor': 175,
  'viper': 200,
  'muta': 80,              /* Mutalisk */
  'corruptor': 160,
  'brood-lord': 325,
  'swarm-host': 215,
  'ultralisk': 325,
  'overseer': 100
};

/* Tech tier costs (not per-unit; useful for cost notes on T2/T3 scenarios) */
window.DSA_TECH_COSTS = window.DSA_TECH_COSTS || { t2: 250, t3: 450 };
