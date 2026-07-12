"""Render paper/draft.md to a print-quality PDF.

Pipeline: python-markdown (tables ext) -> academic CSS -> headless Chrome
--print-to-pdf. Images are inlined as base64 so the HTML is self-contained.

Usage: python paper/render_pdf.py
Output: paper/CSA_YRBS_2023_manuscript.pdf
"""
import base64
import re
import subprocess
import tempfile
from pathlib import Path

import markdown

HERE = Path(__file__).resolve().parent
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

CSS = """
@page { size: A4; margin: 22mm 20mm; }
* { box-sizing: border-box; }
body {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 10.5pt; line-height: 1.55; color: #111;
  max-width: 170mm; margin: 0 auto;
}
h1 { font-size: 17pt; line-height: 1.3; margin: 0 0 6pt; }
h2 { font-size: 13pt; margin: 18pt 0 6pt; border-bottom: 0.5pt solid #999; padding-bottom: 2pt; }
h3 { font-size: 11pt; margin: 12pt 0 4pt; }
p { margin: 5pt 0; text-align: justify; }
em { color: #222; }
blockquote {
  margin: 6pt 18pt; padding: 2pt 10pt; border-left: 2pt solid #bbb;
  font-family: 'Cambria Math', Georgia, serif; font-size: 10pt; text-align: left;
}
table {
  border-collapse: collapse; width: 100%; margin: 8pt 0 10pt;
  font-size: 8.8pt; page-break-inside: avoid;
}
th, td { border-top: 0.5pt solid #333; padding: 3pt 5pt; text-align: left; }
thead th { border-top: 1pt solid #000; border-bottom: 0.6pt solid #000; }
tbody tr:last-child td { border-bottom: 1pt solid #000; }
img { max-width: 100%; display: block; margin: 10pt auto 4pt; page-break-inside: avoid; }
li { margin: 2pt 0; }
hr { border: none; border-top: 0.5pt solid #999; margin: 12pt 0; }
a { color: #111; text-decoration: none; }
h2#references + ul, h2#references ~ ul { font-size: 9pt; }
.figcap { font-size: 8.8pt; text-align: center; margin: 0 14mm 10pt; }
"""


def inline_images(html: str) -> str:
    def repl(m):
        src = m.group(1)
        p = (HERE / src).resolve()
        if not p.exists():
            raise FileNotFoundError(p)
        b64 = base64.b64encode(p.read_bytes()).decode()
        return f'src="data:image/png;base64,{b64}"'
    return re.sub(r'src="([^"]+\.png)"', repl, html)


def main():
    md = (HERE / "draft.md").read_text(encoding="utf-8")
    body = markdown.markdown(md, extensions=["tables", "smarty"])
    # figure captions: paragraphs starting with <em><strong>Figure
    body = re.sub(
        r'<p><em><strong>Figure', '<p class="figcap"><em><strong>Figure', body
    )
    body = inline_images(body)
    html = f"<!doctype html><html><head><meta charset='utf-8'><style>{CSS}</style></head><body>{body}</body></html>"

    with tempfile.TemporaryDirectory() as td:
        src = Path(td) / "paper.html"
        src.write_text(html, encoding="utf-8")
        out = HERE / "CSA_YRBS_2023_manuscript.pdf"
        subprocess.run(
            [CHROME, "--headless", "--disable-gpu", "--no-pdf-header-footer",
             f"--print-to-pdf={out}", src.as_uri()],
            check=True, capture_output=True, timeout=120,
        )
    print("wrote", out, f"({out.stat().st_size/1024:.0f} KB)")


if __name__ == "__main__":
    main()
