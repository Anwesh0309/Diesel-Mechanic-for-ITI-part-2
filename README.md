# डीज़ल मैकेनिक भाग 2 · Diesel Mechanic Part 2

An independent, bilingual (Hindi default / English) Skill Lab for advanced diesel-mechanic learners.
It is a complete standalone project: its own `package.json`, lockfile, configs, source, translations,
assets and `public/` folder. It does not import from, link to, or share storage with any other project.

## Run it

```bash
npm ci            # or: npm install
npm run dev       # http://localhost:5185
# production check
npm run build
npm run preview   # http://localhost:4185
```

Requires Node 18+. The only network use is optional Google Fonts; without it the app falls back to system fonts.
Progress is stored in the browser under the key `diesel-part2:v1`.

## What is inside

Ten advanced modules in two tracks. Every module has the same seven stages:
**Watch → Read → Practice → Simulate → Quiz → Apply → Review**, all bilingual.

| # | Module | Simulation |
|---|--------|------------|
| 1 | Electronic Engine Management (ECU/ECM) | ECU map lab: read and interpolate the fuel map, beat the smoke limiter, set fault reactions |
| 2 | Sensors and Actuators | Sensor signal bench: match waveforms, find 5 V-circuit faults, test APP plausibility |
| 3 | Advanced Common Rail | Rail-pressure control room: live closed-loop IMV/PCV control under changing load |
| 4 | Diagnostic Tools and Fault Codes | Scan-tool console: decode SPN/FMI, prioritise codes, prove a fault with live data |
| 5 | Emission Control (EGR, DPF, SCR, AdBlue) | Aftertreatment console: safe DPF regeneration window, SCR dosing against varying NOx |
| 6 | Advanced Turbo and Intercooler | Turbo bench: compressor map, VGT vane tuning, intercooler effectiveness |
| 7 | Engine Performance Testing | Dyno cell: live sweep, curve-shape diagnosis, power/BSFC calculations |
| 8 | Preventive and Predictive Maintenance | Oil-analysis lab: wear-metal reports, trend to service interval, availability |
| 9 | Overhauling and Component Inspection | Inspection bench: bore-gauge wear/ovality/taper, reuse/repair/replace, reassembly order |
| 10 | Workshop Case Files | One full case: interview, test budget, root cause, estimate, comeback prevention |

Track A (modules 1–5): Control, Data and Emissions. Track B (modules 6–10): Performance and Reliability.
A learner earns 150 XP per module (1500 in total). Stages are freely accessible; the Review sign-off needs the other six stages.

`docs/TOPIC-DIFFERENCE-PLAN.md` lists what Part 1 already covers and how each Part 2 module avoids that overlap.

## Project layout

```
src/
  data/            module content (unit01.ts … unit10.ts), types
  translations/    UI strings (hi, en)
  simulations/     the ten simulations
  components/      layout, UI kit, simulation kit, Watch scenes, icons, art
  pages/           Home, Track, Unit (+ stages/), Progress
  store/           persisted progress + language/theme
public/            favicon
docs/              topic-difference plan
```

## Notes

- Simulations are simplified teaching models. Numbers are typical values for learning, not manufacturer data.
  Always follow the manufacturer's workshop manual for real limits, torque values and procedures.
- Change language or light/dark theme from the top bar; the choice persists.
