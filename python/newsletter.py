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
</head>
<body style="margin:0; padding:0; font-family:Arial, Helvetica, sans-serif; background-color:#000d08; color:#f0fff8;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#000d08;">
        <tr>
            <td align="center" style="padding:20px 10px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px; background-color:#001f3f80; border-radius:8px;">
                    
                    <!-- Header -->
                    <tr>
                        <td align="center" style="padding:20px;">
                            <h1 style="margin:0; color:#f0fff8;">Detour 365 Newsletter</h1>
                            <h2 style="margin:8px 0 0; color:#f0fff8; font-weight:normal;">{context['date']}</h2>
                        </td>
                    </tr>

                    <!-- Next on Detour 365 -->
                    <tr>
                        <td style="padding:16px; text-align:center;">
                            <h2 style="margin:0 0 12px; color:#f0fff8;">Next on Detour 365 ...</h2>
                            <h3 style="margin:8px 0; color:#ffffff;">{context['next_podcast_date']}</h3>
                            <h3 style="margin:8px 0; color:#ffffff;">{context['next_podcast_title']}</h3>
                            <a href="{context['next_podcast_passage_link']}" style="color:#e1ceff; text-decoration:none;">
                                <h3 style="margin:8px 0; color:#e1ceff;">{context['next_podcast_passage']}</h3>
                            </a>
                            <h3 style="margin:8px 0; color:#ffffff;">{context['next_podcast_series']}</h3>
                        </td>
                    </tr>

                    <!-- Next Meeting -->
                    <tr>
                        <td style="padding:16px; text-align:center; border-top:1px solid #00111f;">
                            <h2 style="margin:0 0 12px; color:#f0fff8;">Next Meeting</h2>
                            <h3 style="margin:8px 0; color:#ffffff;">{context['next_podcast_date']}</h3>
                            <h3 style="margin:8px 0; color:#ffffff;">Fellowship Time: 6:45 PM</h3>
                            <h3 style="margin:8px 0; color:#ffffff;">Discussion Begins: 7:15 PM</h3>
                            <a href="{context['next_podcast_passage_link']}" style="color:#e1ceff; text-decoration:none;">
                                <h3 style="margin:8px 0; color:#e1ceff;">{context['next_podcast_passage']}</h3>
                            </a>
                        </td>
                    </tr>

                    <!-- Latest Episode -->
                    <tr>
                        <td align="center" style="padding:16px;">
                            <h2 style="margin:0 0 12px; color:#f0fff8;">Latest Episode on YouTube</h2>
                            <a href="{watch_url}" style="text-decoration:none;">
                                <img src="{thumbnail_url}" alt="Watch latest episode" width="560" style="max-width:100%; height:auto; border-radius:6px; border:2px solid #001f3f;">
                                <div style="margin-top:8px; color:#e1ceff; font-weight:bold;">▶ Watch on YouTube</div>
                            </a>
                        </td>
                    </tr>

                    <!-- Verse of the Day -->
                    <tr>
                        <td style="padding:16px; text-align:center;">
                            <h2 style="margin:0 0 12px; color:#f0fff8;">Verse of The Day</h2>
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#001f3f80; border-radius:8px; background-image:url('{context["verse_bg"]}'); background-size:cover; background-position:center;">
                                <tr>
                                    <td style="padding:24px; text-align:center;">
                                        <p style="margin:0 0 12px; color:#ffffff; font-size:1.15rem; line-height:1.5; text-shadow:1px 1px 3px #000;">{context['verse_text']}</p>
                                        <p style="margin:0; color:#ffffff; font-size:1.15rem;">{context['verse_reference']}</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Quote -->
                    <tr>
                        <td style="padding:16px; text-align:center;">
                            <blockquote style="margin:0; font-style:italic; color:#f0fff8;">
                                Trust in the Lord with all your heart and lean not on your own understanding;
                                in all your ways submit to him, and he will make your paths straight - Proverbs 3:5-6 NIV
                            </blockquote>
                        </td>
                    </tr>

                    <!-- Social links -->
                    <tr>
                        <td align="center" style="padding:20px 16px;">
                            <h2 style="margin:0 0 12px; color:#f0fff8;">Follow Detour 365</h2>
                            <a href="https://open.spotify.com/show/4pPy7ulDhZZjPmnqhcijOd?si=082221aceb0c4fb6" style="display:inline-block; margin:0 8px; padding:8px; background-color:#00111f; border-radius:8px; text-decoration:none;">
                                <img src="https://detour365.org/images/podcast_icon_white.jpg" alt="Podcast" width="36" height="36" style="display:block;">
                            </a>
                            <a href="https://youtube.com/@detour365" style="display:inline-block; margin:0 8px; padding:8px; background-color:#00111f; border-radius:8px; text-decoration:none;">
                                <img src="https://detour365.org/images/yt_icon_white.jpg" alt="YouTube" width="36" height="36" style="display:block;">
                            </a>
                            <a href="https://x.com/Detour365" style="display:inline-block; margin:0 8px; padding:8px; background-color:#00111f; border-radius:8px; text-decoration:none;">
                                <img src="https://detour365.org/images/x_icon_white.jpg" alt="X" width="36" height="36" style="display:block;">
                            </a>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
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
    send_newsletter()