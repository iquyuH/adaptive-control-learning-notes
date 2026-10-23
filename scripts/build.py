"""Build the offline tutorial using only the Python standard library.
Run: uv run python scripts/build.py
Content and navigation are maintained in content/, never in generated pages.
"""
from pathlib import Path
import json
from html import escape

ROOT = Path(__file__).resolve().parents[1]

def build():
    chapters = json.loads((ROOT / 'content/chapters.json').read_text(encoding='utf-8'))
    template = (ROOT / 'templates/page.html').read_text(encoding='utf-8')
    def render(title, prefix, body, scripts='', body_class=''):
        text = template
        for key, val in dict(title=escape(title), prefix=prefix, body=body, extra_scripts=scripts, body_class=escape(body_class)).items():
            text = text.replace('{{' + key + '}}', val)
        return text
    chapters_html = ''
    for c in chapters:
        chapters_html += f'<p><a href="chapters/{c["id"]}.html">第 {escape(c["number"])} 单元：{escape(c["title"])}</a><br><span class="muted">{escape(c["subtitle"])} {escape(c["topics"])}</span></p>'
    home = (ROOT / 'content/home.html').read_text(encoding='utf-8').replace('{{chapters}}', chapters_html)
    if len(chapters) > 1:
        home = home.replace('当前仅收录第二单元', f'当前收录 {len(chapters)} 个单元')
    (ROOT / 'index.html').write_text(render('课程首页', '', home), encoding='utf-8')
    for c in chapters:
        toc = f'<div class="toc"><h2>本单元目录</h2><nav class="section-nav" aria-label="第 {escape(c["number"])} 单元目录">'
        toc += ''.join(f'<a href="#{sid}">{escape(label)}</a>' for sid,label in c['sections'])
        toc += '</nav></div>'
        body = (ROOT / 'content' / c['source']).read_text(encoding='utf-8')
        body = body.replace('</header>', '</header>' + toc, 1)
        page = render(c['title'], '../', body, ''.join(f'<script defer src="../assets/js/{escape(name)}"></script>' for name in c.get('scripts', ['numerics.js', 'lab.js'])), 'chapter-page')
        (ROOT / 'chapters' / (c['id']+'.html')).write_text(page, encoding='utf-8')
    exercise_sheet = (ROOT / 'content/exercise-sheet.html').read_text(encoding='utf-8')
    (ROOT / 'chapters/exercise-sheet.html').write_text(
        render('第 2 章习题原件', '../', exercise_sheet), encoding='utf-8'
    )
    print(f'Built index, {len(chapters)} chapter(s), and exercise sheet.')

if __name__ == '__main__':
    build()
