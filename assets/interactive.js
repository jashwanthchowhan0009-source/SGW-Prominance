// SGW Prominance — interactive pieces: Window Lab (home), Configurator + Cross-section (products)
(() => {
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const $ = (s, r = document) => r.querySelector(s);

  /* ============ 1. WINDOW LAB — drag the sash, feel the difference ============ */
  const lab = $("#lab");
  if (lab) {
    const cv = $("canvas", lab), ctx = cv.getContext("2d"), range = $("#labOpen", lab);
    const m1l = $("#m1l", lab), m1 = $("#m1", lab), m2l = $("#m2l", lab), m2 = $("#m2", lab), m3 = $("#m3", lab), hint = $(".lab-hint", lab);
    let W = 0, H = 0, open = 0, target = 0, mode = "heat", parts = [], drag = null, touched = false, frame = 0, last = performance.now();
    let rnd = 7; const R = () => ((rnd = (rnd * 16807) % 2147483647) / 2147483647);
    const city = Array.from({ length: 14 }, () => ({ w: .05 + R() * .08, h: .18 + R() * .42, win: R() }));
    const trees = Array.from({ length: 6 }, () => ({ x: R(), r: .05 + R() * .05 }));
    const cars = Array.from({ length: 3 }, (_, i) => ({ x: R(), v: (.06 + R() * .05) * (i % 2 ? -1 : 1), c: ["#d32f3a", "#123a6b", "#38b6ff"][i] }));

    function size() {
      const r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
      W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
    }
    new ResizeObserver(size).observe(cv); size();

    function geo() {
      const fx = W * .1, fy = H * .08, fw = W * .8, fh = H * .64, b = Math.max(9, W * .024);
      const ix = fx + b, iy = fy + b, iw = fw - 2 * b, ih = fh - 2 * b, sw = iw / 2, rx = ix + sw - open * sw;
      return { fx, fy, fw, fh, b, ix, iy, iw, ih, sw, rx, gx: rx + sw, gw: ix + iw - (rx + sw), cx: ix + iw / 2, cy: iy + ih / 2 };
    }

    const MODES = {
      heat: { sky: ["#6fb6ec", "#cfe9fb"], m1l: "Indoor temp", m1: o => (24 + 9 * o).toFixed(1) + "°C", m2l: "AC load", m2: o => Math.round(30 + 70 * o) + "%", rate: 16 },
      rain: { sky: ["#5d6b7d", "#a9b4c0"], m1l: "Water inside", m1: o => o < .02 ? "None" : o < .4 ? "Splashes" : "Flooding", m2l: "Sill", m2: o => o < .02 ? "Dry" : "Wet", rate: 90 },
      noise: { sky: ["#2a3160", "#c27a63"], m1l: "Indoor noise", m1: o => Math.round(30 + 42 * o) + " dB", m2l: "Street", m2: () => "72 dB", rate: 7 },
    };

    function drawOutside(g, t) {
      const M = MODES[mode];
      const sky = ctx.createLinearGradient(0, g.iy, 0, g.iy + g.ih);
      sky.addColorStop(0, M.sky[0]); sky.addColorStop(1, M.sky[1]);
      ctx.fillStyle = sky; ctx.fillRect(g.ix, g.iy, g.iw, g.ih);
      if (mode === "heat") { // sun + glow
        const sx = g.ix + g.iw * .8, sy = g.iy + g.ih * .2, gl = ctx.createRadialGradient(sx, sy, 2, sx, sy, g.iw * .35);
        gl.addColorStop(0, "rgba(255,236,170,.95)"); gl.addColorStop(.18, "rgba(255,210,110,.55)"); gl.addColorStop(1, "rgba(255,210,110,0)");
        ctx.fillStyle = gl; ctx.fillRect(g.ix, g.iy, g.iw, g.ih);
        ctx.fillStyle = "#fff6d6"; ctx.beginPath(); ctx.arc(sx, sy, g.iw * .045, 0, 7); ctx.fill();
      }
      if (mode === "rain") { // clouds
        ctx.fillStyle = "rgba(70,80,95,.55)";
        for (let i = 0; i < 5; i++) { const x = g.ix + ((i * .27 + t * .004) % 1.3 - .15) * g.iw; ctx.beginPath(); ctx.ellipse(x, g.iy + g.ih * (.12 + (i % 2) * .08), g.iw * .16, g.ih * .07, 0, 0, 7); ctx.fill(); }
      }
      // skyline
      let x = g.ix - 4; const base = g.iy + g.ih * .86;
      city.forEach(c => {
        const w = c.w * g.iw, h = c.h * g.ih;
        ctx.fillStyle = mode === "noise" ? "#1b2045" : mode === "rain" ? "#4f5967" : "#8aa3bd";
        ctx.fillRect(x, base - h, w - 2, h);
        if (mode === "noise") { ctx.fillStyle = "rgba(255,214,120,.75)"; for (let yy = base - h + 6; yy < base - 6; yy += 9) for (let xx = x + 4; xx < x + w - 6; xx += 8) if ((xx * 7 + yy * 3 + c.win * 99 | 0) % 3 === 0) ctx.fillRect(xx, yy, 3, 4); }
        x += w;
      });
      trees.forEach(tr => { ctx.fillStyle = mode === "noise" ? "#141834" : mode === "rain" ? "#3c5a40" : "#4f9a45"; ctx.beginPath(); ctx.arc(g.ix + tr.x * g.iw, base, tr.r * g.iw, Math.PI, 0); ctx.fill(); });
      // road + cars
      ctx.fillStyle = mode === "noise" ? "#11142b" : "#5b6068"; ctx.fillRect(g.ix, base, g.iw, g.iy + g.ih - base);
      cars.forEach(c => {
        if (!RM) c.x = (c.x + c.v * .016 + 1.2) % 1.2;
        const cx = g.ix + (c.x - .1) * g.iw, cy = base + (g.iy + g.ih - base) * .35, cw = g.iw * .09, ch = cw * .32;
        ctx.fillStyle = c.c; ctx.beginPath(); ctx.roundRect(cx, cy, cw, ch, 3); ctx.fill();
        ctx.fillRect(cx + cw * .2, cy - ch * .55, cw * .55, ch * .6);
        if (mode === "noise") { ctx.fillStyle = "rgba(255,240,180,.8)"; ctx.fillRect(c.v > 0 ? cx + cw - 2 : cx - 2, cy + 2, 4, 3); }
      });
    }

    function sash(x, y, w, h, b, glassTint) {
      const p = b * .85;
      ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.rect(x, y, w, h); ctx.rect(x + p, y + p, w - 2 * p, h - 2 * p); ctx.fill("evenodd");
      ctx.strokeStyle = "rgba(28,38,84,.25)"; ctx.lineWidth = 1; ctx.strokeRect(x + .5, y + .5, w - 1, h - 1);
      ctx.save(); ctx.beginPath(); ctx.rect(x + p, y + p, w - 2 * p, h - 2 * p); ctx.clip();
      ctx.fillStyle = glassTint; ctx.fillRect(x + p, y + p, w - 2 * p, h - 2 * p);
      ctx.strokeStyle = "rgba(255,255,255,.55)"; ctx.lineWidth = 3; // reflections
      ctx.beginPath(); ctx.moveTo(x + p + w * .12, y + h * .55); ctx.lineTo(x + p + w * .5, y + p); ctx.moveTo(x + p + w * .25, y + h * .62); ctx.lineTo(x + p + w * .62, y + p + h * .05); ctx.stroke();
      ctx.restore();
      ctx.strokeStyle = "rgba(28,38,84,.18)"; ctx.strokeRect(x + p - .5, y + p - .5, w - 2 * p + 1, h - 2 * p + 1);
    }

    function spawn(g) {
      const x = g.ix + R() * g.iw, y = g.iy + (mode === "rain" ? R() * g.ih * .9 : g.ih * (.15 + R() * .75));
      const inGap = x > g.gx + 2 && x < g.ix + g.iw - 2;
      parts.push({ x, y, inGap, a: 0, z: 0, life: 0, s: .6 + R() * .8, v: 30 + R() * 50 });
    }

    function drawParts(g, dt) {
      const proj = (p) => { const k = 1 + p.z * 1.7; return [g.cx + (p.x - g.cx) * k, g.cy + (p.y - g.cy) * k + p.z * p.z * H * (mode === "rain" ? .45 : .08), k]; };
      parts = parts.filter(p => {
        p.life += dt;
        if (mode === "heat") {
          if (p.life < .45) { // incoming ray
            const f = p.life / .45, x0 = p.x + 70, y0 = p.y - 70, x1 = x0 + (p.x - x0) * f, y1 = y0 + (p.y - y0) * f;
            ray(x1, y1, 22 * p.s, .25 + .5 * f, 1);
          } else if (!p.inGap) { // reflected by glass
            const f = (p.life - .45) / .5; if (f > 1) return false;
            ctx.fillStyle = `rgba(255,240,190,${.9 * (1 - f)})`; ctx.beginPath(); ctx.arc(p.x, p.y, 2 + 5 * f, 0, 7); ctx.fill();
            ray(p.x + 40 * f, p.y - 40 * f, 16 * p.s, .5 * (1 - f), -1);
          } else { // enters the room
            p.z = Math.min(1, (p.life - .45) / .9); if (p.z >= 1) return false;
            const [x, y, k] = proj(p); ray(x, y, 22 * p.s * k, .8 * (1 - p.z), 1, 2 * k);
          }
        } else if (mode === "rain") {
          if (!p.inGap) {
            p.y += p.v * dt * (p.life < .2 ? 6 : 1); if (p.y > g.iy + g.ih - 4) return false;
            ctx.strokeStyle = "rgba(225,240,255,.75)"; ctx.lineWidth = 1.6 * p.s; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y - 7 * p.s); ctx.stroke();
            ctx.fillStyle = "rgba(240,248,255,.85)"; ctx.beginPath(); ctx.arc(p.x, p.y, 1.4 * p.s, 0, 7); ctx.fill();
          } else {
            p.z = Math.min(1, p.life / .7); if (p.z >= 1) return false;
            const [x, y, k] = proj(p); ctx.strokeStyle = `rgba(200,225,255,${.85 * (1 - p.z * .6)})`; ctx.lineWidth = 1.4 * k;
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 2 * k, y - 12 * k); ctx.stroke();
          }
        } else { // noise rings
          if (!p.inGap) {
            const f = p.life / 1.1; if (f > 1) return false;
            ctx.strokeStyle = `rgba(255,255,255,${.35 * (1 - f)})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(p.x, p.y, 4 + 9 * f, 0, 7); ctx.stroke();
          } else {
            p.z = Math.min(1, p.life / 1.4); if (p.z >= 1) return false;
            const [x, y, k] = proj(p);
            for (let i = 0; i < 3; i++) { ctx.strokeStyle = `rgba(211,47,58,${(.75 - i * .2) * (1 - p.z)})`; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(x, y, (8 + i * 9) * k * (.6 + p.z), 0, 7); ctx.stroke(); }
          }
        }
        return true;
      });
    }
    function ray(x, y, len, a, dir, wdt = 1.8) {
      ctx.strokeStyle = `rgba(255,190,70,${a})`; ctx.lineWidth = wdt; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len * .7 * dir, y - len * .7 * dir); ctx.stroke();
    }

    function room(g) {
      const wall = ctx.createLinearGradient(0, 0, 0, H); wall.addColorStop(0, "#f6f1e7"); wall.addColorStop(1, "#ece4d3");
      ctx.fillStyle = wall; ctx.fillRect(0, 0, W, H);
      const fl = H * .86; ctx.fillStyle = "#c79a64"; ctx.fillRect(0, fl, W, H - fl);
      ctx.fillStyle = "rgba(0,0,0,.06)"; for (let x = 0; x < W; x += W / 9) ctx.fillRect(x, fl, 1, H - fl);
      ctx.fillStyle = "#fff"; ctx.fillRect(0, fl - 6, W, 6);
      // sofa silhouette
      ctx.fillStyle = "#e9dfcc"; ctx.beginPath(); ctx.roundRect(W * .06, H * .74, W * .36, H * .13, 10); ctx.fill();
      ctx.fillStyle = "#d9c9aa"; ctx.beginPath(); ctx.roundRect(W * .1, H * .7, W * .12, H * .08, 8); ctx.fill();
      // plant
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(W * .82, H * .82, W * .04, H * .045, 0, 0, 7); ctx.fill();
      ctx.fillStyle = "#4f9a45"; for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.ellipse(W * .82 + Math.cos(i) * W * .03, H * .76 - Math.sin(i * 1.7) * H * .03, W * .012, H * .028, i, 0, 7); ctx.fill(); }
    }

    function draw(now) {
      const dt = Math.min(.05, (now - last) / 1000); last = now; frame++;
      if (!drag) open += (target - open) * .12;
      const g = geo();
      room(g);
      // shadow on wall + outer frame
      ctx.fillStyle = "rgba(28,38,84,.12)"; ctx.fillRect(g.fx + 6, g.fy + 10, g.fw, g.fh);
      ctx.fillStyle = "#fff"; ctx.fillRect(g.fx, g.fy, g.fw, g.fh);
      ctx.save(); ctx.beginPath(); ctx.rect(g.ix, g.iy, g.iw, g.ih); ctx.clip();
      drawOutside(g, now / 16);
      const tint = mode === "noise" ? "rgba(40,60,120,.16)" : "rgba(190,225,245,.16)";
      sash(g.ix, g.iy, g.sw + g.b * .3, g.ih, g.b, tint); // fixed sash (outer track)
      sash(g.rx, g.iy, g.sw, g.ih, g.b, tint);              // sliding sash (inner track)
      // handle
      const hx = g.rx + g.b * .42, hy = g.iy + g.ih * .5;
      ctx.fillStyle = drag ? "#0077c8" : "#e8e8ea"; ctx.strokeStyle = "rgba(28,38,84,.35)";
      ctx.beginPath(); ctx.roundRect(hx - 3, hy - 22, 6, 44, 3); ctx.fill(); ctx.stroke();
      ctx.restore();
      // spawn + particles (drawn over glass & into room)
      const n = MODES[mode].rate * dt * (RM ? .3 : 1), k = Math.floor(n) + (R() < n % 1 ? 1 : 0); for (let i = 0; i < k; i++) spawn(g);
      drawParts(g, dt);
      // sill
      ctx.fillStyle = "#fff"; ctx.fillRect(g.fx - 12, g.fy + g.fh, g.fw + 24, 10);
      ctx.fillStyle = "rgba(28,38,84,.15)"; ctx.fillRect(g.fx - 12, g.fy + g.fh + 10, g.fw + 24, 3);
      if (mode === "rain" && open > .02) { ctx.fillStyle = `rgba(120,170,220,${.5 * open})`; ctx.beginPath(); ctx.ellipse(g.gx + g.gw / 2, g.fy + g.fh + 5, g.gw * .7, 5, 0, 0, 7); ctx.fill(); }
      // room tint
      if (mode === "heat" && open > .01) { ctx.fillStyle = `rgba(255,140,40,${.16 * open})`; ctx.fillRect(0, 0, W, H); }
      if (mode === "noise" && open > .01) { ctx.fillStyle = `rgba(211,47,58,${.07 * open})`; ctx.fillRect(0, 0, W, H); }
      // meters
      if (frame % 6 === 0) {
        const M = MODES[mode];
        m1.textContent = M.m1(open); m2.textContent = M.m2(open);
        m3.textContent = open < .02 ? "Sealed by Prominance" : `Open ${Math.round(open * 100)}%`;
        lab.classList.toggle("is-open", open >= .02);
        if (document.activeElement !== range) range.value = Math.round(open * 100);
      }
      requestAnimationFrame(draw);
    }

    // interaction
    const pt = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    const stopIntro = () => { if (!touched) { touched = true; hint.classList.add("gone"); } };
    cv.addEventListener("pointerdown", e => {
      const [x, y] = pt(e), g = geo();
      if (x > g.rx - 10 && x < g.rx + g.sw && y > g.iy && y < g.iy + g.ih) { drag = { off: x - g.rx }; cv.setPointerCapture(e.pointerId); stopIntro(); }
    });
    cv.addEventListener("pointermove", e => {
      const [x, y] = pt(e), g = geo();
      if (drag) { open = target = clamp((g.ix + g.sw - (x - drag.off)) / g.sw, 0, 1); }
      cv.style.cursor = drag ? "grabbing" : (x > g.rx && x < g.rx + g.sw && y > g.iy && y < g.iy + g.ih) ? "grab" : "default";
    });
    const end = () => { drag = null; };
    cv.addEventListener("pointerup", end); cv.addEventListener("pointercancel", end);
    range.addEventListener("input", () => { target = range.value / 100; stopIntro(); });
    lab.querySelectorAll("[data-mode]").forEach(b => b.addEventListener("click", () => {
      mode = b.dataset.mode; parts = [];
      lab.querySelectorAll("[data-mode]").forEach(x => x.classList.toggle("on", x === b));
      m1l.textContent = MODES[mode].m1l; m2l.textContent = MODES[mode].m2l;
    }));
    // intro: open a little, then close, to show the contrast
    setTimeout(() => { if (!touched) target = .6; }, 1400);
    setTimeout(() => { if (!touched) target = 0; }, 4400);
    requestAnimationFrame(draw);
  }

  /* ============ 2. CONFIGURATOR — live elevation drawing ============ */
  const cfg = $("#cfg");
  if (cfg) {
    const svg = $("#cfgSvg"), sum = $("#cfgSum"), send = $("#cfgSend"), cw = $("#cw"), chh = $("#ch"), mesh = $("#cmesh");
    const st = { type: "sliding", color: "#ffffff", glass: "Clear 5 mm", open: false };
    const NAMES = { sliding: "Sliding Window", casement: "Casement Window", tilt: "Tilt & Turn Window", door: "Casement Door", french: "French Sliding Door", bifold: "Bi-Fold Door" };
    const FIN = { "#ffffff": "White", "#b5804a": "Golden Oak", "#6b4428": "Walnut", "#3c4047": "Anthracite" };
    const shade = (hex, f) => "#" + hex.slice(1).match(/../g).map(h => clamp(Math.round(parseInt(h, 16) * f), 0, 255).toString(16).padStart(2, "0")).join("");

    function layout(t, w) {
      // returns [{open:'slide-l'|'slide-r'|'hinge-l'|'hinge-r'|'tilt'|'fold'|null}]
      if (t === "sliding") { const n = w <= 1500 ? 2 : w <= 2700 ? 3 : 4; return Array.from({ length: n }, (_, i) => ({ o: i % 2 ? "slide-l" : null })); }
      if (t === "casement") { const n = clamp(Math.round(w / 600), 1, 7); return Array.from({ length: n }, (_, i) => ({ o: n === 1 ? "hinge-l" : i === 0 ? "hinge-l" : i === n - 1 ? "hinge-r" : null })); }
      if (t === "tilt") { const n = clamp(Math.round(w / 800), 1, 5); return Array.from({ length: n }, (_, i) => ({ o: i === 0 ? "tilt" : null })); }
      if (t === "door") { const n = w <= 1100 ? 1 : 2; return n === 1 ? [{ o: "hinge-l" }] : [{ o: "hinge-l" }, { o: "hinge-r" }]; }
      if (t === "french") { const n = w <= 2400 ? 2 : 4; return n === 2 ? [{ o: null }, { o: "slide-l" }] : [{ o: null }, { o: "slide-l" }, { o: "slide-r" }, { o: null }]; }
      const n = clamp(Math.round(w / 800), 2, 7); return Array.from({ length: n }, () => ({ o: "fold" }));
    }

    function render() {
      const w = +cw.value, h = +chh.value; $("#cwo").textContent = w + " mm"; $("#cho").textContent = h + " mm";
      const s = Math.min(520 / w, 380 / h), FW = w * s, FH = h * s, ft = Math.max(6, 60 * s), pf = Math.max(5, 68 * s), L = 64, T = 20;
      const panels = layout(st.type, w), n = panels.length, iw = FW - 2 * ft, ih = FH - 2 * ft, pw = iw / n;
      const col = st.color, dk = shade(col, col === "#ffffff" ? .8 : .7), dgu = st.glass.startsWith("DGU");
      let g = `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8ccaf0"/><stop offset=".7" stop-color="#d7eefb"/><stop offset=".7" stop-color="#7fbf6a"/><stop offset="1" stop-color="#5a9a48"/></linearGradient>
        <pattern id="mesh" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 0H4M0 0V4" stroke="#0b1f3a" stroke-width=".4" opacity=".5"/></pattern></defs>
        <g transform="translate(${L},${T})">
        <rect x="${ft}" y="${ft}" width="${iw}" height="${ih}" fill="url(#sky)"/>`;
      panels.forEach((p, i) => {
        const x = ft + i * pw, oc = p.o;
        let tf = "", org = "left";
        if (st.open && oc) {
          if (oc === "slide-l") tf = `translateX(${-pw * .88}px)`;
          if (oc === "slide-r") tf = `translateX(${pw * .88}px)`;
          if (oc === "hinge-l") { tf = "scaleX(.22)"; org = "left"; }
          if (oc === "hinge-r") { tf = "scaleX(.22)"; org = "right"; }
          if (oc === "tilt") { tf = "scaleY(.86)"; org = "bottom"; }
          if (oc === "fold") { tf = `translateX(${-i * pw + i * pw * .14}px) scaleX(.14)`; org = "left"; }
        }
        const gx = x + pf, gy = ft + pf, gw = pw - 2 * pf, gh = ih - 2 * pf;
        g += `<g class="cs" style="transform:${tf};transform-origin:${org};transform-box:fill-box">
          <rect x="${x}" y="${ft}" width="${pw}" height="${ih}" fill="${col}" stroke="${dk}" stroke-width="1.2"/>
          <rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" fill="#cfe6f5" fill-opacity=".55" stroke="${dk}"/>
          ${dgu ? `<rect x="${gx + 3}" y="${gy + 3}" width="${gw - 6}" height="${gh - 6}" fill="none" stroke="#9fb7c9" stroke-width=".8"/>` : ""}
          <path d="M${gx + gw * .15} ${gy + gh * .3}l${gw * .3} -${gh * .16}M${gx + gw * .15} ${gy + gh * .42}l${gw * .45} -${gh * .26}" stroke="#fff" stroke-width="2" opacity=".8"/>
          ${mesh.checked && oc ? `<rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" fill="url(#mesh)"/>` : ""}
          ${oc === "hinge-l" ? `<path d="M${gx + gw} ${gy} L${gx} ${gy + gh / 2} L${gx + gw} ${gy + gh}" fill="none" stroke="#0077c8" stroke-dasharray="5 4"/>` : ""}
          ${oc === "hinge-r" ? `<path d="M${gx} ${gy} L${gx + gw} ${gy + gh / 2} L${gx} ${gy + gh}" fill="none" stroke="#0077c8" stroke-dasharray="5 4"/>` : ""}
          ${oc === "tilt" ? `<path d="M${gx} ${gy + gh} L${gx + gw / 2} ${gy} L${gx + gw} ${gy + gh} M${gx} ${gy} L${gx + gw} ${gy + gh / 2} L${gx} ${gy + gh}" fill="none" stroke="#0077c8" stroke-dasharray="5 4"/>` : ""}
          ${oc && oc.startsWith("slide") ? `<path d="M${x + pw / 2 - 16} ${ft + ih / 2}h32m-7-6l7 6-7 6" fill="none" stroke="#0077c8" stroke-width="2"/>` : ""}
          ${oc ? `<rect x="${oc === "hinge-l" || oc === "fold" ? x + pw - pf / 2 - 2 : x + pf / 2 - 2}" y="${ft + ih / 2 - 12}" width="4" height="24" rx="2" fill="${shade(col, .55)}"/>` : ""}
        </g>`;
      });
      g += `        <rect x="${ft / 2}" y="${ft / 2}" width="${FW - ft}" height="${FH - ft}" fill="none" stroke="${col}" stroke-width="${ft - 2}"/>
        <rect x=".5" y=".5" width="${FW - 1}" height="${FH - 1}" fill="none" stroke="${dk}"/>
        <g class="dim" stroke="#0b1f3a" fill="#0b1f3a" font-size="12" font-family="Inter,sans-serif">
          <path d="M0 ${FH + 18}H${FW}M0 ${FH + 10}v16M${FW} ${FH + 10}v16" stroke-width="1"/>
          <text x="${FW / 2}" y="${FH + 36}" text-anchor="middle" stroke="none" font-weight="600">${w} mm</text>
          <path d="M-18 0V${FH}M-26 0h16M-26 ${FH}h16" stroke-width="1"/>
          <text x="-30" y="${FH / 2}" text-anchor="middle" stroke="none" font-weight="600" transform="rotate(-90 -30 ${FH / 2})">${h} mm</text>
        </g></g>`;
      svg.setAttribute("viewBox", `0 0 ${FW + L + 20} ${FH + T + 48}`);
      svg.innerHTML = g;
      const ops = panels.filter(p => p.o).length, area = (w * h / 1e6).toFixed(2);
      const rows = [["System", NAMES[st.type]], ["Size", `${w} × ${h} mm`], ["Area", `${area} m²`], ["Panels", `${n} (${ops} opening)`], ["Finish", FIN[st.color]], ["Glass", st.glass], ["Mesh", mesh.checked ? "Yes" : "No"], ["Profile", "Prominance uPVC · 20-yr warranty"]];
      sum.innerHTML = rows.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join("");
      send.href = "https://wa.me/919121878787?text=" + encodeURIComponent("Hello SGW Prominance, please quote for:\n" + rows.map(r => r.join(": ")).join("\n"));
    }

    cfg.querySelectorAll(".chips").forEach(grp => grp.addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      grp.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b));
      st[grp.dataset.k] = b.dataset.v;
      if (grp.dataset.k === "type") {
        const door = ["door", "french", "bifold"].includes(b.dataset.v);
        if (door && +chh.value < 1800) chh.value = 2100;
        if (!door && +chh.value > 1800) chh.value = 1350;
        if (b.dataset.v === "door" && +cw.value > 1800) cw.value = 1500;
        st.open = false;
      }
      render();
    }));
    [cw, chh, mesh].forEach(el => el.addEventListener("input", render));
    $(".cfg-view").addEventListener("click", () => { st.open = !st.open; render(); });
    render();
  }

  /* ============ 3. CROSS-SECTION — what's inside a Prominance profile ============ */
  const xs = $("#xsec");
  if (xs) {
    const items = [...xs.querySelectorAll("[data-p]")];
    let auto = !RM, idx = 0, timer;
    const show = p => { xs.classList.toggle("focus", !!p); items.forEach(el => el.classList.toggle("on", el.dataset.p === p)); };
    items.forEach(el => {
      const go = () => { auto = false; clearInterval(timer); show(el.dataset.p); };
      el.addEventListener("mouseenter", go); el.addEventListener("focus", go); el.addEventListener("click", go);
    });
    const keys = [...new Set(items.map(i => i.dataset.p))];
    if (auto) timer = setInterval(() => { if (auto) show(keys[idx++ % keys.length]); }, 2200);
  }
})();
