# Poojitha’s Portfolio

A responsive React portfolio built with Vite. It features a light glass visual system, scroll-linked section transitions, Framer Motion interactions, a selectively loaded GSAP ScrollTrigger effect in the hero, searchable and filterable projects, and hash-routed project case studies.

## Requirements

- Node.js 20 or newer
- npm

## Run locally

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173/`). Serve the app through Vite; opening `index.html` directly with a `file://` URL prevents the browser from loading its JavaScript modules.

## Update portfolio content

Edit `src/data/projects.js` to update the profile, headline and tagline, social links, focus areas, education entries, skills, carousel interests, and project inventory. Project entries include their case-study details, technology tags, architecture notes, and verified source links. Keep project descriptions aligned with available evidence. The testimonials list is empty, so no testimonial section is displayed.

Project cards open routes in the form `#project/<project-id>`. The site handles these routes without adding a separate routing dependency, which keeps direct project links compatible with the static GitHub Pages deployment.

## Build and preview

Create the production build:

```sh
npm run build
```

Preview the generated build locally:

```sh
npm run preview
```

Motion respects `prefers-reduced-motion`. GSAP ScrollTrigger is loaded only for the hero, and hero parallax is reduced on touch-width screens. The custom cursor is limited to fine-pointer devices; the technical-interest carousel supports swipe and keyboard navigation.

## Deploy to GitHub Pages

The repository includes `.github/workflows/deploy.yml`. In the repository’s GitHub settings, choose **Settings → Pages → GitHub Actions** as the deployment source. The workflow installs dependencies, builds the site, and publishes the `dist` directory when changes are pushed to `main`. It can also be started manually from the repository’s **Actions** tab.

Vite’s relative `base` setting and the existing workflow are configured for this static deployment. The workflow has not been run from this workspace. No commit or push was performed.
