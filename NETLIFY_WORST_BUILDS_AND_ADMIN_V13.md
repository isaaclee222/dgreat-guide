# Direct Strike Academy v13 Notes

## New public feature: Worst Build of the Week

The Matchup Helper now loads a compact rotating widget at the top of the page.

Netlify API endpoints:

- `GET /api/admin/worst-builds`
- `POST /api/admin/worst-builds/submit`
- `POST /api/admin/worst-builds/vote`

Submissions are stored in the existing Netlify Blobs store under:

```json
additions.worstBuilds
```

The public widget fetches once when `matchup-helper.html` loads. It does not poll.

## Admin editing redesign

The admin panel now loads existing data into forms:

- Threat responses preload after selecting My Race / Enemy Race / Position / Threat.
- Strategy Database guides can be selected and updated.
- TvT / PvP page sections can be selected and updated.
- TvT / PvP sections can include up to three quiz questions.
- User login has both a full dropdown and a manual editor ID input.

## Static fallback data

The uploaded Netlify blob export was sanitized before being included in `js/data-community-additions.js`. User password hashes were removed from the public static file.

## Deployment

Replace the files from this package and deploy through Netlify CLI or Git so the updated function is deployed.
