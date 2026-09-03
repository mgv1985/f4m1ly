# The Family Archive

A small, responsive website for browsing unlisted family videos hosted on YouTube. Video titles link directly to YouTube, so the site does not depend on embedded playback.

## Add your videos

Open `videos.js` and replace the sample entries. For each YouTube URL, copy only its video ID:

- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/watch?v=VIDEO_ID`

The site automatically creates category filters and uses YouTube thumbnails. You can optionally add a custom `thumbnail` URL to any entry.

## Preview locally

You can open `index.html` directly, or serve the folder locally:

```powershell
python -m http.server 8080
```

Then visit `http://localhost:8080`.

## Publish on GitHub Pages

Upload all project files to the `mgv1985/f4m1ly` repository, then enable GitHub Pages from **Settings → Pages** using the `main` branch and the root folder. The included `CNAME` file configures `f4m1ly.com` as the custom domain.

Add these DNS records at your domain provider:

- Four GitHub Pages `A` records for `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, and `185.199.111.153`
- A `CNAME` record for `www` pointing to `mgv1985.github.io`

## Privacy note

The site includes a client-side password gate for private, family-use access. The current password is configured in `login.js`. This is not strong security because static files can be inspected; for real access control, deploy it behind authentication (for example Cloudflare Access or a password-protected hosting service). Unlisted YouTube videos are also viewable by anyone who has a video URL.
