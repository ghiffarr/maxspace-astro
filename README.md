# Max Space Astro

Astro reconstruction of [getmaxspace.com](https://www.getmaxspace.com/), based
on Josh's Webflow export and the asset-complete
[`ghiffarr/maxspace-v0`](https://github.com/ghiffarr/maxspace-v0) repository.

Josh's original ZIP and the `maxspace-v0` checkout remain unchanged. The Astro
project now separates preserved source, editable page sections, shared rendering
logic, and production assets so future changes have one predictable home.

## Project structure

```text
src/
├── components/webflow/
│   └── WebflowPage.astro          # shared fragment renderer and clean links
├── content/pages/
│   ├── home/                      # one numbered file per homepage section
│   ├── about/                     # one directory per page
│   └── ...
├── pages/                         # Astro route entry points
└── webflow-source/
    └── original-pages/            # preserved monolithic import snapshot

public/assets/webflow/
├── fonts/
├── images/
│   └── captured/
├── scripts/
├── styles/
└── videos/
```

The numbered files in `src/content/pages/<page>/` are the primary editable
source. Their names follow the Webflow section classes and their numeric prefixes
keep them in document order. For example, the home hero is
`src/content/pages/home/010-home-hero.html`, while the shared page renderer is
`src/components/webflow/WebflowPage.astro`.

Pages that contain semantic Webflow sections are split automatically. Empty CMS
template exports stay as a single `000-page-document.html` because they contain
no editable page body in the supplied export.

## Routes

- `/`
- `/about`
- `/careers`
- `/expandable-habitat`
- `/moon`
- `/thunderbird`
- `/media-use-agreement`
- `/privacy-policy`
- `/terms-and-conditions`
- `/style-guide`
- `/detail-jobs`
- `/detail-progress`
- `/detail-team`

Astro also generates the supplied `404` page.

## Development

```sh
npm install
npx astro dev --background
```

Manage the background server with:

```sh
npx astro dev status
npx astro dev logs
npx astro dev stop
```

## Verification

```sh
npm run audit:assets
npm run build
```

## Rebuilding section files

The organized section files are intended to be edited directly. To create them
from the preserved Webflow snapshot when the directory does not yet exist:

```sh
npm run organize:webflow
```

Passing `-- --force` replaces every editable section with the preserved source,
so use it only when you intentionally want to discard section-level edits.

The current visual comparison and interaction results are recorded in
`design-qa.md`.
