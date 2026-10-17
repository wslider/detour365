# python/email_list.py

# reads a gitignored json file stored locally with email list & send a newsletter to that list
# for testing - run newsletter.py to send test email and avoid spamming entire list

# V2 Automatically send on Thursday or Friday evening via cloudflare worker or github action
# V2 will get emails from an email list table stored on the existing Cloudflare D1 DB

import pandas as pd

from newsletter import send_newsletter

email_list_df = pd.read_json("./data/email_list.json")
email_list = list(email_list_df.copy()['email'])

for email in email_list:
    to_email = email
    send_newsletter(to_email)
