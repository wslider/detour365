import os
import requests
from newsletter import send_newsletter  # adjust import to match your file

# These come from environment variables (local .env or GitHub Secrets)
ACCOUNT_ID = os.environ["CLOUDFLARE_ACCOUNT_ID"]
DATABASE_ID = os.environ["CLOUDFLARE_DATABASE_ID"]
API_TOKEN = os.environ["CLOUDFLARE_API_TOKEN"]

def get_subscribers():
    """Query D1 for people who should receive the newsletter."""
    url = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/d1/database/{DATABASE_ID}/query"
    headers = {
        "Authorization": f"Bearer {API_TOKEN}",
        "Content-Type": "application/json",
    }
    sql = """
        SELECT email, first_name, last_name
        FROM users
        WHERE newsletter = 1
          AND email IS NOT NULL
          AND email != ''
    """
    resp = requests.post(url, headers=headers, json={"sql": sql})
    resp.raise_for_status()
    data = resp.json()
    # D1 returns results in a nested structure
    return data["result"][0]["results"]

def main():
    subscribers = get_subscribers()
    print(f"Found {len(subscribers)} subscribers")

    for person in subscribers:
        email = person["email"]
        # Optional: pass first_name etc. if your send function supports it
        send_newsletter(email)

if __name__ == "__main__":
    main()