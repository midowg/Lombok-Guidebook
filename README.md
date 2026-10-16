# The Art of Being Together · Lombok Guidebook

Mobile guidebook for the 15th anniversary journey of GKR Bendara & KPH Yudanegara, Lombok, 16–19 October 2026.
Prepared by Werkudara Group with Takshaka Event & Experience.

## Files
- `index.html`: the guidebook. All text and data (flights, hotel, itinerary, contacts) live in the `GUIDE`, `DAYS` and `EXPERIENCES` blocks near the top of the script.
- `upload/index.html`: `/upload`, one button to add photos.
- `photos/index.html`: `/photos`, every shared photo, newest first.
- `api/`: Vercel functions. `upload-url.js` hands out a 10-minute upload link, `photos.js` lists the album. Photos go straight from the phone to Cloudflare R2.
- `assets/images/`: photos, logo and favicon.
- `assets/docs/`: PDF backup and the e-ticket (`8d4f2c7a91e6b305.pdf`, linked from `eticket` in `GUIDE.flights`).
- `package.json`: the R2 (S3-compatible) client the functions use. Vercel installs it on deploy.

## Who sees what
- `/photos`: share this link with the guests. It has no upload button.
- `/upload`: admin only. Nothing on the site links to it, so keep the address within the team.

## Shared Album setup (Vercel + Cloudflare R2), one time
1. **Cloudflare → R2 → Create bucket**, name it e.g. `lombok-album`. Keep it private.
2. **R2 → Manage API tokens → Create API token**, permission *Object Read & Write*, limited to that bucket.
   Note the **Access Key ID**, **Secret Access Key** and your **Account ID**.
3. **Bucket → Settings → CORS policy**, paste (replace the domain with your Vercel domain):
   ```json
   [{"AllowedOrigins":["https://YOUR-PROJECT.vercel.app"],"AllowedMethods":["PUT","GET"],"AllowedHeaders":["Content-Type"],"MaxAgeSeconds":3600}]
   ```
4. **Vercel → Project → Settings → Environment Variables**, add:
   | Name | Value |
   |---|---|
   | `R2_ACCOUNT_ID` | Cloudflare account ID |
   | `R2_ACCESS_KEY_ID` | from step 2 |
   | `R2_SECRET_ACCESS_KEY` | from step 2 |
   | `R2_BUCKET` | `lombok-album` |
5. **Redeploy** (Deployments → ⋯ → Redeploy). Open `/upload`, add a test photo, then check `/photos`.

To remove a photo, delete it in Cloudflare → R2 → `lombok-album` → `album/`.

## Privacy
The site, the album and the e-ticket are open to anyone with the link, and anyone with the link can add photos.
Share the link only with the guests and their team.
