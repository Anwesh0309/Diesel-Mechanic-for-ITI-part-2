# Diesel Mechanic Part 2 — Topic-Difference Plan

Part 1 was inspected **only** to list what is already taught. Nothing from it is reused as content.

## 1. What Part 1 already covers (do NOT repeat)

| P1 unit | Covered |
|---|---|
| 1 Fundamentals | Compression ignition, compression ratio, diesel vs petrol, cetane, glow plugs |
| 2 Components | Block, head, gasket, piston, rings, rod, crank, flywheel, valve train; head-bolt torque sequence |
| 3 Four-stroke | Intake/compression/power/exhaust, 720° cycle, firing order 1-3-4-2, timing marks |
| 4 Fuel injection & CR | Fuel path, HP pump, rail, sensors (basic), injector spray; rail-pressure tuner (noise/NOx/soot), pilot/post injection basics, depressurise safely |
| 5 Air & turbo | Boost, wastegate, intercooler purpose, boost-leak hunt |
| 6 Cooling & lube | Heat balance, thermostat, oil circuit, relief valve, overheating drill |
| 7 Maintenance | Service intervals, filters, belts, basic triage, parts kit, schedule calculation |
| 8 Electrical & starting | Battery, starter, alternator, glow circuit, multimeter voltage/voltage-drop |
| 9 Diagnostics | Symptom → cause logic, basic tests (compression, leak-down, balance), black/blue/white smoke |
| 10 Workshop & safety | PPE, hazards, lifting, fire (PASS), tools, best practice |

## 2. Part 2 curriculum (10 new job cards, two tracks)

**Track A — Control, Data & Emissions** · **Track B — Performance & Reliability**

| P2 unit | New topic | Why it is NOT in Part 1 | Overlap removed |
|---|---|---|---|
| 1 ECU / ECM Engine Management | Open/closed loop, fuel maps (rpm × pedal), correction factors, smoke limiter, fault reaction levels (substitute value / limp / shutdown), CAN bus | P1 never mentions the ECU's logic | Basic "sensor list" in P1-4 left out |
| 2 Sensors & Actuators | 5 V reference sensors, signal types (inductive, Hall, NTC, piezo), plausibility (APP 2:1), voltage windows, actuator drive types (PWM, solenoid, stepper) | P1-8 uses a multimeter on batteries; P2 deals with sensor *signals* | Battery/starter circuits excluded |
| 3 Advanced Common Rail | Solenoid vs piezo injectors, injector coding (IMA/C2I), rail-pressure *control loop* (IMV + PCV), leak-off / return-flow test, pump wear, multiple-injection strategies | P1-4 teaches the fuel path and noise/NOx tuning only | Pilot/post-injection explanation and rail-tuner excluded |
| 4 Diagnostic Tools & Fault Codes | J1939 SPN/FMI decoding, DTC states (active/pending/historic), freeze frame, live data, bi-directional tests, scope/breakout box, code prioritisation | P1-9 is symptom logic with manual tests | Smoke-colour diagnosis excluded |
| 5 Emission Control (EGR, DPF, SCR) | EGR cooler & valve, DPF soot load / ΔP / regeneration, SCR chemistry, AdBlue dosing window, NOx sensors, derate rules | Not present in Part 1 | — |
| 6 Advanced Turbo & Intercooler | Compressor map (surge/choke/efficiency island), VGT vane control, electric actuators, twin-stage/sequential, intercooler effectiveness, turbo failure analysis | P1-5 only covers boost, wastegate, leak hunt | Wastegate and leak hunt excluded |
| 7 Performance Testing & Analysis | Dyno power/torque curves, BSFC, rated vs corrected power, opacity test, cylinder contribution test, reading curve shapes | Not present in Part 1 | — |
| 8 Preventive & Predictive Maintenance | Oil analysis (wear metals, TBN, fuel dilution), trend & remaining-life projection, condition monitoring, downtime cost model, RCM | P1-7 is fixed-interval service only | Intervals/filters/belts excluded |
| 9 Overhauling & Component Inspection | Bore wear & ovality, ring end-gap, journal & bearing clearance, valve seat recession, crack inspection, reuse/repair/replace limits, rebuild sequence | P1-2 teaches parts *functions*, not inspection limits | Head-bolt torque excluded |
| 10 Workshop Case Files | Multi-evidence investigation: customer interview, evidence budget, root-cause vs symptom, repair-order cost, comeback prevention | P1-9 is a short test-selection exercise | — |

## 3. New learning activities (all different from Part 1)

| # | Simulation | Mechanic |
|---|---|---|
| 1 | ECU Map Lab | Read an rpm × pedal fuel map, apply smoke-limiter, choose ECU fault reactions |
| 2 | Sensor Signal Bench | Match waveforms, diagnose 5 V-circuit faults from voltage windows, check APP plausibility |
| 3 | Rail Pressure Control Room | Live closed-loop pressure control, read fault traces, return-flow test |
| 4 | Scan-Tool Console | Decode SPN/FMI, prioritise DTCs, read freeze-frame/live data |
| 5 | Aftertreatment Console | Real-time DPF regen window, SCR dosing, EGR/DPF/SCR symptom match |
| 6 | Compressor Map Bench | Live operating point on a compressor map with VGT vane control |
| 7 | Dyno Cell | Read curves, compute BSFC, diagnose curve shape |
| 8 | Oil-Lab & Trend Desk | Interpret oil report, project wear trend, choose maintenance strategy by cost |
| 9 | Inspection Bench | Bore-gauge readings, part triage (reuse/repair/replace), rebuild sequence |
| 10 | Case-File Investigator | Branching case with evidence budget and cost sheet |

## 4. Standalone guarantee
Own folder, `package.json`, lockfile, configs, `src`, `public`, assets, translations and storage key (`diesel-part2:v1`). No imports from Part 1; Part 1 is not modified.
