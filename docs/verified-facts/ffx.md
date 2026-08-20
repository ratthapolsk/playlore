# Final Fantasy X — verified facts

Primary version: **HD Remaster / International**. PS2-original differences are noted per
entry where they exist. Protocol and the bar for `confirmed`: [`README.md`](README.md).

Append new entries at the bottom of the relevant section. Never delete one.

---

## Equipment and abilities

### What does an unupgraded Celestial Weapon actually do — is it weak?
- **Answer:** It is not weak, it is *incomplete*. A Celestial Weapon **ignores the
  enemy's Defence entirely**, so at full HP it does the same damage a normal weapon
  would against a 0-Defence enemy. What it lacks is **abilities**: fresh, it carries only
  `No AP` plus empty slots, and it stays **capped at 9,999** until the Sigil stage adds
  `Break Damage Limit`.
- **Status:** confirmed
- **Verified:** 2026-08-14
- **Sources:**
  - https://finalfantasy.fandom.com/wiki/Celestial_Weapon (search extraction — 402 on direct fetch)
  - https://gamefaqs.gamespot.com/ps3/643146-final-fantasy-x-x-2-hd-remaster/answers/575069-celestial-weapon-damage-formula
- **Notes:** Corrects the common belief that the weapon is a dud. The second reason it
  disappoints is the HP/MP damage modifier below, which is active from the moment you
  get it.

### Celestial Weapon damage formulas
- **Answer:** HP-scaling weapons (Caladbolg, World Champion, Spirit Lance, Godhand):
  `(10 + 100 × curHP/maxHP) / 110`. MP version (Nirvana, Onion Knight):
  same shape using MP. Masamune is inverted: `(130 − 100 × curHP/maxHP) / 60` — it gets
  **stronger** as HP drops.
- **Status:** confirmed
- **Verified:** 2026-08-14
- **Sources:**
  - https://finalfantasy.fandom.com/wiki/Celestial_Weapon (search extraction)
  - https://gamefaqs.gamespot.com/ps3/643146-final-fantasy-x-x-2-hd-remaster/answers/575069-celestial-weapon-damage-formula
- **Notes:** At 1 HP a Caladbolg user does roughly 9% of full damage. Measure a Celestial
  Weapon's real power at full HP, never at low HP.

### How to power up a Celestial Weapon once you have weapon + Crest + Sigil
- **Answer:** Not automatic. Take the **Celestial Mirror** to the glowing sphere on the
  shimmering path in **Macalania Woods** (the same one that upgraded Cloudy Mirror →
  Celestial Mirror) and interact with it. A **character-select list** appears; each
  selection powers one weapon **one level**. You must do it **twice** and **cannot skip
  the Crest stage**.
- **Status:** confirmed
- **Verified:** 2026-08-14
- **Sources:**
  - https://strategywiki.org/wiki/Final_Fantasy_X/Celestial_Weapons (search extraction — 403 on direct fetch)
  - https://jegged.com/Games/Final-Fantasy-X/Celestial-Weapons/Caladbolg.html
- **Notes:** This is the single most-missed step — players hold every piece and nothing
  happens because they never return to the sphere.

### Brotherhood is not a Celestial Weapon
- **Answer:** Brotherhood auto-upgrades through the story and **never gains
  `Break Damage Limit`**. It is not part of the Crest/Sigil system.
- **Status:** confirmed
- **Verified:** 2026-08-13
- **Sources:**
  - https://jegged.com/Games/Final-Fantasy-X/Celestial-Weapons/
  - https://finalfantasy.fandom.com/wiki/Celestial_Weapon (search extraction)

### `No Encounters` — how to get it and how many characters need it
- **Answer:** Armour auto-ability. Customise with **`Purifying Salt ×30`**. **Only one
  character needs it**, not all three. Best source of Purifying Salt: capture **4 of each
  Drake-type fiend** (Mi'ihen Highroad, Mushroom Rock Road, Thunder Plains, Sanubia
  Desert, Mt. Gagazet) and the Monster Arena owner gives **`Purifying Salt ×99`** as a
  one-time unlock reward. Slow fallback: rare Steal from **Fallen Monk** in Zanarkand
  Ruins, ×1 per steal.
- **Status:** confirmed
- **Verified:** 2026-08-15
- **Sources:**
  - https://jegged.com/Games/Final-Fantasy-X/Tips-and-Tricks/No-Encounters.html
  - https://jegged.com/Games/Final-Fantasy-X/Abilities/Equipment/Armor.html
- **Notes:** Unequip it before farming AP or items — you want random encounters back.

### Does `No Encounters` stop the battles during the Butterfly Hunt?
- **Answer:** **No.** Two separate reasons. Once the Butterfly Hunt starts the game
  **suspends random encounters by itself**, with or without the ability — so it adds
  nothing there. And the battle players actually hit is **not random**: touching a **red
  butterfly** triggers a **forced, unescapable** battle made of Macalania Woods fiends.
  `No Encounters` cannot prevent a triggered battle. The only defence is route knowledge:
  blue butterflies are the targets, red ones are the trap.
- **Status:** confirmed
- **Version:** HD Remaster / International
- **Verified:** 2026-08-15
- **Sources:**
  - Direct play observation by the repo owner, 2026-08-15 — reported still being pulled
    into a fight while wearing `No Encounters` armour, on contact with a red butterfly.
  - https://finalfantasy.fandom.com/wiki/Butterfly_Hunt (search extraction — 402 on direct fetch)
  - https://jegged.com/Games/Final-Fantasy-X/Side-Quests/Butterfly-Catcher.html
- **Notes:** `ref-sidequests.html` briefly claimed `No Encounters` "helps a lot" here.
  Corrected the same day. This entry exists as the worked example of the protocol rule
  that **a player's own console outranks a guide site** — the correction started from an
  observation, and the sources were then found to agree with it.

### Butterfly Hunt — what each butterfly colour does, and the North-course trap
- **Answer:** The **rainbow/green** butterfly is the **starter**, not a target — touching
  it spawns the blue and red ones. **Blue** are the targets: **7 per course**. **Red**
  force an unescapable battle against stronger-than-normal area fiends. There are **two
  separate courses**, one in **Macalania Woods – Central** and one in **Macalania Woods –
  North**, and both must be cleared for the main reward. **North-course trap:** after you
  take the first blue butterfly next to the start point, a replacement spawns **behind
  you**, past the start — running forward along the path means finishing short of 7.
- **Status:** confirmed
- **Version:** HD Remaster / International
- **Verified:** 2026-08-15
- **Sources:**
  - https://jegged.com/Games/Final-Fantasy-X/Side-Quests/Butterfly-Catcher.html
  - https://finalfantasy.fandom.com/wiki/Butterfly_Hunt (search extraction — 402 on direct fetch)
- **Notes:** Borra, the harp-playing creature, gives the rules as a riddle, which is why
  players finish the explanation still not knowing what the green one is for. A run is
  contained in **one zone** — walking into the next zone leaves the run rather than
  continuing it.

### Endgame armour set — customisation costs
- **Answer:** `Auto-Haste` = `Chocobo Wing ×80` – `Auto-Protect` = `Light Curtain ×70` –
  `Auto-Phoenix` = `Mega Phoenix ×20` – `Ribbon` = `Dark Matter ×99`.
- **Status:** confirmed
- **Verified:** 2026-08-15
- **Sources:**
  - https://jegged.com/Games/Final-Fantasy-X/Abilities/Equipment/Armor.html
  - https://game8.co/games/Final-Fantasy-X/archives/270854

### Why does customising an ability rename the piece of gear?
- **Answer:** Equipment names in FFX are **derived, not stored**. The game computes the
  name from the abilities currently attached, picking the one with the **highest
  priority** — so adding `Break HP Limit` to a `Phoenix Shield` renames it
  `Genji Shield`. **Nothing is lost or replaced:** same item, same slots, all previous
  abilities still on it. The 3D model follows the name, which is why the item looks
  different. Adding a still-higher-priority ability renames it again.
  The trailing word is fixed per character: **Tidus** Shield – **Yuna** Ring –
  **Wakka** Armguard – **Lulu** Bangle – **Kimahri** Armlet – **Auron** Bracer –
  **Rikku** Targe.
- **Status:** confirmed
- **Version:** HD Remaster / International
- **Verified:** 2026-08-15
- **Sources:**
  - https://finalfantasy.fandom.com/wiki/Genji_Shield (search extraction — 402 on direct fetch)
  - https://finalfantasy.fandom.com/wiki/Final_Fantasy_X_armor (search extraction)
- **Notes:** This is the same system behind the blank-gear naming already documented on
  `ref-gear.html` — `Tetra*` means a blank 4-slot piece and `Glorious*` a blank 3-slot
  one, because "no abilities attached" is itself a naming case. Practical use: read the
  name to know the contents when sorting hundreds of Omega Ruins drops.

### Proof versus Ward — the two are different recipes
- **Answer:** `Stoneproof` = `Petrify Grenade ×20` but `Stone Ward` = `Soft ×30`.
  `Poisonproof` = `Poison Fang ×12` but `Poison Ward` = `Antidote ×40`. "Proof" is
  ~100% immunity; "Ward" only reduces the chance.
- **Status:** confirmed
- **Verified:** 2026-08-15
- **Sources:**
  - https://jegged.com/Games/Final-Fantasy-X/Abilities/Equipment/Armor.html
  - https://game8.co/games/Final-Fantasy-X/archives/270854
- **Notes:** These were swapped in `19-airship-get-evrae.html` and corrected on
  2026-08-15. If a page tells you Soft ×30 gives Stoneproof, it is wrong.

### Blank 4-slot gear — cheapest sources
- **Answer:** **Weapons:** Rin's Travel Agency on the **Thunder Plains** sells all seven
  blank 4-slot weapons at **41,625 Gil** each after you have the airship. **Armour:**
  Wantz at Macalania Woods is the **only** shop selling genuinely blank 4-slot armour, at
  100,000 Gil. Rin's cheap Tetra armour already has `HP +10%` attached, so it is a
  3-free-slot piece and cannot hold the full endgame set.
- **Status:** confirmed
- **Verified:** 2026-08-15
- **Sources:**
  - https://jegged.com/Games/Final-Fantasy-X/Shops/
  - https://game8.co/games/Final-Fantasy-X/archives/271776
- **Notes:** Buying weapons from Wantz instead of Rin wastes roughly 400,000 Gil.

---

## Bosses and combat

### Evrae (airship) — status immunities
- **Answer:** **Immune to Poison**, and also to Silence, Sleep, Petrify, Zombie, Death,
  Armor Break and Mental Break. **`Power Break` has 0% resistance and always lands.**
  Takes half damage from Fire, Water, Thunder and Ice, with no elemental weakness.
- **Status:** confirmed
- **Verified:** 2026-08-15
- **Sources:**
  - https://game8.co/games/Final-Fantasy-X/archives/269179
  - https://www.gamerguides.com/final-fantasy-x-hd/guide/bestiary/bosses/evrae (search extraction — 403 on direct fetch)
- **Notes:** `19-airship-get-evrae.html` used to recommend Bio here. Corrected
  2026-08-15 — poisoning Evrae wastes a turn.

### Bevelle tower assault — how many battles
- **Answer:** **Five** consecutive battles, with a chance to heal between each:
  (1) 2 rifle Warrior Monks + 1 flamethrower, (2) YKT-63 + 2 flamethrower Monks,
  (3) repeat of 1, (4) repeat of 2, (5) 2 rifle Monks + YAT-99.
- **Status:** confirmed
- **Verified:** 2026-08-15
- **Sources:**
  - https://gamefaqs.gamespot.com/ps2/197344-final-fantasy-x/faqs/79145/bevelle (search extraction — 403 on direct fetch)
  - https://jegged.com/Games/Final-Fantasy-X/Walkthrough/22-Bevelle.html
- **Notes:** YKT-63 and YAT-99 are weak to **Fire and Water**, not Lightning. Kimahri can
  Lancet YKT-63 to learn the Ronso Rage `Thrust Kick`.

### Braska's Final Aeon — which Overdrive it uses
- **Answer:** It picks by target. Against a **character** it uses **Triumphant Grasp**
  (two hits, can inflict Zombie). Against an **Aeon** it uses **Jecht Bomber** (~4,000).
- **Status:** confirmed
- **Verified:** 2026-08-15
- **Sources:**
  - https://finalfantasy.fandom.com/wiki/Braska's_Final_Aeon (search extraction)
  - https://www.gamerguides.com/final-fantasy-x-hd/guide/bestiary/bosses/braskas-final-aeon (search extraction)
- **Notes:** These were stated the wrong way round in `30-dreams-end-final.html` until
  2026-08-15. The usable consequence: summon an Aeon to absorb the Overdrive.

### Yu Yevon cannot be lost
- **Answer:** The party carries permanent, unlimited **Auto-Life** granted by the fayth.
  Gravija removes 75% of *current* HP, so it can never reduce anyone to zero.
- **Status:** confirmed
- **Verified:** 2026-08-15
- **Sources:**
  - https://game8.co/games/Final-Fantasy-X/archives/271780
  - https://finalfantasy.fandom.com/wiki/Yu_Yevon_(boss) (search extraction)

---

## Side quests and minigames

### Sun Sigil — what time the Catcher Chocobo race actually requires
- **Answer:** The final time must be **strictly below zero**. The results screen never
  displays a negative number, so an exact 0:00.0 shows the same "0:0.0" and **does not
  award the Sigil**. Balloons subtract 3 seconds each, bird hits add 3 seconds each, so
  the requirement is: `raw course time − (3 × balloons) + (3 × bird hits) < 0`.
- **Status:** confirmed
- **Verified:** 2026-08-14
- **Sources:**
  - https://jegged.com/Games/Final-Fantasy-X/Side-Quests/Chocobo-Training.html
  - https://www.gamerguides.com/final-fantasy-x-hd/guide/side-activities/chocobo-training/catcher-chocobo (search extraction — 403 on direct fetch)
- **Notes:** This is the single most demoralising trap in the game — players hit 0:0.0,
  see success on screen, and get nothing. A ~36-second run needs 13 balloons; 12 gives
  exactly zero and fails.

### Jecht Shot — what it does in a Blitzball match
- **Answer:** **Both** effects: it removes up to **two** defenders from the shot
  calculation (their `BL` is not subtracted) **and** adds **+5 to Tidus's `SH`**.
  Downside: the animation runs about **20 seconds**.
- **Status:** confirmed
- **Verified:** 2026-08-15
- **Sources:**
  - https://jegged.com/Games/Final-Fantasy-X/Blitzball/Strategy-and-Tips.html
  - https://www.fandomspot.com/ffx-best-blitzball-techniques/
- **Notes:** Two agents in this repo contradicted each other on the `+5` — one wrote "it
  does not raise SH". It does. Settled 2026-08-15.

### Jecht Shot — when you can retry it if you miss it
- **Answer:** **After you gain control of the airship**, by flying to **Kilika Port** and
  taking the ferry to Luca again. Attempts are then unlimited.
- **Status:** confirmed
- **Verified:** 2026-08-15
- **Sources:**
  - https://strategywiki.org/wiki/Final_Fantasy_X/S.S._Winno (search extraction — 403 on direct fetch)
  - https://www.rpgsite.net/feature/8456-final-fantasy-x-jecht-shot-how-to-get-this-vital-blitzball-move-even-if-you-miss-it-the-first-time
- **Notes:** **Not** "after the Luca tournament" — after the tournament the party leaves
  on foot for Mi'ihen Highroad and cannot walk back to a port. Corrected in
  `07-ss-winno-jecht-shot.html` on 2026-08-15.

### S.S. Winno seagull quest
- **Answer:** The answer is **11**, and the reward is **Ace Wizard**, Wakka's blitzball
  carrying the first four `Magic +%` tiers (+3% / +5% / +10% / +20%). It only becomes
  available **after clearing the Djose Temple Cloister of Trials**, so it can never
  appear on the first crossing.
- **Status:** confirmed
- **Verified:** 2026-08-15
- **Sources:**
  - https://finalfantasy.fandom.com/wiki/S.S._Winno (search extraction — 402 on direct fetch)
  - https://strategywiki.org/wiki/Final_Fantasy_X/S.S._Winno (search extraction — 403 on direct fetch)
- **Notes:** Sources disagree on the NPC's gender — Fandom says a woman, StrategyWiki
  says a man. The guide is written gender-neutral rather than picking one.

### The full roster of obtainable Aeons, and what gates the optional three
- **Answer:** **8 obtainable.** Story-mandatory, one per temple: **Valefor** (Besaid),
  **Ifrit** (Kilika), **Ixion** (Djose), **Shiva** (Macalania), **Bahamut** (Bevelle).
  Optional: **Yojimbo** (Cavern of the Stolen Fayth, bought by haggling), **Anima** (Baaj
  Temple, requires opening the Destruction Sphere chest in **all six** temples — Besaid,
  Kilika, Djose, Macalania, Bevelle, Zanarkand), **Magus Sisters** (Remiem Temple,
  requires **both** the `Blossom Crown` and the `Flower Scepter`).
  `Blossom Crown` comes from the Monster Arena owner after **capturing at least one of
  every fiend on Mt. Gagazet**. `Flower Scepter` comes from **Belgemine at Remiem
  Temple** after beating her Aeon duels.
- **Status:** confirmed
- **Version:** HD Remaster / International
- **Verified:** 2026-08-15
- **Sources:**
  - https://jegged.com/Games/Final-Fantasy-X/Aeons/
  - https://gamerant.com/final-fantasy-x-how-to-unlock-every-aeon/ (search extraction)
- **Notes:** Braska's Final Aeon and the Aeons summoned by Isaaru and Belgemine are not
  obtainable. Dark Aeons are superbosses, a separate thing entirely.

### Dark Aeons — how many, and which version has them
- **Answer:** **8 battles** (10 individuals if the three Magus Sisters are counted
  separately). **Not in the PS2 North-American original** — added in the International
  release and present in every HD Remaster. **Penance** appears only after all 8 are
  beaten.
- **Status:** confirmed
- **Verified:** 2026-08-14
- **Sources:**
  - https://finalfantasy.fandom.com/wiki/Penance_(Final_Fantasy_X) (search extraction)
  - https://jegged.com/Games/Final-Fantasy-X/Side-Quests/Dark-Aeons/
- **Notes:** `ref-sidequests.html` said "9" in one place. Corrected 2026-08-15.

### Dark Anima is not in the Gagazet cave
- **Answer:** **Dark Anima** guards the **Mt. Gagazet mountain gate**, not the cave, and
  is a superboss with 8,000,000 HP. **Anima** — the obtainable Aeon — comes from **Baaj
  Temple** after all six Destruction Spheres. They are different entities.
- **Status:** confirmed
- **Verified:** 2026-08-13
- **Sources:**
  - https://jegged.com/Games/Final-Fantasy-X/Side-Quests/Dark-Aeons/Dark-Anima.html
  - https://finalfantasy.fandom.com/wiki/Dark_Aeon (search extraction)

### Yojimbo — what he actually costs
- **Answer:** Ask for **250,000 gil**; you need **more than 190,350 gil** in hand for the
  best outcome, and **compatibility always starts at 128** regardless. The advice to
  "spend your gil first so he asks for less" is **false and harmful**.
- **Status:** confirmed
- **Verified:** 2026-08-13
- **Sources:**
  - https://jegged.com/Games/Final-Fantasy-X/Side-Quests/Yojimbo.html
  - https://finalfantasy.fandom.com/wiki/Yojimbo_(Final_Fantasy_X) (search extraction)

---

## Story structure and progression

### When does the airship become freely controllable?
- **Answer:** **After Yunalesca is defeated in Zanarkand.** Cid picks the party up, and
  only then does the **NavMap** open for choosing destinations and entering the secret
  coordinates and passwords.
- **Status:** confirmed
- **Verified:** 2026-08-15
- **Sources:**
  - https://game8.co/games/Final-Fantasy-X/archives/271783
  - https://jegged.com/Games/Final-Fantasy-X/Walkthrough/29-Airship-Highbridge.html
- **Notes:** At the Evrae fight the airship is a scripted story vehicle to Bevelle only.
  After Bevelle the party escapes on foot through Via Purifico and walks Calm Lands →
  Gagazet → Zanarkand with no airship at all. `19-airship-get-evrae.html` claimed free
  flight started there; corrected 2026-08-15.

### The Highbridge visit to Maester Mika is mandatory
- **Answer:** Mandatory. Until you clear the Highbridge scene, **"Sin" does not appear as
  a NavMap destination at all**, so the final assault cannot be started.
- **Status:** confirmed
- **Verified:** 2026-08-14
- **Sources:**
  - https://jegged.com/Games/Final-Fantasy-X/Walkthrough/29-Airship-Highbridge.html
  - https://finalfantasy.fandom.com/wiki/Walkthrough:Final_Fantasy_X/Apoqliphoth/Part_22 (search extraction)

### FFX has no post-game save and no New Game+
- **Answer:** There is **no Clear Data save** and **no New Game+** in FFX. The credits
  end and the game returns to the title screen without creating a save. The only way back
  is a save file you made yourself before the point of no return. (FFX-2 does have New
  Game+; FFX does not.)
- **Status:** confirmed
- **Verified:** 2026-08-15
- **Sources:**
  - https://gamefaqs.gamespot.com/vita/730650-final-fantasy-x-x-2-hd-remaster/faqs/27317 (search extraction — 403 on direct fetch)
  - https://gamefaqs.gamespot.com/ps3/643146-final-fantasy-x-x-2-hd-remaster/answers/369531-new-game-plus-for-ffx (search extraction)
- **Notes:** Pages 29 and 30 previously described a Clear Data save. Corrected
  2026-08-15. This is high-stakes: a reader who believes it may overwrite their only
  pre-endgame save.

---

## Stat mechanics

### Luck — why it is the stat that matters at the top end
- **Answer:** `AcNum = (Accuracy × 0.4) − target Evasion + 9`, which maps to a base hit
  rate on a fixed ladder (≤0 → 25%, 7 → 80%, ≥8 → 100%). Final hit rate is
  `base accuracy + attacker Luck − target Luck`, and crit rate is
  `attacker Luck − target Luck + equipment crit bonus`. Because characters apply only
  **40%** of Accuracy, 255 Accuracy contributes just 102, and against 111+ Evasion the
  base rate is locked at 25% — Luck is added **outside** that cap, which is why it is the
  stat that makes superbosses possible.
- **Status:** confirmed
- **Verified:** 2026-08-14
- **Sources:**
  - https://game8.co/games/Final-Fantasy-X/archives/271774
  - https://finalfantasy.fandom.com/wiki/Luck_(stat) (search extraction)
- **Notes:** Agility stops helping at **170** — tick speed bottoms out there and further
  nodes are wasted. Luck also floors the effect of Darkness: blindness sets base accuracy
  to 10% but does not touch the Luck term.

### Does Luck affect item drop rates?
- **Answer:** Unknown. No verifiable source confirms or denies it. Luck **does not**
  affect Steal.
- **Status:** disputed
- **Verified:** 2026-08-14
- **Sources:**
  - https://finalfantasy.fandom.com/wiki/Luck_(stat) (search extraction — silent on drops)
- **Notes:** Do not farm Luck for drop rates on the strength of forum claims. Recorded
  here specifically so nobody spends tokens re-searching a question that has no answer.

---

## Gear deep-dive (verified 2026-08-16)

### Celestial Weapons — the exact four abilities on each fully upgraded weapon
- **Answer:** Every weapon gets `Break Damage Limit` + `Triple Overdrive` plus two unique.
  **Caladbolg** – Evade & Counter, Magic Counter. **Nirvana** – Double AP, One MP Cost.
  **Masamune** – First Strike, Counterattack. **World Champion** – Double AP, Evade &
  Counter. **Onion Knight** – Magic Booster, One MP Cost. **Spirit Lance** – Double AP,
  Evade & Counter. **Godhand** – Double AP, Gillionaire. `First Strike` is on **Masamune
  only**; **no** Celestial carries `Piercing`.
- **Status:** confirmed
- **Version:** HD Remaster / International
- **Verified:** 2026-08-16
- **Sources:**
  - https://jegged.com/Games/Final-Fantasy-X/Celestial-Weapons/Caladbolg.html (and sibling per-weapon pages)
  - https://game8.co/games/Final-Fantasy-X/archives/270607 (and 271606, 271607, 271770, 271603, 271767, 271599)
- **Notes:** All 28 abilities are customisable onto blank gear, so a Celestial's ability
  set can be rebuilt exactly. Its exclusive property is the damage formula, not the kit.

### Celestial Weapon special properties do NOT apply to Overdrives
- **Answer:** Both the HP/MP damage multiplier **and** the Defence-ignoring apply only to
  **normal attacks, skills and counterattacks**. During an Overdrive a Celestial behaves
  exactly like an ordinary weapon carrying the same auto-abilities.
- **Status:** confirmed
- **Version:** HD Remaster / International
- **Verified:** 2026-08-16
- **Sources:**
  - https://gamefaqs.gamespot.com/ps2/197344-final-fantasy-x/faqs/79145/the-celestial-weapons (search extraction — 403 on direct fetch)
  - https://steamcommunity.com/app/359870/discussions/0/1291817208493317616/
- **Notes:** The GameFAQs FAQ and the Fandom Celestial Weapon page share near-identical
  wording and count as one source lineage; the Steam thread is the independent second.
  Consequence: a character whose damage comes from an Overdrive (Wakka via Attack Reels)
  loses almost nothing using a customised blank weapon, which makes `Jupiter Sigil`
  skippable for damage purposes.

### Weapon `Break Damage Limit` lifts the 9,999 cap on Overdrives too
- **Answer:** Yes. Attack Reels, Blitz Ace and Banishing Blade all exceed 9,999 with it
  equipped. The only stated exception anywhere is items.
- **Status:** confirmed
- **Version:** HD Remaster / International
- **Verified:** 2026-08-16
- **Sources:**
  - https://jegged.com/Games/Final-Fantasy-X/Characters/Wakka.html
  - https://finalfantasy.fandom.com/wiki/Break_Damage_Limit_(Final_Fantasy_X) (search extraction — 402 on direct fetch)
- **Notes:** Auron's `Tornado` was named by no source — inferred only, not confirmed.
  Overdrives are their own damage category, so `Strength +%` gear and Protect/Shell do not
  interact with them the way they do with normal attacks.

### Customisation costs — full verified block, weapon and armour
- **Answer:** **Weapon** – `Break Damage Limit` Dark Matter ×60 – `Triple Overdrive`
  Winning Formula ×30 – `Double Overdrive` Underdog's Secret ×30 – `One MP Cost` Three
  Stars ×20 – `Half MP Cost` Twin Stars ×20 – `Magic Booster` Turbo Ether ×30 –
  `Gillionaire` Designer Wallet ×30 – `Triple AP` Wings to Discovery ×50 – `Double AP`
  Megalixir ×20 – `Overdrive → AP` Door to Tomorrow ×10 – `Evade & Counter` Teleport
  Sphere ×1 – `Counterattack` Friend Sphere ×1 – `Magic Counter` Shining Gem ×16 –
  `First Strike` Return Sphere ×1 – `Piercing` Lv.2 Key Sphere ×1 – `Initiative` Chocobo
  Feather ×6 – `Sensor` Ability Sphere ×2.
  **Armour** – `Break HP Limit` Wings to Discovery ×30 – `Break MP Limit` Three Stars ×30
  – `Auto-Potion` Stamina Tablet ×4 – `Auto-Shell` Lunar Curtain ×80 – `Auto-Regen`
  Healing Spring ×80 – `Auto-Med` Remedy ×20 – `Deathproof` Farplane Wind ×60 –
  `Defense +20%` Blessed Gem ×4 – `Magic Def +20%` Blessed Gem ×4 – `HP +30%` Stamina
  Tonic ×1 – `MP +30%` Mana Tonic ×1 – `Master Thief` Pendulum ×30 – `Pickpocket`
  Amulet ×30 – `SOS Haste` Chocobo Feather ×20.
- **Status:** confirmed
- **Version:** HD Remaster / International
- **Verified:** 2026-08-16
- **Sources:**
  - https://jegged.com/Games/Final-Fantasy-X/Abilities/Equipment/Weapon.html and .../Armor.html
  - https://game8.co/games/Final-Fantasy-X/archives/270788 (weapons) and /270789 (armour)
- **Notes:** Both `Break Damage Limit` and `Break HP Limit` are ordinary Customize entries
  on blank gear, not drop-only. `Break HP Limit` and `Triple AP` share one material — plan
  a single farm of 80 Wings to Discovery rather than two separate trips.

### `Auto-Haste` has no substitute; `Auto-Protect` has a cheap partial one
- **Answer:** `Chocobo Wing ×80` is the **only** recipe for `Auto-Haste` — no alternative
  material and no cheaper always-on equivalent exist. `SOS Haste` fires only at critical
  HP. For `Auto-Protect` (Light Curtain ×70, 50% physical cut) the cheap partial stand-in
  is **`Defense +20%` = Blessed Gem ×4**, a flat 20% cut by a different mechanism that
  **stacks** with Auto-Protect. `SOS Protect` (Light Curtain ×8) is the same 50% but only
  at critical HP.
- **Status:** confirmed
- **Version:** HD Remaster / International
- **Verified:** 2026-08-16
- **Sources:**
  - https://game8.co/games/Final-Fantasy-X/archives/270884 (Auto-Haste) and /270879 (Defense +20%)
  - https://jegged.com/Games/Final-Fantasy-X/Abilities/Equipment/Armor.html
- **Notes:** Auto-Haste also confers Slow immunity and cannot be Dispelled, which no
  cheaper option reproduces.

### `Break HP Limit` does nothing until max HP already exceeds 9,999
- **Answer:** The ability **grants no HP**. It only removes the 9,999 cap, so on a
  character whose max HP is still 9,999 it has literally no effect. It becomes meaningful
  only after heavy HP-node investment on a broken Sphere Grid.
- **Status:** confirmed
- **Version:** HD Remaster / International
- **Verified:** 2026-08-16
- **Sources:**
  - https://game8.co/games/Final-Fantasy-X/archives/270857
  - https://jegged.com/Games/Final-Fantasy-X/Abilities/Equipment/Armor.html
- **Notes:** This is why the general-purpose endgame set omits it — armour has only four
  slots. Whether to run it at all is community strategy opinion, not a game rule.

### Capture weapons — one free slot, cannot be customised, per-character names
- **Answer:** Bought from the Monster Arena owner at **9,075 Gil** each. Each is `Capture`
  **plus exactly one empty slot** — that is the whole weapon. `Capture` cannot be
  customised onto a normal weapon. `Capture` is also the dominant ability, so the weapon's
  name never changes whatever you add. Names: **Taming Sword** (Tidus) – **Herding Staff**
  (Yuna) – **Catcher** (Wakka) – **Trapper Mog** (Lulu) – **Taming Spear** (Kimahri) –
  **Beastmaster** (Auron) – **Iron Grip** (Rikku).
- **Status:** confirmed
- **Version:** HD Remaster / International
- **Verified:** 2026-08-16
- **Sources:**
  - https://finalfantasy.fandom.com/wiki/Catch_(ability) (search extraction — 402 on direct fetch)
  - https://strategywiki.org/wiki/Final_Fantasy_X/Monster_Arena (search extraction — 403 on direct fetch)
- **Notes:** A "Capture + Triple AP + Overdrive → AP + Triple Overdrive" loadout is
  therefore impossible; capturing and AP farming need two different weapons. Recommended
  single slot is `Triple AP`, the only one of the three that yields anything without a
  partner slot. `ref-gear.html` asserted the impossible build until 2026-08-16.

### AP-farm multipliers — what stacks and what does not
- **Answer:** `Overdrive → AP` × `Triple Overdrive` × `Triple AP` on one weapon gives
  roughly **9× base AP**. `Triple AP` and `Double AP` **do not stack** — the higher one
  applies. Same for `Triple Overdrive` versus `Double Overdrive`. For the Don Tonberry
  trick the character **taking** the Karma counter must be set to **Stoic** and the two
  supporting characters to **Comrade**; the receiving character's armour needs
  `Auto-Phoenix`.
- **Status:** confirmed
- **Version:** HD Remaster / International
- **Verified:** 2026-08-16
- **Sources:**
  - https://game8.co/games/Final-Fantasy-X/archives/271968
  - https://steamcommunity.com/sharedfiles/filedetails/?id=686086248
- **Notes:** jegged's Quick-Leveling page describes the Overdrive Mode loosely without
  splitting it by role. Only Stoic-on-self makes the trick function.

### Monster Arena capture-completion rewards are ONE-TIME, not repeatable
- **Answer:** The ×99 lots are granted **once**, when you first speak to the arena owner
  after meeting the capture requirement. Releasing and re-capturing does not re-award them.
  Confirmed pairs: Cactuar King → Chocobo Wing ×99 – Juggernaut → Light Curtain ×99 –
  Pteryx → Mega Phoenix ×99 – Ultima Buster → Dark Matter ×99 – Neslug → Winning
  Formula ×99. Repeatable fallbacks: Chocobo Wing by Bribing **Machea** (Omega Ruins,
  ~360,000 Gil); Light Curtain from **Fafnir** drops (~20 per kill); Mega Phoenix by
  Bribing **Ghost** (~199,980 Gil); Dark Matter from **Dark Aeon** drops and the **Dark
  Yojimbo** reset loop; Winning Formula by Bribing **Sand Worm** (900,000 Gil, ~15) and
  from **Ultima Buster** drops.
- **Status:** confirmed
- **Version:** HD Remaster / International
- **Verified:** 2026-08-16
- **Sources:**
  - https://jegged.com/Games/Final-Fantasy-X/Monster-Arena/Rewards.html
  - https://game8.co/games/Final-Fantasy-X/archives/271795
- **Notes:** This number sizes the whole endgame. Seven Ribbons need **693 Dark Matter**
  against a single 99 lot — which is why kitting **three** characters (297) is the sane
  target, since only three fight at once. Bribe becomes 100% reliable once the Gil offered
  reaches 25× the target's max HP.

### Blank 4-slot gear — per-character names
- **Answer:** **Weapons:** Variable Steel (Tidus) – Malleable Staff (Yuna) – All-Rounder
  (Wakka) – Morphing Mog (Lulu) – Shapeshifter (Kimahri) – Shiranui (Auron) – Flexible
  Arm (Rikku). **Armour:** every `Tetra`-prefixed piece is the blank 4-slot version —
  Tetra Shield – Tetra Ring – Tetra Armguard – Tetra Bangle – Tetra Armlet – Tetra
  Bracer – Tetra Targe, in that same character order.
- **Status:** confirmed
- **Version:** HD Remaster / International
- **Verified:** 2026-08-16
- **Sources:**
  - https://jegged.com/Games/Final-Fantasy-X/Weapons/Longswords.html (and sibling type pages)
  - https://finalfantasy.fandom.com/wiki/Tetra_Bangle (search extraction — 402 on direct fetch)

### The four cheap one-off customisation Spheres — where to farm them
- **Answer:** `Teleport Sphere` (Evade & Counter) – drops from **Master Tonberry** in
  Omega Ruins, Bribe **Barbatos** inside Sin. `Return Sphere` (First Strike) – Bribe
  **Dark Element** at the Cavern of the Stolen Fayth for only **36,000 Gil**, the cheapest
  of the group. `Friend Sphere` (Counterattack) – Bribe **Coeurl** at Calm Lands
  120,000 Gil, drops from **Biran Ronso** and **Yenke Ronso**. `Lv.2 Key Sphere`
  (Piercing) – common drop from **Defender Z** in Zanarkand Ruins, a farmable random
  encounter, and Bribe **Behemoth** on Mt. Gagazet 460,000 Gil.
- **Status:** confirmed
- **Version:** HD Remaster / International
- **Verified:** 2026-08-16
- **Sources:**
  - https://jegged.com/Games/Final-Fantasy-X/Items/Spheres.html
  - https://game8.co/games/Final-Fantasy-X/archives/271303 (and 271814, 271821)
- **Notes:** Each ability needs only 1 sphere per weapon, so quantity is never the
  bottleneck for these four.

### `Magic Booster` — exact scope, and what it costs alongside `One MP Cost`
- **Answer:** +50% magic **power**, doubling MP cost. It boosts black magic, white magic
  damage (Holy) **and healing spells** — "damage only" understates it. Status spells with
  no damage or healing get the doubled cost and no benefit. With `One MP Cost` equipped
  the reduction applies first and the doubling second, landing at **2 MP per spell**,
  not 1.
- **Status:** confirmed
- **Version:** HD Remaster / International
- **Verified:** 2026-08-16
- **Sources:**
  - https://jegged.com/Games/Final-Fantasy-X/Abilities/Equipment/Weapon.html
  - https://www.fandomspot.com/ffx-magic-booster/
- **Notes:** Relevant to Lulu's Onion Knight, which carries both by design. The Holy part
  rests on search-synthesised snippets rather than a verbatim line naming Holy.

### Unresolved — recorded so nobody re-pays for these searches
- **`Friend Sphere` quantity from a Coeurl bribe** — sources say 2 or 3 per 120,000 Gil.
  **Status:** disputed. Written without a quantity.
- **`Land Worm` bribe price for Dark Matter** — jegged says 1,600,000 Gil, others say
  2,000,000. **Status:** disputed. Left out of the page; Dark Aeon farming used instead.
- **Fafnir dropping 40 Light Curtain on Overkill** — **Status:** single-source. The base
  ~20 per kill is confirmed twice and is what the page states.
- **Ironclad stealing Light Curtain ×4** — **Status:** single-source. Omitted.
- **Blessed Gem farm location** — the ×4 cost is confirmed but no verified source for
  where it is farmed. **Status:** unverified, and the page says so rather than guessing.
- **Auron's `Tornado` uncapped by `Break Damage Limit`** — only `Banishing Blade` was
  explicitly sourced. **Status:** unverified. Not claimed on the page.

### `Piercing` is NOT redundant on a Celestial Weapon — armored and Defence are different mechanics
- **Answer:** A Celestial Weapon ignores the enemy's **Defence stat**. It does **not**
  bypass the separate **"armored"** property, which cuts non-Piercing physical damage to
  **one third**. **No Celestial Weapon carries `Piercing`**, so a fully upgraded Caladbolg
  still does 1/3 damage to an armored enemy such as Iron Giant or Defender. `Piercing`
  (Lv.2 Key Sphere ×1) is therefore the one ability that covers a gap a Celestial cannot
  close by itself.
- **Status:** confirmed
- **Version:** HD Remaster / International
- **Verified:** 2026-08-16
- **Sources:**
  - https://finalfantasy.fandom.com/wiki/Celestial_Weapon (search extraction — 402 on direct fetch)
  - https://gamefaqs.gamespot.com/boards/197344-final-fantasy-x/56025562 ("Celestial Weapons do *not* pierce defenses?" — consistent community testing)
- **Notes:** This is the strongest argument for keeping a `Piercing` backup weapon for
  every physical attacker, and it corrects the widespread assumption that "ignores
  Defence" and "pierces armour" are the same thing.

### `First Strike` does not work in boss battles
- **Answer:** It grants the first turn **only in random encounters**; boss fights and some
  Monster Arena battles are excluded. Its real value is therefore outside the fights that
  decide anything — random-encounter grinding, capture runs, and surviving **Omega Ruins**
  where acting first is what stops **Great Malboro** landing **Bad Breath**.
- **Status:** single-source (leaning confirmed)
- **Version:** HD Remaster / International
- **Verified:** 2026-08-16
- **Sources:**
  - https://finalfantasy.fandom.com/wiki/First_Strike_(ability) (search extraction — 402 on direct fetch) — the only source stating the boss exclusion outright
  - https://jegged.com/Games/Final-Fantasy-X/Tips-and-Tricks/First-Strike.html — does not mention bosses at all, but only ever recommends it for random encounters, which is consistent
- **Notes:** Deliberately **not** marked `confirmed` — one source states the rule and the
  other is merely consistent with it, which does not meet the two-independent-sources bar.
  Practical consequence either way: `Piercing` belongs on a combat weapon and
  `First Strike` on the Capture weapon. `Masamune` carries `First Strike` innately, so
  bringing Auron covers the Omega Ruins case without spending anyone's slot.

### `Counterattack` versus `Evade & Counter`
- **Answer:** `Evade & Counter` is a **strict upgrade**. `Counterattack` (Friend Sphere ×1)
  strikes back but the character **still takes the damage**; `Evade & Counter` (Teleport
  Sphere ×1) **avoids the damage entirely** and then strikes back. Equipping both wastes a
  slot — both grant the counter, only the second adds evasion. When evasion fails against
  a high-Accuracy enemy the character **still counters**, so there is no case where both
  halves are lost at once.
- **Status:** confirmed
- **Version:** HD Remaster / International
- **Verified:** 2026-08-16
- **Sources:**
  - https://finalfantasy.fandom.com/wiki/Counter_(status) (search extraction — 402 on direct fetch)
  - https://game8.co/games/Final-Fantasy-X/archives/270814 (effect and cost)
- **Notes:** `Masamune` carries `Counterattack` while Caladbolg, World Champion and Spirit
  Lance carry `Evade & Counter` — an asymmetry fixed by the game and unremovable, offset
  by Masamune being the only weapon with `First Strike`. On any weapon you customise
  yourself, always pick `Evade & Counter`. One untested caveat: evading means not being
  hit, which works against Overdrive modes that charge from taking damage (Stoic) — that
  is inference from confirmed mechanics, not a sourced test.

### `Double AP` and `Gillionaire` are dead slots on a Celestial Weapon at endgame
- **Answer:** Celestial abilities cannot be removed, so a weapon that ships with a farming
  ability permanently spends a slot on something useless once the Sphere Grid is opened
  and Gil is plentiful. **Godhand (Rikku) loses 2 of 4** (`Double AP` + `Gillionaire`) —
  the worst ratio of the seven. **Nirvana (Yuna)**, **World Champion (Wakka)** and
  **Spirit Lance (Kimahri)** each lose 1 to `Double AP`. **Caladbolg**, **Masamune** and
  **Onion Knight** lose none.
- **Status:** confirmed
- **Version:** HD Remaster / International
- **Verified:** 2026-08-16
- **Sources:**
  - https://jegged.com/Games/Final-Fantasy-X/Celestial-Weapons/ (per-weapon ability lists)
  - https://game8.co/games/Final-Fantasy-X/archives/270607 (and sibling per-weapon pages)
- **Notes:** The design consequence, raised by the repo owner: a backup weapon should
  **compensate for the dead slot rather than copy the Celestial's kit**, and every farming
  ability belongs on a separate third weapon swapped in only for farming. `ref-gear.html`
  originally gave Yuna a backup containing `Double AP` and Rikku one containing
  `Gillionaire` — both repeated the very slot that is dead. Corrected 2026-08-16.

### Monster Arena — how many captures each unlock category actually needs
- **Answer:** ~~**Area Conquest** and **Species Conquest** both need only **ONE of each
  fiend**~~ — **WRONG for Species Conquest. See the corrected entry below.**
- **Status:** superseded 2026-08-16 by "Species Conquest quotas vary per species"
- **Notes:** Kept, not deleted, because `ref-sidequests.html` carried this wrong figure
  for part of 2026-08-16 and any page written against it needs re-checking. **The failure
  worth learning from:** this entry was marked `confirmed` while the `No Encounters`
  entry in this same file already said "capture **4 of each** Drake-type fiend" — which
  is a Species Conquest quota and directly contradicted it. Two outside sources agreed
  with each other and were believed, and the file was never checked against itself.
  `README.md` now requires that check.
- **Version:** HD Remaster / International
- **Verified:** 2026-08-16
- **Sources:**
  - https://game8.co/games/Final-Fantasy-X/archives/270615 ("Only 1 fiend each are required to unlock the said monsters")
  - https://eip.gg/ffx-x2/guides/auron-celestial-weapon-masamune/ ("capture at least one of every fiend in an area … at least one of every fiend in the same species")
- **Notes:** A WebFetch summary of jegged's Monster Arena overview rendered Species
  Conquest as "ten of every fiend of a specific species", which contradicts both sources
  above. Treated as a bad summary rather than a third position, but recorded here so the
  discrepancy is not rediscovered. `ref-sidequests.html` carried the wrong "10" figure
  until 2026-08-16 — a costly error, because it makes the task look ten times larger than
  it is and drives players to abandon it.

### Mars Sigil — what it actually requires
- **Answer:** Unlock **any 10 creations from Area Conquest and Species Conquest
  combined**. The mix is free — all Area, all Species, or any blend. **Original creations
  do not count** toward the 10. Since each of those unlocks needs only one of each fiend,
  Mars Sigil never requires capturing ten of anything.
- **Status:** confirmed
- **Version:** HD Remaster / International
- **Verified:** 2026-08-16
- **Sources:**
  - https://game8.co/games/Final-Fantasy-X/archives/271392
  - https://eip.gg/ffx-x2/guides/auron-celestial-weapon-masamune/
- **Notes:** Mars Sigil upgrades **Masamune** (Auron).

### The Monster Arena area menu — the two "Unknown" entries
- **Answer:** The area-select list runs **left to right across each row**, not down each
  column, in the game's own order: Besaid – Kilika – Mi'ihen Highroad – Mushroom Rock
  Road – Djose Road – Thunder Plains – Macalania – Bikanel – Calm Lands – Stolen Fayth
  Cavern – Mt. Gagazet – **Inside Sin** – Omega Dungeon, then the three creation
  categories Area Conquest – **Species Conquest** – Original. So the two greyed-out
  `Unknown` rows are **Inside Sin** (position 12) and **Species Conquest** (position 15).
  An area shows as `Unknown` until at least one fiend has been captured there; a category
  shows as `Unknown` until its first creation is unlocked.
- **Status:** confirmed
- **Version:** HD Remaster / International
- **Verified:** 2026-08-16
- **Sources:**
  - https://jegged.com/Games/Final-Fantasy-X/Monster-Arena/ (13 capture areas in order, plus the three categories and their unlock conditions)
  - https://game8.co/games/Final-Fantasy-X/archives/270615
- **Notes:** ~~Inside Sin sits past the point of no return, so its fiends must be captured
  during the single run through Sin — there is no coming back.~~ **This half of the note
  was wrong and is corrected in
  [`monster-arena-fiends.md`](monster-arena-fiends.md) §12 (verified 2026-08-16):** you
  can **leave Sin by airship and return as often as you like** using any Save Sphere. The
  one-way gate is **entering the Nucleus**, not entering Sin. What remains true: only 3 of
  the 9 fiends are confirmed to still spawn past that gate, so capture all 9 before
  touching the glyph — and missing the area still blocks `Original`, which blocks
  **Nemesis**.
  **Why it was wrong:** written from the general "Inside Sin is past the point of no
  return" framing without checking where the gate actually sits. The specific research
  pass found jegged stating it verbatim: *"There is no way to leave and go back once you
  have entered 'The Nucleus.'"*

### Species Conquest quotas vary per species (supersedes the "one of each" entry)
- **Answer:** **Area Conquest** genuinely needs **one of each** fiend in the area. **Species
  Conquest does not** — each species has its own quota of **N of each fiend in that
  species**, and N differs by species:
  **3** — Lupine (→ Fenrir) – Reptile (→ Ornitholestes) – Flan (→ Jumbo Flan).
  **4** — Wasp (→ Hornet) – Imp (→ Vidatu) – Evil Eye (→ One-Eye) – Drake (→ the
  `Purifying Salt ×99` reward).
  **5** — Bird (→ Pteryx).
  **10** — Iron Giant (→ Ironclad).
  Separately, **Nemesis** needs **10 of every fiend in the entire game**.
- **Status:** confirmed
- **Version:** HD Remaster / International
- **Verified:** 2026-08-16
- **Sources:**
  - https://jegged.com/Games/Final-Fantasy-X/Monster-Arena/Species-Conquest/Fenrir.html — verbatim: "You can unlock Fenrir by capturing three of each Wolf/Lupine-type fiend"
  - https://finalfantasy.neoseeker.com/wiki/Monster_Arena_(FFX)/Species_Conquest and https://strategywiki.org/wiki/Final_Fantasy_X/Species_Conquest (search extraction — the per-species quota table)
  - Corroborated **inside this file**: the `No Encounters` entry (verified 2026-08-15)
    already stated "capture **4 of each** Drake-type fiend" for the `Purifying Salt ×99`
    reward, which is a Species Conquest quota.
- **Notes:** Check the specific species' quota before farming — assuming a flat number in
  either direction wastes real time. Assuming 1 leaves the creation unlocked-looking but
  never unlocking; assuming 10 makes the job up to three times longer than it needs to be.

### Process rule this file learned the hard way
- **Answer:** **A new entry must be checked against the entries already in this file
  before it is marked `confirmed`.** Two agreeing outside sources are not enough if the
  file itself already says otherwise — the contradiction is evidence that one side is
  wrong, and it has to be resolved rather than overwritten.
- **Status:** confirmed (process, not a game fact)
- **Verified:** 2026-08-16
- **Notes:** On 2026-08-16 a "Species Conquest needs one of each" entry was written and
  marked `confirmed` on the strength of two outside sources, while the `No Encounters`
  entry three screens above already implied a quota of 4. The wrong figure reached
  `ref-sidequests.html` and was given to the repo owner as an answer before a research
  agent caught it. The check that would have prevented it costs one `grep`.

### Cactuar Nation sidequest — what happens when you lose the gatekeeper minigame
- **Answer:** **Losing does not cost you the Mercury Sigil.** Each of the 10 Cactuar
  Gatekeepers in Sanubia Desert runs a red-light/green-light chase minigame (run while it
  looks away, freeze when it turns). You get **three attempts** per gatekeeper; being seen
  or running out of time burns one. Win and you receive that Cactuar's Sphere; **lose all
  three and you still receive a `Sphere del Perdedor` ("sphere of the loser"), and it
  counts exactly the same** when placed in the Cactuar Stone. The only way to fail the
  sidequest is to **not return all ten spheres** — the win/lose ratio is irrelevant to the
  Sigil itself.
- **What the ratio does change:** the *second* chest at the end scales with wins —
  `Potion` (0–2 wins), `Elixir` (3–5), `Megalixir` (6–7), `Friend Sphere` (8–10).
- **Status:** confirmed
- **Version:** HD Remaster / International
- **Verified:** 2026-08-19
- **Sources:**
  - https://jegged.com/Games/Final-Fantasy-X/Side-Quests/Village-of-the-Cactuars.html
    ("You do not need to complete each of the Cactuar mini-games to receive the Mercury
    Sigil at the conclusion")
  - https://strategywiki.org/wiki/Final_Fantasy_X/Cactuar_Minigame and
    https://www.gamerguides.com/final-fantasy-x-hd/guide/side-activities/village-of-the-cactuars/village-of-the-cactuars
    (search extraction — both sites 403 on direct fetch)
- **Disputed detail — do not state as fact:** the top prize boundary. One source gives
  `Friend Sphere` at 8–10 wins, another at 9–10. The lower tiers agree. Until this is
  settled, describe the top tier as "almost all of them" rather than naming a number.
- **Notes:** This is a different system from capturing Cactuar for the Monster Arena, and
  the two are constantly confused because both involve the number 10. The **Monster Arena**
  Cactuar is an ordinary random encounter in Bikanel fought with a capture weapon. The
  **gatekeeper** Cactuars are not battles at all and cannot be captured. Catching wild
  Cactuar does not advance the sidequest, and losing the minigame does not affect any
  capture count.
- **Correction made during this entry’s own cross-check:** a first draft of this note said
  Bikanel **Area Conquest** needs 10 captures of each fiend. That contradicts the confirmed
  entry "Species Conquest quotas vary per species" already in this file, which states
  **Area Conquest needs one of each fiend in the area**. The figure **10** belongs to
  **Nemesis**, which needs 10 of every fiend in the entire game. Both numbers are real and
  they attach to different unlocks, which is precisely why they get swapped.


### A fiend that roams several areas gives capture credit to exactly one of them
- **Answer:** Many fiends appear in more than one area, but the Monster Arena credits the
  capture to **one area only** — generally the first area in the game where that fiend can
  appear — **no matter where you actually caught it**. The published example is
  **Nidhogg**, which roams Mt. Gagazet as well, yet always counts toward **Cavern of the
  Stolen Fayth**. Practical consequence: **catch a fiend wherever it is easiest to find;
  the credit lands on its home area regardless.**
- **Status:** single-source
- **Version:** HD Remaster / International
- **Verified:** 2026-08-19
- **Sources:** the statement appears on
  https://gamefaqs.gamespot.com/pc/190170-final-fantasy-x-x-2-hd-remaster/faqs/79145/monster-arena
  and is repeated at https://strategywiki.org/wiki/Final_Fantasy_X/Monster_Arena and
  https://eip.gg/ffx-x2/guides/monster-arena/ — **in near-identical wording, so these are
  very likely one source reprinted, not three independent ones.** Marked `single-source`
  for that reason. jegged's arena index does not mention the rule at all.
- **Corroborated inside this repo:** `ref-monster-arena.html` already told readers that
  Wraith, Demonolith, Great Malboro and Adamantoise can be caught in Omega Dungeon and
  still count toward Inside Sin — the same rule, written before it had a name here.
- **Notes:** The full list of which fiends overlap which areas has never been published.
  Six are confirmed (the four above, plus Nidhogg and Malboro); treat any other overlap as
  unknown rather than assuming the list is complete.

### Malboro does appear in the Cavern of the Stolen Fayth — jegged's fiend list omits it
- **Answer:** **Malboro roams the Cavern of the Stolen Fayth**, specifically **in the
  rooms and not in the connecting hallways.** In the Calm Lands — the area it is listed
  under for arena purposes — it appears only around **the ramp down that a man stands
  guarding**, at a very low encounter rate. Because capture credit follows the fiend and
  not the location (see the entry above), **catching one in the Cavern still completes the
  Calm Lands requirement**, and the Cavern is the faster place to hunt it.
- **Status:** confirmed
- **Version:** HD Remaster / International
- **Verified:** 2026-08-19
- **Sources:**
  - https://finalfantasy.fandom.com/wiki/Malboro_(Final_Fantasy_X) (search extraction —
    the site 402s on direct fetch): "occasionally in the rooms (not hallways) in the
    Cavern of the Stolen Fayth"
  - https://gamefaqs.gamespot.com/boards/197344-final-fantasy-x/46633604 and
    http://ffxfiendsandstrategies.blogspot.com/2008/11/calm-lands.html — the Calm Lands
    spawn area and its low rate
- **How this was found, and why it is worth recording:** **the player reported it from
  their own screen.** Two direct fetches of jegged — the arena page for the Cavern and the
  location page for the Cavern — both list nine fiends without Malboro, so the repo's
  primary reference is simply incomplete here. This is the protocol working exactly as
  written: a player's console outranks every website, and the correct response was to
  re-verify rather than to argue.


### Jupiter Crest — the full location, and why "Luca" alone is not one
- **Answer:** **Luca is a city** — the port city that hosts Spira's blitzball stadium. The
  Jupiter Crest is inside **Luca Stadium**, down in the **basement**, in the **Besaid
  Aurochs locker room**, **towards the back of the room**. It can be collected from the
  end of the story's first blitzball match onward, and Luca is an ordinary NavMap
  destination, so the airship can bring you back at any time — nothing here is missable.
- **Status:** confirmed for the location – **disputed for the container**
- **Version:** HD Remaster / International
- **Verified:** 2026-08-19
- **Sources:**
  - https://jegged.com/Games/Final-Fantasy-X/Celestial-Weapons/World-Champion.html —
    "Besaid Aurochs locker room" in the stadium basement, item "towards the back", a
    **treasure chest**, available "after the first Blitzball match involving Tidus, Wakka,
    and the Besaid Aurochs"
  - https://game8.co/games/Final-Fantasy-X/archives/271393 — same room, but calls it a
    **locker**: "the second locker from the wall near Botta"
- **Disputed detail — do not state as fact:** whether the container is a treasure chest or
  a locker. The room and the "towards the back" position agree, so the guide tells the
  reader to sweep the back of the room rather than naming the container.
- **Why this entry exists at all:** a reader of this guide read the line
  "Jupiter Crest — Luca, ห้องล็อกเกอร์ทีม Besaid Aurochs" and **took "Luca" for a
  person's name.** The line named no map, no building, and no way to travel there. The
  location was never wrong — it was unusable. See the naming rule this produced in
  `docs/content-model.md`.


### The ten movie spheres for Auron's Bushido Overdrive — full list and two corrections
- **Answer:** There are **ten**, and two of them are not Jecht's: sphere 6 is **Auron's
  Sphere** and sphere 10 is **Braska's Sphere**. Locations, in the order the guide lists
  them: **1** Macalania Woods — given by the story right after Spherimorph, and it is what
  switches the whole collection on. **2** Besaid Village, right of Besaid Temple.
  **3** S.S. Liki, on the bridge beside the captain. **4** Luca Stadium, Basement A, in the
  **hallway outside** the Besaid Aurochs locker room. **5** Mi'ihen Highroad, Oldroad
  South, down the path where O'aka XXIII hid, near a chest. **6** Mushroom Rock Road, at
  the ridge summit where Tidus meets Gatta and Luzzu. **7** Moonflow, South Bank Wharf, by
  the tent near the Save Sphere. **8** Thunder Plains, beside a lightning-rod tower about
  halfway to the Travel Agency. **9** Macalania Woods again, at the forest entrance beside
  the Save Sphere. **10** Mt. Gagazet, early on the Mountain Trail by a steep cliff.
- **Missable:** only **Besaid (2)** in practice. Once the airship is acquired the Dark
  Aeons take their posts and one of them blocks the village entrance. It is not a true
  permanent loss — beating that Dark Aeon reopens it — but that is end-game work, so treat
  it as a deadline. (PS2 releases outside Japan have no Dark Aeons and no deadline.)
- **Status:** confirmed
- **Version:** HD Remaster / International
- **Verified:** 2026-08-19
- **Sources:** https://jegged.com/Games/Final-Fantasy-X/Side-Quests/Jecht-Spheres.html ·
  https://game8.co/games/Final-Fantasy-X/archives/270619
- **Two corrections this made to `ref-sidequests.html`:** the page previously listed
  **ซากเมือง Zanarkand (the Zanarkand ruins)** as a sphere location — **neither source
  lists a sphere there** — and it listed **Macalania Woods only once** when there are
  **two**, which is the single most common miscount. Both were corrected rather than left,
  and both are called out here so any page written against the old list can be rechecked.


### Blitzball league prizes can be rerolled — and the save must come BEFORE the menu
- **Answer:** The prize list is rolled **the first time you open the Blitzball screen
  after a league or tournament finishes**, not when the league ends. So the reroll works
  like this: finish the league, decline to keep playing, **save at a Save Sphere while
  still outside the Blitzball menu**, then enter the menu and read the prize list. If the
  wanted prize is absent, reload that save and enter again for a fresh roll. **Saving
  after the list is on screen locks it into the save** and reloading returns the same list.
- **Jupiter Sigil chain (all four steps confirmed):** `Attack Reels` — tournament 1st,
  100%, no prerequisite. `Status Reels` — needs Attack Reels **and Wakka in 250+ battles**,
  then league 1st, 100%. `Aurochs Reels` — needs Status Reels **and 450+ battles**, then
  tournament 1st, 100%. `Jupiter Sigil` — only after Aurochs Reels, league 1st, **50%**
  chance per league, which is what makes the reroll worth doing.
- **Status:** confirmed
- **Version:** HD Remaster / International
- **Verified:** 2026-08-19
- **Sources:**
  - https://jegged.com/Games/Final-Fantasy-X/Blitzball/Prizes.html (direct fetch) — the
    four prize conditions and the battle counts, plus "save at a Save Sphere when the
    league prizes reset until the prize appears"
  - https://gamefaqs.gamespot.com/ps3/643146-final-fantasy-x-x-2-hd-remaster/faqs/82607/blitzball
    (search extraction, 403 on direct fetch) — "prizes are determined the first time you
    open the Blitzball screen after finishing a league or tournament"
- **Correction this made to `ref-sidequests.html`:** the page said only "save at a Save
  Sphere before taking the prize", which reads as "save once the prize list is on screen"
  — by then it is locked and the trick does nothing. The timing, not the trick, was the
  part that was wrong.


### Blitzball — the shot and pass maths are randomised, not a straight comparison
- **Answer:** Both are a **random 50–150% roll**, not a threshold test. **Shooting:** `SH`
  decays with distance, any defender you did **not** break through subtracts their `BL`,
  and then the keeper subtracts **50–150% of their `CA`**, rolled per shot. So `SH` merely
  above `CA` is a **coin flip**; `SH` above **1.5 × CA** always scores; `SH` at or below
  **0.5 × CA** never does. **Passing:** `PA` decays with distance and a defender on the line
  subtracts 50–150% of their `BL`; if it reaches 0 the pass **turns the ball over**, it is
  not merely incomplete. Breaking through a defender removes their `BL` from the sum
  entirely, so "No Break" is the **more expensive** option, not the safe one.
- **Naming:** the stats are `HP SP EN AT PA BL SH CA`. The HD Remaster match screen labels
  four of them `PAS SHT BLK CAT`, so those on-screen names are correct to use — but there is
  **no `BLI` stat**; that spelling should never appear.
- **Status:** confirmed
- **Version:** HD Remaster / International
- **Verified:** 2026-08-20
- **Sources:** https://ffextreme.com/ff10/blitzball/action-commands/ ·
  https://www.fandomspot.com/ffx-blitzball-stats/ ·
  https://strategywiki.org/wiki/Final_Fantasy_X/Blitzball (search extraction)
- **Why it matters more than it looks:** it changes team-building. A forward whose `SH` just
  beats the enemy keeper `CA` is not "good enough" — aim for roughly 1.5 times it.

### Blitzball prize rerolling — three different methods, only one works on league prizes
- **Answer:** The prize table rolls **the first time you open the Blitzball screen after a
  competition ends**, and viewing locks it. Three techniques exploit that, and they are
  **not interchangeable**:
  1. **Save before opening the menu, reload if the prize is wrong** — rerolls **both** the
     league and tournament tables, costs nothing. **This is the default.**
  2. **Enter and leave the Blitzball menu about five times** — this is **not a reroll at
     all**. After a tournament finishes the `Tournament` option is greyed out for **four**
     menu entries and returns on the **fifth**; the new tournament that spawns carries a
     fresh prize as a side effect. **Tournament prizes only — it does nothing to the league
     table**, and both `Status Reels` and the `Jupiter Sigil` are league prizes.
  3. **`Reset Data`** (Save Sphere, then Play Blitzball, then the main menu) — forces a fresh
     roll of both tables at any time, at severe cost (next entry).
- **Status:** confirmed
- **Version:** HD Remaster / International
- **Verified:** 2026-08-20
- **Sources:** https://gamefaqs.gamespot.com/ps3/643146-final-fantasy-x-x-2-hd-remaster/faqs/82607/blitzball ·
  https://gamefaqs.gamespot.com/ps3/643146-final-fantasy-x-x-2-hd-remaster/answers/369222-how-do-i-get-the-tournament-option-back-in-blitzball ·
  https://www.allgamestaff.com/final-fantasy-x/blitzball/ (search extraction; those domains 403 on direct fetch)
- **Notes:** Method 2 is the classic **right procedure, wrong explanation** — players see the
  prize change and conclude they rerolled it, then apply it to a league prize and cycle the
  menu forever.

### Reset Data destroys more than it is usually credited with
- **Answer:** It resets **every player level to its starting value** (several below 3),
  **wipes every learned technique on every player**, **wipes all contracts** so recruits
  scatter back to their original teams, **returns every team in the league to its default
  roster** — not only yours — and **resets standings, win/loss records and statistics**.
- **The trap:** **Tidus still knows `Jecht Shot` but cannot equip it** until he is levelled
  back to 3, because equipping needs a tech slot and the first slot opens at level 3.
  Knowing a technique and being able to use it are different states.
- **Status:** confirmed
- **Version:** HD Remaster / International
- **Verified:** 2026-08-20
- **Sources:** https://www.allgamestaff.com/final-fantasy-x/blitzball/ ·
  https://gamefaqs.gamespot.com/ps2/197344-final-fantasy-x/answers/293970-blitzball-reset-data-trick-for-wakkas-reels-jupiter-sigil ·
  https://gamefaqs.gamespot.com/ps3/643146-final-fantasy-x-x-2-hd-remaster/answers/462608-i-cant-use-jecht-shot-after-reset-data-on-blitzball
  (search extraction)
- **Inferred, not documented — say so when writing it:** that already-won prizes stay in the
  inventory, and that the 250/450 battle counter survives. Neither is stated anywhere, but the
  published 26-match method resets repeatedly after each prize is won and still depends on
  the counter, so it would be impossible if either were wiped.

### Blitzball tech slots open at five levels, not one
- **Answer:** A player has **five** technique slots and they open one at a time at levels
  **3, 7, 12, 20 and 30**. "Level 3" is only the first rung. A freshly signed level-1 recruit
  has no slot at all, which is why the set-techs screen appears to do nothing for them.
- **Status:** confirmed
- **Version:** HD Remaster / International
- **Verified:** 2026-08-20
- **Sources:** https://www.esque.com/slr/gamefaqs/ffx_blitz_tech_primer_v17.txt ·
  https://game8.co/games/Final-Fantasy-X/archives/271410

### Mark changes defensive AI — the blue prompt is a side effect, not the mechanic
- **Answer:** Marking an opponent makes your player **abandon positional defence and follow
  that one opponent** whether or not they hold the ball, which leaves the space they were
  covering open. Marking is also the **only** gate on **Techcopy**: only a marked opponent
  technique can be copied, and the game announces the chance with a blue-and-white flashing
  prompt.
- **So "No Mark on everyone" is right for winning quickly and wrong for building a team** —
  it forfeits technique learning for the whole game. The reason usually given, that the blue
  prompt interrupts your inputs, describes a real annoyance but not the mechanic that decides
  matches.
- **Status:** confirmed
- **Version:** HD Remaster / International
- **Verified:** 2026-08-20
- **Sources:** https://ffextreme.com/ff10/blitzball/formations/ ·
  https://game8.co/games/Final-Fantasy-X/archives/275310

### Recruiting Nimrook, and what the standard write-up leaves out
- **Answer:** Best keeper in the game (`CA` 67 at level 99), contracted to the **Al Bhed
  Psyches**. To read his remaining contract: stand in front of him and press the **scout
  button** (Square on a PlayStation pad). To burn contract games: play **Exhibition** against
  the Psyches and choose **Forfeit** (Triangle during the match). With **one** game left,
  **save first**, then forfeit — the renew-or-release roll happens as that match ends, so
  reloading rerolls it. Once he is free, sign him before playing anything else, because
  another team can take him. He costs **100 gil per game**, so 99 games is 9,900 gil.
- **Two preconditions on Forfeit that break the instruction when omitted:** your side must
  **hold the ball** and also be **behind on score**. At 0–0 the option can be greyed out; let
  them score once, take the ball back, then forfeit.
- **Location:** the airship **Corridor** — from the Bridge (the control room holding the Save
  Sphere and the NavMap console), through the door behind the pilot seat and down the narrow
  passage running toward the Cabin, past the lift where Rin trades. jegged calls the same
  place the "cargo area"; the name the game shows is **Corridor**.
- **Contracts are paid in full up front and tick down for every match the team plays, benched
  or not** — so a long forfeit grind shortens your own squad contracts at the same time.
- **Status:** confirmed. The odds of release are **undocumented** — do not invent a number.
- **Version:** HD Remaster / International
- **Verified:** 2026-08-20
- **Sources:** https://jegged.com/Games/Final-Fantasy-X/Blitzball/Recruiting-Players.html ·
  https://game8.co/games/Final-Fantasy-X/archives/275303 ·
  https://www.thegamer.com/final-fantasy-10-every-blitzball-player-location-guide/

### Level-1 blitzball recruits — three superlatives that get repeated wrongly
- **Answer:** **Ropp does not have the best starting `AT`.** The famous `AT` 73 is a
  **level-99** figure; at level 1 he has `AT` 11 and **Zalitz beats him at 15**. The real
  level-1 strengths of Ropp are `BL` 15 and `HP` 191. **Zalitz ships with `Hi-Risk`**, which
  halves every stat except `HP` and `SP` in exchange for double EXP — leave it equipped and
  the defender is far weaker than the stat line suggests. **Letty is not a balanced passer:**
  at level 1 his `PA` is 3 and his `BL` is 2, his two worst stats. **The `SH` 17 of Wedge**
  is the best among **recruitable** players, not in the game — **Tidus starts at `SH` 78**.
  **The `CA` 14 of Jumal** is the best keeper obtainable **before the airship**, not overall.
  **Brother is airship-locked**, so this roster cannot be completed before the Fahrenheit.
- **Status:** confirmed
- **Version:** HD Remaster / International
- **Verified:** 2026-08-20
- **Sources:** https://game8.co/games/Final-Fantasy-X/archives/274808 (Ropp) ·
  https://www.fandomspot.com/ffx-zalitz/ ·
  https://game8.co/games/Final-Fantasy-X/archives/274787 (Wedge) ·
  https://game8.co/games/Final-Fantasy-X/archives/274793 (Jumal) ·
  https://www.fandomspot.com/ffx-brother/

### Tournament overtime has a clock; a league draw does not
- **Answer:** A **league** draw ends the match with no extra time and both sides take
  **1 point** (a win is 3, a loss is 0). A **tournament** draw goes to **Golden Goal overtime
  made of repeating 5-minute periods** — if nobody scores the period resets and another
  starts, so it is effectively endless, but there **is** a visible clock counting down. A
  reader told "no time limit" will panic when they watch it approach zero.
- **Status:** confirmed
- **Version:** HD Remaster / International
- **Verified:** 2026-08-20
- **Sources:** https://www.hxchector.com/final-fantasy-x-hd-remaster-walkthrough/blitzball/ ·
  https://finalfantasy.fandom.com/wiki/Blitzball_(minigame) (search extraction, 402 on fetch)
- **Unverified:** the league standings tiebreaker when two teams finish level on points.
