#!/usr/bin/env python3
"""
Detour 365 – Blog generator
- Reads published Markdown files from content/posts/
- Auto-matches missing youtube_id by date (within 6 days)
- Creates simple cards from data/youtube.json for videos without Markdown
- Builds data/blog.json + blog.html + individual post pages
"""

import json
import re
from datetime import datetime, timedelta
from pathlib import Path

import frontmatter
import markdown

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
ROOT = Path(__file__).resolve().parent.parent
POSTS_DIR = ROOT / "content" / "posts"
DATA_DIR = ROOT / "data"
OUTPUT_DIR = ROOT / "posts"
BLOG_HTML = ROOT / "blog.html"
BLOG_JSON = DATA_DIR / "blog.json"
YOUTUBE_JSON = DATA_DIR / "youtube.json"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-")

def youtube_thumbnail(youtube_id: str) -> str:
    return f"https://i.ytimg.com/vi/{youtube_id}/hqdefault.jpg" if youtube_id else ""

def get_thumbnail(post: dict) -> str:
    if post.get("image_url"):
        return post["image_url"]
    if post.get("youtube_id"):
        return youtube_thumbnail(post["youtube_id"])
    if post.get("thumbnail"):
        return post["thumbnail"]
    return "/images/detour365-logo-square.jpeg"

def parse_date(date_str: str):
    """Return a date object or None."""
    if not date_str:
        return None
    try:
        return datetime.strptime(str(date_str)[:10], "%Y-%m-%d").date()
    except ValueError:
        return None

def load_markdown_posts() -> list[dict]:
    posts = []
    if not POSTS_DIR.exists():
        return posts

    for md_path in sorted(POSTS_DIR.glob("*.md")):
        post = frontmatter.load(md_path)
        meta = post.metadata

        if meta.get("status", "draft") != "published":
            continue

        slug = meta.get("slug") or slugify(meta.get("title", md_path.stem))
        html_body = markdown.markdown(
            post.content,
            extensions=["extra", "nl2br", "sane_lists"]
        )

        entry = {
            "source": "markdown",
            "slug": slug,
            "filename": md_path.name,
            "type": meta.get("type", "text"),
            "title": meta.get("title", "Untitled"),
            "date": meta.get("date", ""),
            "episode": meta.get("episode"),
            "passage": meta.get("passage", ""),
            "series": meta.get("series", ""),
            "categories": meta.get("categories", []),
            "tags": meta.get("tags", []),
            "description": meta.get("description", ""),
            "excerpt": meta.get("excerpt") or (meta.get("description") or "")[:220],
            "youtube_id": meta.get("youtube_id", ""),
            "youtube_url": meta.get("youtube_url", ""),
            "spotify_url": meta.get("spotify_url", ""),
            "image_url": meta.get("image_url", ""),
            "resources": meta.get("resources", []),
            "featured": meta.get("featured", False),
            "html_body": html_body,
        }
        entry["thumbnail"] = get_thumbnail(entry)
        posts.append(entry)
    return posts

def load_youtube_videos() -> list[dict]:
    if not YOUTUBE_JSON.exists():
        return []
    data = json.loads(YOUTUBE_JSON.read_text())
    videos = []
    for v in data.get("videos", []):
        videos.append({
            "source": "youtube",
            "slug": slugify(v["title"]),
            "type": "video",
            "title": v["title"],
            "date": v["publishedAt"][:10],
            "description": v.get("description", ""),
            "excerpt": (v.get("description") or "")[:220].replace("\n", " "),
            "youtube_id": v["id"],
            "youtube_url": f"https://www.youtube.com/watch?v={v['id']}",
            "thumbnail": v.get("thumbnail") or youtube_thumbnail(v["id"]),
            "featured": False,
            "html_body": f"<p>{(v.get('description') or '').replace(chr(10), '<br>')}</p>",
        })
    return videos

def enrich_markdown_with_youtube(md_posts: list[dict], yt_videos: list[dict]) -> list[dict]:
    """
    If a Markdown post is missing youtube_id, try to match it to a YouTube video
    published within 6 days after the Markdown date.
    """
    yt_with_dates = []
    for v in yt_videos:
        d = parse_date(v.get("date"))
        if d:
            yt_with_dates.append((d, v))

    for post in md_posts:
        if post.get("youtube_id"):
            continue

        post_date = parse_date(post.get("date"))
        if not post_date:
            continue

        window_end = post_date + timedelta(days=6)
        candidates = [
            v for d, v in yt_with_dates
            if post_date <= d <= window_end
        ]

        if len(candidates) == 1:
            match = candidates[0]
            post["youtube_id"] = match["youtube_id"]
            post["youtube_url"] = match["youtube_url"]
            post["thumbnail"] = match["thumbnail"]
            print(f"  ✓ Auto-matched '{post['title']}' → {match['youtube_id']}")
        elif len(candidates) > 1:
            print(f"  ! Multiple YouTube matches for '{post['title']}' ({post_date}) – skipping auto-match")

    return md_posts

def merge_posts(md_posts: list[dict], yt_videos: list[dict]) -> list[dict]:
    """Prefer Markdown version when a youtube_id already exists."""
    md_posts = enrich_markdown_with_youtube(md_posts, yt_videos)

    used_ids = {p["youtube_id"] for p in md_posts if p.get("youtube_id")}
    combined = md_posts[:]

    for v in yt_videos:
        if v["youtube_id"] not in used_ids:
            combined.append(v)

    combined.sort(key=lambda p: (not p.get("featured", False), p.get("date") or ""), reverse=True)
    return combined

def write_blog_json(posts: list[dict]):
    DATA_DIR.mkdir(exist_ok=True)
    payload = {
        "updatedAt": datetime.utcnow().isoformat() + "Z",
        "count": len(posts),
        "posts": posts,
    }
    BLOG_JSON.write_text(json.dumps(payload, indent=2, ensure_ascii=False))
    print(f"Wrote {BLOG_JSON}")

def render_card(post: dict) -> str:
    type_badge = {"podcast": "Podcast", "video": "Video", "text": "Article"}.get(post["type"], "Post")
    links = []
    if post.get("youtube_url"):
        links.append(f'<a href="{post["youtube_url"]}" target="_blank">Watch</a>')
    if post.get("spotify_url"):
        links.append(f'<a href="{post["spotify_url"]}" target="_blank">Listen</a>')
    if post.get("source") == "markdown":
        links.append(f'<a href="posts/{post["slug"]}.html">Read notes</a>')
    else:
        links.append(f'<a href="{post.get("youtube_url", "#")}" target="_blank">Watch on YouTube</a>')

    return f"""
    <article class="blog-card">
      <img src="{post["thumbnail"]}" alt="{post["title"]}">
      <div class="card-body">
        <span class="badge">{type_badge}</span>
        <h2>{post["title"]}</h2>
        <p class="meta">{post.get("date", "")}</p>
        <p class="excerpt">{post.get("excerpt", "")}</p>
        <div class="links">{ " · ".join(links) }</div>
      </div>
    </article>
    """

def write_blog_html(posts: list[dict]):
    cards = "\n".join(render_card(p) for p in posts)
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog – Detour 365</title>
  <link rel="stylesheet" href="css/styles.css">
  <style>
    .blog-grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; padding: 1rem; }}
    .blog-card {{ background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.08); }}
    .blog-card img {{ width: 100%; height: 180px; object-fit: cover; }}
    .card-body {{ padding: 1rem; }}
    .badge {{ background: #222; color: #fff; font-size: .75rem; padding: .2rem .5rem; border-radius: 4px; }}
    .excerpt {{ color: #444; font-size: .95rem; }}
    .links a {{ margin-right: .5rem; }}
  </style>
</head>
<body>
  <header class="header"><h1>Detour 365 Blog</h1></header>
  <main>
    <div class="blog-grid">
      {cards}
    </div>
  </main>
</body>
</html>
"""
    BLOG_HTML.write_text(html)
    print(f"Wrote {BLOG_HTML}")

def write_individual_posts(posts: list[dict]):
    """Only write full pages for Markdown-sourced posts."""
    OUTPUT_DIR.mkdir(exist_ok=True)
    count = 0
    for post in posts:
        if post.get("source") != "markdown":
            continue
        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{post["title"]} – Detour 365</title>
  <link rel="stylesheet" href="../css/styles.css">
</head>
<body>
  <article>
    <h1>{post["title"]}</h1>
    <p class="meta">{post["date"]}</p>
    {post["html_body"]}
  </article>
  <p><a href="../blog.html">← Back to Blog</a></p>
</body>
</html>
"""
        (OUTPUT_DIR / f"{post['slug']}.html").write_text(html)
        count += 1
    print(f"Wrote {count} individual post pages")

def main():
    md_posts = load_markdown_posts()
    yt_videos = load_youtube_videos()
    posts = merge_posts(md_posts, yt_videos)

    print(f"Markdown posts: {len(md_posts)}")
    print(f"YouTube-only cards: {len(posts) - len(md_posts)}")
    print(f"Total cards: {len(posts)}")

    write_blog_json(posts)
    write_blog_html(posts)
    write_individual_posts(posts)

if __name__ == "__main__":
    main()