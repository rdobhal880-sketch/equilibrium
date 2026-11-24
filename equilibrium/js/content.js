/* =====================================================================
   content.js — all the words and data the app uses, in one place.
   Edit this file to add exercises, breathing patterns or sources
   without touching any logic.
   ===================================================================== */
window.EQ = window.EQ || {};

/* ---------- Health targets (each one has a source in SOURCES) ---------- */
EQ.TARGETS = {
  sleepMin: 8,     // AASM: teenagers 13–18 need 8–10 h per 24 h
  sleepMax: 10,
  activeMin: 60,   // WHO 2020: average 60 min/day moderate-to-vigorous, ages 5–17
  waterDefault: 8  // a personal goal the user can change, not a medical rule
};

/* ---------- Mood scale ---------- */
EQ.MOODS = [
  { v: 1, label: 'Awful' },
  { v: 2, label: 'Low' },
  { v: 3, label: 'Okay' },
  { v: 4, label: 'Good' },
  { v: 5, label: 'Great' }
];

/* ---------- Quick-add activities for the check-in ---------- */
EQ.ACTIVITIES = [
  { name: 'Walk', min: 20 }, { name: 'PE lesson', min: 45 }, { name: 'Gym', min: 45 },
  { name: 'Football', min: 60 }, { name: 'Cricket nets', min: 45 }, { name: 'Padel', min: 60 },
  { name: 'Swim', min: 30 }, { name: 'Dance', min: 30 }, { name: 'Cycling', min: 30 }
];

/* ---------- Breathing patterns: [phase name, seconds, orb size] ---------- */
EQ.BREATHS = [
  { id: 'sigh', name: 'Cyclic sighing', tag: 'Fast calm',
    desc: 'Two breaths in through the nose, one long breath out through the mouth. In a 2023 Stanford study, five minutes a day improved mood more than mindfulness meditation.',
    phases: [['Breathe in', 2, 0.9], ['Top up', 1, 1.04], ['Long breath out', 6, 0.5]] },
  { id: 'box', name: 'Box breathing', tag: 'Before a test',
    desc: 'Four equal sides: in, hold, out, hold. A steady rhythm that is easy to do silently in an exam hall.',
    phases: [['Breathe in', 4, 1], ['Hold', 4, 1], ['Breathe out', 4, 0.5], ['Hold', 4, 0.5]] },
  { id: '478', name: '4-7-8', tag: 'Wind down',
    desc: 'A long hold and an even longer out-breath. Good for the last ten minutes before sleep. Shorten the hold if it feels uncomfortable.',
    phases: [['Breathe in', 4, 1], ['Hold', 7, 1], ['Breathe out', 8, 0.5]] },
  { id: 'even', name: 'Even breathing', tag: 'Steady',
    desc: 'About five and a half breaths a minute, in and out for the same length. Simple and good for beginners.',
    phases: [['Breathe in', 5.5, 1], ['Breathe out', 5.5, 0.5]] }
];

/* ---------- Exercise library for Move and Focus breaks ----------
   space: desk | room | outdoor     focus: energise | stretch | strength */
EQ.EXERCISES = [
  { id: 'neck', name: 'Neck release', cue: 'Drop your right ear towards your shoulder, breathe, then switch sides. Keep it slow; no full backward circles.', space: ['desk', 'room'], focus: ['stretch'] },
  { id: 'shoulders', name: 'Shoulder rolls', cue: 'Lift your shoulders to your ears, roll them back and down. Ten slow rolls, then reverse.', space: ['desk', 'room', 'outdoor'], focus: ['stretch'] },
  { id: 'twist', name: 'Seated twist', cue: 'Sit tall, hold the back of your chair and turn your chest to one side. Swap halfway.', space: ['desk'], focus: ['stretch'] },
  { id: 'wrists', name: 'Wrist and finger stretch', cue: 'Arm out, palm up, gently pull your fingers back. Swap hands, then make fists and spread your fingers wide.', space: ['desk', 'room'], focus: ['stretch'] },
  { id: 'chest', name: 'Chest opener', cue: 'Clasp your hands behind your back, lift your chest and squeeze your shoulder blades together. Undoes the revision hunch.', space: ['desk', 'room', 'outdoor'], focus: ['stretch'] },
  { id: 'hamstring', name: 'Hamstring reach', cue: 'Heel forward, toes up, hinge at the hips with a flat back until you feel the back of the leg. Swap halfway.', space: ['room', 'outdoor'], focus: ['stretch'] },
  { id: 'hipflexor', name: 'Hip flexor lunge', cue: 'Half-kneel, squeeze the glute of the back leg and shift forward gently. Swap halfway.', space: ['room'], focus: ['stretch'] },
  { id: 'catcow', name: 'Cat–cow', cue: 'On hands and knees, round your back up as you breathe out, let it dip as you breathe in.', space: ['room'], focus: ['stretch'] },
  { id: 'child', name: 'Child’s pose', cue: 'Knees wide, sit back on your heels and reach your arms forward. Breathe into your back.', space: ['room'], focus: ['stretch'] },
  { id: 'march', name: 'March on the spot', cue: 'Lift your knees to hip height and swing your arms. Easy pace to warm up.', space: ['desk', 'room', 'outdoor'], focus: ['energise'], warm: true },
  { id: 'armcircles', name: 'Arm circles', cue: 'Arms out to the sides, small fast circles forwards, then backwards. Keep your shoulders down.', space: ['desk', 'room', 'outdoor'], focus: ['energise'] },
  { id: 'deskjog', name: 'Quiet jog', cue: 'Stand behind your chair and jog lightly on the spot, landing softly. Pump your arms.', space: ['desk', 'room'], focus: ['energise'] },
  { id: 'jacks', name: 'Jumping jacks', cue: 'Jump feet out as arms go up, back in as arms come down. Step instead of jump if you need to be quiet.', space: ['room', 'outdoor'], focus: ['energise'] },
  { id: 'highknees', name: 'High knees', cue: 'Run on the spot driving your knees up. Stay light on the balls of your feet.', space: ['room', 'outdoor'], focus: ['energise'] },
  { id: 'buttkicks', name: 'Heel flicks', cue: 'Jog on the spot flicking your heels towards your glutes.', space: ['room', 'outdoor'], focus: ['energise'] },
  { id: 'skaters', name: 'Skater hops', cue: 'Hop sideways from one foot to the other, swinging your arms like a speed skater.', space: ['room', 'outdoor'], focus: ['energise'] },
  { id: 'boxing', name: 'Shadow boxing', cue: 'Soft knees, guard up, throw quick straight punches. Keep your core tight.', space: ['desk', 'room', 'outdoor'], focus: ['energise'] },
  { id: 'fielding', name: 'Fielding shuffle', cue: 'Cricket drill: low stance, shuffle three steps left, touch the floor, three steps right. Stay low.', space: ['room', 'outdoor'], focus: ['energise'] },
  { id: 'padel', name: 'Split-step to lunge', cue: 'Padel drill: small hop to land on both feet, then lunge to one side as if reaching a volley. Alternate sides.', space: ['room', 'outdoor'], focus: ['energise', 'strength'] },
  { id: 'deskpush', name: 'Desk push-ups', cue: 'Hands on a sturdy desk edge, body straight, lower your chest and push back. Check the desk can’t slide.', space: ['desk'], focus: ['strength'] },
  { id: 'chairsquat', name: 'Chair squats', cue: 'Sit back until you just touch the chair, then stand tall. Knees follow your toes.', space: ['desk', 'room'], focus: ['strength'] },
  { id: 'wallsit', name: 'Wall sit', cue: 'Back flat on the wall, slide down until your knees are near 90°. Hold and breathe.', space: ['room'], focus: ['strength'] },
  { id: 'bridge', name: 'Glute bridge', cue: 'Lie on your back, knees bent, push through your heels to lift your hips. Pause at the top.', space: ['room'], focus: ['strength'] },
  { id: 'plank', name: 'Plank', cue: 'Forearms down, body in one straight line from head to heels. Drop to your knees if your back sags.', space: ['room'], focus: ['strength'] },
  { id: 'calves', name: 'Calf raises', cue: 'Rise onto your toes, pause, lower slowly. Hold a desk or wall for balance.', space: ['desk', 'room', 'outdoor'], focus: ['strength', 'energise'] },
  { id: 'lunges', name: 'Reverse lunges', cue: 'Step back and lower your back knee towards the floor, then return. Alternate legs.', space: ['room', 'outdoor'], focus: ['strength'] },
  { id: 'superman', name: 'Superman hold', cue: 'Lie face down, lift arms and legs a few centimetres and hold. Look at the floor to protect your neck.', space: ['room'], focus: ['strength'] },
  { id: 'kneelift', name: 'Seated knee lifts', cue: 'Sit on the front of your chair, lean back slightly and lift both knees towards your chest.', space: ['desk'], focus: ['strength'] },
  { id: 'brisk', name: 'Brisk walk', cue: 'Walk fast enough that you can talk but not sing. Find shade or go indoors if it’s hot.', space: ['outdoor'], focus: ['energise'], warm: true },
  { id: 'stairs', name: 'Stair climb', cue: 'Walk up a flight of stairs at a steady pace, walk down carefully. Hold the rail.', space: ['outdoor'], focus: ['energise', 'strength'] }
];

/* ---------- Thinking traps for the thought record (CBT) ---------- */
EQ.TRAPS = [
  { id: 'all', name: 'All-or-nothing', help: 'Seeing things in only two boxes: perfect or a total failure. "If I don’t get a 7, I’ve failed."' },
  { id: 'cat', name: 'Catastrophising', help: 'Jumping to the worst possible outcome. "One bad mock means I won’t get into university."' },
  { id: 'mind', name: 'Mind reading', help: 'Assuming you know what others think. "My teacher thinks I’m lazy."' },
  { id: 'fortune', name: 'Fortune telling', help: 'Predicting the future as if it’s fact. "I’m going to blank in the exam."' },
  { id: 'should', name: '“Should” statements', help: 'Rigid rules for yourself. "I should be revising every minute."' },
  { id: 'label', name: 'Labelling', help: 'Turning one event into who you are. "I’m stupid" instead of "I made a mistake."' },
  { id: 'over', name: 'Overgeneralising', help: 'One event becomes "always" or "never". "I always mess up presentations."' },
  { id: 'discount', name: 'Discounting the positive', help: 'Brushing off what went well. "I only passed because it was easy."' },
  { id: 'emotion', name: 'Emotional reasoning', help: 'Treating a feeling as evidence. "I feel like a failure, so I must be one."' }
];

/* ---------- Support lines (checked November 2026) ---------- */
EQ.HELPLINES = [
  { name: 'National Mental Support Line', num: '800 4673', tel: '8004673', note: '800-HOPE. Call or WhatsApp. Free and confidential, Arabic and English.' },
  { name: '800-SAKINA (Department of Health Abu Dhabi)', num: '800 725462', tel: '800725462', note: 'Psychological support 24/7, Arabic and English.' },
  { name: 'Police emergency', num: '999', tel: '999', note: 'If you or someone else is in immediate danger.' },
  { name: 'Ambulance', num: '998', tel: '998', note: 'Medical emergencies.' }
];

/* Words that trigger the gentle support card in free-text fields.
   This is a safety net, not a diagnosis. */
EQ.CRISIS_WORDS = ['suicide', 'suicidal', 'kill myself', 'end my life', 'end it all', 'want to die',
  'self harm', 'self-harm', 'hurt myself', 'cut myself', 'no reason to live', "don't want to be here",
  'dont want to be here', 'better off without me'];

/* ---------- Sources shown on "How it works" ---------- */
EQ.SOURCES = [
  { t: 'American Academy of Sleep Medicine (2016). Recommended amount of sleep for pediatric populations: consensus statement. Teenagers 13–18: 8–10 h per 24 h.', u: 'https://aasm.org/advocacy/position-statements/teen-sleep-duration-health-advisory/' },
  { t: 'World Health Organization (2020). Guidelines on physical activity and sedentary behaviour. Ages 5–17: average 60 min/day moderate-to-vigorous activity.', u: 'https://www.ncbi.nlm.nih.gov/books/NBK566046/' },
  { t: 'WHO / PAHO (9 November 2026). One in four adolescents worldwide reported no active days in the previous week.', u: 'https://www.paho.org/en/news/9-11-2026-one-four-adolescents-worldwide-reported-no-active-days-previous-week' },
  { t: 'Balban, M. Y. et al. (2023). Brief structured respiration practices enhance mood and reduce physiological arousal. Cell Reports Medicine 4(1).', u: 'https://doi.org/10.1016/j.xcrm.2022.100895' },
  { t: 'US National Weather Service. The heat index equation (Rothfusz regression) and heat index risk levels.', u: 'https://www.wpc.ncep.noaa.gov/html/heatindex_equation.shtml' },
  { t: 'Beck, J. S. Cognitive Behavior Therapy: Basics and Beyond. Thought records and common cognitive distortions.', u: 'https://beckinstitute.org/' },
  { t: 'UAE National Programme for Happiness and Wellbeing. Mental Support Line 800-HOPE (800 4673).', u: 'https://hope.hw.gov.ae' }
];

/* ---------- Build story (edit as you refine the project) ---------- */
EQ.BUILD_LOG = [
  { t: 'Brief from the rubric', d: 'We started from the six judging criteria and wrote a brief: a wellbeing tool for students that is interactive, uses real data, and treats health content responsibly.' },
  { t: 'Choosing the problem', d: 'Exam stress, short sleep and less movement happen together, so one tool that shows the balance between them is more useful than three separate trackers.' },
  { t: 'Fact-checking the health content', d: 'Every target (8–10 h sleep, 60 active minutes) and every support number was checked against its original source before it went in.' },
  { t: 'Making it ours', d: 'Personal touches: the economics idea of equilibrium in the score, a tanpura drone synthesised for the breathing tool, and cricket and padel drills in Move.' },
  { t: 'Testing in a real browser', d: 'An automated script opened every screen in headless Chrome at laptop and phone widths, in light and dark mode, with no data and with a sample fortnight, and checked for errors.' },
  { t: 'Bugs we found and fixed', d: 'Chart legends picked up the wrong styles because two class names clashed; Move repeated the same exercise twice in desk routines; the keyboard focus ring was hidden behind card shadows; finishing a Move routine created a fake check-in with made-up mood and sleep, so we changed it to hold the minutes until you check in.' },
  { t: 'Safety review', d: 'We added the support dialog, the low-mood check, crisis-word detection in free text, and the line that Insights are patterns, not causes.' }
];

/* ---------- Test log ---------- */
EQ.TESTS = [
  ['Every page loads with no console errors', 'Automated headless Chrome run through all 8 pages', 'Pass'],
  ['Check-in saves and updates the score', 'Saved a day, reloaded the page, checked the ring and Insights', 'Pass'],
  ['Works with no data at all', 'Cleared storage; every page shows a helpful empty state', 'Pass'],
  ['Phone layout', 'Checked at 390 px wide; nothing scrolls sideways', 'Pass'],
  ['Keyboard only', 'Tab through nav, forms and dialogs; focus is always visible', 'Pass'],
  ['Safety trigger', 'Mood "Awful" + stress 10, and a crisis phrase in Reframe, both show support lines', 'Pass'],
  ['Heat index maths', 'Compared 35 °C / 60% with the NWS calculator (about 45 °C)', 'Pass'],
  ['Reduced motion', 'Turned on reduced motion; animations stop, timers still work', 'Pass']
];

/* ---------- Code map ---------- */
EQ.CODEMAP = [
  ['index.html', 'Page structure for all eight screens and the dialogs'],
  ['css/styles.css', 'Colours, layout, light and dark themes, phone layout'],
  ['js/content.js', 'All text and data: targets, exercises, breathing patterns, sources'],
  ['js/core.js', 'Saving data, the Balance score formula, the ring graphic, routing, safety checks'],
  ['js/today.js / checkin.js', 'Home screen recommendations and the daily check-in form'],
  ['js/insights.js', 'Charts drawn in SVG and the pattern-finding logic'],
  ['js/breathe.js', 'Breathing animation and the Web Audio tanpura drone'],
  ['js/move.js', 'Routine builder, interval timer and heat index calculator'],
  ['js/reframe.js / focus.js', 'Thought records, focus timer and the sleep trade-off'],
  ['js/main.js', 'Starts everything when the page loads']
];
