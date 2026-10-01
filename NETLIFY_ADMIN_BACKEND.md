# Direct Strike Academy — Netlify Admin Backend

This version replaces the old static/local-only admin save model with Netlify Functions + Netlify Blobs.

## What this backend does

- Admin passwords are checked server-side in a Netlify Function.
- Owner/admin saves are written permanently to Netlify Blobs.
- Public pages fetch the latest community additions from `/api/admin/public`.
- `community-data-bridge.js` merges server additions into the existing website data at runtime.
- You can still download backup files from the admin panel.

## Required Netlify environment variables

Set these in Netlify:

Site configuration → Environment variables

Required:

```text
DSA_OWNER_PASSWORD_HASH=pbkdf2$sha256$120000$...
DSA_SESSION_SECRET=a-long-random-secret-string
```

Optional:

```text
DSA_OWNER_ID=isaac
DSA_OWNER_NAME=Isaac
```

## Create the owner password hash

On your computer, from the project root:

```bash
npm install
npm run hash:password -- "your owner password here"
```

Copy the printed value into `DSA_OWNER_PASSWORD_HASH`.

You can also use `DSA_OWNER_PASSWORD` instead of the hash for quick testing, but the hash is recommended.

## Deploy structure

Make sure these files are at the root of the project you deploy to Netlify:

```text
netlify.toml
package.json
netlify/functions/dsa-admin.mjs
scripts/hash-password.mjs
admin.html
js/admin.js
js/community-data-bridge.js
```

## API routes added

```text
GET  /api/admin/public
POST /api/admin/auth
GET  /api/admin/state
POST /api/admin/change
POST /api/admin/users
GET  /api/admin/export-js
GET  /api/admin/export-json
GET  /api/admin/export-md
POST /api/admin/clear
```

## First setup workflow

1. Deploy the site to Netlify.
2. Set `DSA_OWNER_PASSWORD_HASH` and `DSA_SESSION_SECRET`.
3. Open `/admin.html`.
4. Log in as `isaac` with the owner password.
5. Add Terran/Zerg/Protoss editor passwords from the admin page.
6. Ask editors to log in and save strategies.
7. Their changes are stored in Netlify Blobs and appear on public pages after refresh.

## Backup workflow

The admin panel can download:

- public `data-community-additions.js` backup
- private JSON audit backup
- changelog markdown

These are backups. The live backend storage is Netlify Blobs.
