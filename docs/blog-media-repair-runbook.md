# Blog media repair runbook

This runbook handles RonnieCC Blog blocks that cannot be repaired safely by the
static site build. The common case is a Notion `video` block that still points
at a Notion/S3 secure file instead of a stable YouTube URL.

This is a human-admin repair path, not a build-script responsibility. The build
may render a Notion fallback link, but it must not upload videos or mutate the
source Notion note.

## When to use this

Run this SOP when the publisher reports:

- `blog-video-needs-youtube-repair`
- `blog-media-needs-human-repair`

The warning means the public page may contain a fallback link such as `VIDEO
FROM THE ORIGINAL NOTION NOTE` until the source block is repaired.

## Detect warnings

From the RonnieCC repo:

```sh
cd /Volumes/Data/Github/RonnieCC
rtk bun run check:blog-media
rtk bun run check:blog-media -- --json
```

The checker prints the article slug, source Notion page, block id, source URL,
and block title. Use the JSON output when you need a structured repair list.

Warnings are intentionally non-fatal by default. To use the checker in a strict
manual gate:

```sh
rtk node scripts/check-blog-media-warnings.mjs --fail-on-warnings
```

## Repair a Notion video block through YouTube

1. Refresh the local seed first so signed Notion/S3 URLs are current:

   ```sh
   cd /Volumes/Data/Github/RonnieCC
   rtk sh scripts/update-blog.sh --full
   rtk bun run check:blog-media -- --json
   ```

2. Pick one `blog-video-needs-youtube-repair` warning and download the source
   video to a local repair workspace. Use the warning's `source` URL and keep
   the block id in the filename for traceability:

   ```sh
   mkdir -p exports/blog-media-repair/<slug>
   curl -L '<warning.source>' \
     -o 'exports/blog-media-repair/<slug>/<blockId>-<original-name>.mp4'
   ```

3. Verify that the downloaded file is playable:

   ```sh
   ffprobe -hide_banner 'exports/blog-media-repair/<slug>/<file>.mp4'
   ```

   If the file is a `.mov` that YouTube accepts, upload it as-is. If playback
   or upload fails, transcode to H.264/AAC:

   ```sh
   ffmpeg -i 'input.mov' -c:v libx264 -c:a aac -movflags +faststart 'output.mp4'
   ```

4. Prepare YouTube API credentials outside this repo. Secrets must stay in
   user-local config:

   ```sh
   mkdir -p ~/.config/ronniecc/youtube
   $EDITOR ~/.config/ronniecc/youtube/env.sh
   ```

   Expected variables:

   ```sh
   export RONNIECC_YOUTUBE_TOKEN_FILE="$HOME/.config/ronniecc/youtube/token.json"
   export RONNIECC_YOUTUBE_CLIENT_SECRET_FILE="$HOME/.config/ronniecc/youtube/client_secret.json"
   ```

5. Install uploader dependencies in a local virtualenv:

   ```sh
   cd /Volumes/Data/Github/RonnieCC
   python3 -m venv .venv-youtube
   . .venv-youtube/bin/activate
   pip install -r scripts/youtube/requirements.txt
   . ~/.config/ronniecc/youtube/env.sh
   ```

6. Dry-run the upload command:

   ```sh
   python3 scripts/youtube/upload_youtube_video.py \
     --video 'exports/blog-media-repair/<slug>/<file>.mp4' \
     --title '<article title> - <block title>' \
     --description 'Repaired RonnieCC Blog media block. Source article: https://ronniewong.cc/blog/<slug>/' \
     --privacy-status unlisted \
     --dry-run
   ```

7. Upload to YouTube. The first run can initialize OAuth when the token is
   missing:

   ```sh
   python3 scripts/youtube/upload_youtube_video.py \
     --video 'exports/blog-media-repair/<slug>/<file>.mp4' \
     --title '<article title> - <block title>' \
     --description 'Repaired RonnieCC Blog media block. Source article: https://ronniewong.cc/blog/<slug>/' \
     --privacy-status unlisted \
     --init-oauth-if-needed \
     --output-json 'exports/blog-media-repair/<slug>/<blockId>-youtube.json'
   ```

8. Open the returned `studioUrl`, verify title, visibility, and playback. Copy
   the returned `watchUrl`, for example `https://youtu.be/<videoId>`.

9. In the source Notion article, replace the problematic `video` block source
   with the YouTube URL. If the old block cannot be edited reliably, insert a
   new YouTube embed/link next to it, confirm the page content, then remove the
   broken source block.

10. Resync and verify:

    ```sh
    cd /Volumes/Data/Github/RonnieCC
    rtk sh scripts/update-blog.sh --full
    rtk bun run build
    rtk bun run check:blog-media
    ```

    The repaired block should no longer appear as
    `blog-video-needs-youtube-repair`. The built article should render a
    YouTube iframe instead of the Notion fallback.

## Handling non-video media warnings

`blog-media-needs-human-repair` means the block is not a stable image asset or
YouTube video. Examples include Notion file attachments, zip files, or opaque
`external_object_instance` blocks.

Decide the repair manually:

- For archive files, replace the Notion block with a durable public download
  link or a Notion source link.
- For unsupported embeds, replace the source block with a stable external URL
  or a short explanatory Notion link.
- For obsolete assets, remove the block from Notion only after confirming the
  article still reads correctly.

Then run the same resync/build/check loop.

## Publisher behavior

`ronniecc-content-publisher` should report these warnings after sync/build and
continue publishing unless the human operator explicitly chooses to stop. This
keeps content publication separate from media migration while still surfacing
the repair queue.
