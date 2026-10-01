# Visualizer Plan — next build turn

Strategies selected for dedicated coded visualizers (scenario-theater engine), plus the
schema/layout decisions locked in this turn. Build order for next turn: schema extensions
first, then scenarios 1-8, then the matchup-helper sidebar tie-in QA.

## Blocking input needed from Isaac

**The unit mineral-cost list was not pasted last message.** Scenarios below are designed,
but the ±200 mineral balance rule cannot be applied until the list arrives. Next turn:
paste the list → it becomes `js/data-unit-costs.js` (`window.DSA_UNIT_COSTS = { 'Marine': 50, ... }`)
→ each scenario side gets a computed total → setups are adjusted to bring
|allies − enemy| ≤ 200 minerals for BOTH bad and good setups.

## Engine extensions (scenario-theater.js)

- `guideId` on each scenario — ties it to a strategy guide. The sidebar already renders a
  "▶ Watch it play out" button on any guide card whose id matches (wired this turn).
- Mineral chips: theater header shows `YOU 1450 ⚔ 1520 ENEMY` computed from DSA_UNIT_COSTS;
  flags red if the gap exceeds 200.
- `fx` field: impact effect per scenario — `storm` (blue flash), `fungal` (green lock flash),
  `nova` (white-purple burst), `mine` (red pop). Same keyframe budget, different colors.
- Existing 4 scenarios get retrofitted with `guideId` + costs (storm-buffer → guide-storm-value-basics,
  marine-baneling → guide-meat-shield-economics, muta-spread → guide-zvz-muta-window,
  lib-overbuild → guide-three-liberators-too-many).

## The 8 new visualizers

| # | Scenario id | Guide | Bad setup → lesson | Good setup | Enemy | fx |
|---|---|---|---|---|---|---|
| 1 | scn-fungal-spacing | guide-fungal-spacing | 8 clumped Marines locked by one fungal | Same Marines in a 3-row lattice, fungal catches 2 | 2 Infestor + 4 Zergling screen | fungal |
| 2 | scn-archon-starvation | guide-archon-starvation | Zergling/Baneling clump feeds Archon splash | Spread Roach front, Hydras at max range behind | 2 Archon + 2 Zealot | storm |
| 3 | scn-mine-nova-bait | guide-widowmine-disruptor-bait | Mines tucked inside the bio ball, novas hit everything | Mines spread 20% forward, novas vaporize dirt | 2 Disruptor + 3 Stalker | nova |
| 4 | scn-swarmhost-magnet | guide-swarmhost-nova-magnet | Hydra line takes both novas | Unburrowed Swarmhost ahead draws both shots | 2 Disruptor + 2 Adept | nova |
| 5 | scn-ghost-ultra-trap | guide-ghost-ultra-trap | Ghosts + clumped bio trampled by Ultras | Siege Tanks behind spread Marauders | 3 Ultralisk + 2 Queen | mine |
| 6 | scn-ling-thor-surround | guide-ling-thor-surrounds | Roach/Hydra/Queen reinforcing into 2 Thors | Zergling flood wrapping the Thor line | 2 Thor + 3 Marine | mine |
| 7 | scn-stalker-backline | guide-stalker-backline | Terran army forward; Stalkers blink behind it | Army positioned at the far back of the square | 4 Stalker (blink animation: teleport mid-pass) | storm |
| 8 | scn-adept-rauder-front | guide-adept-rauder-front | Marines in front melt to Adept light bonus | Marauders front, Marines tucked behind | 4 Adept + 1 Sentry | mine |

Stretch (only if budget allows): scn-pvp-archon-spine (guide-pvp-archon-spine, Zealot feed
timing) and scn-zealot-falloff (guide-zealot-falloff-clock, two-wave time-lapse).

Unit PNGs confirmed present for every unit listed above (incl. infestor, disruptor,
swarm-host, ultralisk, thor, adept, sentry, ghost — checked against assets/units/).

## Layout (locked)

Same stage as today (2-side drift, bad pass → good pass autoplay) plus:
- Cost chips row above the stage (left/right totals, balance state).
- Blink exception (#7): enemy Stalkers get a mid-pass position jump (opacity dip +
  reposition) instead of linear drift — one extra keyframe, no engine rewrite.
- Sidebar: guide cards with a tied scenario mount it inline (already live); the threat
  expander keeps using `threats[]` matching as today.
