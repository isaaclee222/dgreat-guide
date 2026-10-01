# Netlify live-throttle admin fix

This patch fixes two issues:

1. Newly-created editor passwords only showed up on the owner's browser.
2. Public backend syncing had been slowed to once per day.

## What changed

- `netlify/functions/dsa-admin.mjs`
  - Adds `GET /api/admin/login-users`.
  - This endpoint returns the safe public login-user list with `no-store` cache headers.
  - `/api/admin/public` now uses a short CDN cache for live public strategy data.

- `js/admin.js`
  - Refreshes the login-user list directly from `/api/admin/login-users`.
  - Uses `cache: 'no-store'` for admin API calls.
  - Lets editors type an editor ID manually if their browser's list is stale.

- `admin.html`
  - Changes the login editor selector to a datalist-backed text input.
  - If the editor name is missing, type the exact editor ID.

- `js/community-data-bridge.js`
  - Public pages now sync backend data at most once per hour per browser by default.
  - To force a public sync, add `?syncCommunity=1` to any page.
  - To disable public backend syncing in a browser, run:
    `localStorage.setItem('DSA_DISABLE_PUBLIC_BACKEND_SYNC', 'true')`

## Replace these files

```
admin.html
js/admin.js
js/community-data-bridge.js
netlify/functions/dsa-admin.mjs
```

Then redeploy with Netlify CLI or Git.
