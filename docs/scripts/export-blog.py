"""
Export blog posts from Django DB to MDX files for Starlight.

Usage (from the frutjam.com project root):
    python docs/scripts/export-blog.py

Or set the Django settings module explicitly:
    DJANGO_SETTINGS_MODULE=config.settings python docs/scripts/export-blog.py

Output: docs/src/content/docs/blog/<slug>.mdx
Each file carries the title, description, date, and meta SEO fields from the DB.
The body HTML from `content` is written as-is — it renders fine inside MDX.
"""

import os
import sys
import re
import textwrap
from pathlib import Path
from datetime import timezone

# ── Locate the frutjam.com project ───────────────────────────────────────────

SCRIPT_DIR   = Path(__file__).resolve().parent
DOCS_ROOT    = SCRIPT_DIR.parent
FRUTJAM_COM  = Path(os.environ.get('FRUTJAM_COM_PATH', SCRIPT_DIR.parent.parent.parent / 'frutjam.com'))
OUTPUT_DIR   = DOCS_ROOT / 'src' / 'content' / 'docs' / 'blog'

sys.path.insert(0, str(FRUTJAM_COM))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from dashboard.models import BlogModel  # noqa: E402

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

posts = (
    BlogModel.objects
    .filter(is_active=True)
    .select_related('category')
    .order_by('-created_at')
)

def slugify_author(name: str) -> str:
    return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')

created = 0

for post in posts:
    date_str = post.created_at.astimezone(timezone.utc).strftime('%Y-%m-%d')

    # Build frontmatter
    meta_title = (post.meta_title or post.title or '').replace('"', '\\"')
    meta_desc  = (post.meta_description or post.description or '').replace('"', '\\"')
    title      = (post.title or post.slug).replace('"', '\\"')
    description = (post.description or '').replace('"', '\\"')
    category   = post.category.name if post.category else ''

    frontmatter = textwrap.dedent(f"""\
        ---
        title: "{title}"
        description: "{description}"
        date: {date_str}
        authors:
          - nezanuha
        category: {category}
        head:
          - tag: meta
            attrs:
              name: "title"
              content: "{meta_title or title}"
          - tag: meta
            attrs:
              name: "description"
              content: "{meta_desc or description}"
        ---
    """)

    body = post.content or ''

    mdx = f"{frontmatter}\n{body}\n"

    out_path = OUTPUT_DIR / f"{post.slug}.mdx"
    out_path.write_text(mdx, encoding='utf-8')
    print(f"  exported: blog/{post.slug}")
    created += 1

print(f"\nExported {created} blog posts to {OUTPUT_DIR}")
