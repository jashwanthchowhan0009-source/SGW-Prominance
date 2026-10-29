# SGW Prominance
4-page static site for Sekhara Glass Works: Home, About (about us, experience, promoters), Products & Specs (elevations, technical specs, 20-yr warranty), Contact (WhatsApp quote form + map).
Deploy: any static host (Vercel/Netlify/GitHub Pages) — no build step.
TODO: promoter names/bios in `about.html`; confirm PIN (500049 vs 500079).
Domain: www.sgwprominance.com

## Home slider & banner posts
Slide 1 is an animated intro graphic, followed by 3 banner posts.
To change a banner or add a promo post: drop the image in `assets/banners/` and set `image:` in `assets/banners.js` (any size fits; `full: true` fills the whole banner). Add or remove entries to change the number of banners.
