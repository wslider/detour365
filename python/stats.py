import pandas as pd
import datetime as dt
import re
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path


class BibleStudyStats:
    """Analyze Detour 365 podcast episodes and generate Bible book/category charts."""

    def __init__(
        self,
        podcast_path: str | Path = "../data/podcast.json",
        bible_path: str | Path = "../data/bible_books.csv",
        plots_dir: str | Path = "../plots",
    ):
        # Resolve all paths relative to *this script file*
        script_dir = Path(__file__).resolve().parent

        self.podcast_path = (script_dir / podcast_path).resolve()
        self.bible_path = (script_dir / bible_path).resolve()
        self.plots_dir = (script_dir / plots_dir).resolve()

        # Create plots folder if it doesn't exist
        self.plots_dir.mkdir(parents=True, exist_ok=True)

        print(f"Podcast data : {self.podcast_path}")
        print(f"Bible data   : {self.bible_path}")
        print(f"Plots folder : {self.plots_dir}")

        if not self.podcast_path.exists():
            raise FileNotFoundError(f"Podcast file not found: {self.podcast_path}")
        if not self.bible_path.exists():
            raise FileNotFoundError(f"Bible file not found: {self.bible_path}")

        self.podcast_df = pd.read_json(self.podcast_path)
        self.bible_df = pd.read_csv(self.bible_path)
        self.podcast_df["date"] = pd.to_datetime(self.podcast_df["date"])

        # Will be filled later
        self.current_saturday = None
        self.past_df = None
        self.enriched_df = None

    def _get_current_saturday(self) -> dt.datetime:
        """Return the Saturday of the current week."""
        now = dt.datetime.now()
        days_to_saturday = 5 - now.weekday()
        self.current_saturday = now + dt.timedelta(days=days_to_saturday)
        print(f"This Week's Saturday is {self.current_saturday}")
        return self.current_saturday

    def _filter_past_and_current(self):
        """Keep only episodes up to (and including) this week's Saturday."""
        self._get_current_saturday()
        self.past_df = self.podcast_df[self.podcast_df["date"] <= self.current_saturday].copy()

    def _extract_books(self):
        """Extract the Bible book name from the 'passage' column."""
        pattern = "|".join([rf"\b{re.escape(book)}\b" for book in self.bible_df["book"]])
        self.past_df["book"] = self.past_df["passage"].str.extract(f"({pattern})")

    def _merge_categories(self):
        """Add category and testament information."""
        self.enriched_df = pd.merge(
            self.past_df[["id", "date", "title", "passage", "book"]],
            self.bible_df[["book", "category", "testament"]],
            on="book",
            how="left",
        )

    def _plot_horizontal_bar(
        self,
        series: pd.Series,
        title: str,
        ylabel: str,
        filename: str | Path,
        top_n: int = 20,
    ):
        """Reusable horizontal bar chart with value labels."""
        counts = series.value_counts().head(top_n).sort_values(ascending=False)

        plt.figure(figsize=(12, 9))
        ax = sns.barplot(
            y=counts.index,
            x=counts.values,
            palette="mako",
            orient="h",
        )

        plt.title(title, fontsize=18, pad=16)
        plt.xlabel("Number of Episodes", fontsize=14)
        plt.ylabel(ylabel, fontsize=14)

        # Value labels
        for p in ax.patches:
            width = p.get_width()
            ax.text(
                width + 0.3,
                p.get_y() + p.get_height() / 2,
                f"{round(width)}",
                va="center",
                fontsize=11,
                fontweight="bold",
            )

        plt.grid(axis="x", alpha=0.3)
        plt.tight_layout()

        # Save
        full_path = self.plots_dir / filename
        if full_path.exists():
            print(f"{full_path} already exists and will be overwritten.")
        plt.savefig(full_path, dpi=300, bbox_inches="tight")
        plt.show()

    def update_stats(self):
        """Main method – run the full pipeline."""
        self._filter_past_and_current()
        self._extract_books()
        self._merge_categories()

        # Category chart
        self._plot_horizontal_bar(
            series=self.enriched_df["category"],
            title="Detour 365 Bible Study - Literary Types",
            ylabel="Literary Type",
            filename="category_counts.png",
        )

        # Book chart
        self._plot_horizontal_bar(
            series=self.enriched_df["book"],
            title="Detour 365 Bible Study - Books",
            ylabel="Book",
            filename="book_counts.png",
        )


if __name__ == "__main__":
    stats = BibleStudyStats()
    stats.update_stats()