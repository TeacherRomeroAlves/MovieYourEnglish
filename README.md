# MovieYourEnglish
MovieYourEnglish

## Link previews

Movie lessons have static Open Graph and Twitter card tags and lightweight 1200 × 630 JPEG crops in `assets/social-previews/`. The original lesson posters are unchanged. Public pages use a branded logo preview.

When adding a movie, add it to `learning-data.js`, then run:

```powershell
node scripts/update-social-previews.cjs
node tests/social-previews.cjs
```

The scripts require `sharp`; point `NODE_PATH` to the bundled Node dependencies if it is not locally installed. Commit the generated HTML metadata and JPEGs along with the lesson. The public origin is configured in `scripts/update-social-previews.cjs`; update it if the deployment domain changes.

Previews become accessible after deployment. Messaging apps control their rendering and may cache previously shared links; old messages may retain their earlier preview.
