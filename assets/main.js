// Shared header, footer, elevation drawings and small interactions
const SITE = {
  phones: ["+91 91218 78787", "+91 98492 19587", "+91 91333 44795"],
  email: "sekharglassworkshyd@gmail.com",
  address: "Plot No. 218, Mathrusree Nagar, Miyapur, Hyderabad, Telangana 500049",
};
const tel = p => "tel:" + p.replace(/\s/g, "");
const page = document.body.dataset.page;

const logo = `<svg width="46" height="46" viewBox="0 0 48 48" aria-hidden="true">
  <path d="M30 4C18 4 9 11 9 20c0 6 4 9 10 11-5 0-9-2-11-5 1 10 9 18 20 18 9 0 15-5 15-12 0-6-5-9-11-10 4 0 7 1 9 3C41 15 37 4 30 4z" fill="#2b3a7a"/>
  <path d="M30 4c-8 1-14 6-14 12 0 4 3 6 7 7-6 0-11-3-12-8C13 8 21 3 30 4z" fill="#d32f3a"/></svg>`;
const brand = `<a href="index.html" class="brand" aria-label="SGW Prominance home">${logo}
  <span class="brand-txt"><b>SGW <em class="pm">Prominance</em></b><small>uPVC Window Systems</small></span></a>`;

const links = [["index.html","Home","home"],["about.html","About Us","about"],["products.html","Products & Specs","products"],["contact.html","Contact","contact"]];

document.getElementById("hdr").outerHTML = `
<div class="top"><div class="wrap">
  <span class="hide-sm">www.sgwprominance.com · 11+ years of uPVC fabrication in Hyderabad</span>
  <span><a href="${tel(SITE.phones[0])}">${SITE.phones[0]}</a> &nbsp;·&nbsp; <a href="mailto:${SITE.email}">${SITE.email}</a></span>
</div></div>
<header class="nav"><div class="wrap">${brand}
  <nav class="menu" id="menu">${links.map(([h,t,k])=>`<a href="${h}" class="${k===page?"active":""}">${t}</a>`).join("")}
    <a href="contact.html#quote" class="btn btn-gold">Get a Quote</a></nav>
  <button class="burger" id="burger" aria-label="Menu"><span></span><span></span><span></span></button>
</div></header>`;

document.getElementById("ftr").outerHTML = `
<section class="band"><div class="wrap">
  <h2>Upgrade your space with premium uPVC.</h2>
  <a href="contact.html#quote" class="btn">Request a free site visit →</a>
</div></section>
<footer><div class="wrap">
  <div class="cols">
    <div>${brand}<p style="margin-top:18px;max-width:34ch">Custom uPVC windows and doors fabricated by Sekhara Glass Works with certified Prominance profiles.</p></div>
    <div><h4>Explore</h4><ul>${links.map(([h,t])=>`<li><a href="${h}">${t}</a></li>`).join("")}</ul></div>
    <div><h4>Products</h4><ul><li>Sliding Windows</li><li>Casement Windows</li><li>Casement Doors</li><li>French Sliding Doors</li><li>Bi-Fold Doors</li></ul></div>
    <div><h4>Reach us</h4><ul>${SITE.phones.map(p=>`<li><a href="${tel(p)}">${p}</a></li>`).join("")}
      <li><a href="mailto:${SITE.email}">${SITE.email}</a></li><li><a href="https://www.sgwprominance.com">www.sgwprominance.com</a></li><li>${SITE.address}</li></ul></div>
  </div>
  <div class="copy"><span>© ${new Date().getFullYear()} SGW Prominance · Sekhara Glass Works. All rights reserved.</span><span>Prominance is a registered brand of its respective owner.</span></div>
</div></footer>
<a class="wa" href="https://wa.me/919121878787" target="_blank" rel="noopener" aria-label="WhatsApp">
<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l2 .9c.3.1.5.2.5.3.1.2.1.7-.1 1.1z"/></svg></a>`;

// Menu
const menu = document.getElementById("menu"), burger = document.getElementById("burger");
burger.onclick = () => { menu.classList.toggle("open"); burger.classList.toggle("x"); };

// Elevation drawings: data-elev="sliding|casement|door|french|bifold|tilt"
const F = "#ffffff", S = "#1c2654", G = "#cfe6f5", A = "#c8962e";
function pane(x,y,w,h){return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${G}" stroke="${S}" stroke-width="2"/>
  <path d="M${x+w*.15} ${y+h*.2} l${w*.25} -${h*.12} M${x+w*.15} ${y+h*.34} l${w*.4} -${h*.22}" stroke="#fff" stroke-width="3" opacity=".8"/>`;}
function sash(x,y,w,h,open){ // open: 'l','r' hinge side for swing line, 's' sliding arrow
  let o = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${F}" stroke="${S}" stroke-width="2.5"/>` + pane(x+8,y+8,w-16,h-16);
  if(open==="l") o += `<path d="M${x+w-8} ${y+8} L${x+8} ${y+h/2} L${x+w-8} ${y+h-8}" fill="none" stroke="${A}" stroke-width="1.6" stroke-dasharray="6 5"/>`;
  if(open==="r") o += `<path d="M${x+8} ${y+8} L${x+w-8} ${y+h/2} L${x+8} ${y+h-8}" fill="none" stroke="${A}" stroke-width="1.6" stroke-dasharray="6 5"/>`;
  if(open==="s") o += `<path d="M${x+w/2-22} ${y+h/2} h44 m-8 -7 l8 7 -8 7" fill="none" stroke="${A}" stroke-width="2.4"/>`;
  return o;
}
function elev(type){
  const W=320,H=type==="sliding"||type==="casement"?200:240;
  let g = `<rect x="2" y="2" width="${W-4}" height="${H-4}" fill="${F}" stroke="${S}" stroke-width="3" rx="2"/>`;
  const iw=W-24, ih=H-24, x0=12, y0=12;
  const split=(n,opens)=>{const w=iw/n;for(let i=0;i<n;i++) g+=sash(x0+i*w,y0,w,ih,opens[i]);};
  if(type==="sliding") split(2,["s","s"]);
  if(type==="casement") split(3,["r","",'l']);
  if(type==="door") split(1,["r"]);
  if(type==="french") split(4,["","s","s",""]);
  if(type==="bifold"){const w=iw/5;for(let i=0;i<5;i++) g+=sash(x0+i*w,y0,w,ih,i%2?"l":"r");}
  if(type==="tilt"){g+=sash(x0,y0,iw/2,ih,"r")+sash(x0+iw/2,y0,iw/2,ih,"");
    g+=`<path d="M${x0+iw/2+8} ${y0+ih-8} L${x0+iw*.75} ${y0+8} L${x0+iw-8} ${y0+ih-8}" fill="none" stroke="${A}" stroke-width="1.6" stroke-dasharray="6 5"/>`;}
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${type} elevation">${g}</svg>`;
}
document.querySelectorAll("[data-elev]").forEach(el => el.innerHTML = elev(el.dataset.elev));

// Reveal on scroll
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12 });
document.querySelectorAll(".rv").forEach(el => io.observe(el));

// Count-up stats
document.querySelectorAll("[data-count]").forEach(el => {
  const end = +el.dataset.count, suf = el.dataset.suffix || "";
  el.textContent = end.toLocaleString("en-IN") + suf;
  const run = () => { let t0; const step = t => { t0 ??= t; const p = Math.min((t - t0) / 1400, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))).toLocaleString("en-IN") + suf; if (p < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); };
  new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { run(); o.disconnect(); } })).observe(el);
});

// Quote form -> WhatsApp (no backend needed)
const form = document.getElementById("quoteForm");
if (form) form.addEventListener("submit", e => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(form));
  const msg = `Hello SGW, I'd like a quote.\nName: ${d.name}\nPhone: ${d.phone}\nLocation: ${d.location || "-"}\nProduct: ${d.product}\nProject: ${d.ptype}\nDetails: ${d.message || "-"}`;
  window.open(`https://wa.me/919121878787?text=${encodeURIComponent(msg)}`, "_blank");
});
