# python/youtube_embeds.py

import json
from pathlib import Path
from typing import List, Dict, Optional

import requests


class YouTubeEmbeds:
    def __init__(self, api_key: str, channel_id: str):
        self.api_key = api_key
        self.channel_id = channel_id
        self._uploads_playlist_id = None

    def _get_uploads_playlist_id(self) -> str:
        if self._uploads_playlist_id:
            return self._uploads_playlist_id

        url = (
            "https://www.googleapis.com/youtube/v3/channels"
            f"?part=contentDetails&id={self.channel_id}&key={self.api_key}"
        )
        data = requests.get(url, timeout=30).json()

        if "error" in data:
            raise RuntimeError(data["error"])

        self._uploads_playlist_id = data["items"][0]["contentDetails"]["relatedPlaylists"]["uploads"]
        return self._uploads_playlist_id

    def get_embeds(self, max_results: Optional[int] = None) -> List[Dict]:
        """
        Return list of dicts with title, date_uploaded, embed_src.
        If max_results is None, fetches every video in the uploads playlist.
        """
        playlist_id = self._get_uploads_playlist_id()
        embeds = []
        page_token = None
        remaining = max_results

        while True:
            # API max per page is 50
            page_size = 50 if remaining is None else min(50, remaining)

            url = (
                "https://www.googleapis.com/youtube/v3/playlistItems"
                f"?part=snippet&playlistId={playlist_id}"
                f"&maxResults={page_size}&key={self.api_key}"
            )
            if page_token:
                url += f"&pageToken={page_token}"

            data = requests.get(url, timeout=30).json()

            if "error" in data:
                raise RuntimeError(data["error"])

            for item in data.get("items", []):
                snippet = item["snippet"]
                video_id = snippet["resourceId"]["videoId"]
                embeds.append({
                    "title": snippet.get("title"),
                    "date_uploaded": snippet.get("publishedAt"),
                    "embed_src": f"https://www.youtube.com/embed/{video_id}",
                })

            if remaining is not None:
                remaining -= len(data.get("items", []))
                if remaining <= 0:
                    break

            page_token = data.get("nextPageToken")
            if not page_token:
                break

        return embeds

    def dump(self, file_path: Path, max_results: Optional[int] = None) -> None:
        embeds = self.get_embeds(max_results=max_results)

        file_path.parent.mkdir(parents=True, exist_ok=True)
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(embeds, f, indent=4, ensure_ascii=False)

        print(f"wrote {len(embeds)} embeds → {file_path}")