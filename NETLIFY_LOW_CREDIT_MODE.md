# Direct Strike Academy — Netlify low-credit mode

This update prevents public visitors from calling Netlify Functions on every page load.

## What changed

- Public pages use `js/data-community-additions.js` and cached server data first.
- Public pages do **not** call `/api/admin/public` by default.
- Admin pages still use the Netlify backend normally.
- To manually sync a public browser, open any page with `?syncCommunity=1`.
- To enable occasional public sync in one browser, run:

```js
localStorage.setItem('DSA_ENABLE_PUBLIC_BACKEND_SYNC', 'true')
```

That browser will sync at most once every 24 hours.

## Recommended publishing workflow

For the lowest Netlify credit usage:

1. Admins edit in `/admin.html`.
2. You export `data-community-additions.js`.
3. Replace `/js/data-community-additions.js` in the site files.
4. Deploy only when you want public static data updated.

This keeps normal players on static files instead of making serverless backend requests.
