# Preserved Webflow source

The HTML documents in `original-pages/` are the preserved working import
snapshot used to create the editable section files. The original archive at
`/Users/ghiffarr/Desktop/DORXATA/Max Space Webflow.zip` and the
`ghiffarr/maxspace-v0` checkout remain unchanged.

Astro renders the organized copies in `src/content/pages/`; it does not render
these monolithic source documents directly. Run `npm run organize:webflow`
only when `src/content/pages/` does not exist, or add `-- --force` to knowingly
replace all editable fragments from this snapshot.
