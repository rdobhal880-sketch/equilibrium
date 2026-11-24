# Equilibrium

**Balance your mind, body and rest through exam season.**

Equilibrium is a 60-second daily check-in for secondary students. It turns how you slept, moved and felt into one **Balance score**, spots the pillar that is slipping, and gives you a tool to fix it in under five minutes.

Built for the **GWA Innovation Championship 2026 · VibeCoding Jam** (theme: mental health, physical health or sports/fitness).

---

## The problem

During mocks and finals, students trade sleep and movement for revision hours, and stress quietly builds. Most wellbeing apps track one thing. Equilibrium tracks the **balance between three**, because they affect each other.

**Audience:** secondary students (IB, A-level, GCSE, CBSE) in the UAE.

## Features

| Screen | What it does |
|---|---|
| **Today** | Balance ring (Mind, Body, Rest), three personalised "next best step" cards, today's numbers, sourced health facts |
| **Check-in** | Mood, stress, sleep, activity, water and a note. The ring updates live as you answer |
| **Insights** | 7/14/30-day SVG charts, KPIs, streaks and plain-English findings (sleep vs mood, activity vs stress, correlation, trend) |
| **Breathe** | Four guided patterns (cyclic sighing, box, 4-7-8, even) with an animated orb and an optional **tanpura drone synthesised live with the Web Audio API** |
| **Move** | Builds a routine for your time, space (desk/room/outside) and goal, runs it with an interval timer, and logs the minutes. Includes a **heat index check** using the US National Weather Service formula |
| **Reframe** | CBT thought records: name the thinking trap, weigh the evidence, write a balanced thought, track how much the feeling dropped |
| **Focus** | 25/5, 50/10 or 15/3 focus timer with movement breaks, plus **the sleep trade-off**: what a late night costs your Rest score |
| **How it works** | Score formula, safety approach, build story, test log, code map and sources |

**Safety:** a "Need support?" button on every screen with UAE helplines; a gentle support prompt when a check-in shows very low mood with very high stress or free text mentions self-harm.

**Accessibility:** keyboard navigable with visible focus, screen-reader labels, light/dark/auto theme, three text sizes, reduced-motion mode, works at 360 px wide.

**Privacy:** all data stays in the browser (localStorage). No accounts, cookies, analytics or servers. Export, import and delete are built in.

## The Balance score

```
Rest  = 100 inside 8–10 h sleep; −25 per hour under 8; −15 per hour over 10
Body  = 80% × (active minutes ÷ 60) + 20% × (water ÷ goal)
Mind  = 60% × mood (1–5) + 40% × calm (stress 1–10, inverted)
Balance = mean(Mind, Body, Rest) − 0.2 × (strongest − weakest)
```

The gap penalty is the "equilibrium" idea from economics: a system is stable when the forces are even. Ten hours of sleep doesn't cancel out zero movement.

## Run it

No build step, no dependencies. Either:

- double-click `index.html`, or
- run a local server: `python3 -m http.server` and open <http://localhost:8000>

## Put it on GitHub and publish it free (GitHub Pages)

1. Create a new **public** repository on GitHub called `equilibrium`.
2. Upload everything in this folder (drag the files and folders into "Add file → Upload files"), or from a terminal:
   ```bash
   git init
   git add .
   git commit -m "Equilibrium: student wellbeing app"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/equilibrium.git
   git push -u origin main
   ```
3. In the repository go to **Settings → Pages**, set **Source** to "Deploy from a branch", branch **main**, folder **/ (root)**, and save.
4. After a minute your site is live at `https://YOUR-USERNAME.github.io/equilibrium/`.

## Project structure

```
index.html          all eight screens and the dialogs
css/styles.css      design system, themes, responsive layout
js/content.js       all text and data: targets, exercises, patterns, helplines, sources
js/core.js          storage, score formula, ring graphic, routing, safety checks
js/today.js         home screen logic and sample data
js/checkin.js       daily check-in form
js/insights.js      SVG charts and pattern finding
js/breathe.js       breathing engine and tanpura synthesiser
js/move.js          routine builder, interval timer, heat index
js/reframe.js       CBT thought records
js/focus.js         focus timer and sleep trade-off
js/about.js         fills the How it works page
js/main.js          starts the app
docs/               demo script and judge Q&A prep
```

**Easy changes:** add an exercise, breathing pattern or source in `js/content.js`; change colours at the top of `css/styles.css`; change the score weights in `EQ.pillars` in `js/core.js`.

## Sources

- American Academy of Sleep Medicine (2016). Teenagers 13–18 should sleep 8–10 hours per 24 hours.
- World Health Organization (2020). Guidelines on physical activity and sedentary behaviour: ages 5–17, average 60 min/day moderate-to-vigorous activity.
- WHO/PAHO (9 Nov 2026). One in four adolescents worldwide reported no active days in the previous week.
- Balban et al. (2023), *Cell Reports Medicine*. Brief structured respiration practices enhance mood and reduce physiological arousal.
- US National Weather Service. Heat index equation (Rothfusz regression) and risk levels.
- UAE National Programme for Happiness and Wellbeing: Mental Support Line 800-HOPE (800 4673).

## Disclaimer

Equilibrium is a wellbeing tool, not a medical device, and does not give medical advice. In an emergency in the UAE call **999** (police) or **998** (ambulance).

## How it was built

Built with AI-assisted ("vibe") coding using Claude, then tested in a real browser and reviewed. See `docs/JUDGE_PREP.md` and the "How it works" screen.

## Licence

MIT
