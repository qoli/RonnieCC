#!/usr/bin/env python3
"""Upload a repaired RonnieCC Blog media asset to YouTube.

Secrets are intentionally resolved from user-home environment configuration,
not from this repository. Source ~/.config/ronniecc/youtube/env.sh or set:

  RONNIECC_YOUTUBE_TOKEN_FILE
  RONNIECC_YOUTUBE_CLIENT_SECRET_FILE
"""

from __future__ import annotations

import argparse
import json
import mimetypes
import os
import sys
from pathlib import Path
from typing import Any

from google.auth.exceptions import RefreshError
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaFileUpload
from google_auth_oauthlib.flow import InstalledAppFlow


SCOPES = ["https://www.googleapis.com/auth/youtube.upload"]
DEFAULT_CATEGORY_ID = "28"  # Science & Technology
DEFAULT_PRIVACY_STATUS = "unlisted"
DEFAULT_CHUNK_SIZE_MB = 10


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Upload a RonnieCC Blog media repair video to YouTube.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument("--video", required=True, help="Local video file to upload.")
    parser.add_argument("--title", required=True, help="YouTube video title.")
    parser.add_argument("--description", default="", help="YouTube description text.")
    parser.add_argument("--description-file", help="Read description text from a file.")
    parser.add_argument("--tags", nargs="*", default=["RonnieCC", "Notion archive"], help="YouTube tags.")
    parser.add_argument("--category-id", default=DEFAULT_CATEGORY_ID, help="YouTube category id.")
    parser.add_argument(
        "--privacy-status",
        choices=["private", "public", "unlisted"],
        default=DEFAULT_PRIVACY_STATUS,
        help="YouTube privacyStatus.",
    )
    parser.add_argument("--publish-at", help="RFC3339 publishAt. Only valid when privacy is private.")
    parser.add_argument("--thumbnail", help="Optional thumbnail image.")
    parser.add_argument(
        "--token-file",
        default=os.environ.get("RONNIECC_YOUTUBE_TOKEN_FILE", ""),
        help="OAuth token JSON. Defaults to RONNIECC_YOUTUBE_TOKEN_FILE.",
    )
    parser.add_argument(
        "--client-secret",
        default=os.environ.get("RONNIECC_YOUTUBE_CLIENT_SECRET_FILE", ""),
        help="OAuth client secret JSON. Defaults to RONNIECC_YOUTUBE_CLIENT_SECRET_FILE.",
    )
    parser.add_argument(
        "--init-oauth-if-needed",
        action="store_true",
        help="Open browser OAuth if token is missing, revoked, or lacks refresh_token.",
    )
    parser.add_argument("--chunk-size-mb", type=int, default=DEFAULT_CHUNK_SIZE_MB)
    parser.add_argument("--dry-run", action="store_true", help="Validate inputs without calling YouTube.")
    parser.add_argument("--show-response", action="store_true", help="Print full API response JSON.")
    parser.add_argument("--output-json", help="Write upload result JSON to this path.")
    return parser.parse_args()


def resolve_file(raw_path: str, label: str, required: bool = True) -> Path | None:
    if not raw_path:
        if required:
            raise SystemExit(f"[error] {label} is required.")
        return None
    path = Path(raw_path).expanduser()
    if required and not path.exists():
        raise SystemExit(f"[error] {label} not found: {path}")
    if not required and not path.exists():
        print(f"[warn] {label} not found, skipping: {path}", file=sys.stderr)
        return None
    return path


def read_description(args: argparse.Namespace) -> str:
    if args.description_file:
        path = resolve_file(args.description_file, "--description-file")
        return path.read_text(encoding="utf-8")
    return args.description


def run_oauth_flow(client_secret: Path, token_file: Path) -> None:
    print(f"[info] Opening Google OAuth flow using {client_secret}")
    flow = InstalledAppFlow.from_client_secrets_file(str(client_secret), scopes=SCOPES)
    credentials = flow.run_local_server(
        open_browser=True,
        port=0,
        access_type="offline",
        prompt="consent",
        include_granted_scopes="true",
    )
    if not credentials.refresh_token:
        raise SystemExit(
            "[error] OAuth completed without refresh_token. Revoke the app in Google Account permissions and retry.",
        )
    token_file.parent.mkdir(parents=True, exist_ok=True)
    token_file.write_text(credentials.to_json(), encoding="utf-8")
    token_file.chmod(0o600)
    print(f"[info] Saved OAuth token: {token_file}")


def load_credentials(token_file: Path, client_secret: Path, init_oauth: bool) -> Credentials:
    if not token_file.exists():
        if not init_oauth:
            raise SystemExit(
                f"[error] OAuth token missing: {token_file}. "
                "Source ~/.config/ronniecc/youtube/env.sh or pass --init-oauth-if-needed.",
            )
        run_oauth_flow(client_secret, token_file)

    credentials = Credentials.from_authorized_user_file(str(token_file), SCOPES)
    if not credentials.refresh_token:
        if not init_oauth:
            raise SystemExit("[error] OAuth token has no refresh_token. Re-run with --init-oauth-if-needed.")
        run_oauth_flow(client_secret, token_file)
        credentials = Credentials.from_authorized_user_file(str(token_file), SCOPES)

    if credentials.expired:
        try:
            credentials.refresh(Request())
            token_file.write_text(credentials.to_json(), encoding="utf-8")
            token_file.chmod(0o600)
        except RefreshError as exc:
            if not init_oauth:
                raise SystemExit(f"[error] OAuth refresh failed: {exc}") from exc
            run_oauth_flow(client_secret, token_file)
            credentials = Credentials.from_authorized_user_file(str(token_file), SCOPES)

    return credentials


def guess_mimetype(path: Path) -> str:
    mime, _ = mimetypes.guess_type(str(path))
    return mime or "video/mp4"


def chunk_size_bytes(megabytes: int) -> int:
    if megabytes <= 0:
        return -1
    return megabytes * 1024 * 1024


def build_body(args: argparse.Namespace, description: str) -> dict[str, Any]:
    status: dict[str, Any] = {
        "privacyStatus": args.privacy_status,
        "selfDeclaredMadeForKids": False,
    }
    if args.publish_at:
        if args.privacy_status != "private":
            raise SystemExit("[error] --publish-at is only valid with --privacy-status private.")
        status["publishAt"] = args.publish_at

    return {
        "snippet": {
            "title": args.title,
            "description": description,
            "tags": args.tags,
            "categoryId": args.category_id,
        },
        "status": status,
    }


def print_summary(args: argparse.Namespace, video: Path, token_file: Path, thumbnail: Path | None, body: dict[str, Any]) -> None:
    print(f"[info] Video: {video}")
    print(f"[info] Token file: {token_file}")
    if thumbnail:
        print(f"[info] Thumbnail: {thumbnail}")
    print(f"[info] Title: {body['snippet']['title']}")
    print(f"[info] Privacy: {body['status']['privacyStatus']}")
    if body["status"].get("publishAt"):
        print(f"[info] Publish at: {body['status']['publishAt']}")
    print(f"[info] Dry run: {args.dry_run}")


def upload_video(youtube, video: Path, body: dict[str, Any], chunk_size: int) -> dict[str, Any]:
    request = youtube.videos().insert(
        part="snippet,status",
        body=body,
        media_body=MediaFileUpload(
            str(video),
            mimetype=guess_mimetype(video),
            chunksize=chunk_size,
            resumable=True,
        ),
    )
    response = None
    while response is None:
        status, response = request.next_chunk()
        if status:
            print(f"[info] Upload progress: {int(status.progress() * 100)}%")
    return response


def upload_thumbnail(youtube, video_id: str, thumbnail: Path) -> None:
    request = youtube.thumbnails().set(
        videoId=video_id,
        media_body=MediaFileUpload(str(thumbnail)),
    )
    request.execute()


def main() -> None:
    args = parse_args()
    video = resolve_file(args.video, "--video")
    token_file = resolve_file(args.token_file, "RONNIECC_YOUTUBE_TOKEN_FILE / --token-file")
    client_secret = resolve_file(args.client_secret, "RONNIECC_YOUTUBE_CLIENT_SECRET_FILE / --client-secret")
    thumbnail = resolve_file(args.thumbnail, "--thumbnail", required=False) if args.thumbnail else None
    body = build_body(args, read_description(args))

    print_summary(args, video, token_file, thumbnail, body)

    if args.dry_run:
        return

    credentials = load_credentials(token_file, client_secret, args.init_oauth_if_needed)
    youtube = build("youtube", "v3", credentials=credentials, cache_discovery=False)
    try:
        response = upload_video(youtube, video, body, chunk_size_bytes(args.chunk_size_mb))
        video_id = response.get("id")
        if video_id:
            print(f"[info] Uploaded video: https://youtu.be/{video_id}")
            print(f"[info] Studio edit: https://studio.youtube.com/video/{video_id}/edit")
            if thumbnail:
                upload_thumbnail(youtube, video_id, thumbnail)
    except HttpError as exc:
        details = exc.content.decode() if isinstance(exc.content, bytes) else str(exc)
        status_code = getattr(getattr(exc, "resp", None), "status", "unknown")
        raise SystemExit(f"[error] YouTube upload failed ({status_code}): {details}") from exc

    result = {
        "videoId": response.get("id"),
        "watchUrl": f"https://youtu.be/{response.get('id')}" if response.get("id") else "",
        "studioUrl": f"https://studio.youtube.com/video/{response.get('id')}/edit" if response.get("id") else "",
        "response": response if args.show_response else None,
    }
    if args.output_json:
        Path(args.output_json).expanduser().write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
    if args.show_response:
        print(json.dumps(response, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
