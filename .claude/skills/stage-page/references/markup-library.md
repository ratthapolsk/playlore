# Markup library

Every block below is copied from a live `games/ffx/` page. Copy the structure, replace the Thai
text. Class names, attribute names and nesting are fixed by `style.css` and `app.js` — a
renamed class is an unstyled block, and a renamed attribute is a dead control.

---

## Scene heading inside the walkthrough section

`ffx/27-zanarkand-ruins.html`. The `<span class="hn">` is the scene number within the stage.

```html
<h3><span class="hn">5</span>Spectral Keeper — ผู้เฝ้าโดม</h3>
```

## Story / mood block

Two flavours, both `.story`. The first states the plot, the second is the party's state of
mind at this exact moment.

```html
<div class="story"><b>เนื้อเรื่อง:</b> สุดปลายทางแสวงบุญ คณะก้าวข้ามหิมะบนยอด Gagazet ลงมาเจอสิ่งที่ Tidus เฝ้าฝันจะได้เห็นมาตลอด — <b>Zanarkand</b> บ้านเกิดของเขา</div>

<div class="story">💬 <b>บรรยากาศตอนนี้:</b> Tidus ยืนนิ่งมองซากเมืองที่ควรจะเป็นบ้าน เสียงหัวเราะ แสงไฟ ผู้คน — ไม่มีเหลือสักอย่าง มีแต่ความเงียบและ pyreflies ล่องลอย</div>
```

Inside a `.story` block, `<b>` marks a name or a beat the reader must not skim past, and
`<br>•` starts a sub-point in a long reveal.

## Step list — where to go, what to do

```html
<ol class="steps">
  <li>ช่วงนี้ <b>ลงน้ำได้แค่ Tidus, Wakka และ Rikku</b> — คนอื่นรอบนฝั่ง แก้ปริศนาด้วยสามคนนี้เท่านั้น</li>
  <li>ว่ายเก็บของระหว่างทาง — <span class="it">Return Sphere</span> และ <span class="it">Recovery Ring</span> อยู่ที่มุมเก็บของ (จุด 4 ในแผนที่ด้านล่าง)</li>
</ol>
```

## Item checklist — ticked where the player walks past it

```html
<div class="pick"><h4>เก็บของในฉากนี้</h4><ul class="chklist">
  <li class="chk"><input type="checkbox" data-k="s27-fortune"><span class="lbl"><span class="it">Fortune Sphere</span> — กลางทางเดินช่วงแรกของซากเมือง</span></li>
  <li class="chk"><input type="checkbox" data-k="s27-targe"><span class="lbl"><span class="it">Spiritual Targe</span> — แท่นเล็กข้างทาง (โล่ของ Rikku)</span></li>
</ul></div>
```

A missable item leads with the warning glyph and says what losing it costs:

```html
<li class="chk"><input type="checkbox" data-k="s27-sun"><span class="lbl">⚠️ <span class="it">Sun Crest</span> — ห้อง "The Beyond" ขึ้นบันไดในโดม<b>ทันที</b>หลังปราบ Yunalesca (ปลดพลัง Caladbolg ของ Tidus – ถ้าออกไปก่อน จะมี <b>Dark Bahamut HP 4,000,000</b> มายืนเฝ้าแทน)</span></li>
```

## Milestone checklist — story beats and one-time actions

```html
<div class="pick milestone"><h4>เหตุการณ์สำคัญของฉากนี้</h4><ul class="chklist">
  <li class="chk"><input type="checkbox" data-k="s28-highbridge"><span class="lbl">ฉาก <b>Highbridge</b> — เลือกจุดหมาย <b>Highbridge</b> บน NavMap แล้วคุยกับ Grand Maester Mika จนจบฉาก (ปลดล็อกจุดหมาย <b>Sin</b> + การกลับเข้าวิหารทั่ว Spira)</span></li>
</ul></div>
```

Use milestones as the checklist when a scene has nothing to pick up. That is the honest
alternative to padding.

## Preparation block — sits immediately above the fight

```html
<div class="prep"><h4>เตรียมตัวก่อนสู้</h4>
  <ul>
    <li><b>เกราะติด <span class="it">Berserk Ward</span> หรือ <span class="it">Berserkproof</span></b> — ท่า Berserk Tail ของมันทำให้คนของเราคุมไม่ได้ ถ้ากันได้เต็มจะสบายทั้งศึก</li>
    <li><b>อย่าพึ่ง Guard/Sentinel</b> — ตัวละครยืนคนละแท่น จึงปกป้องกันไม่ได้เลย</li>
  </ul>
</div>
```

Plain `<li>`, no checkbox — matching the reference implementation.

## Boss block — sits where the boss appears

The `id` doubles as the sidebar anchor, so it also needs an entry in `nav.toc`.

```html
<div class="boss" id="keeper"><h3>Spectral Keeper <span class="hp">HP 52,000</span></h3>
  <div class="lore"><b>ทำไมต้องสู้:</b> ผู้พิทักษ์วิญญาณเฝ้าประตูสู่ Yunalesca — ทดสอบว่าคณะแข็งแกร่งพอจะเผชิญความจริงเบื้องหลังหรือไม่</div>
  <p><b>กลไกสนาม:</b> ตัวละคร 3 คนยืนแยกบนแท่นลอยคนละแท่น บอสอยู่กลาง — <b>Guard/Sentinel ใช้ปกป้องกันไม่ได้</b></p>
  <p><b>Glyph Mine:</b> เมื่อโดนตี <b>ครบ 4 ครั้ง</b> บอสจะวางทุ่นระเบิดบนแท่นแบบสุ่ม 2 แท่น ระเบิดนี้ <b>KO ทันที</b> — ใช้ <b>Trigger Command วาร์ปย้ายแท่น</b> ออกไปก่อนมันระเบิด</p>
  <p><b>วิธีเอาชนะ:</b> จัดให้มีช่องว่างคั่นระหว่างตัวละคร – ใช้ <b>Mental Break</b> แล้วถล่มเวทดำ – นับจำนวนครั้งที่ตีมันไว้เสมอ ครบ 4 ครั้งเมื่อไรให้เตรียมวาร์ปหนี</p>
  <p class="drops"><b>Steal:</b> Ether (rare: Turbo Ether) – <b>Drop:</b> Lv.4 Key Sphere</p>
</div>
```

The paragraph order is the order a player needs it: why the fight is happening, what the
arena does to you, each named attack and its counter, then how to win, then the rewards.
`.drops` is always last.

## Callouts

Three variants, all in use. Pick by what the reader is supposed to do with it.

```html
<div class="callout tip"><b>โดม Zanarkand คืออะไร:</b> …</div>
<div class="callout warn"><b>⚠️ อันตรายที่สุดของทั้งเกมสำหรับสายเก็บครบ:</b> …</div>
<div class="callout secret"><b>สาย 100%:</b> …</div>
```

- `tip` — orientation and explanation, including the "what is this place / what do I do here
  / how ready must I be" card that opens a big stage.
- `warn` — something that costs the reader progress if ignored.
- `secret` — optional depth for a completionist.

## Note line

`data-note` is a bare attribute on a `<p>`. Use it for a clarification that is not a step:
a route summary, a legend for a table, or the honest statement that a scene has nothing to
collect.

```html
<p data-note>ห้องแรก 3 จุด: ขวาบน – กลาง-ซ้าย – กลางห้อง (ไม่ต้องเรียง)</p>
<p data-note>🔑 ด่านนี้เป็นบทสอนระบบ ศัตรูทั้งหมดเป็นฉากบังคับ ไม่มีของหายากให้ฟาร์ม</p>
<p data-note>🔑 <b>บิน/ลอย</b>=ใช้ Wakka หรือเวท (ประชิดพลาด) – <b>เกราะ/armored</b>=Armor Break หรืออาวุธ Piercing – <b>undead</b>=ขว้าง Phoenix Down ฆ่า</p>
```

The third one is the legend pattern: a table that uses codes gets its key defined right
beside it, never in another section.

## Inline term and item

```html
<span class="term" title="ห้องปริศนาในวิหารทุกแห่ง ต้องไขให้จบก่อนจะเข้าห้องชั้นในได้">Cloister of Trials</span>
<span class="it">Magistral Rod</span>
```

`.term` carries a one-line gloss in `title` for a mechanic or piece of world vocabulary.
`.it` marks an item, weapon or armour name. Gloss a term on first use on the page, then use
it bare.

## Section wrapper

```html
<section id="walk">
  <h2><span class="ic">▶</span> เดินเรื่องตามลำดับเล่น <span class="sec-count" data-count>0/0</span></h2>
  …
</section>
```

`.ic` is the section glyph. `sec-count` appears **only** on sections that contain checkboxes.
Icons in use: `❗` missables, `▶` walkthrough, `⚔️` a battle set-piece, `🗺️` a map or code
section.

## Lookup tables at the end

Only pure lookup material goes at the bottom — the fiend list and the glossary. Everything
else is inline in its scene. Give the table its legend in a `data-note` directly beneath it,
and use `—` for a value no two sources agree on, with the note that says `—` means
"unconfirmed", not "nothing".
