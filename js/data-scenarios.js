/*
  Battle scenario data for scenario-theater.js.
  Plain objects so non-programmers (and later the admin pipeline) can edit.

  Fields:
   - guideId: ties the scenario to a strategy guide; the sidebar shows a
     "Watch it play out" button on that guide's card.
   - threats: matchup-helper enemyThreat names that surface this scenario.
   - fx: impact flash style — 'storm' (cyan) | 'fungal' (green) | 'nova' (violet) | 'mine' (orange).
   - blink: true → enemy units teleport mid-pass (Stalker blink) instead of drifting.
   - costNote: optional text shown next to the mineral chips (e.g. tech-cost context).
   - Coordinates: x/y are % of the stage. Allies x 2-38, enemies x 62-96.
   - Mineral balance: side totals computed from DSA_UNIT_COSTS; target gap ≤200
     unless tech costs justify more (DSA_TECH_COSTS: t2 250, t3 450).
*/
window.DSA_SCENARIOS = window.DSA_SCENARIOS || [
  {
    id: 'scn-marine-clump-baneling',
    guideId: 'guide-meat-shield-economics',
    title: 'Clumped Marines vs Banelings & Storm',
    lesson: 'A Marine ball is one big AoE target. Banelings and storm farm the clump for free value. Spread Marauders soak the same hits and keep fighting.',
    races: ['Terran'],
    threats: ['Baneling', 'High Templar', 'Zergling'],
    fx: 'mine',
    badSetup: {
      label: 'Marine clump',
      formation: 'clump',
      units: [
        { name: 'Marine', x: 22, y: 38 },
        { name: 'Marine', x: 28, y: 32 },
        { name: 'Marine', x: 28, y: 46 },
        { name: 'Marine', x: 34, y: 38 },
        { name: 'Marine', x: 22, y: 52 },
        { name: 'Marine', x: 34, y: 52 }
      ]
    },
    goodSetup: {
      label: 'Spread Marauders',
      formation: 'spread',
      units: [
        { name: 'Marauder', x: 12, y: 14 },
        { name: 'Marauder', x: 30, y: 28 },
        { name: 'Marauder', x: 16, y: 46 },
        { name: 'Marauder', x: 32, y: 62 },
        { name: 'Marauder', x: 12, y: 80 }
      ]
    },
    enemy: {
      units: [
        { name: 'Baneling', x: 72, y: 28 },
        { name: 'Baneling', x: 80, y: 46 },
        { name: 'Baneling', x: 72, y: 64 },
        { name: 'Zergling', x: 88, y: 38 },
        { name: 'Zergling', x: 88, y: 56 },
        { name: 'Roach', x: 94, y: 30 },
        { name: 'Roach', x: 94, y: 62 }
      ]
    },
    outcome: {
      bad: 'Banelings detonate once and the whole Marine ball evaporates.',
      good: 'Each Baneling trades into one Marauder\'s armor. The line holds.'
    }
  },
  {
    id: 'scn-hydra-storm-buffer',
    guideId: 'guide-storm-value-basics',
    title: 'Hydra Clump vs High Templar Storm',
    lesson: 'Storm value comes from clumps. A Roach buffer in front plus spread Hydras makes each storm land on cheap HP instead of your damage units.',
    races: ['Zerg'],
    threats: ['High Templar'],
    fx: 'storm',
    badSetup: {
      label: 'Hydra clump',
      formation: 'clump',
      units: [
        { name: 'Hydralisk', x: 22, y: 34 },
        { name: 'Hydralisk', x: 30, y: 28 },
        { name: 'Hydralisk', x: 30, y: 44 },
        { name: 'Hydralisk', x: 22, y: 50 },
        { name: 'Hydralisk', x: 36, y: 36 },
        { name: 'Hydralisk', x: 36, y: 52 }
      ]
    },
    goodSetup: {
      label: 'Roach buffer + spread',
      formation: 'buffer',
      units: [
        { name: 'Roach', x: 34, y: 20 },
        { name: 'Roach', x: 36, y: 44 },
        { name: 'Roach', x: 34, y: 70 },
        { name: 'Hydralisk', x: 14, y: 14 },
        { name: 'Hydralisk', x: 18, y: 44 },
        { name: 'Hydralisk', x: 14, y: 76 }
      ]
    },
    enemy: {
      units: [
        { name: 'High Templar', x: 76, y: 32 },
        { name: 'High Templar', x: 76, y: 58 },
        { name: 'Zealot', x: 88, y: 30 },
        { name: 'Zealot', x: 88, y: 58 }
      ]
    },
    outcome: {
      bad: 'One storm hits all six Hydras. The wave dies before it shoots.',
      good: 'Storms land on Roach HP. Spread Hydras keep firing through it.'
    }
  },
  {
    id: 'scn-zvz-muta-spread',
    guideId: 'guide-viper-pivot',
    guideIds: ['guide-viper-pivot', 'guide-zvz-muta-window'],
    title: 'ZvZ Muta Flock vs Viper',
    lesson: 'A stacked Muta flock is one parasitic bomb away from deletion. Spread the flock, and answer their Viper with your own — or start the Hydra switch.',
    races: ['Zerg'],
    threats: ['Muta', 'Viper'],
    fx: 'fungal',
    badSetup: {
      label: 'Stacked flock',
      formation: 'clump',
      units: [
        { name: 'Muta', x: 24, y: 30 },
        { name: 'Muta', x: 30, y: 24 },
        { name: 'Muta', x: 30, y: 38 },
        { name: 'Muta', x: 24, y: 46 },
        { name: 'Muta', x: 36, y: 32 },
        { name: 'Muta', x: 36, y: 46 }
      ]
    },
    goodSetup: {
      label: 'Spread + your own Viper',
      formation: 'spread',
      units: [
        { name: 'Muta', x: 12, y: 12 },
        { name: 'Muta', x: 30, y: 24 },
        { name: 'Muta', x: 14, y: 48 },
        { name: 'Muta', x: 30, y: 70 },
        { name: 'Viper', x: 8, y: 80 },
        { name: 'Hydralisk', x: 20, y: 88 }
      ]
    },
    enemy: {
      units: [
        { name: 'Muta', x: 72, y: 26 },
        { name: 'Muta', x: 80, y: 40 },
        { name: 'Muta', x: 72, y: 56 },
        { name: 'Viper', x: 90, y: 42 }
      ]
    },
    outcome: {
      bad: 'One parasitic bomb melts the entire stack. Their Viper paid for itself.',
      good: 'The bomb catches one Muta. Your Viper trades back while the Hydra switch begins.'
    }
  },
  {
    id: 'scn-lib-overbuild-stalkers',
    guideId: 'guide-three-liberators-too-many',
    title: 'Liberator Overbuild vs Stalker Counts',
    lesson: 'Liberators are strong, but three early ones starve your ground wave. Enough Stalkers shoot them down for free. Mix tanks and bio instead.',
    races: ['Terran'],
    threats: ['Liberator'],
    fx: 'storm',
    badSetup: {
      label: 'Triple Liberator, thin ground',
      formation: 'clump',
      units: [
        { name: 'Liberator', x: 22, y: 16 },
        { name: 'Liberator', x: 32, y: 24 },
        { name: 'Liberator', x: 22, y: 32 },
        { name: 'Marine', x: 28, y: 62 },
        { name: 'Marine', x: 18, y: 70 }
      ]
    },
    goodSetup: {
      label: 'One Liberator + ground core',
      formation: 'mix',
      units: [
        { name: 'Liberator', x: 24, y: 14 },
        { name: 'Siege Tank', x: 14, y: 42 },
        { name: 'Marauder', x: 32, y: 40 },
        { name: 'Marine', x: 30, y: 60 },
        { name: 'Marine', x: 16, y: 66 },
        { name: 'Marine', x: 24, y: 80 }
      ]
    },
    enemy: {
      units: [
        { name: 'Stalker', x: 72, y: 18 },
        { name: 'Stalker', x: 82, y: 28 },
        { name: 'Stalker', x: 72, y: 44 },
        { name: 'Stalker', x: 82, y: 58 },
        { name: 'Stalker', x: 72, y: 72 },
        { name: 'Stalker', x: 88, y: 44 }
      ]
    },
    outcome: {
      bad: 'Stalkers focus the Liberators down, then walk through two Marines.',
      good: 'Tank and bio hold the ground while one Liberator zones safely.'
    }
  },
  {
    id: 'scn-fungal-spacing',
    guideId: 'guide-fungal-spacing',
    title: 'Marine Spacing vs Infestor Fungal',
    lesson: 'Fungal value is decided by your spacing before the cast. The same eight Marines either die as one clump or fight on in spaced out rows.',
    races: ['Terran'],
    threats: ['Infestor'],
    fx: 'fungal',
    badSetup: {
      label: 'One Marine ball',
      formation: 'clump',
      units: [
        { name: 'Marine', x: 24, y: 32 },
        { name: 'Marine', x: 30, y: 26 },
        { name: 'Marine', x: 30, y: 40 },
        { name: 'Marine', x: 24, y: 46 },
        { name: 'Marine', x: 36, y: 30 },
        { name: 'Marine', x: 36, y: 44 },
        { name: 'Marine', x: 30, y: 54 },
        { name: 'Marine', x: 24, y: 60 }
      ]
    },
    goodSetup: {
      label: 'Spaced out rows',
      formation: 'spread',
      units: [
        { name: 'Marine', x: 10, y: 12 },
        { name: 'Marine', x: 26, y: 18 },
        { name: 'Marine', x: 14, y: 34 },
        { name: 'Marine', x: 30, y: 42 },
        { name: 'Marine', x: 10, y: 56 },
        { name: 'Marine', x: 26, y: 64 },
        { name: 'Marine', x: 14, y: 80 },
        { name: 'Marine', x: 32, y: 86 }
      ]
    },
    enemy: {
      units: [
        { name: 'Infestor', x: 80, y: 34 },
        { name: 'Infestor', x: 80, y: 56 },
        { name: 'Zergling', x: 70, y: 26 },
        { name: 'Zergling', x: 70, y: 44 },
        { name: 'Zergling', x: 70, y: 62 },
        { name: 'Zergling', x: 90, y: 44 }
      ]
    },
    outcome: {
      bad: 'One fungal locks all eight Marines. The lings eat them for free.',
      good: 'The cast catches two. Six keep shooting and the wave trades up.'
    }
  },
  {
    id: 'scn-archon-starvation',
    guideId: 'guide-archon-starvation',
    title: 'Feeding the Archon vs Starving It',
    lesson: 'Archons feast on cheap clumped units. Hydras at max range behind spread Roaches give the splash nothing worth hitting.',
    races: ['Zerg'],
    threats: ['Archon'],
    fx: 'storm',
    badSetup: {
      label: 'Ling/Bane/Muta clump',
      formation: 'clump',
      units: [
        { name: 'Zergling', x: 26, y: 30 },
        { name: 'Zergling', x: 32, y: 26 },
        { name: 'Zergling', x: 32, y: 38 },
        { name: 'Zergling', x: 26, y: 44 },
        { name: 'Zergling', x: 38, y: 32 },
        { name: 'Zergling', x: 38, y: 44 },
        { name: 'Zergling', x: 26, y: 56 },
        { name: 'Zergling', x: 34, y: 56 },
        { name: 'Baneling', x: 22, y: 36 },
        { name: 'Baneling', x: 22, y: 50 },
        { name: 'Baneling', x: 30, y: 48 },
        { name: 'Baneling', x: 36, y: 50 },
        { name: 'Muta', x: 28, y: 16 },
        { name: 'Muta', x: 36, y: 18 },
        { name: 'Muta', x: 22, y: 22 }
      ]
    },
    goodSetup: {
      label: 'Roach front, Hydra range',
      formation: 'buffer',
      units: [
        { name: 'Roach', x: 34, y: 22 },
        { name: 'Roach', x: 36, y: 46 },
        { name: 'Roach', x: 34, y: 70 },
        { name: 'Hydralisk', x: 12, y: 16 },
        { name: 'Hydralisk', x: 16, y: 40 },
        { name: 'Hydralisk', x: 12, y: 62 },
        { name: 'Hydralisk', x: 16, y: 82 }
      ]
    },
    enemy: {
      units: [
        { name: 'Archon', x: 74, y: 34 },
        { name: 'Archon', x: 74, y: 58 },
        { name: 'Zealot', x: 86, y: 30 },
        { name: 'Zealot', x: 86, y: 60 }
      ]
    },
    outcome: {
      bad: 'Every splash hits five cheap units. The Archons never stop earning.',
      good: 'Splash lands on two Roaches while Hydras shred the HP ball from range.'
    }
  },
  {
    id: 'scn-mine-nova-bait',
    guideId: 'guide-widowmine-disruptor-bait',
    title: 'Widow Mines: Nova Shields, Not Squad Members',
    lesson: 'Disruptor shots prioritize your mines. Tucked inside the army they get everyone killed; parked on the flanks and back they eat novas for 105 minerals apiece, far from your real units.',
    races: ['Terran'],
    threats: ['Disruptor'],
    fx: 'nova',
    badSetup: {
      label: 'Mines inside the ball',
      formation: 'clump',
      units: [
        { name: 'Widow Mine', x: 26, y: 36 },
        { name: 'Widow Mine', x: 32, y: 44 },
        { name: 'Widow Mine', x: 26, y: 52 },
        { name: 'Widow Mine', x: 32, y: 58 },
        { name: 'Marauder', x: 22, y: 40 },
        { name: 'Marauder', x: 28, y: 30 },
        { name: 'Marauder', x: 22, y: 56 },
        { name: 'Marauder', x: 30, y: 64 }
      ]
    },
    goodSetup: {
      label: 'Mines on the flanks and back',
      formation: 'buffer',
      units: [
        { name: 'Widow Mine', x: 22, y: 6 },
        { name: 'Widow Mine', x: 34, y: 8 },
        { name: 'Widow Mine', x: 22, y: 92 },
        { name: 'Widow Mine', x: 6, y: 48 },
        { name: 'Marauder', x: 26, y: 30 },
        { name: 'Marauder', x: 32, y: 44 },
        { name: 'Marauder', x: 26, y: 58 },
        { name: 'Marauder', x: 32, y: 70 }
      ]
    },
    enemy: {
      units: [
        { name: 'Disruptor', x: 78, y: 36 },
        { name: 'Disruptor', x: 78, y: 58 },
        { name: 'Stalker', x: 88, y: 28 },
        { name: 'Stalker', x: 88, y: 48 },
        { name: 'Stalker', x: 88, y: 66 }
      ]
    },
    outcome: {
      bad: 'Novas aimed at mines vaporize the Marauders packed around them.',
      good: 'Both novas detonate on lone mines. The Marauder line walks through.'
    }
  },
  {
    id: 'scn-swarmhost-magnet',
    guideId: 'guide-swarmhost-nova-magnet',
    title: 'The Unburrowed Swarmhost Nova Magnet',
    lesson: 'Burrow autocast off, Swarmhost tucked on the back edge of your wave: Disruptors still prioritize it, but nothing kills it before the novas commit — 215 minerals soaks shots meant for 500 of Hydras.',
    races: ['Zerg'],
    threats: ['Disruptor'],
    fx: 'nova',
    badSetup: {
      label: 'Hydra line, no bait',
      formation: 'clump',
      units: [
        { name: 'Hydralisk', x: 22, y: 26 },
        { name: 'Hydralisk', x: 28, y: 34 },
        { name: 'Hydralisk', x: 22, y: 44 },
        { name: 'Hydralisk', x: 28, y: 54 },
        { name: 'Hydralisk', x: 22, y: 64 },
        { name: 'Hydralisk', x: 28, y: 72 }
      ]
    },
    goodSetup: {
      label: 'Swarmhost on the back edge',
      formation: 'buffer',
      units: [
        { name: 'Swarm Host', x: 6, y: 10 },
        { name: 'Hydralisk', x: 20, y: 24 },
        { name: 'Hydralisk', x: 26, y: 40 },
        { name: 'Hydralisk', x: 20, y: 54 },
        { name: 'Hydralisk', x: 26, y: 70 },
        { name: 'Hydralisk', x: 20, y: 86 }
      ]
    },
    enemy: {
      units: [
        { name: 'Disruptor', x: 78, y: 38 },
        { name: 'Disruptor', x: 78, y: 58 },
        { name: 'Adept', x: 90, y: 34 },
        { name: 'Adept', x: 90, y: 62 }
      ]
    },
    outcome: {
      bad: 'Both novas land in the Hydra line. The wave\'s damage is gone.',
      good: 'The Swarmhost eats both shots. Every Hydra is still firing.'
    }
  },
  {
    id: 'scn-ghost-ultra-trap',
    guideId: 'guide-ghost-ultra-trap',
    title: 'Ghosts vs Ultras: The Intuitive Trap',
    lesson: 'Ghost snipe feels like the designed answer to Ultralisks. Tanks behind spread Marauders is what actually holds the charge.',
    races: ['Terran'],
    threats: ['Ultralisk'],
    fx: 'mine',
    badSetup: {
      label: 'Ghosts + clumped bio',
      formation: 'clump',
      units: [
        { name: 'Ghost', x: 18, y: 38 },
        { name: 'Ghost', x: 18, y: 52 },
        { name: 'Marine', x: 26, y: 32 },
        { name: 'Marine', x: 32, y: 38 },
        { name: 'Marine', x: 26, y: 46 },
        { name: 'Marine', x: 32, y: 52 },
        { name: 'Marauder', x: 26, y: 58 },
        { name: 'Marauder', x: 32, y: 64 },
        { name: 'Marauder', x: 26, y: 70 },
        { name: 'Marauder', x: 36, y: 44 },
        { name: 'Marauder', x: 36, y: 58 }
      ]
    },
    goodSetup: {
      label: 'Tanks behind spread Marauders',
      formation: 'buffer',
      units: [
        { name: 'Siege Tank', x: 10, y: 34 },
        { name: 'Siege Tank', x: 10, y: 60 },
        { name: 'Marauder', x: 30, y: 12 },
        { name: 'Marauder', x: 34, y: 30 },
        { name: 'Marauder', x: 30, y: 48 },
        { name: 'Marauder', x: 34, y: 64 },
        { name: 'Marauder', x: 30, y: 80 },
        { name: 'Marauder', x: 22, y: 46 }
      ]
    },
    enemy: {
      units: [
        { name: 'Ultralisk', x: 72, y: 28 },
        { name: 'Ultralisk', x: 72, y: 50 },
        { name: 'Ultralisk', x: 72, y: 72 },
        { name: 'Queen', x: 88, y: 38 },
        { name: 'Queen', x: 88, y: 60 }
      ]
    },
    outcome: {
      bad: 'The Ultras trample the clump before the Ghosts finish one snipe.',
      good: 'Spread Marauders slow the charge while Tanks break it from behind.'
    }
  },
  {
    id: 'scn-ling-thor-surround',
    guideId: 'guide-ling-thor-surrounds',
    title: 'Feeding Thors vs Surrounding Them',
    lesson: 'Roach, Hydra, and Queen all feed Thors. A Zergling flood wraps around the line and kills 425 minerals with 20-mineral units.',
    races: ['Zerg'],
    threats: ['Thor'],
    fx: 'mine',
    badSetup: {
      label: 'More Roach/Hydra/Queen',
      formation: 'clump',
      units: [
        { name: 'Roach', x: 28, y: 28 },
        { name: 'Roach', x: 34, y: 36 },
        { name: 'Roach', x: 28, y: 44 },
        { name: 'Roach', x: 34, y: 52 },
        { name: 'Hydralisk', x: 20, y: 32 },
        { name: 'Hydralisk', x: 20, y: 46 },
        { name: 'Hydralisk', x: 20, y: 60 },
        { name: 'Hydralisk', x: 28, y: 60 },
        { name: 'Queen', x: 12, y: 46 }
      ]
    },
    goodSetup: {
      label: 'Ling flood + Hydra core',
      formation: 'mix',
      units: [
        { name: 'Zergling', x: 36, y: 10 },
        { name: 'Zergling', x: 38, y: 26 },
        { name: 'Zergling', x: 38, y: 42 },
        { name: 'Zergling', x: 38, y: 58 },
        { name: 'Zergling', x: 38, y: 74 },
        { name: 'Zergling', x: 36, y: 88 },
        { name: 'Zergling', x: 30, y: 18 },
        { name: 'Zergling', x: 30, y: 80 },
        { name: 'Roach', x: 24, y: 32 },
        { name: 'Roach', x: 24, y: 64 },
        { name: 'Hydralisk', x: 12, y: 24 },
        { name: 'Hydralisk', x: 14, y: 42 },
        { name: 'Hydralisk', x: 12, y: 58 },
        { name: 'Hydralisk', x: 14, y: 76 },
        { name: 'Hydralisk', x: 8, y: 42 }
      ]
    },
    enemy: {
      units: [
        { name: 'Thor', x: 76, y: 36 },
        { name: 'Thor', x: 76, y: 62 },
        { name: 'Marine', x: 90, y: 34 },
        { name: 'Marine', x: 90, y: 60 }
      ]
    },
    outcome: {
      bad: 'The Thors chew the Roach/Hydra mass and the Queen heals nothing.',
      good: 'Lings wrap the Thor line while Hydras pour damage in from range.'
    }
  },
  {
    id: 'scn-stalker-backline',
    guideId: 'guide-stalker-backline',
    title: 'Stalkers Blink Behind You. Build at the Back of Your Square.',
    lesson: 'Stalkers blink repeatedly backwards toward the cannon, and if your units are placed forward, your army lets them chain two or three blinks and land behind the enemy cannon, stacking with the next teammate\'s wave. Built at the back of your square, they cant activate blink until they are in range making it much more difficult to blink back to the cannon.',
    races: ['Terran'],
    threats: ['Stalker'],
    fx: 'storm',
    blink: true,
    badSetup: {
      label: 'Army placed forward',
      formation: 'clump',
      units: [
        { name: 'Marine', x: 30, y: 26 },
        { name: 'Marine', x: 36, y: 36 },
        { name: 'Marine', x: 30, y: 46 },
        { name: 'Marine', x: 36, y: 56 },
        { name: 'Marauder', x: 30, y: 64 },
        { name: 'Marauder', x: 36, y: 18 }
      ]
    },
    goodSetup: {
      label: 'Army at the far back',
      formation: 'spread',
      units: [
        { name: 'Marine', x: 6, y: 22 },
        { name: 'Marine', x: 12, y: 34 },
        { name: 'Marine', x: 6, y: 50 },
        { name: 'Marine', x: 12, y: 64 },
        { name: 'Marauder', x: 6, y: 78 },
        { name: 'Marauder', x: 14, y: 12 }
      ]
    },
    enemy: {
      units: [
        { name: 'Stalker', x: 74, y: 26 },
        { name: 'Stalker', x: 82, y: 40 },
        { name: 'Stalker', x: 74, y: 56 },
        { name: 'Stalker', x: 82, y: 70 }
      ]
    },
    outcome: {
      bad: 'They chain blinks past your forward line and stack behind the cannon onto your teammate\'s lane.',
      good: 'They walk most of the square first — the blinks are spent before they reach anything worth hitting.'
    }
  },
  {
    id: 'scn-adept-rauder-front',
    guideId: 'guide-adept-rauder-front',
    title: 'Adepts Eat Light Units. Front the Marauders.',
    lesson: 'Adepts deal bonus damage to light units like Marines. Marauders in front deny the bonus and absorb the opener.',
    races: ['Terran'],
    threats: ['Adept'],
    fx: 'mine',
    badSetup: {
      label: 'Marines in front',
      formation: 'clump',
      units: [
        { name: 'Marine', x: 34, y: 20 },
        { name: 'Marine', x: 36, y: 34 },
        { name: 'Marine', x: 34, y: 48 },
        { name: 'Marine', x: 36, y: 62 },
        { name: 'Marine', x: 34, y: 76 },
        { name: 'Marine', x: 26, y: 28 },
        { name: 'Marine', x: 26, y: 54 },
        { name: 'Marine', x: 26, y: 70 }
      ]
    },
    goodSetup: {
      label: 'Marauders front, Marines back',
      formation: 'buffer',
      units: [
        { name: 'Marauder', x: 36, y: 24 },
        { name: 'Marauder', x: 38, y: 46 },
        { name: 'Marauder', x: 36, y: 68 },
        { name: 'Marine', x: 14, y: 22 },
        { name: 'Marine', x: 18, y: 40 },
        { name: 'Marine', x: 14, y: 58 },
        { name: 'Marine', x: 18, y: 76 }
      ]
    },
    enemy: {
      units: [
        { name: 'Adept', x: 74, y: 24 },
        { name: 'Adept', x: 82, y: 38 },
        { name: 'Adept', x: 74, y: 54 },
        { name: 'Adept', x: 82, y: 68 },
        { name: 'Sentry', x: 92, y: 46 }
      ]
    },
    outcome: {
      bad: 'The light-unit bonus melts the Marine front before it does damage.',
      good: 'Adepts waste their bonus on armor while the Marines shoot from safety.'
    }
  },
  {
    id: 'scn-bc-team-response',
    guideId: 'guide-bc-is-a-team-fight',
    title: 'Battlecruisers vs the Corruptor Committee',
    lesson: 'Pure ground feeds Battlecruisers. Hydra rows with Corruptors sprinkled in — then Viper parasitic bomb — is the Zerg half of the team answer.',
    races: ['Zerg'],
    threats: ['Battlecruiser'],
    fx: 'mine',
    costNote: 'BC also paid ~700 minerals in T2+T3 tech, so bigger gaps are fair here.',
    badSetup: {
      label: 'Pure Hydra ground',
      formation: 'clump',
      units: [
        { name: 'Hydralisk', x: 22, y: 22 },
        { name: 'Hydralisk', x: 28, y: 30 },
        { name: 'Hydralisk', x: 22, y: 38 },
        { name: 'Hydralisk', x: 28, y: 46 },
        { name: 'Hydralisk', x: 22, y: 54 },
        { name: 'Hydralisk', x: 28, y: 62 },
        { name: 'Hydralisk', x: 22, y: 70 },
        { name: 'Hydralisk', x: 28, y: 78 }
      ]
    },
    goodSetup: {
      label: 'Hydra rows + Corruptor/Viper',
      formation: 'mix',
      units: [
        { name: 'Hydralisk', x: 24, y: 20 },
        { name: 'Hydralisk', x: 24, y: 42 },
        { name: 'Hydralisk', x: 24, y: 64 },
        { name: 'Hydralisk', x: 24, y: 84 },
        { name: 'Corruptor', x: 12, y: 16 },
        { name: 'Corruptor', x: 12, y: 46 },
        { name: 'Corruptor', x: 12, y: 76 },
        { name: 'Viper', x: 4, y: 46 }
      ]
    },
    enemy: {
      units: [
        { name: 'Battlecruiser', x: 76, y: 34 },
        { name: 'Battlecruiser', x: 76, y: 62 }
      ]
    },
    outcome: {
      bad: 'Yamato picks off Hydras at leisure. A leaked BC heads for your teammate.',
      good: 'Corruptors hold the sky while the parasitic bomb makes both hulls pay rent.'
    }
  },
  {
    id: 'scn-archon-spine-pvp',
    guideId: 'guide-pvp-archon-spine',
    title: 'PvP: HP Spine vs Glass Cannon',
    lesson: 'The mirror is an HP contest. Stalker/Adept mass folds to Archon splash; Archons in front with Zealot feed and one Immortal wins the long fight.',
    races: ['Protoss'],
    threats: ['Archon', 'Immortal'],
    fx: 'storm',
    badSetup: {
      label: 'Stalker/Adept mass',
      formation: 'clump',
      units: [
        { name: 'Stalker', x: 24, y: 22 },
        { name: 'Stalker', x: 30, y: 32 },
        { name: 'Stalker', x: 24, y: 42 },
        { name: 'Stalker', x: 30, y: 52 },
        { name: 'Adept', x: 24, y: 62 },
        { name: 'Adept', x: 30, y: 72 },
        { name: 'Adept', x: 24, y: 80 }
      ]
    },
    goodSetup: {
      label: 'Archon front, Zealot feed',
      formation: 'buffer',
      units: [
        { name: 'Archon', x: 34, y: 32 },
        { name: 'Archon', x: 34, y: 62 },
        { name: 'Zealot', x: 24, y: 24 },
        { name: 'Zealot', x: 24, y: 70 },
        { name: 'Immortal', x: 12, y: 46 }
      ]
    },
    enemy: {
      units: [
        { name: 'Archon', x: 74, y: 34 },
        { name: 'Archon', x: 74, y: 62 },
        { name: 'Immortal', x: 88, y: 48 },
        { name: 'Zealot', x: 86, y: 22 }
      ]
    },
    outcome: {
      bad: 'Their Archons splash the fragile mass down before your DPS matters.',
      good: 'Your spine outlasts theirs, and the Immortal cracks whatever is left.'
    }
  },
  {
    id: 'scn-zealot-falloff',
    guideId: 'guide-zealot-falloff-clock',
    title: 'Zealot Opener: Panic vs Patience',
    lesson: 'Zealot openers dominate four rounds, then fall off a cliff around minute 7. Panic-teching loses the wave; a Marine/Marauder line just outlasts the clock.',
    races: ['Terran'],
    threats: ['Zealot'],
    fx: 'mine',
    badSetup: {
      label: 'Panic tech, thin wave',
      formation: 'clump',
      units: [
        { name: 'Marauder', x: 26, y: 30 },
        { name: 'Marauder', x: 26, y: 48 },
        { name: 'Marauder', x: 26, y: 66 },
        { name: 'Siege Tank', x: 12, y: 48 }
      ]
    },
    goodSetup: {
      label: 'Marine/Marauder line',
      formation: 'mix',
      units: [
        { name: 'Marauder', x: 34, y: 28 },
        { name: 'Marauder', x: 34, y: 64 },
        { name: 'Marine', x: 22, y: 14 },
        { name: 'Marine', x: 26, y: 30 },
        { name: 'Marine', x: 22, y: 46 },
        { name: 'Marine', x: 26, y: 62 },
        { name: 'Marine', x: 22, y: 78 },
        { name: 'Marine', x: 14, y: 24 },
        { name: 'Marine', x: 14, y: 54 },
        { name: 'Marine', x: 14, y: 82 }
      ]
    },
    enemy: {
      units: [
        { name: 'Zealot', x: 72, y: 18 },
        { name: 'Zealot', x: 80, y: 30 },
        { name: 'Zealot', x: 72, y: 44 },
        { name: 'Zealot', x: 80, y: 58 },
        { name: 'Zealot', x: 72, y: 72 },
        { name: 'Zealot', x: 80, y: 84 },
        { name: 'Sentry', x: 92, y: 48 }
      ]
    },
    outcome: {
      bad: 'The thin panic wave gets swarmed — and the tech never arrives in time.',
      good: 'The bio line holds the rush. By minute 7 the Zealots are paying you.'
    }
  },
  {
    id: 'scn-queen-drain',
    guideId: 'guide-queen-drain-rule',
    title: 'Out-Healing You: The Queen Line',
    lesson: 'A Queen line quietly un-takes the damage your wave deals. One Ghost drains the heal energy and a Liberator zones the rest — ignoring them is the only wrong answer.',
    races: ['Terran'],
    threats: ['Queen'],
    fx: 'nova',
    badSetup: {
      label: 'More Marines, no drain',
      formation: 'clump',
      units: [
        { name: 'Marine', x: 24, y: 18 },
        { name: 'Marine', x: 30, y: 28 },
        { name: 'Marine', x: 24, y: 38 },
        { name: 'Marine', x: 30, y: 48 },
        { name: 'Marine', x: 24, y: 58 },
        { name: 'Marine', x: 30, y: 68 },
        { name: 'Marine', x: 24, y: 78 },
        { name: 'Marine', x: 30, y: 86 },
        { name: 'Marauder', x: 16, y: 48 }
      ]
    },
    goodSetup: {
      label: 'Ghost drain + Liberator zone',
      formation: 'mix',
      units: [
        { name: 'Ghost', x: 10, y: 30 },
        { name: 'Liberator', x: 12, y: 64 },
        { name: 'Marine', x: 28, y: 22 },
        { name: 'Marine', x: 32, y: 42 },
        { name: 'Marine', x: 28, y: 62 },
        { name: 'Marine', x: 32, y: 80 }
      ]
    },
    enemy: {
      units: [
        { name: 'Queen', x: 78, y: 26 },
        { name: 'Queen', x: 78, y: 48 },
        { name: 'Queen', x: 78, y: 70 },
        { name: 'Roach', x: 90, y: 36 },
        { name: 'Roach', x: 90, y: 60 }
      ]
    },
    outcome: {
      bad: 'Every wound you deal gets healed between volleys. The wave goes nowhere.',
      good: 'Drained Queens stop healing, the Liberator zone splits them, and the line breaks.'
    }
  },
  {
    id: 'scn-widowmine-opener-pvt',
    guideId: 'guide-widowmine-hellbat-lib',
    title: 'PvT: Light Units vs the Mine/Hellbat/Lib Opener',
    lesson: 'The Widow Mine, Hellbat, Liberator opener farms Adepts and Zealots. Detection plus a high-DPS Stalker/Disruptor core defuses it.',
    races: ['Protoss'],
    threats: ['Widow Mine', 'Hellbat', 'Liberator'],
    fx: 'mine',
    badSetup: {
      label: 'Adept/Zealot wave',
      formation: 'clump',
      units: [
        { name: 'Adept', x: 28, y: 22 },
        { name: 'Adept', x: 34, y: 34 },
        { name: 'Adept', x: 28, y: 46 },
        { name: 'Adept', x: 34, y: 58 },
        { name: 'Zealot', x: 22, y: 30 },
        { name: 'Zealot', x: 22, y: 50 },
        { name: 'Zealot', x: 28, y: 68 }
      ]
    },
    goodSetup: {
      label: 'Detection + Stalker/Disruptor',
      formation: 'mix',
      units: [
        { name: 'Observer', x: 8, y: 16 },
        { name: 'Stalker', x: 30, y: 24 },
        { name: 'Stalker', x: 34, y: 46 },
        { name: 'Stalker', x: 30, y: 68 },
        { name: 'Disruptor', x: 14, y: 46 }
      ]
    },
    enemy: {
      units: [
        { name: 'Widow Mine', x: 68, y: 24 },
        { name: 'Widow Mine', x: 68, y: 48 },
        { name: 'Widow Mine', x: 68, y: 72 },
        { name: 'Hellbat', x: 80, y: 34 },
        { name: 'Hellbat', x: 80, y: 60 },
        { name: 'Liberator', x: 92, y: 46 }
      ]
    },
    outcome: {
      bad: 'Mines detonate on the light wave and the Liberator zones the survivors.',
      good: 'The Observer reveals every mine; Stalkers and a nova clear the lane.'
    }
  },
  {
    id: 'scn-immortal-overbuild-pvz',
    guideId: 'guide-immortal-overbuild',
    title: 'Mass Immortal vs the Flexible Core',
    lesson: 'Roach waves scream "build Immortals" — until the Hydras arrive. One Immortal, one Templar, and a wall of Zealots wins instead: Zealot HP per mineral keeps the storm and the Immortal alive through the pivot.',
    races: ['Protoss'],
    threats: ['Roach', 'Hydralisk'],
    fx: 'storm',
    badSetup: {
      label: 'Immortal overload',
      formation: 'clump',
      units: [
        { name: 'Immortal', x: 24, y: 28 },
        { name: 'Immortal', x: 30, y: 46 },
        { name: 'Immortal', x: 24, y: 64 }
      ]
    },
    goodSetup: {
      label: 'One Immortal + Templar + Zealot wall',
      formation: 'buffer',
      units: [
        { name: 'Zealot', x: 36, y: 22 },
        { name: 'Zealot', x: 38, y: 46 },
        { name: 'Zealot', x: 36, y: 70 },
        { name: 'Immortal', x: 22, y: 46 },
        { name: 'High Templar', x: 10, y: 46 }
      ]
    },
    enemy: {
      units: [
        { name: 'Roach', x: 70, y: 22 },
        { name: 'Roach', x: 70, y: 42 },
        { name: 'Roach', x: 70, y: 62 },
        { name: 'Roach', x: 70, y: 82 },
        { name: 'Hydralisk', x: 84, y: 30 },
        { name: 'Hydralisk', x: 84, y: 50 },
        { name: 'Hydralisk', x: 84, y: 70 }
      ]
    },
    outcome: {
      bad: 'The Hydras behind the Roaches melt three Immortals that can\'t answer back.',
      good: 'The Zealot wall soaks for cheap while the Immortal cracks Roaches and storm erases the Hydras.'
    }
  },
  {
    id: 'scn-collos-viper-abduct',
    guideId: 'guide-collos-viper-stop',
    title: 'Colossi vs Vipers: The Abduct Tax',
    lesson: 'Every Colossus you add after Vipers exist is an abduct waiting to happen. Stop at what you have, add Templar drain, and lean on Stalkers.',
    races: ['Protoss'],
    threats: ['Viper'],
    fx: 'fungal',
    badSetup: {
      label: 'Doubling down on Colossi',
      formation: 'clump',
      units: [
        { name: 'Colossus', x: 26, y: 34 },
        { name: 'Colossus', x: 26, y: 60 },
        { name: 'Zealot', x: 34, y: 26 },
        { name: 'Zealot', x: 34, y: 66 }
      ]
    },
    goodSetup: {
      label: 'Keep one, drain the Vipers',
      formation: 'mix',
      units: [
        { name: 'Colossus', x: 30, y: 46 },
        { name: 'High Templar', x: 12, y: 46 },
        { name: 'Stalker', x: 24, y: 20 },
        { name: 'Stalker', x: 26, y: 64 },
        { name: 'Stalker', x: 24, y: 84 }
      ]
    },
    enemy: {
      units: [
        { name: 'Viper', x: 78, y: 30 },
        { name: 'Viper', x: 78, y: 62 },
        { name: 'Hydralisk', x: 88, y: 22 },
        { name: 'Hydralisk', x: 88, y: 42 },
        { name: 'Hydralisk', x: 88, y: 62 },
        { name: 'Hydralisk', x: 88, y: 82 }
      ]
    },
    outcome: {
      bad: 'Both Colossi get yanked into the Hydra line and die without firing.',
      good: 'Drained Vipers can\'t abduct. The lone Colossus burns lanes all wave.'
    }
  },
  {
    id: 'scn-thor-skytoss-ground',
    guideId: 'guide-thor-skytoss-tax',
    title: 'Late Game: Thor Bank vs Air + Ground Floor',
    lesson: 'When the Thor bank appears, don\'t sell the Carriers and Void Rays you already own — and don\'t add more. Slot Immortals and Zealots underneath: the ground floor cracks the Thors while your existing air keeps working.',
    races: ['Protoss'],
    threats: ['Thor'],
    fx: 'mine',
    costNote: 'Late-game wave — roughly 2000 minerals per side.',
    badSetup: {
      label: 'Doubling down on air',
      formation: 'clump',
      units: [
        { name: 'Carrier', x: 20, y: 22 },
        { name: 'Carrier', x: 28, y: 36 },
        { name: 'Carrier', x: 20, y: 50 },
        { name: 'Void Ray', x: 28, y: 64 },
        { name: 'Void Ray', x: 20, y: 78 }
      ]
    },
    goodSetup: {
      label: 'Keep the air, add the floor',
      formation: 'mix',
      units: [
        { name: 'Carrier', x: 14, y: 16 },
        { name: 'Carrier', x: 22, y: 30 },
        { name: 'Void Ray', x: 14, y: 44 },
        { name: 'Immortal', x: 34, y: 38 },
        { name: 'Immortal', x: 34, y: 62 },
        { name: 'Zealot', x: 40, y: 22 },
        { name: 'Zealot', x: 42, y: 50 },
        { name: 'Zealot', x: 40, y: 78 }
      ]
    },
    enemy: {
      units: [
        { name: 'Thor', x: 72, y: 24 },
        { name: 'Thor', x: 72, y: 48 },
        { name: 'Thor', x: 72, y: 72 },
        { name: 'Siege Tank', x: 84, y: 36 },
        { name: 'Marauder', x: 84, y: 58 },
        { name: 'Marauder', x: 84, y: 76 },
        { name: 'Marine', x: 92, y: 20 },
        { name: 'Marine', x: 92, y: 40 },
        { name: 'Marine', x: 92, y: 60 },
        { name: 'Marine', x: 92, y: 80 }
      ]
    },
    outcome: {
      bad: 'Five more air units fly into the bank built to delete exactly them.',
      good: 'Zealots and Immortals tie up the Thors while the fleet you kept melts the wave.'
    }
  },
  {
    id: 'scn-roach-lock-mothership',
    guideId: 'guide-roach-lock-mothership',
    title: 'Mass Roach Can\'t Shoot Up',
    lesson: 'A Roach bank with a few Hydras has its minerals locked into units that can\'t hit air — and selling them bleeds value. The Mothership switch makes the whole bank dead weight.',
    races: ['Protoss'],
    threats: ['Roach'],
    fx: 'nova',
    badSetup: {
      label: 'Immortal/Zealot ground grind',
      formation: 'mix',
      units: [
        { name: 'Immortal', x: 26, y: 32 },
        { name: 'Immortal', x: 26, y: 60 },
        { name: 'Zealot', x: 36, y: 22 },
        { name: 'Zealot', x: 38, y: 46 },
        { name: 'Zealot', x: 36, y: 70 }
      ]
    },
    goodSetup: {
      label: 'Mothership switch',
      formation: 'mix',
      units: [
        { name: 'Mothership', x: 22, y: 44 }
      ]
    },
    enemy: {
      units: [
        { name: 'Roach', x: 70, y: 16 },
        { name: 'Roach', x: 78, y: 28 },
        { name: 'Roach', x: 70, y: 42 },
        { name: 'Roach', x: 78, y: 56 },
        { name: 'Roach', x: 70, y: 70 },
        { name: 'Roach', x: 78, y: 84 },
        { name: 'Hydralisk', x: 90, y: 34 },
        { name: 'Hydralisk', x: 90, y: 62 }
      ]
    },
    outcome: {
      bad: 'You win the grind slowly while their Roach bank keeps reloading every round.',
      good: 'Six Roaches stare at the sky. Two Hydras versus a Mothership is not a fight.'
    }
  },
  {
    id: 'scn-storm-pro-opener',
    guideId: 'guide-storm-the-pro-opener',
    title: 'Cracking the Hellbat/Mine/Liberator/Raven Opener',
    lesson: 'Void Rays get matrixed, mines eat light units and mass Stalker invites more Liberators. Archons soak the Hellbats while storm — mines first, then Liberators — breaks the clump for the Stalkers to finish.',
    races: ['Protoss'],
    threats: ['Widow Mine', 'Hellbat', 'Liberator', 'Raven'],
    fx: 'storm',
    badSetup: {
      label: 'Void Rays + light units',
      formation: 'clump',
      units: [
        { name: 'Void Ray', x: 22, y: 26 },
        { name: 'Void Ray', x: 28, y: 38 },
        { name: 'Void Ray', x: 22, y: 50 },
        { name: 'Adept', x: 32, y: 28 },
        { name: 'Adept', x: 32, y: 48 },
        { name: 'Zealot', x: 28, y: 62 },
        { name: 'Zealot', x: 22, y: 72 }
      ]
    },
    goodSetup: {
      label: 'Archon soak + storm micro',
      formation: 'buffer',
      units: [
        { name: 'Archon', x: 36, y: 32 },
        { name: 'Archon', x: 36, y: 60 },
        { name: 'Stalker', x: 22, y: 22 },
        { name: 'Stalker', x: 24, y: 46 },
        { name: 'Stalker', x: 22, y: 70 },
        { name: 'High Templar', x: 10, y: 46 }
      ]
    },
    enemy: {
      units: [
        { name: 'Widow Mine', x: 68, y: 26 },
        { name: 'Widow Mine', x: 68, y: 48 },
        { name: 'Widow Mine', x: 68, y: 70 },
        { name: 'Hellbat', x: 78, y: 34 },
        { name: 'Hellbat', x: 78, y: 60 },
        { name: 'Liberator', x: 88, y: 30 },
        { name: 'Liberator', x: 88, y: 58 },
        { name: 'Raven', x: 95, y: 44 }
      ]
    },
    outcome: {
      bad: 'The Raven turns off a Void Ray, mines eat the rest, Liberators clean up.',
      good: 'Storm lands on the mine line and half the Liberators\' HP. Stalkers mop up.'
    }
  },
  {
    id: 'scn-muta-vs-queen-wall',
    guideId: 'guide-zvz-muta-window',
    guideIds: ['guide-zvz-muta-window', 'guide-queen-drain-rule'],
    title: 'Muta Opener vs the Queen Wall',
    lesson: 'Six or more Queens out-heal everything Mutas deal, and Zerg has no energy drain. Sell Mutas down each round into a Hydra-heavy wave with Roach cover, then transition Lurker — Queen DPS is terrible and the panic-stop becomes a free win.',
    races: ['Zerg'],
    threats: ['Queen'],
    fx: 'fungal',
    badSetup: {
      label: 'Staying pure Muta',
      formation: 'clump',
      units: [
        { name: 'Muta', x: 22, y: 18 },
        { name: 'Muta', x: 30, y: 26 },
        { name: 'Muta', x: 22, y: 36 },
        { name: 'Muta', x: 30, y: 44 },
        { name: 'Muta', x: 22, y: 54 },
        { name: 'Muta', x: 30, y: 62 },
        { name: 'Muta', x: 22, y: 72 },
        { name: 'Muta', x: 30, y: 80 },
        { name: 'Muta', x: 14, y: 40 },
        { name: 'Muta', x: 14, y: 60 }
      ]
    },
    goodSetup: {
      label: 'Sell into 80% Hydra → Lurker',
      formation: 'mix',
      units: [
        { name: 'Roach', x: 36, y: 30 },
        { name: 'Roach', x: 36, y: 62 },
        { name: 'Hydralisk', x: 24, y: 18 },
        { name: 'Hydralisk', x: 26, y: 40 },
        { name: 'Hydralisk', x: 24, y: 60 },
        { name: 'Hydralisk', x: 26, y: 80 },
        { name: 'Lurker', x: 10, y: 46 }
      ]
    },
    enemy: {
      units: [
        { name: 'Queen', x: 72, y: 14 },
        { name: 'Queen', x: 80, y: 28 },
        { name: 'Queen', x: 72, y: 42 },
        { name: 'Queen', x: 80, y: 56 },
        { name: 'Queen', x: 72, y: 70 },
        { name: 'Queen', x: 80, y: 84 }
      ]
    },
    outcome: {
      bad: 'Transfuse undoes every Muta volley. Ten Mutas, zero kills, lost round.',
      good: 'Hydras out-range the heals and the Lurker line ends the wall. Queens can\'t shoot back well.'
    }
  },
  {
    id: 'scn-tvt-anti-reaper',
    guideId: 'guide-tvt-discipline',
    title: 'TvT: Reaper Mines vs the Marauder Screen',
    lesson: 'Reaper mines are area pushback: they blast your line backwards into a U while the Reapers wedge through the middle to split your wave. Two Marauders spaced way out front eat the knockback instead — then your Marines catch up and kill everything.',
    races: ['Terran'],
    threats: ['Marauder / Reaper', 'Reaper'],
    fx: 'mine',
    badSetup: {
      label: 'Pure Marine wave',
      formation: 'clump',
      units: [
        { name: 'Marine', x: 24, y: 14, kb: 22 },
        { name: 'Marine', x: 26, y: 24, kb: 38 },
        { name: 'Marine', x: 24, y: 34, kb: 54 },
        { name: 'Marine', x: 26, y: 44, kb: 68 },
        { name: 'Marine', x: 24, y: 54, kb: 68 },
        { name: 'Marine', x: 26, y: 64, kb: 54 },
        { name: 'Marine', x: 24, y: 74, kb: 38 },
        { name: 'Marine', x: 26, y: 84, kb: 22 },
        { name: 'Marine', x: 18, y: 49, kb: 74 }
      ]
    },
    goodSetup: {
      label: 'Marauder mine-catchers in front',
      formation: 'buffer',
      units: [
        { name: 'Marauder', x: 40, y: 32, kb: 44 },
        { name: 'Marauder', x: 40, y: 64, kb: 44 },
        { name: 'Marine', x: 16, y: 20 },
        { name: 'Marine', x: 22, y: 34 },
        { name: 'Marine', x: 16, y: 48 },
        { name: 'Marine', x: 22, y: 62 },
        { name: 'Marine', x: 16, y: 76 },
        { name: 'Marine', x: 22, y: 88 }
      ]
    },
    enemy: {
      units: [
        { name: 'Reaper', x: 72, y: 22, kb: 8 },
        { name: 'Reaper', x: 76, y: 35, kb: 24 },
        { name: 'Reaper', x: 78, y: 49, kb: 38 },
        { name: 'Reaper', x: 76, y: 63, kb: 24 },
        { name: 'Reaper', x: 72, y: 76, kb: 8 },
        { name: 'Marine', x: 90, y: 32 },
        { name: 'Marine', x: 90, y: 48 },
        { name: 'Marine', x: 90, y: 64 }
      ]
    },
    outcome: {
      bad: 'The mines blast your line into a U and the Reapers wedge through the split.',
      good: 'The Marauders eat the knockback out front. Your Marines walk in behind them and erase the wave.'
    }
  },
  {
    id: 'scn-tvt-anti-mass-marine',
    guideId: 'guide-tvt-discipline',
    title: 'TvT: Mass Marine vs the Side Marauders',
    lesson: 'Against a pure Marine opener, a couple of Marauders on the side edges glue their Marines onto bad targets while yours shoot for free. Keep it under 20% of your spend — one Marauder per ten Marines at most.',
    races: ['Terran'],
    threats: ['Marine'],
    fx: 'mine',
    badSetup: {
      label: 'Marine mirror, center blob',
      formation: 'clump',
      units: [
        { name: 'Marine', x: 22, y: 22 },
        { name: 'Marine', x: 28, y: 30 },
        { name: 'Marine', x: 22, y: 38 },
        { name: 'Marine', x: 28, y: 46 },
        { name: 'Marine', x: 22, y: 54 },
        { name: 'Marine', x: 28, y: 62 },
        { name: 'Marine', x: 22, y: 70 },
        { name: 'Marine', x: 28, y: 78 },
        { name: 'Marine', x: 16, y: 40 },
        { name: 'Marine', x: 16, y: 56 },
        { name: 'Marine', x: 34, y: 40 },
        { name: 'Marine', x: 34, y: 56 }
      ]
    },
    goodSetup: {
      label: 'Marauders on the side edges',
      formation: 'mix',
      units: [
        { name: 'Marauder', x: 30, y: 6 },
        { name: 'Marauder', x: 30, y: 92 },
        { name: 'Marine', x: 20, y: 22 },
        { name: 'Marine', x: 26, y: 32 },
        { name: 'Marine', x: 20, y: 42 },
        { name: 'Marine', x: 26, y: 52 },
        { name: 'Marine', x: 20, y: 62 },
        { name: 'Marine', x: 26, y: 72 },
        { name: 'Marine', x: 14, y: 38 },
        { name: 'Marine', x: 14, y: 58 }
      ]
    },
    enemy: {
      units: [
        { name: 'Marine', x: 72, y: 18 },
        { name: 'Marine', x: 80, y: 26 },
        { name: 'Marine', x: 72, y: 34 },
        { name: 'Marine', x: 80, y: 42 },
        { name: 'Marine', x: 72, y: 50 },
        { name: 'Marine', x: 80, y: 58 },
        { name: 'Marine', x: 72, y: 66 },
        { name: 'Marine', x: 80, y: 74 },
        { name: 'Marine', x: 88, y: 34 },
        { name: 'Marine', x: 88, y: 50 },
        { name: 'Marine', x: 88, y: 66 },
        { name: 'Marine', x: 72, y: 82 }
      ]
    },
    outcome: {
      bad: 'A coin-flip mirror blob. Whoever clumps worse loses the wave.',
      good: 'Their Marines chase armor on the edges while yours delete the middle.'
    }
  },
  {
    id: 'scn-tvt-banshee-split',
    guideId: 'guide-banshee-cheese-protocol',
    title: 'TvT: Banshees Split the Marauder Wave',
    lesson: 'When the enemy is 60%+ Marauder, one or two Banshees pull their few Marines — the only units that can shoot up — into a useless duel with a high-HP flyer while your Marines pummel the Marauders.',
    races: ['Terran'],
    threats: ['Marauder / Reaper', 'Banshee'],
    fx: 'mine',
    badSetup: {
      label: 'Marauder mirror grind',
      formation: 'clump',
      units: [
        { name: 'Marauder', x: 24, y: 22 },
        { name: 'Marauder', x: 30, y: 36 },
        { name: 'Marauder', x: 24, y: 50 },
        { name: 'Marauder', x: 30, y: 64 },
        { name: 'Marauder', x: 24, y: 78 },
        { name: 'Marauder', x: 16, y: 50 }
      ]
    },
    goodSetup: {
      label: '2 Banshees + Marine core',
      formation: 'mix',
      units: [
        { name: 'Banshee', x: 14, y: 14 },
        { name: 'Banshee', x: 14, y: 82 },
        { name: 'Marine', x: 28, y: 26 },
        { name: 'Marine', x: 32, y: 38 },
        { name: 'Marine', x: 28, y: 50 },
        { name: 'Marine', x: 32, y: 62 },
        { name: 'Marine', x: 28, y: 74 },
        { name: 'Marine', x: 22, y: 50 }
      ]
    },
    enemy: {
      units: [
        { name: 'Marauder', x: 72, y: 20 },
        { name: 'Marauder', x: 80, y: 32 },
        { name: 'Marauder', x: 72, y: 46 },
        { name: 'Marauder', x: 80, y: 60 },
        { name: 'Marauder', x: 72, y: 74 },
        { name: 'Marine', x: 90, y: 36 },
        { name: 'Marine', x: 90, y: 54 },
        { name: 'Marine', x: 90, y: 70 }
      ]
    },
    outcome: {
      bad: 'An armor-on-armor slugfest where their Marine support tips the scale.',
      good: 'Their three Marines duel a flying tank while your Marines erase the Marauders.'
    }
  },
  {
    id: 'scn-anti-colossus-roach-line',
    guideId: 'guide-meat-shield-economics',
    guideIds: ['guide-meat-shield-economics', 'guide-collos-viper-stop'],
    title: 'Colossus Behind Archons vs the Roach Buffer Line',
    lesson: 'A Colossus added behind Archons and Immortals flips a lane you were winning — its lance sweeps 2-3 units at a time. Spread Roaches deny the light bonus and feed it cheap HP while untouched Hydras chew through everything. Then T3: a Viper bomb or a pull drags the long-range Colossus in front of its own Archon shield.',
    races: ['Zerg'],
    threats: ['Colossus'],
    fx: 'mine',
    badSetup: {
      label: 'Low Roach, clumped Hydras',
      formation: 'clump',
      units: [
        { name: 'Roach', x: 36, y: 46 },
        { name: 'Hydralisk', x: 22, y: 24 },
        { name: 'Hydralisk', x: 28, y: 34 },
        { name: 'Hydralisk', x: 22, y: 44 },
        { name: 'Hydralisk', x: 28, y: 54 },
        { name: 'Hydralisk', x: 22, y: 64 },
        { name: 'Hydralisk', x: 28, y: 74 },
        { name: 'Hydralisk', x: 16, y: 44 },
        { name: 'Hydralisk', x: 16, y: 60 }
      ]
    },
    goodSetup: {
      label: 'Spread Roach line + Viper pull',
      formation: 'buffer',
      units: [
        { name: 'Roach', x: 38, y: 10 },
        { name: 'Roach', x: 36, y: 32 },
        { name: 'Roach', x: 38, y: 54 },
        { name: 'Roach', x: 36, y: 76 },
        { name: 'Hydralisk', x: 20, y: 20 },
        { name: 'Hydralisk', x: 22, y: 44 },
        { name: 'Hydralisk', x: 20, y: 64 },
        { name: 'Hydralisk', x: 22, y: 84 },
        { name: 'Hydralisk', x: 12, y: 44 },
        { name: 'Viper', x: 6, y: 16 }
      ]
    },
    enemy: {
      units: [
        { name: 'Archon', x: 72, y: 28 },
        { name: 'Archon', x: 72, y: 64 },
        { name: 'Immortal', x: 84, y: 46 },
        { name: 'Colossus', x: 94, y: 46 }
      ]
    },
    outcome: {
      bad: 'The lance sweeps three Hydras per pass and the Archons walk through.',
      good: 'Roaches eat the lance for cheap, Hydras shred the wave, and the pull drops the Colossus in front of its own shield.'
    }
  },
  {
    id: 'scn-anti-mothership-corruptors',
    guideId: 'guide-mothership-protocol',
    title: 'Mothership vs the Corruptor Sacrifice Rounds',
    lesson: 'Mothership beats every Zerg ground mainstay at once. Sell T1, eat a bad round or two while Corruptor numbers climb, and keep Queens behind them if Void Rays show — the heals keep the flock alive through the beam.',
    races: ['Zerg'],
    threats: ['Mothership'],
    fx: 'nova',
    costNote: 'Mothership is 700 minerals plus deep tech — corruptor count matters more than parity.',
    badSetup: {
      label: 'Ground mainstays, no switch',
      formation: 'mix',
      units: [
        { name: 'Hydralisk', x: 24, y: 16 },
        { name: 'Hydralisk', x: 28, y: 32 },
        { name: 'Hydralisk', x: 24, y: 48 },
        { name: 'Hydralisk', x: 28, y: 64 },
        { name: 'Hydralisk', x: 24, y: 80 },
        { name: 'Queen', x: 14, y: 32 },
        { name: 'Queen', x: 14, y: 62 },
        { name: 'Roach', x: 36, y: 32 },
        { name: 'Roach', x: 36, y: 62 }
      ]
    },
    goodSetup: {
      label: 'Corruptor flock + Queen heals',
      formation: 'mix',
      units: [
        { name: 'Corruptor', x: 28, y: 14 },
        { name: 'Corruptor', x: 32, y: 32 },
        { name: 'Corruptor', x: 28, y: 50 },
        { name: 'Corruptor', x: 32, y: 68 },
        { name: 'Corruptor', x: 28, y: 84 },
        { name: 'Queen', x: 14, y: 34 },
        { name: 'Queen', x: 14, y: 64 }
      ]
    },
    enemy: {
      units: [
        { name: 'Mothership', x: 76, y: 44 },
        { name: 'Void Ray', x: 90, y: 28 },
        { name: 'Void Ray', x: 90, y: 62 }
      ]
    },
    outcome: {
      bad: 'The beam carves through Hydra, Queen, and Roach alike. Nothing shoots back well.',
      good: 'Healed Corruptors stay on the hull until the giant falls out of the sky.'
    }
  },
  {
    id: 'scn-archon-mirror-stasis',
    guideId: 'guide-oracle-stasis-pvp',
    guideIds: ['guide-oracle-stasis-pvp', 'guide-pvp-archon-spine'],
    title: 'Archon Mirror: Stasis Cuts the Wave in Half',
    lesson: 'Against mass Archon, building your own spine is only step one. Oracle stasis freezes half their wave mid-charge — your units erase the unfrozen half, and by the time the ice breaks there is nothing left beside them. Disruptors after minute 6 hit 2-3 Archons at once, and a couple of Zealots bend the AI targeting your way.',
    races: ['Protoss'],
    threats: ['Archon'],
    fx: 'nova',
    badSetup: {
      label: 'Archons, no stasis, no Disruptor',
      formation: 'clump',
      units: [
        { name: 'Archon', x: 26, y: 26 },
        { name: 'Archon', x: 26, y: 48 },
        { name: 'Archon', x: 26, y: 70 },
        { name: 'Zealot', x: 36, y: 36 },
        { name: 'Zealot', x: 36, y: 60 },
        { name: 'Adept', x: 16, y: 38 },
        { name: 'Adept', x: 16, y: 58 }
      ]
    },
    goodSetup: {
      label: 'Archons + Oracle stasis + Disruptor',
      formation: 'mix',
      units: [
        { name: 'Archon', x: 32, y: 32 },
        { name: 'Archon', x: 32, y: 62 },
        { name: 'Zealot', x: 40, y: 20 },
        { name: 'Zealot', x: 40, y: 74 },
        { name: 'Zealot', x: 24, y: 47 },
        { name: 'Oracle', x: 12, y: 18 },
        { name: 'Disruptor', x: 10, y: 60 }
      ]
    },
    enemy: {
      units: [
        { name: 'Archon', x: 72, y: 38, frozen: true },
        { name: 'Archon', x: 72, y: 56, frozen: true },
        { name: 'Archon', x: 82, y: 20 },
        { name: 'Archon', x: 82, y: 74 },
        { name: 'Immortal', x: 93, y: 46 }
      ]
    },
    outcome: {
      bad: 'Four Archons and an Immortal hit your wave at once. The spine snaps.',
      good: 'Stasis holds two Archons in the ice while you delete the rest — the thaw arrives to an empty field.'
    }
  }
];
