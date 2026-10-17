# send an html newsletter out to a mailing list ( dictionary or json?)
    # gitignore mailing list or store on cloudflare 
    # add input cli later 

# public html version
    # recent video
    # verse image of the day * 
    # announcments (add default / filler content)
    # this week .. 

# save public version -> save to archives 

# v2 prayer requests ( pull from prayers.bd ) - private version
    # public html version + prayer requests 
    # only send to mailing list 
from __future__ import annotations

import datetime
import json
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()  # Load .env file

NEWSLETTERS_DIR = Path("../newsletters")
NEWSLETTERS_DIR.mkdir(parents=True, exist_ok=True)


def build_context() -> dict:
    now = datetime.datetime.now()
    embeds = json.loads(Path("data/d365_yt_embeds.json").read_text(encoding="utf-8"))
    latest_video = embeds[0]
    return {
        "date": now.strftime("%Y-%m-%d"),
        "youtube_src": latest_video["embed_src"],
    }


def render_newsletter(context: dict) -> str:
    # Extract video ID from embed URL (e.g. https://www.youtube.com/embed/VIDEO_ID)
    youtube_src = context["youtube_src"]
    video_id = youtube_src.rstrip("/").split("/")[-1].split("?")[0]
    thumbnail_url = f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"
    watch_url = f"https://www.youtube.com/watch?v={video_id}"

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Detour 365 Newsletter</title>
    <style>
        body {{
            margin: 0;
            padding: 0;
            font-family: Arial, Helvetica, sans-serif;
            background-color: #000d08;
            color: #f0fff8;
        }}
        .container {{
            max-width: 600px;
            margin: 20px auto;
            background-color: #001f3f80;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }}
        h1, h2 {{
            color: #f0fff8;
        }}
        .video-link {{
            display: inline-block;
            text-decoration: none;
        }}
        .thumbnail {{
            max-width: 100%;
            height: auto;
            border-radius: 6px;
            border: 2px solid #001f3f;
        }}
        .play-button {{
            display: block;
            margin-top: 10px;
            color: #e1ceff;
            font-weight: bold;
        }}

        .socialLinks {{
        text-align: center;
        margin: var(--spacing-md) 0;
        padding: 0;
        list-style: none;
        }}

        .socialLinks li {{
        display: inline-block;
        margin: 0 8px;
        vertical-align: middle;
        }}

        .socialLinks a {{
        display: inline-block;
        padding: var(--spacing-sm);
        text-decoration: none;
        background-color: var(--marianaTrench);
        border-radius: 8px;
        }}

        .social-icon {{
        width: 36px;
        height: 36px;
        fill: #ffffff;
        color: #ffffff;
        vertical-align: middle;
        }}

        /* Light hover (only works in some clients) */
        .socialLinks a:hover .social-icon {{
        fill: var(--starLight);
        color: var(--starLight);
        }}
    </style>
</head>
<body>
    <header>
        <h1>Detour 365 - Newsletter</h1>
        <h2>{context['date']}</h2>
    </header>
    <div class="container">
    </div>
    <div class="container">
        <h2>Latest Episode on YouTube</h2>
        <a href="{watch_url}" class="video-link" target="_blank">
            <img src="{thumbnail_url}" alt="Watch latest episode" class="thumbnail" width="560">
            <span class="play-button">▶ Watch on YouTube</span>
        </a>
    </div>
    <div>
        <h2>Follow Us & Take The Detour</h2>       
        <ul class="socialLinks" role="list">
        <li>
            <a href="https://open.spotify.com/show/4pPy7ulDhZZjPmnqhcijOd?si=082221aceb0c4fb6" aria-label="Detour 365 on Spotify" title="Spotify Podcast">
            <img class="social-icon" src="https://detour365.org/images/Spotify_Primary_Logo_RGB_White.png" alt="Spotify Icon" width="36" height="36">
            </a>
        </li>
        <li>
            <a href="https://youtube.com/@detour365" aria-label="Detour 365 on Youtube" title="Youtube Channel">
            <img class="social-icon" src="https://detour365.org/images/youtube-white.jpg" alt="YouTube Icon" width="36" height="36">
            </a>
        </li>
        <li>
            <a href="https://x.com/Detour365" aria-label="Detour 365 on X" title="X Profile">
            <img class="social-icon" src="https://detour365.org/images/x-white.jpg" alt="X Icon" width="36" height="36">
            </a>
        </li>
        </ul>
    </div>
</body>
</html>
"""


def generate_newsletter() -> Path:
    """Generate today's newsletter and return the path to the file."""
    today = datetime.datetime.now().strftime("%Y-%m-%d")
    context = build_context()
    filename = NEWSLETTERS_DIR / f"d365_newsletter_{today}.html"
    filename.write_text(render_newsletter(context), encoding="utf-8")
    return filename


def send_newsletter(to_email) -> bool:
    html_path = generate_newsletter()
    date = datetime.datetime.now().strftime("%Y-%m-%d")

    from_email = os.environ.get("EMAIL_USER")
    password = os.environ.get("EMAIL_PASS")

    if not all([from_email, password, to_email]):
        print("Missing email credentials in environment variables.")
        return False

    html = html_path.read_text(encoding="utf-8")

    msg = MIMEMultipart("related")
    msg["Subject"] = f"Detour 365 Newsletter {date}"
    msg["From"] = from_email
    msg["To"] = to_email

    alt = MIMEMultipart("alternative")
    alt.attach(MIMEText("Detour 365 Newsletter", "plain"))
    alt.attach(MIMEText(html, "html"))
    msg.attach(alt)

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
            smtp.starttls()
            smtp.login(from_email, password)
            smtp.send_message(msg)
        print(f"Newsletter sent successfully: {html_path}")
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

# add to_email argument to send_newsletter() when calling function for testing here
if __name__ == "__main__":
    send_newsletter("")