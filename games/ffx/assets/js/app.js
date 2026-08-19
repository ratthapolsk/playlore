(function(){
  var PAGE = document.body.dataset.page || 'x';
  var KEY = 'ffx_' + PAGE;
  var store = {};
  try{ store = JSON.parse(localStorage.getItem(KEY) || '{}'); }catch(e){}
  var boxes = [].slice.call(document.querySelectorAll('input[type=checkbox][data-k]'));

  function save(){ try{ localStorage.setItem(KEY, JSON.stringify(store)); }catch(e){} }
  function refreshRow(b){ var li = b.closest('.chk'); if(li){ li.classList.toggle('done', b.checked); } }

  // shared "done/total per stage" blob so index.html can show per-stage
  // progress without re-reading every ffx_sNN checklist individually
  function writeStats(done, total){
    if(PAGE === 'x') return; // no real data-page attribute on this page — nothing to attribute the stats to
    var stats = {};
    try{ stats = JSON.parse(localStorage.getItem('ffx_stats') || '{}'); }catch(e){ stats = {}; }
    stats[PAGE] = { d: done, t: total };
    try{ localStorage.setItem('ffx_stats', JSON.stringify(stats)); }catch(e){}
  }

  function updateProgress(){
    var done = boxes.filter(function(b){return b.checked;}).length, total = boxes.length;
    document.querySelectorAll('[data-progress="all"]').forEach(function(el){ el.textContent = done + ' / ' + total; });
    var fill = document.querySelector('.pbar-fill'); if(fill){ fill.style.width = (total ? done/total*100 : 0) + '%'; }
    document.querySelectorAll('section').forEach(function(sec){
      var bs = [].slice.call(sec.querySelectorAll('input[type=checkbox][data-k]'));
      var d = bs.filter(function(b){return b.checked;}).length;
      var el = sec.querySelector('[data-count]');
      if(el){ el.innerHTML = '<b>'+d+'</b>/'+bs.length; }

      /* Mirror the section's state onto its sidebar link. Without this the rail
       * looked identical whether a section was untouched or fully cleared, so
       * the reader had to scroll the page to find out where they were.
       * Sections with no checkboxes (story, glossary) are deliberately left
       * unmarked — "complete" is meaningless for them and marking them all
       * green would drown the signal. */
      if(!sec.id) return;
      var link = document.querySelector('nav.toc a[href="#' + sec.id + '"]');
      if(!link) return;
      link.classList.toggle('sec-done', bs.length > 0 && d === bs.length);
      link.classList.toggle('sec-part', bs.length > 0 && d > 0 && d < bs.length);
      if(bs.length > 0) link.dataset.secCount = d + '/' + bs.length;
    });
    writeStats(done, total);
    return { done: done, total: total };
  }

  boxes.forEach(function(b){
    if(store[b.dataset.k]){ b.checked = true; }
    refreshRow(b);
    b.addEventListener('change', function(){
      if(b.checked){ store[b.dataset.k] = 1; } else { delete store[b.dataset.k]; }
      save(); refreshRow(b);
      var p = updateProgress();
      var pct = p.total ? Math.round(p.done/p.total*100) : 0;
      document.dispatchEvent(new CustomEvent('ffx:check', { detail: { el: b, checked: b.checked, done: p.done, total: p.total, pct: pct } }));
      if(p.total > 0 && p.done === p.total){
        document.dispatchEvent(new CustomEvent('ffx:complete', { detail: { done: p.done, total: p.total } }));
      }
    });
  });
  updateProgress();

  var rst = document.querySelector('[data-reset]');
  if(rst){ rst.addEventListener('click', function(){
    if(!confirm('ล้างการติ๊กทั้งหมดในหน้านี้?')) return;
    store = {}; save(); boxes.forEach(function(b){ b.checked = false; refreshRow(b); }); updateProgress();
    if(window.FFX && typeof window.FFX.toast === 'function'){ window.FFX.toast('ล้างเช็กลิสต์หน้านี้แล้ว'); }
  }); }
})();
