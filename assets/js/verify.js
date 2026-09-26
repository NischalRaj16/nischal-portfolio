/*!
 * Nischal Sadashivaiah — Portfolio · credential verification
 * Copyright (c) 2026 Nischal Sadashivaiah. Released under the MIT License.
 *
 * Recomputes every credential hash and the Merkle root in the visitor's browser
 * (Web Crypto, SHA-256) and checks them against the root that is timestamped
 * on the Bitcoin blockchain with OpenTimestamps.
 */
(function () {
  'use strict';

  // Refuse to run inside someone else's frame (clickjacking guard).
  try { if (window.top !== window.self) { window.top.location = window.self.location.href; } } catch (e) { document.documentElement.style.display = 'none'; }

  var btn = document.getElementById('verifyBtn');
  var list = document.getElementById('verifyList');
  var rootEl = document.getElementById('verifyRoot');
  var statusEl = document.getElementById('verifyStatus');
  if (!btn || !list || !window.crypto || !crypto.subtle) {
    if (statusEl) statusEl.textContent = 'This browser cannot run the check. Try a recent Chrome, Edge, Firefox or Safari.';
    return;
  }

  var enc = new TextEncoder();
  function hex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return b.toString(16).padStart(2, '0'); }).join(''); }
  function sha(bytes) { return crypto.subtle.digest('SHA-256', bytes); }
  function concat(a, b) { var o = new Uint8Array(a.byteLength + b.byteLength); o.set(new Uint8Array(a), 0); o.set(new Uint8Array(b), a.byteLength); return o; }

  async function merkle(leaves) {
    var level = leaves.slice();
    while (level.length > 1) {
      if (level.length % 2) level.push(level[level.length - 1]);
      var next = [];
      for (var i = 0; i < level.length; i += 2) next.push(await sha(concat(level[i], level[i + 1])));
      level = next;
    }
    return level[0];
  }

  function row(rec, ok, h) {
    var li = document.createElement('li');
    li.className = 'vrow ' + (ok ? 'ok' : 'bad');
    var mark = document.createElement('span'); mark.className = 'vmark'; mark.textContent = ok ? '✓' : '✕';
    var body = document.createElement('div');
    var t = document.createElement('b'); t.textContent = rec.title;
    var s = document.createElement('span'); s.className = 'vsub'; s.textContent = rec.issuer + ' · ' + rec.date;
    var c = document.createElement('code'); c.textContent = h.slice(0, 16) + '…' + h.slice(-8);
    body.appendChild(t); body.appendChild(s); body.appendChild(c);
    li.appendChild(mark); li.appendChild(body);
    return li;
  }

  var running = false;
  async function run() {
    if (running) return; running = true;
    btn.disabled = true; btn.textContent = 'Verifying…';
    statusEl.className = 'vstatus'; statusEl.textContent = 'Hashing records in your browser…';
    list.textContent = '';
    try {
      var doc = await fetch('credentials.json', { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error('credentials.json ' + r.status); return r.json(); });
      var anchored = (await fetch('proofs/merkle-root.txt', { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error('merkle-root.txt ' + r.status); return r.text(); })).trim();
      var leaves = [], allOk = true;
      for (var i = 0; i < doc.records.length; i++) {
        var rec = doc.records[i];
        var h = await sha(enc.encode(JSON.stringify(rec)));
        var hx = hex(h), ok = hx === doc.leaves[i];
        allOk = allOk && ok; leaves.push(h);
        list.appendChild(row(rec, ok, hx));
      }
      var root = hex(await merkle(leaves));
      var rootOk = root === doc.merkleRoot && root === anchored;
      rootEl.textContent = root;
      if (allOk && rootOk) {
        statusEl.className = 'vstatus ok';
        statusEl.textContent = 'All ' + doc.records.length + ' records match. Merkle root matches the root timestamped on Bitcoin (' + doc.anchor.stamped + ').';
      } else {
        statusEl.className = 'vstatus bad';
        statusEl.textContent = 'Mismatch: at least one record was changed after it was timestamped.';
      }
    } catch (e) {
      statusEl.className = 'vstatus bad';
      statusEl.textContent = 'Could not load the records (' + e.message + '). Open the site over https to run the check.';
    }
    btn.disabled = false; btn.textContent = 'Run again'; running = false;
  }

  btn.addEventListener('click', run);
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); run(); } }, { rootMargin: '0px 0px -20% 0px' });
    io.observe(document.getElementById('verify'));
  }
})();
