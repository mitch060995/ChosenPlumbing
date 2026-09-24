# Chosen Plumbing — Website Concept

A modern, animated redesign concept for **Chosen Plumbing** (Mudgeeraba, Gold Coast).
Plain HTML/CSS/JS — no build step — so it runs straight from GitHub Pages, Netlify, Vercel or Cloudflare Pages.

```
index.html          ← the page
css/styles.css      ← all styling + animations
js/main.js          ← rain hero, scroll reveals, card tilt, mobile menu, quote form
assets/family.jpeg  ← Jesse & family photo
```

## Design notes
- **Hero**: a rainy night street scene drawn in code (canvas rain with splashes, lightning, a house with teal gutters and downpipes). Scrolling pans the camera up into the storm clouds, where the Chosen "C" drop draws itself, fills with water and the wordmark rises in. No video or external assets.
- Other animations: shimmering headline, service marquee, animated service icons (drip, flame, steam, swirl), 3D card tilt with cursor glow, flowing wave dividers, rotating "family owned" stamp, button water-ripples, circular-reveal mobile menu, floating "Call now" button on phones.
- Respects `prefers-reduced-motion`.
- All copy comes from the existing site / Facebook page: tagline, services (plumbing, gas, hot water, drainage), Jesse's "Chosen standard" story, Brett Derome's testimonial, phone **0433 953 915**, email **info@chosenplumbing.com**, Mudgeeraba.

## Before showing the client
1. **Check with Jesse**: hours ("Always open" is from Facebook), QBCC licence number (add to footer), and service list details.

## Quote form
Out of the box the form opens the visitor's email app pre-filled (addressed to info@chosenplumbing.com).
To have enquiries land straight in an inbox instead: get a free access key at [web3forms.com](https://web3forms.com) (enter the email that should receive quotes), then paste it into `WEB3FORMS_KEY` at the bottom of `js/main.js`.

## Hosting (free)
- **GitHub Pages**: Settings → Pages → Deploy from branch → `main` / root. Note: Pages on a **private** repo needs a paid GitHub plan; on the free plan the repo must be public.
- **Private repo + free hosting**: connect the repo to **Netlify**, **Vercel** or **Cloudflare Pages** — each gives a free shareable link.
