// Quiz data is intentionally plain objects so non-programmers can edit it.
window.DSA_GAS_SCENARIOS = [
  {
    title: 'Scenario 1',
    prompt: 'Minute 3. Your team does not hold mid. Your wave is leaking. You have 150 minerals.',
    correct: 'No',
    explanation: 'You are already losing wave strength. Gassing delays your counter and can make the team lose mid harder.'
  },
  {
    title: 'Scenario 2',
    prompt: 'Minute 5. Your team has mid control. You got cannon bounty. Your wave is stable.',
    correct: 'Yes',
    explanation: 'This is safer. Cannon bounty makes the gas less punishing.'
  },
  {
    title: 'Scenario 3',
    prompt: 'Minute 4. Your opponent just revealed High Templar. Your Hydras are clumped and dying. You have 150 minerals.',
    correct: 'No',
    explanation: 'You need to fix formation, add buffers, or switch tech before taking gas.'
  },
  {
    title: 'Scenario 4',
    prompt: 'Minute 8. Your team has controlled mid for several minutes. Your wave is stable. No major leaks are happening.',
    correct: 'Yes',
    explanation: 'Gas is safer when your team has map control and stable waves.'
  }
];

window.DSA_ZVZ_SCENARIOS = [
  {
    title: 'Early Muta Reveal',
    prompt: 'Enemy Zerg reveals early Muta. What do you do?',
    options: ['Muta yourself', 'Early Infestor', 'Early Queen main answer', 'Rush Ultra immediately'],
    correct: 'Muta yourself',
    explanation: 'The current ZvZ early game is dominated by Muta. Muta is the main opener for the first 6 rounds.'
  },
  {
    title: 'Enemy Viper Wins Value',
    prompt: 'Enemy Viper wins value against your Muta wave. What do you do?',
    options: ['Stay pure Muta forever', 'Switch Hydra and add your own Viper', 'Mass Queens', 'Gas while leaking'],
    correct: 'Switch Hydra and add your own Viper',
    explanation: 'If enemy Viper hits effectively, switch Hydra and add your own Viper if the Muta counts are already high.'
  },
  {
    title: 'Ultra Transition',
    prompt: 'Enemy switches into Ultra. What do you do?',
    options: ['Switch Ultra also and avoid upgrades until ahead in numbers', 'Keep pure Muta', 'Rush upgrades before matching count', 'Build early Infestors only'],
    correct: 'Switch Ultra also and avoid upgrades until ahead in numbers',
    explanation: 'When the opponent goes Ultra, transition to Ultra also. Count often matters before upgrades.'
  },
  {
    title: 'Need T3 Before Round Start',
    prompt: 'You need T3 before round start but have too many Mutas tied up in minerals. What can be correct?',
    options: ['Sell Mutas if needed', 'Wait and miss timing', 'Buy Queens', 'Start random upgrades'],
    correct: 'Sell Mutas if needed',
    explanation: 'Selling Mutas can be correct when it lets you afford T3 before the round starts.'
  },
  {
    title: 'Minute 7 Planning',
    prompt: 'You survived early Muta. What is usually still correct by around minute 7?',
    options: ['Hydra transition', 'Never leave Muta', 'Infestor-only defense', 'No army, take gas'],
    correct: 'Hydra transition',
    explanation: 'Hydra by minute 7 is still usually correct after the opening Muta phase.'
  }
];
