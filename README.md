# Puppeteer Screenshot Sandbox for Testing

A sandbox to test out different WCAG and other screenshot testing needs using Puppeteer for tooling. Will most likely create a couple other versions such as for Cypress and others to see what might get closer to needs.

Currently for WCAG 1.4.10 Reflow testing and screenshots Puppeteer does not look like it actually gets the right match up. I will update as I dive deeper into it.

## NPM Script Commands

-  Run script - still basic enough to just do node index.js

   ```
   npm run shoot
   ```
-  Clean images folder and run - use rimraf and cleanup to start fresh (technically same named files will overwrite regardless of approach)

   ```
   npm run cleanshot 
   ```