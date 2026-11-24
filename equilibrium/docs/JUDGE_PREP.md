# Judge Q&A prep (criterion 6: Understanding and Responsible AI Use)

Full marks needs you to: **explain how it was built, how prompts were refined, how it was tested and improved; show you can modify the code; consider accuracy and safety of health content.**

Be honest. Judges can tell, and honesty about AI use is exactly what this criterion rewards.

---

## 1. How was it built?

- **Tools:** an AI assistant (Claude) generated the first full version from a detailed brief based on the rubric. We then reviewed it, tested it and changed it.
- **Tech:** plain HTML, CSS and JavaScript. No frameworks, no build step, no server. Hosted free on GitHub Pages.
- **Why no framework?** So every line is readable and we can explain it. It also means it loads fast and works offline.
- **Data:** saved in the browser's `localStorage`. Nothing is sent anywhere.

## 2. How were the prompts refined?

**Your honest story.** Fill in the gaps with what you actually did:

1. **First prompt:** we gave the AI a photo of the judging rubric and asked for a detailed, polished website that would score full marks.
2. **What the AI did with it:** it chose the problem (exam-season balance), fact-checked health numbers with web searches, built the app, and wrote automated browser tests.
3. **Refinements we made:** ____________________________ *(do at least two before the demo: see section 6)*
4. **What we learned about prompting:** a vague prompt gets a generic site. Giving the AI the **rubric**, the **audience** and **personal details** (Hindustani music, cricket, padel, economics) is what made it original.

## 3. How was it tested and improved?

An automated script (Python + Playwright, headless Chrome) ran through every screen and checked:

| Test | Result |
|---|---|
| All 8 screens load with no JavaScript errors | Pass |
| Check-in saves, survives a page reload, ring score matches | Pass |
| Empty states when there is no data | Pass |
| Sample data doesn't overwrite real check-ins | Pass |
| No sideways scrolling at 390 px (phone), light and dark | Pass |
| Keyboard focus ring visible | Pass |
| Low mood + max stress opens support lines | Pass |
| Crisis phrase in Reframe opens support lines | Pass |
| Heat index 35 °C / 60% ≈ 45 °C (matches NWS chart) | Pass |
| Move routine builds and the timer runs | Pass |
| Reduced-motion mode | Pass |

**Real bugs found and fixed during testing** (good to mention, it shows iteration):

1. **Chart legend broke the layout.** A legend item used the class name `band`, which already meant "full-width section with big padding". Renamed to `k-band`.
2. **Desk routines repeated the same exercise** ("March on the spot" twice) because the warm-up was also in the main pool. Fixed by excluding warm-up/cool-down, and added more desk-friendly exercises.
3. **Keyboard focus ring was invisible on cards**, because the card's shadow rule came later in the CSS. Fixed with a higher-priority focus style. (Accessibility.)
4. **Finishing a Move routine created a fake check-in** with made-up mood and sleep. That's a data-honesty problem, so now the minutes are held as "pending" until you check in yourself.
5. **Question labels sat on the card border** (default `<fieldset>` styling). Fixed with a float.
6. **Chart dates overlapped on phones.** Now phones show only the day number.

## 4. Accuracy and safety of health content

- Every number has a named source on the How it works screen:
  - **8–10 h sleep** for ages 13–18: American Academy of Sleep Medicine, 2016.
  - **60 min/day** activity for ages 5–17: WHO guidelines, 2020.
  - **1 in 4** adolescents had no active day last week: WHO, 9 November 2026.
  - **Cyclic sighing**: Balban et al., Stanford, *Cell Reports Medicine* 2023.
  - **Heat index**: US National Weather Service equation.
  - **Helplines**: 800-HOPE (800 4673) national line; 800-SAKINA (800 725462) 24/7; 999 police; 998 ambulance. Checked November 2026.
- **The water goal is labelled as a personal goal**, not a medical rule, because there's no single correct number.
- **Insights say "patterns, not causes"**, because a correlation from a few days of your own data can't prove anything.
- **Support lines** are on every screen; the app surfaces them for very low mood + very high stress, or self-harm language. It never diagnoses or gives medical advice.
- **Privacy** is a safety feature for mental-health data: nothing leaves the device.
- **Breathing:** we tell users to stop if they feel dizzy, and to shorten the 4-7-8 hold if it's uncomfortable.

## 5. Likely questions and good answers

**"How does the Balance score work?"**
Three pillar scores from 0 to 100, averaged, minus 20% of the gap between your best and worst pillar. The gap penalty is the equilibrium idea: balance matters more than one huge number. (Show `EQ.pillars` in `js/core.js`.)

**"Why 25 points per hour of lost sleep?"**
It's a design choice, not a medical figure. It makes 6 hours score 50 and 4 hours score 0, which matches how strongly the sleep guidance warns against regularly missing the 8-hour minimum. We say clearly it's a wellbeing score, not a diagnosis.

**"How does the tanpura sound work?"**
Each pluck is nine sine waves at the note's harmonics (1×, 2×, 3× the frequency...). The higher harmonics swell slightly after the attack, which imitates the buzzing bridge (jawari) of a real tanpura. The strings play Pa (×0.75), Sa, Sa, then Sa an octave lower (×0.5) on a loop. Code: `Drone` in `js/breathe.js`.

**"How do you calculate the heat index?"**
Convert to Fahrenheit, apply the National Weather Service's Rothfusz regression with its humidity adjustments, convert back. Risk levels are the NWS bands. Code: `EQ.heatIndexC` in `js/move.js`.

**"What did the AI get wrong?"**
Use the bug list in section 3. The fake-check-in one is the best example of a responsible-AI issue: the code worked, but it invented health data.

**"What would you add next?"**
A reminder notification for the daily check-in (needs a service worker), a teacher/counsellor view with anonymous class-level trends (would need consent and a server), and Arabic and Hindi translations.

**"Could this replace a counsellor?"**
No, and it says so. It's a first step that points people to real help.

## 6. Do these before the demo (10–15 minutes), so you have your own refinements to talk about

Pick two or three. Each is a real prompt-and-edit you can describe.

1. **Add an activity you do** in `js/content.js` → `EQ.ACTIVITIES`, e.g. `{ name: 'Basketball', min: 45 }`.
2. **Add your own exercise** to `EQ.EXERCISES` (copy an existing line and change it).
3. **Change the accent colour**: in `css/styles.css` change `--cta: #ff7a4f;` to another colour.
4. **Ask an AI** to explain one function you don't understand yet (for example `EQ.pillars` or `drawBars`) until you can explain it yourself.
5. **Update the build log** in `js/content.js` → `EQ.BUILD_LOG` with what you changed. It appears on the How it works screen.

Practise the live code change once so it takes under 30 seconds.
