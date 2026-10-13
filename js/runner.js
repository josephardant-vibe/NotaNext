// Animation de la page « Se connecter » : un petit bonhomme court sur la ligne du bas d'une portée,
// saute sur certaines notes, en touche d'autres de la main et glisse sous d'autres ; les notes
// touchées deviennent vertes. Dessinée en SVG, animée image par image (requestAnimationFrame),
// aucune image ni dépendance. Conçue sur maquette (Notanext Connexion), portée ici en JS simple.
// Respecte « réduire les animations » (pose fixe) et se met en veille quand la page est masquée.
window.Notanext = window.Notanext || {};

(function () {
  const NOTES = 14;
  const BARS = 8;

  // ----- modèle : poses du personnage et positions des notes en fonction du temps -----
  function buildModel() {
      const V = 180, T = 23, N = 48, TC = T / N, XR = 190, G = 204, S = 16.9, FR = 2.25, NH = 9.3, L = V * T, RATE = 1.5;
      const sm = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x), lp = (a, b, w) => a + (b - a) * w, md = (a, n) => ((a % n) + n) % n;
      const D2R = Math.PI / 180;
      const spl = (ks, t) => {
        const n = ks.length; if (t <= ks[0][0]) return ks[0][1]; if (t >= ks[n - 1][0]) return ks[n - 1][1];
        let i = 0; while (ks[i + 1][0] < t) i++;
        const t0 = ks[i][0], y0 = ks[i][1], t1 = ks[i + 1][0], y1 = ks[i + 1][1], h = t1 - t0, sl = (y1 - y0) / h;
        let m0 = i > 0 ? (y1 - ks[i - 1][1]) / (t1 - ks[i - 1][0]) : sl, m1 = i + 2 < n ? (ks[i + 2][1] - y0) / (ks[i + 2][0] - t0) : sl;
        const lim = m => m * sl <= 0 ? 0 : Math.abs(m) > 3 * Math.abs(sl) ? Math.sign(m) * 3 * Math.abs(sl) : m;
        const s = (t - t0) / h, s2 = s * s, s3 = s2 * s; m0 = lim(m0); m1 = lim(m1);
        return (2 * s3 - 3 * s2 + 1) * y0 + (s3 - 2 * s2 + s) * h * m0 + (-2 * s3 + 3 * s2) * y1 + (s3 - s2) * h * m1;
      };
      const runFoot = p => {
        if (p < 0.45) { const u = p / 0.45; return [XR + S - 2 * S * u, FR]; }
        const u = (p - 0.45) / 0.55; return [XR - S + 2 * S * sm(u), FR + 8 * Math.sin(Math.PI * u)];
      };
      const run = t => {
        const ph = md(t / TC, 1), c4 = Math.cos(4 * Math.PI * (ph - 0.225)), c1 = Math.cos(2 * Math.PI * ph);
        return { py: 24.2 + 1.0 * (1 - c4), lean: 12, A: runFoot(ph), B: runFoot(md(ph + 0.5, 1)), aA: [5 - 38 * c1, 90], aB: [5 + 38 * c1, 90] };
      };
      const ik = (h, f, l, sc) => {
        const dx = f[0] - h[0], dy = f[1] - h[1], d = Math.hypot(dx, dy) || 1e-6, dm = Math.min(d, 2 * l * 0.999), ux = dx / d, uy = dy / d;
        const fx = h[0] + ux * dm, fy = h[1] + uy * dm, hh = Math.sqrt(Math.max(0, l * l - dm * dm / 4)), mx = (h[0] + fx) / 2, my = (h[1] + fy) / 2;
        const k1 = [mx - uy * hh, my + ux * hh], k2 = [mx + uy * hh, my - ux * hh];
        return { knee: sc(k1) >= sc(k2) ? k1 : k2, foot: [fx, fy], over: d - dm };
      };
      const legSc = (h, f) => k => (f[1] - h[1] > -9.5 ? k[1] + 0.3 * k[0] : k[0] + 0.5 * k[1]), armSc = k => -k[0] + 0.3 * k[1];
      const ang = (a, b) => Math.atan2(b[0] - a[0], -(b[1] - a[1])) / D2R;
      const TOf = k => (k + 0.95) * TC, grid = (t, leg) => { const o = leg === 'A' ? 0 : 0.5; return (Math.ceil(t / TC - o) + o) * TC; };
      const K0 = [null, null, null, null, null, null];
      const spec = (an, rows, ct, nt) => ({ an, rows, ct, nt, t0: an[rows[0][0]] + rows[0][1], t1: an[rows[rows.length - 1][0]] + rows[rows.length - 1][1] });
      const jumpS = k => { const TO = TOf(k), C = TO + 0.30, P = C + 0.10, an = { TO, C, P, L: grid(P + 0.30, 'B') };
        return spec(an, [['TO', -0.16, ...K0], ['TO', -0.07, [-3.5], [8], null, null, [-55, 40], [-55, 40]], ['TO', 0, [0], [3], null, null, [-50, 45], [-50, 45]],
          ['TO', 0.08, 34, 16, [14, -14], [-15, -12.5], [100, 20], [100, 20]], ['TO', 0.16, 40, 18, [15, -14], [-16, -14], [115, 15], [115, 15]],
          ['C', 0, 32.3, 14, [13, -19.5], [-16, -17], [75, 30], [75, 30]], ['C', 0.05, 30.3, 12, [10, -19], [-11, -17.5], [40, 40], [40, 40]],
          ['P', 0, 33.5, 12, [-4, -19], [-3, -17.5], [20, 50], [20, 50]], ['P', 0.12, 40, 14, [-14, -13], [8, -19], [60, 40], [60, 40]],
          ['L', -0.07, 31, 16, [-15, -15], [15, -21], [50, 45], [50, 45]], ['L', 0, ...K0], ['L', 0.07, [-2.5], null, null, null, null, null], ['L', 0.2, ...K0]],
          [{ type: 'foot', ts: C, te: P, h: 0, cx: 9 }], { cx: 9, h: 0, squash: 1 }); };
      const handQ = k => { const TO = TOf(k), C = TO + 0.22, an = { TO, C, L: grid(C + 0.5, 'B') };
        return spec(an, [['TO', -0.16, ...K0], ['TO', -0.07, [-3], [9], null, null, [-40, 50], [-70, 30]], ['TO', 0, [0], [5], null, null, [-30, 50], [-70, 30]],
          ['TO', 0.11, 34, 36, [12, -12], [-14, -12.5], [70, 10], [-65, 30]],
          ['C', 0, 36, 58, [12, -5], [-8, -5.5], [70, 10], [-65, 30]], ['C', 0.1, 36.5, 54, [16, -6], [-8, -6], [30, 20], [-55, 35]],
          ['C', 0.2, 36, 40, [18, -9], [-6, -6], [-10, 40], [-30, 50]], ['C', 0.28, 34, 30, [18, -12], [-2, -9], [20, 50], [0, 60]],
          ['L', -0.08, 29, 20, [16, -22], [14, -18], [40, 55], [30, 55]], ['L', 0, ...K0], ['L', 0.07, [-2], null, null, null, null, null], ['L', 0.2, ...K0]],
          [{ type: 'hand', ts: C, te: C + 0.06, h: 16, cx: 25 }], { cx: 25, h: 16, squash: 0.6 }); };
      const slide = (h, deep) => k => { const C = TOf(k) + 0.55, an = { C }, py = deep ? 4.5 : 5, ln = deep ? -87 : -85, sA = [27, 3.5], sB = deep ? [10, 1.5] : [16, 1];
        return spec(an, [['C', -0.55, ...K0], ['C', -0.36, deep ? 14 : 17, deep ? 32 : 26, [16, -12], [-4, -12], [50, 50], [-30, 60]],
          ['C', -0.26, deep ? 7 : 8, deep ? -30 : -40, [26, 0], [8, -4], [95, 0], [-60, 50]], ['C', -0.16, py, ln, sA, sB, [95, 0], [-90, 32]], ['C', 0, py, ln, sA, sB, [95, 0], [-90, 32]], ['C', 0.34, py, ln, sA, sB, [95, 0], [-90, 32]],
          ['C', 0.46, 9, -52, [22, 0], [10, -2], [100, 0], [-70, 40]], ['C', 0.58, 19, 2, [8, -14], [-6, -14], [30, 60], [-30, 60]], ['C', 0.74, ...K0]],
          [], { cx: 0, h, squash: 0 }); };
      const jumpL = k => { const TO = TOf(k), C = TO + 0.50, P = C + 0.12, an = { TO, C, P, L: grid(P + 0.30, 'A') };
        return spec(an, [['TO', -0.2, ...K0], ['TO', -0.09, [-4], [10], null, null, [-65, 30], [-65, 30]], ['TO', 0, [0], [6], null, null, [-60, 35], [-60, 35]],
          ['TO', 0.12, 50, 20, [15, -13], [-16, -12], [120, 10], [120, 10]], ['TO', 0.26, 70, 22, [16, -11], [-17, -12], [135, 10], [135, 10]], ['TO', 0.4, 62, 18, [14, -16], [-17, -15], [100, 25], [100, 25]],
          ['C', 0, 56.3, 14, [11, -19.5], [-16, -18], [70, 35], [70, 35]], ['C', 0.06, 53.5, 12, [8, -19], [-10, -16], [40, 40], [40, 40]],
          ['P', 0, 57, 12, [-4, -19], [-2, -19], [20, 50], [20, 50]], ['P', 0.1, 61, 14, [-14, -14], [10, -20], [55, 40], [55, 40]],
          ['L', -0.07, 33, 16, [16, -22], [-15, -15], [50, 45], [50, 45]], ['L', 0, ...K0], ['L', 0.07, [-2.5], null, null, null, null, null], ['L', 0.2, ...K0]],
          [{ type: 'foot', ts: C, te: P, h: 24, cx: 9 }], { cx: 9, h: 24, squash: 1.3 }); };
      const handH = k => { const TO = TOf(k), C = TO + 0.30, an = { TO, C, L: grid(C + 0.4, 'B') };
        return spec(an, [['TO', -0.16, ...K0], ['TO', -0.07, [-4], [10], null, null, [-45, 40], [-70, 30]], ['TO', 0, [0], [6], null, null, [-40, 45], [-70, 30]],
          ['TO', 0.1, 40, 25, [14, -12], [-15, -13], [70, 10], [-65, 30]], ['TO', 0.19, 54, 40, [14, -8], [-12, -9], [75, 10], [-65, 30]],
          ['C', 0, 46, 62, [12, -6], [-8, -7], [75, 10], [-65, 30]], ['C', 0.12, 46.5, 55, [16, -7], [-6, -7.5], [30, 20], [-55, 35]], ['C', 0.27, 45, 35, [18, -12], [-2, -10], [-10, 40], [-30, 50]],
          ['L', -0.07, 31, 24, [16, -22], [14, -20], [30, 55], [20, 55]], ['L', 0, ...K0], ['L', 0.07, [-2.5], null, null, null, null, null], ['L', 0.2, ...K0]],
          [{ type: 'hand', ts: C, te: C + 0.06, h: 24, cx: 25 }], { cx: 25, h: 24, squash: 0.6 }); };
      const jumpM = k => { const TO = TOf(k), C = TO + 0.36, P = C + 0.10, an = { TO, C, P, L: grid(P + 0.25, 'B') };
        return spec(an, [['TO', -0.16, ...K0], ['TO', -0.07, [-3.5], [6], null, null, [-50, 45], [-50, 45]], ['TO', 0, [0], [2], null, null, [-45, 45], [-45, 45]],
          ['TO', 0.1, 40, 14, [14, -14], [-15, -12.5], [110, 20], [60, 40]], ['TO', 0.2, 56, 16, [15, -13], [-16, -14], [165, 0], [100, 20]],
          ['C', 0, 48.3, 12, [12, -19.5], [-16, -17], [170, 0], [80, 30]], ['C', 0.05, 46, 10, [10, -19], [-10, -18], [150, 0], [60, 40]],
          ['P', 0, 49, 10, [-4, -19], [-2, -18], [120, 10], [40, 50]], ['P', 0.09, 52, 12, [-14, -14], [10, -20], [60, 40], [30, 50]],
          ['L', -0.07, 31, 16, [-15, -16], [15, -22], [50, 45], [40, 45]], ['L', 0, ...K0], ['L', 0.07, [-2.5], null, null, null, null, null], ['L', 0.2, ...K0]],
          [{ type: 'foot', ts: C, te: P, h: 16, cx: 9 }], { cx: 9, h: 16, squash: 1 }); };
      const s1 = slide(48, false), s2 = slide(40, true);
      const order = [jumpS, handQ, s1, jumpL, handH, s2, jumpM, s2, jumpM, handQ, jumpS, s1, handH, jumpL];
      const build = (an, rows) => {
        const K = { py: [], ln: [], ax: [], ay: [], bx: [], by: [], a1: [], a2: [], b1: [], b2: [] };
        const val = (c, base) => c == null ? base : Array.isArray(c) ? base + c[0] : c;
        for (const r of rows) {
          const t = an[r[0]] + r[1], rn = run(t), A = r[4] || [rn.A[0] - XR, rn.A[1] - rn.py], B = r[5] || [rn.B[0] - XR, rn.B[1] - rn.py], aA = r[6] || rn.aA, aB = r[7] || rn.aB;
          K.py.push([t, val(r[2], rn.py)]); K.ln.push([t, val(r[3], rn.lean)]);
          K.ax.push([t, A[0]]); K.ay.push([t, A[1]]); K.bx.push([t, B[0]]); K.by.push([t, B[1]]);
          K.a1.push([t, aA[0]]); K.a2.push([t, aA[1]]); K.b1.push([t, aB[0]]); K.b2.push([t, aB[1]]);
        }
        return K;
      };
      const events = [], notes = []; let prevEnd = -0.05;
      for (const f of order) {
        let sp, k = 0; for (; k < 60; k++) { sp = f(k); if (sp.t0 >= prevEnd + 0.12) break; }
        events.push({ t0: sp.t0, t1: sp.t1, K: build(sp.an, sp.rows), ct: sp.ct }); notes.push(Object.assign({ tc: sp.an.C }, sp.nt)); prevEnd = sp.t1;
      }
      const noteX = (i, t) => { const n = notes[i]; return 30 + md(XR + n.cx + V * n.tc - V * t - 30, L); };
      const shoulder = p => { const th = p.lean * D2R, s = Math.sin(th), c = Math.cos(th); return [XR + 26 * s + c, p.py + 26 * c - s]; };
      const evAt = (ev, t) => {
        const K = ev.K, py = spl(K.py, t), p = { py, lean: spl(K.ln, t), A: [XR + spl(K.ax, t), py + spl(K.ay, t)], B: [XR + spl(K.bx, t), py + spl(K.by, t)], aA: [spl(K.a1, t), spl(K.a2, t)], aB: [spl(K.b1, t), spl(K.b2, t)] };
        for (const c of ev.ct) {
          const w = sm((t - (c.ts - 0.08)) / 0.08) * (1 - sm((t - c.te) / 0.08)); if (w <= 0) continue;
          const nx = XR + c.cx - V * (t - c.ts);
          if (c.type === 'foot') { const tg = [nx, c.h + NH + FR + 0.1]; p.A = [lp(p.A[0], tg[0], w), lp(p.A[1], tg[1], w)]; }
          else { const sh = shoulder(p), tg = [nx - 3, c.h + NH + 1.9], r = ik(sh, tg, 11, armSc), a = ang(sh, r.knee), a2 = ang(r.knee, r.foot); let b = a2 - a; if (b > 180) b -= 360; if (b < -180) b += 360; p.aA = [lp(p.aA[0], a, w), lp(p.aA[1], b, w)]; }
        }
        return p;
      };
      const pose = t => {
        t = md(t, T);
        for (const ev of events) if (t >= ev.t0 && t <= ev.t1) { const p = evAt(ev, t); p.A[1] = Math.max(p.A[1], FR); p.B[1] = Math.max(p.B[1], FR); return p; }
        return run(t);
      };
      const skel = p => {
        const th = p.lean * D2R, s = Math.sin(th), c = Math.cos(th), pel = [XR, p.py];
        const top = [pel[0] + 30 * s + 1.5 * c, pel[1] + 30 * c - 1.5 * s], sh = [pel[0] + 26 * s + c, pel[1] + 26 * c - s], head = [pel[0] + 42 * s + 5 * c, pel[1] + 42 * c - 5 * s];
        const la = ik(pel, p.A, 14, legSc(pel, p.A)), lb = ik(pel, p.B, 14, legSc(pel, p.B));
        const arm = a => { const e = [sh[0] + 11 * Math.sin(a[0] * D2R), sh[1] - 11 * Math.cos(a[0] * D2R)], a2 = (a[0] + a[1]) * D2R; return { e, h: [e[0] + 11 * Math.sin(a2), e[1] - 11 * Math.cos(a2)] }; };
        const aa = arm(p.aA), ab = arm(p.aB);
        return { pel, top, sh, head, kA: la.knee, fA: la.foot, kB: lb.knee, fB: lb.foot, over: Math.max(la.over, lb.over), eA: aa.e, hA: aa.h, eB: ab.e, hB: ab.h };
      };
      const nb = Math.round(L / 540), bs = L / nb, W = notes.map(n => XR + n.cx + V * n.tc);
      let bo = 0, bd = -1;
      for (let o = 0; o < bs; o += 5) { let m = 1e9; for (const w of W) for (let k = 0; k < nb; k++) m = Math.min(m, Math.abs(md(o + bs * k - w + L / 2, L) - L / 2)); if (m > bd) { bd = m; bo = o; } }
      const model = { V, T, TC, XR, G, L, FR, NH, RATE, notes, events, pose, skel, noteX, run, bo, bs, nb, md, sm };

    return model;
  }

  const SVG_INNER = `
    <defs>
      <linearGradient id="nn-g" gradientUnits="userSpaceOnUse" x1="62" y1="0" x2="118" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="1"/></linearGradient>
      <mask id="nn-m" maskUnits="userSpaceOnUse" x="0" y="-400" width="6000" height="1000"><rect x="0" y="-400" width="6000" height="1000" fill="url(#nn-g)"/></mask>
    </defs>
    <path d="M0 140H6000M0 156H6000M0 172H6000M0 188H6000M0 204H6000" stroke="#211D18" stroke-width="1.6" fill="none"/>
    <text x="10" y="200" font-family="Noto Music" font-size="74" fill="#211D18">\u{1D11E}</text>
    <g mask="url(#nn-m)">
      ${Array.from({ length: BARS }, (_, b) => `<path id="nb${b}" d="M0 140V204" stroke="#211D18" stroke-width="2.2" fill="none"/>`).join('')}
      ${Array.from({ length: NOTES }, (_, n) => `<g id="nn${n}"><circle id="nr${n}" r="14" fill="none" stroke="#3B7A4A" stroke-width="2" opacity="0"/><g id="ns${n}"><ellipse id="ne${n}" rx="13" ry="9" fill="#111" transform="rotate(-18)"/></g></g>`).join('')}
    </g>
    <g stroke="#B8502F" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <path id="r-lb" stroke-width="4.5" d=""/><path id="r-ab" stroke-width="4" d=""/><path id="r-to" stroke-width="4.5" d=""/>
      <circle id="r-hd" r="8.5" fill="#FAF6EF" stroke-width="4.5" cx="0" cy="0"/>
      <path id="r-la" stroke-width="4.5" d=""/><path id="r-aa" stroke-width="4" d=""/>
    </g>`;

  // Monte l'animation dans un élément <svg> ; renvoie une fonction d'arrêt.
  function mount(svg) {
    svg.innerHTML = SVG_INNER;
    const M = buildModel();
    const $ = (id) => svg.querySelector('#' + id);
    const G = M.G;
    const f = (v) => v.toFixed(2);
    const E = { lb: $('r-lb'), to: $('r-to'), hd: $('r-hd'), la: $('r-la'), ab: $('r-ab'), aa: $('r-aa') };
    const NE = M.notes.map((n, i) => ({ g: $('nn' + i), r: $('nr' + i), s: $('ns' + i), e: $('ne' + i) }));
    const BE = Array.from({ length: BARS }, (_, i) => $('nb' + i));
    BE.forEach((b, i) => { if (i >= M.nb) b.setAttribute('display', 'none'); });
    const P = (a, b, c) => 'M' + f(a[0]) + ' ' + f(G - a[1]) + 'L' + f(b[0]) + ' ' + f(G - b[1]) + (c ? 'L' + f(c[0]) + ' ' + f(G - c[1]) : '');

    function fit() {
      const W = svg.clientWidth, H = svg.clientHeight;
      if (!W || !H) return;
      const s = Math.min(H / 170, W / 560), vw = W / s, vh = H / s;
      svg.setAttribute('viewBox', '0 ' + f(137 - vh / 2) + ' ' + f(vw) + ' ' + f(vh));
    }
    window.addEventListener('resize', fit);
    fit();

    function draw(t) {
      const p = M.pose(t), k = M.skel(p);
      E.lb.setAttribute('d', P(k.pel, k.kB, k.fB)); E.la.setAttribute('d', P(k.pel, k.kA, k.fA)); E.to.setAttribute('d', P(k.pel, k.top));
      E.hd.setAttribute('cx', f(k.head[0])); E.hd.setAttribute('cy', f(G - k.head[1]));
      E.ab.setAttribute('d', P(k.sh, k.eB, k.hB)); E.aa.setAttribute('d', P(k.sh, k.eA, k.hA));
      M.notes.forEach((n, i) => {
        const x = M.noteX(i, t), el = M.md(t - n.tc, M.T), ne = NE[i], on = el < 1.1;
        ne.g.setAttribute('transform', 'translate(' + f(x) + ' ' + f(G - n.h) + ')');
        let sy = 1, sx = 1;
        if (el < 0.3 && n.squash) { const sq = Math.sin(Math.PI * el / 0.3) * n.squash; sy = 1 - 0.15 * sq; sx = 1 + 0.07 * sq; }
        ne.s.setAttribute('transform', 'scale(' + f(sx) + ' ' + f(sy) + ')');
        ne.e.setAttribute('fill', on ? '#3B7A4A' : '#111');
        if (el < 0.5) { ne.r.setAttribute('r', f(14 + 14 * el / 0.5)); ne.r.setAttribute('opacity', f(0.5 * (1 - el / 0.5))); } else ne.r.setAttribute('opacity', '0');
      });
      BE.forEach((b, i) => b.setAttribute('transform', 'translate(' + f(30 + M.md(M.bo + M.bs * i - M.V * t - 30, M.L)) + ' 0)'));
    }

    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) { draw(1.0); return () => window.removeEventListener('resize', fit); }

    let raf = 0, timer = 0, stopped = false;
    function loop() {
      if (stopped) return;
      // Page masquée (autre onglet de l'app) : on ne dessine rien et on revérifie plus tard.
      if (!svg.clientWidth) { timer = setTimeout(loop, 300); return; }
      draw(((performance.now() / 1000) * M.RATE) % M.T);
      raf = requestAnimationFrame(loop);
    }
    loop();
    return () => { stopped = true; cancelAnimationFrame(raf); clearTimeout(timer); window.removeEventListener('resize', fit); };
  }

  window.Notanext.runner = { mount };
})();
