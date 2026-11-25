"""
Full content update for Detour 365.

Runs:
  1. Bible study stats + visualizations
  2. Blog generation (blog.html, data/blog.json, individual posts)

Does **not** send the newsletter. That step is handled separately
in the GitHub Action after the generated files are committed.
"""

import stats
import blog


def the_works() -> None:
    """Update stats/plots and regenerate the blog."""
    print("Updating Bible study stats and plots...")
    stats.BibleStudyStats().update_stats()

    print("Generating blog...")
    blog.main()

    print("Content update finished.")


if __name__ == "__main__":
    the_works()