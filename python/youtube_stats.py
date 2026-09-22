# python/youtube_stats.py

import json
from pathlib import Path

import requests


class YTstats:
    def __init__(self, api_key, channel_id):
        self.api_key = api_key
        self.channel_id = channel_id
        self.channel_statistics = None

    def get_channel_statistics(self):
        url = (
            "https://www.googleapis.com/youtube/v3/channels"
            f"?part=statistics&id={self.channel_id}&key={self.api_key}"
        )
        response = requests.get(url, timeout=30)
        data = response.json()

        if "error" in data:
            raise RuntimeError(data["error"])

        self.channel_statistics = data["items"][0]["statistics"]
        return self.channel_statistics

    def dump(self, file_path: Path):
        if self.channel_statistics is None:
            return

        file_path.parent.mkdir(parents=True, exist_ok=True)
        with open(file_path, "w") as f:
            json.dump(self.channel_statistics, f, indent=4)
        print(f"wrote {file_path}")