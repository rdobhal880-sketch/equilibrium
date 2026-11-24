# Equilibrium: 5-minute live demo script

Rubric: "Confident, well-paced 5-minute demo within time; walks through the key features; handles questions clearly." Aim to finish at **4:40** so you have a buffer. Don't read this word for word. Learn the beats and say them your way.

If you're a pair, **Person A** drives the laptop and **Person B** talks, then swap at the halfway mark (3:00).

---

## Before the judges arrive (5 minutes before)

- [ ] Open the site **from GitHub Pages** (or `index.html`) in Chrome, full screen (F11), zoom 110%.
- [ ] Go to Insights → "Your data" → **Delete all my data**, so you start clean.
- [ ] Laptop volume at about 40% (for the tanpura drone).
- [ ] In a second window, open the code in VS Code with `js/content.js` ready.
- [ ] Have your phone with the site open too, to show it works on mobile.
- [ ] Close notifications and other tabs.

---

## 0:00–0:40 · The problem (criterion 1: purpose obvious in the first minute)

> "It's November. Mocks are coming. What do most of us do? We stay up later, skip sport, and tell ourselves we'll sleep after exams. Sleep, movement and stress all slip **at the same time**, and they make each other worse.
>
> Equilibrium is a 60-second daily check-in for students like us. It turns how you slept, moved and felt into one Balance score, shows which pillar is slipping, and gives you a tool to fix it in under five minutes."

Point at the ring on the Today screen: Mind, Body, Rest.

## 0:40–1:30 · Live check-in (criterion 2: interactivity, logic)

Click **Start today's check-in**.

- Pick a mood, move the stress slider. **Point at the ring updating live on the right.**
- Set sleep to **6 hours**: "Watch the blue Rest arc drop. Teenagers need 8 to 10 hours, and that's from the American Academy of Sleep Medicine."
- Tap **Padel** or **Cricket nets** to add active minutes; tap a few water glasses.
- Read the line under the ring: "A big gap between pillars costs points. That's the **equilibrium rule**. I took it from economics: a market is stable when forces balance. Ten hours of sleep doesn't make up for zero exercise."
- Click **Save**. You land on Today: "Now it recommends my next best step, based on my weakest pillar."

## 1:30–2:15 · Insights (criterion 2: data)

Go to **Insights** → "Your data" → **Add sample fortnight** (say: "so you can see two weeks of data. It's clearly marked as sample, and my real check-in is kept").

- Switch to **14 days**. "The dip here is a mock week: short sleep, low mood."
- Read one finding aloud: "After 8+ hours of sleep, mood averaged 4.2 out of 5, compared with 2.9 after shorter nights."
- **Important line:** "And notice it says these are *patterns, not proof of cause*. We didn't want the app to overclaim."

## 2:15–3:00 · Tools (criterion 3: creativity and personal touch)

**Breathe** → cyclic sighing → turn on **Tanpura drone** → Start for about 10 seconds.
> "This drone isn't an audio file. It's synthesised live in the browser with the Web Audio API: the Pa–Sa–Sa–Sa cycle used in Hindustani classical music. I trained in it, so that's my personal touch."

Stop it. Go to **Move**: choose 5 min, "At my desk", Energy → **Build my routine** → Start.
> "It builds a routine for the space you actually have, and when you finish, the minutes go into today's check-in."

Scroll to the **Heat check**: type 35 °C and 60%.
> "In Dubai, 35 degrees with humidity actually feels like 45. This uses the US National Weather Service heat index formula and tells you to train indoors."

## 3:00–3:40 · Safety (criterion 6: accuracy and safety of health content)

Click **Need support?** (top right).
> "This is on every screen: UAE support lines, checked this month. And if someone checks in with the lowest mood and maximum stress, or writes something about self-harm in a note or in Reframe, the app gently brings this up. It never diagnoses."

Close it. Quick flash of **Reframe**: "A CBT thought record, for when one bad mock turns into 'I'm going to fail everything'."

## 3:40–4:30 · How we built it (criterion 6: understanding)

Open **How it works**. Point at the formula, the test table and the sources.
> "We built this with AI-assisted coding, but we checked every health number against its original source, and we tested it in a real browser at phone and laptop sizes. The build log shows real bugs we found and fixed."

**Live code change (this is what gets full marks):** switch to VS Code, open `js/content.js`, find `EQ.ACTIVITIES` and add:
```js
{ name: 'Basketball', min: 45 },
```
Save, refresh the browser, open Check-in: the new chip is there.
> "All the content lives in one file, so anyone can extend it."

## 4:30–4:50 · Close

> "Equilibrium: one minute a day to keep your mind, body and rest in balance through exam season. It's private, it works on any phone, and it's live on GitHub Pages right now. Thank you. We're happy to take questions."

---

## If something goes wrong

- **No sound:** "The drone needs the volume up; let me move on" and go to Move.
- **Page looks odd:** press Ctrl+Shift+R to hard-refresh.
- **Wi-Fi drops:** open `index.html` straight from the laptop. Everything works offline except the custom fonts.
- **Running long:** skip Reframe and Focus. Never skip the safety part or the code change.
