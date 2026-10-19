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
import json
import os
import smtplib

from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()  # Load .env file

NEWSLETTERS_DIR = Path("../newsletters")
NEWSLETTERS_DIR.mkdir(parents=True, exist_ok=True)


def build_context() -> dict:
    now = datetime.now()
    today = now.date()

    embeds = json.loads(Path("data/d365_yt_embeds.json").read_text(encoding="utf-8"))
    podcasts = json.loads(Path("data/podcast.json").read_text(encoding="utf-8"))
    daily = json.loads(Path("data/daily.json").read_text(encoding="utf-8"))

    latest_video = embeds[0]

    # Verse of the day
    #mdate_str = now.strftime("%B %-d")          # "October 19" (no leading zero)
    # Windows fallback if %-d isn't supported:
    date_str = now.strftime("%B %d").replace(" 0", " ")

    verse = next((v for v in daily if v.get("date") == date_str), None)
    if not verse:
        verse = {
            "text": "Lean not on your own understanding, but in all your ways submit to him, and he will make your paths straight.",
            "reference": "Proverbs 3:5-6"
        }

    # Parse podcast dates and find the current or next upcoming one
    parsed_podcasts = []
    for p in podcasts:
        try:
            dt = datetime.strptime(p["date"], "%Y %B %d").date()
            parsed_podcasts.append((dt, p))
        except (ValueError, KeyError):
            continue  # skip any malformed entries

    # Sort by date so we can reliably find the soonest upcoming
    parsed_podcasts.sort(key=lambda x: x[0])

    next_podcast = None
    for dt, p in parsed_podcasts:
        if dt >= today:
            next_podcast = p
            break

    # Fallback to the last podcast if everything is in the past
    if next_podcast is None and parsed_podcasts:
        next_podcast = parsed_podcasts[-1][1]

    return {
        "date": now.strftime("%Y-%m-%d"),
        "youtube_src": latest_video["embed_src"],
        # verse ofthe day fields
        "verse_text": verse["text"],
        "verse_reference": verse["reference"],
        "verse_bg": "https://wslider.github.io/detour365/images/tartoosh-sunset-trail.jpeg",
        # upcomming podcast fields
        "next_podcast_date": next_podcast["date"] if next_podcast else None,
        "next_podcast_title": next_podcast["title"] if next_podcast else None,
        "next_podcast_passage": next_podcast["passage"] if next_podcast else None,
        "next_podcast_passage_link": next_podcast["bible_gateway_link"] if next_podcast else None,
        "next_podcast_series": next_podcast["series"] if next_podcast else None,
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
    :root {{
    --sprucePine: #003a00;
    --kentuckyNight: #000d08;
    --mountainFog: #f0fff8;
    --stormCloud: #333849;
    --campfireSmoke: #2f2e2eb3;
    --smokeyMountainMist: #b0c4de;
    --blueRidgeParkway: #002167;
    --starLight: #e1ceff;
    --midnightBlue: #001f3f;
    --transparentMidnight: #001f3f80;
    --marianaTrench: #00111f;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 2rem;
    }}
    body {{
        margin: 0;
        padding: 0;
        font-family: Arial, Helvetica, sans-serif;
        background-color: var(--kentuckyNight);
        color: var(--mountainFog);
    }}
    .header {{
        text-align: center;
    }}
    .container {{
        max-width: 600px;
        margin: var(--spacing-md) auto;
        background-color: var(--transparentMidnight);
        padding: var(--spacing-md);
        border-radius: 8px;
        text-align: center;
        display: flex;
        flex-direction: column;
    }}
    .quoteContainer {{
        font-size: 0.9rem;
        text-align: center;
        align-items: center;
        background-color: var(--transparentMidnight);
        font-family: Arial, Helvetica, sans-serif;
        color: var(--mountainFog);
        box-shadow: 5px 5px 15px #000000a1;
    }}
    h1, h2 {{
        color: var(--mountainFog);
    }}
    p {{
        color: #ffffff;
        font-size: 1.15rem;
        line-height: 1.5;
        text-shadow: 1px 1px 3px #000;
        text-align: center;
    }}
    .video-link {{
        display: inline-block;
        text-decoration: none;
    }}
    .thumbnail {{
        max-width: 100%;
        height: auto;
        border-radius: 6px;
        border: 2px solid var(--midnightBlue);
    }}
    .play-button {{
        display: block;
        margin-top: var(--spacing-sm);
        color: var(--starLight);
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
    .socialLinks a:hover .social-icon {{
        fill: var(--starLight);
        color: var(--starLight);
    }}
    </style>
</head>
<body>

    <header class="header">
        <h1>Detour 365 Newsletter</h1>
        <h2>{context['date']}</h2>
    </header>

    <div class="thisWeekContent container" id="thisWeekContent">
                <h2>Next on Detour 365 ... </h2>
                    <h3 id="epDate">{context['next_podcast_date']}</h3>
                    <h3 id="epTitle">{context['next_podcast_title']}</h3>
                    <a href="{context['next_podcast_passage_link']}" id="passage-backup-link" target="_blank" class="link-text">
                        <h3 id="epPassageTitle">{context['next_podcast_passage']}</h3>
                    </a>
                    <h3 id="epSeries">{context['next_podcast_series']}</h3>
    </div>

    <div class="container">
        <h2>Latest Episode on YouTube</h2>
        <a href="{watch_url}" class="video-link" target="_blank">
            <img src="{thumbnail_url}" alt="Watch latest episode" class="thumbnail" width="560">
            <span class="play-button">▶ Watch on YouTube</span>
        </a>
    </div>

    <div class="container">
        <h2>Verse of The Day</h2>
        <div class="container" style="background: #001f3f80 url('{context["verse_bg"]}') center/cover no-repeat; border-radius: 8px; padding: 24px; margin: 20px auto; max-width: 560px;">
            <p>{context['verse_text']}</p>
            <p>{context['verse_reference']}</p>
        </div>
    </div>
    

    <div class="quoteContainer container">
                <blockquote class="quote"><i>Trust in the Lord with all your heart and lean not on your own understanding;
            in all your ways submit to him, and he will make your paths straight - Proverbs 3:5-6 NIV</i></blockquote>
    </div>
    
    <div class="container">
        <h2>Follow Detour 365</h2>       
        <ul class="socialLinks" role="list">
            <li>
                <a href="https://open.spotify.com/show/4pPy7ulDhZZjPmnqhcijOd?si=082221aceb0c4fb6" aria-label="Detour 365 Podcast" title="Podcast">
                    <img class="social-icon" src="https://detour365.org/images/podcast_icon_white.jpg" alt="Podcast Icon" width="36" height="36">
                </a>
            </li>
            <li>
                <a href="https://youtube.com/@detour365" aria-label="Detour 365 on Youtube" title="Youtube Channel">
                    <img class="social-icon" src="https://detour365.org/images/yt_icon_white.jpg" alt="YouTube Icon" width="36" height="36">
                </a>
            </li>
            <li>
                <a href="https://x.com/Detour365" aria-label="Detour 365 on X" title="X Profile">
                    <img class="social-icon" src="https://detour365.org/images/x_icon_white.jpg" alt="X Icon" width="36" height="36">
                </a>
            </li>
        </ul>
    </div>
</body>
</html>
"""


def generate_newsletter() -> Path:
    """Generate today's newsletter and return the path to the file."""
    today = datetime.now().strftime("%Y-%m-%d")
    context = build_context()
    filename = NEWSLETTERS_DIR / f"d365_newsletter_{today}.html"
    filename.write_text(render_newsletter(context), encoding="utf-8")
    return filename


def send_newsletter(to_email) -> bool:
    html_path = generate_newsletter()
    date = datetime.now().strftime("%Y-%m-%d")

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