window.__audit = function () {
  const vw = innerWidth, vh = innerHeight;
  const out = { vw, vh, scrollW: document.documentElement.scrollWidth, scrollH: document.documentElement.scrollHeight, over: [], small: [], contrast: [], tiny: [], clipped: [] };
  const vis = (el) => { const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return null; for (let e = el; e && e.nodeType === 1; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return null; if (e.hidden) return null; } return r; };
  const sel = (el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
  const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(',').map(s => parseFloat(s)); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const over = (f, b) => ({ r: f.r * f.a + b.r * (1 - f.a), g: f.g * f.a + b.g * (1 - f.a), b: f.b * f.a + b.b * (1 - f.a), a: 1 });
  const bgOf = (el) => { let layers = []; for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); const c = parse(cs.backgroundColor); if (c && c.a > 0) { layers.push(c); if (c.a === 1) break; } } let base = { r: 250, g: 246, b: 239, a: 1 }; for (let i = layers.length - 1; i >= 0; i--) base = over(layers[i], base); return base; };
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  document.querySelectorAll('body *').forEach((el) => {
    const r = vis(el); if (!r) return;
    if (!el.closest('svg') || el.tagName.toLowerCase() === 'svg') {
      if ((r.right > vw + 1 || r.left < -1) && !el.classList.contains('bg') && !el.closest('.bg-icons')) { if (out.over.length < 12) out.over.push(sel(el) + ' ' + Math.round(r.left) + '→' + Math.round(r.right)); }
    }
    if (/^(a|button|input|select|summary|textarea)$/i.test(el.tagName) || el.getAttribute('role') === 'button' || el.getAttribute('tabindex') === '0') {
      const inline = el.tagName === 'A' && getComputedStyle(el).display === 'inline' && el.closest('p,li');
      if ((r.width < 44 || r.height < 44) && !el.closest('[inert]') && !inline) out.small.push(sel(el) + ' ' + Math.round(r.width) + '×' + Math.round(r.height) + ' «' + (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 18) + '»');
    }
    let own = ''; el.childNodes.forEach(n => { if (n.nodeType === 3) own += n.textContent; }); own = own.trim();
    if (own && !el.closest('svg')) {
      const cs = getComputedStyle(el); const fg = parse(cs.color); if (!fg) return;
      const bg = bgOf(el); const f = over(fg, bg); const size = parseFloat(cs.fontSize); const bold = parseInt(cs.fontWeight) >= 700;
      const large = size >= 24 || (size >= 18.66 && bold); const rt = ratio(f, bg);
      if (rt < (large ? 3 : 4.5)) out.contrast.push(sel(el) + ' ' + rt.toFixed(2) + ' «' + own.slice(0, 22) + '» ' + size + 'px');
      if (size < 12) out.tiny.push(sel(el) + ' ' + size + 'px «' + own.slice(0, 18) + '»');
      if (el.scrollWidth > el.clientWidth + 2 && cs.overflow !== 'visible' && cs.textOverflow !== 'ellipsis' && el.clientWidth > 0) out.clipped.push(sel(el) + ' scroll ' + el.scrollWidth + ' > ' + el.clientWidth);
    }
  });
  ['small', 'contrast', 'tiny', 'clipped'].forEach(k => out[k] = [...new Set(out[k])].slice(0, 25));
  return JSON.stringify(out);
};
window.__runAll = async function (routes) {
  routes = routes || ['#/accueil', '#/exercer', '#/exercer/guess-window', '#/exercer/guess-scroll', '#/exercer/place', '#/exercer/ear-guess', '#/exercer/ear-place', '#/apprendre', '#/apprendre/clefs', '#/reglages', '#/mentions-legales', '#/confidentialite', '#/credits', '#/compte'];
  const res = {};
  for (const r of routes) {
    location.hash = r; await new Promise(t => setTimeout(t, /exercer\//.test(r) ? 4200 : 1000));
    document.querySelectorAll('details').forEach(d => d.open = true);
    await new Promise(t => setTimeout(t, 150));
    const a = JSON.parse(window.__audit());
    res[r] = { sw: a.scrollW, sh: a.scrollH, vw: a.vw, vh: a.vh, over: a.over.slice(0, 6), small: a.small.slice(0, 16), contrast: a.contrast.slice(0, 8), tiny: a.tiny.slice(0, 4), clipped: a.clipped.slice(0, 6) };
  }
  return JSON.stringify(res);
};
