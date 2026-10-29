// Home slider: slide 1 = animated intro graphic, then banner posts from assets/banners.js
(() => {
  const root = document.getElementById("slider");
  if (!root) return;
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const banners = window.SGW_BANNERS || [];

  const intro = `
  <div class="slide s-intro" aria-label="SGW Prominance">
    <div class="intro-glow"></div>
    <div class="intro-stage">
      <div class="intro-win">
        <div class="pane l"><span>SGW</span></div>
        <div class="pane r"><span>PROMINANCE</span></div>
        <div class="intro-reveal">
          <small>uPVC Window Systems · Hyderabad</small>
          <h2>Windows engineered<br>for <em>Indian weather.</em></h2>
          <div class="intro-chips"><span>11+ years</span><span>20-yr warranty</span><span>SKZ · BSI · IFT</span><span>3000 Pa</span></div>
          <a href="contact.html#quote" class="btn btn-gold">Get a free quote →</a>
        </div>
      </div>
    </div>
  </div>`;

  const graphic = g => g === "seal"
    ? `<div class="bn-seal"><div><b>20</b><span>Year warranty</span></div></div>`
    : `<div class="bn-elev" data-elev="${g || "sliding"}"></div>`;

  const banner = (b, i) => {
    const img = b.image && b.image.trim();
    const full = img && b.full;
    return `<div class="slide s-banner${full ? " full" : ""}" aria-label="Banner ${i + 1}">
      ${full ? `<img class="bn-full" src="${img}" alt="${(b.tag || "Promotion").replace(/"/g, "")}">` : ""}
      <div class="wrap bn-grid">
        <div class="bn-copy">
          ${b.tag ? `<span class="eyebrow">${b.tag}</span>` : ""}
          ${b.title ? `<h2>${b.title}</h2>` : ""}
          ${b.text ? `<p>${b.text}</p>` : ""}
          ${b.cta ? `<a href="${b.cta.href}" class="btn btn-gold">${b.cta.label} →</a>` : ""}
        </div>
        ${full ? "" : `<div class="bn-slot">${img
          ? `<div class="bn-post" style="--img:url('${img}')"><img src="${img}" alt="${(b.tag || "Promotional post").replace(/"/g, "")}"></div>`
          : graphic(b.graphic)}</div>`}
      </div>
    </div>`;
  };

  const slides = [intro, ...banners.map(banner)];
  root.innerHTML = `<div class="track">${slides.join("")}</div>
    <button class="sl-arrow prev" aria-label="Previous slide">‹</button>
    <button class="sl-arrow next" aria-label="Next slide">›</button>
    <div class="sl-dots">${slides.map((_, i) => `<button aria-label="Go to slide ${i + 1}"><i></i></button>`).join("")}</div>`;

  // draw elevation graphics (main.js helper runs before us only for existing nodes)
  if (window.SGW_ELEV) root.querySelectorAll("[data-elev]").forEach(el => el.innerHTML = window.SGW_ELEV(el.dataset.elev));

  const track = root.querySelector(".track"), els = [...root.querySelectorAll(".slide")], dots = [...root.querySelectorAll(".sl-dots button")];
  let cur = 0, timer, paused = false;
  const DUR = [6500, ...banners.map(() => 5500)];
  function go(n, user) {
    cur = (n + els.length) % els.length;
    track.style.transform = `translateX(${-cur * 100}%)`;
    els.forEach((s, i) => s.classList.toggle("active", i === cur));
    dots.forEach((d, i) => d.classList.toggle("on", i === cur));
    root.style.setProperty("--dur", DUR[cur] + "ms");
    clearTimeout(timer);
    if (!RM && !paused) timer = setTimeout(() => go(cur + 1), DUR[cur]);
    if (user) root.classList.add("touched");
  }
  root.querySelector(".prev").onclick = () => go(cur - 1, true);
  root.querySelector(".next").onclick = () => go(cur + 1, true);
  dots.forEach((d, i) => d.onclick = () => go(i, true));
  root.addEventListener("mouseenter", () => { paused = true; clearTimeout(timer); root.classList.add("paused"); });
  root.addEventListener("mouseleave", () => { paused = false; root.classList.remove("paused"); go(cur); });
  root.addEventListener("keydown", e => { if (e.key === "ArrowLeft") go(cur - 1, true); if (e.key === "ArrowRight") go(cur + 1, true); });
  let x0 = null;
  root.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
  root.addEventListener("touchend", e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1), true); x0 = null; });
  requestAnimationFrame(() => go(0));
})();
