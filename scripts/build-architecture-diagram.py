#!/usr/bin/env python3
"""Regenerates docs/architecture.svg. Brand icons are fetched from simple-icons (CC0)."""
import re, urllib.request, pathlib

OUT = pathlib.Path(__file__).resolve().parent.parent / 'docs' / 'architecture.svg'
CACHE = pathlib.Path('/tmp/spilab-icons'); CACHE.mkdir(exist_ok=True)

def path(name):
    f = CACHE / f'{name}.svg'
    if not f.exists():
        urllib.request.urlretrieve(f'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/{name}.svg', f)
    return re.search(r'd="([^"]+)"', f.read_text()).group(1)

def icon(name, x, y, size, color):
    return f'<g transform="translate({x},{y}) scale({size/24:.4f})"><path fill="{color}" d="{path(name)}"/></g>'
def box(x, y, w, h, fill, stroke, r=14):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}" stroke-width="1.5"/>'
def text(x, y, s, size=15, weight=400, fill='#1f2933', anchor='start'):
    return f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" fill="{fill}" text-anchor="{anchor}">{s}</text>'
def arrow(x1, y1, x2, y2, dashed=False, both=False):
    d = ' stroke-dasharray="7 6"' if dashed else ''; ms = ' marker-start="url(#arrowRev)"' if both else ''
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="#4b5563" stroke-width="2"{d} marker-end="url(#arrow)"{ms}/>'
def label(x, y, s, size=13, anchor='middle'):
    return f'<text x="{x}" y="{y}" font-size="{size}" fill="#4b5563" text-anchor="{anchor}">{s}</text>'

W, H = 1180, 720
out = [f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, 'Hiragino Sans', 'Noto Sans JP', sans-serif">
<defs>
  <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#4b5563"/></marker>
  <marker id="arrowRev" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M10,0 L0,5 L10,10 z" fill="#4b5563"/></marker>
  <filter id="shadow" x="-5%" y="-5%" width="110%" height="115%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#0f172a" flood-opacity="0.08"/></filter>
</defs>
<rect width="{W}" height="{H}" fill="#f6f7f9"/>''']
out.append(text(40, 44, 'SPILAB システム構成', 24, 700))
out.append(text(40, 68, '静的サイト + ブラウザ内DB。任意でクラウド同期。問題は開発者が Claude の下書きをレビューして追加。', 14, 400, '#6b7280'))

# Row 1: publishing pipeline
gy, gh, bw1 = 100, 110, 238
gap = (W - 80 - 4 * bw1) / 3
xs = [40 + i * (bw1 + gap) for i in range(4)]
items = [('anthropic', '#191919', '問題作成 CLI（開発者）', 'npm run generate → Claude が下書き', '検算 → レビュー → 問題データへ追加'),
         ('github', '#181717', 'GitHub リポジトリ', 'main ブランチへ push', '問題データ・ソースコード'),
         ('githubactions', '#2088FF', 'GitHub Actions', 'npm test → npm run build', '問題データの検証とビルド'),
         ('githubpages', '#222222', 'GitHub Pages', 'dist/ を静的配信', 'https://gakutasu.github.io/spilab/')]
for x, (ic, col, title, l1, l2) in zip(xs, items):
    out.append(f'<g filter="url(#shadow)">{box(x, gy, bw1, gh, "#ffffff", "#e3e6ea")}</g>')
    out.append(icon(ic, x + 16, gy + 18, 30, col))
    out.append(text(x + 56, gy + 36, title, 14, 700))
    out.append(text(x + 16, gy + 64, l1, 12, 400, '#4b5563'))
    out.append(text(x + 16, gy + 84, l2, 12, 400, '#4b5563'))
out.append(icon('claude', xs[0] + bw1 - 38, gy + 14, 20, '#D97757'))
for i, lbl in enumerate(['commit', 'push', 'deploy']):
    out.append(arrow(xs[i] + bw1, gy + 55, xs[i + 1], gy + 55))
    out.append(label((xs[i] + bw1 + xs[i + 1]) / 2, gy + 43, lbl, 12))

# Row 2: browser
by, bh, bx, bw = 270, 330, 40, 580
out.append(f'<g filter="url(#shadow)">{box(bx, by, bw, bh, "#ffffff", "#2563eb")}</g>')
out.append(text(bx + 24, by + 34, 'ユーザーのブラウザ（PC / スマートフォン）', 17, 700, '#2563eb'))
out.append(text(bx + 24, by + 56, 'サーバーなし。学習・採点・出題はすべてブラウザ内で動作', 13, 400, '#4b5563'))
ax, ay, aw, ah = bx + 24, by + 80, 250, 220
out.append(box(ax, ay, aw, ah, '#f0f5ff', '#c7d7fe'))
out.append(text(ax + 16, ay + 30, 'SPILAB アプリ（SPA）', 15, 700))
for i, (ic, col, name) in enumerate([('react', '#61DAFB', 'React 19'), ('typescript', '#3178C6', 'TypeScript'), ('vite', '#646CFF', 'Vite')]):
    out.append(icon(ic, ax + 16, ay + 46 + 38 * i, 28, col)); out.append(text(ax + 52, ay + 66 + 38 * i, name, 13))
out.append(text(ax + 16, ay + 178, '1問ずつ出題・タイマー・採点', 12, 400, '#4b5563'))
out.append(text(ax + 16, ay + 196, '習熟度計算・苦手優先の出題', 12, 400, '#4b5563'))
dx, dw, dy, dh = ax + aw + 30, bw - aw - 78, ay, ah
out.append(box(dx, dy, dw, dh, '#fff8e6', '#f5d78a'))
out.append(text(dx + 16, dy + 30, 'IndexedDB（ブラウザ内DB）', 15, 700))
out.append(f'<g transform="translate({dx+16},{dy+46})"><ellipse cx="14" cy="6" rx="14" ry="6" fill="#f59e0b"/><path d="M0 6v20c0 3.3 6.3 6 14 6s14-2.7 14-6V6" fill="none" stroke="#f59e0b" stroke-width="2.5"/><path d="M0 16c0 3.3 6.3 6 14 6s14-2.7 14-6" fill="none" stroke="#f59e0b" stroke-width="2.5"/></g>')
out.append(text(dx + 56, dy + 66, 'answers：回答履歴', 13)); out.append(text(dx + 56, dy + 88, 'settings：設定', 13)); out.append(text(dx + 56, dy + 110, 'secrets：AI の API キー', 13))
out.append(text(dx + 16, dy + 140, '履歴はここが正', 12, 400, '#4b5563'))
out.append(text(dx + 16, dy + 158, 'JSON で書き出し / 読み込み可', 12, 400, '#4b5563'))
out.append(text(dx + 16, dy + 176, '未ログインならここだけで完結', 12, 400, '#4b5563'))
out.append(arrow(ax + aw, ay + ah / 2, dx, ay + ah / 2, both=True))
mid, px = by - 25, xs[3] + bw1 / 2
out.append(f'<path d="M{px} {gy+gh} V {mid} H {bx+bw/2}" fill="none" stroke="#4b5563" stroke-width="2"/>')
out.append(arrow(bx + bw / 2, mid, bx + bw / 2, by))
out.append(label(bx + bw / 2 + 12, mid - 8, 'HTML / JS / CSS を配信', anchor='start'))

# Supabase
rx, rw, sy, sh = 820, 320, 285, 190
out.append(f'<g filter="url(#shadow)">{box(rx, sy, rw, sh, "#ffffff", "#3FCF8E")}</g>')
out.append(icon('supabase', rx + 20, sy + 20, 36, '#3FCF8E'))
out.append(text(rx + 70, sy + 36, 'Supabase（任意）', 16, 700))
out.append(text(rx + 70, sy + 58, 'Auth：Google / GitHub ログイン', 13, 400, '#4b5563'))
out.append(icon('google', rx + 70, sy + 66, 18, '#4285F4')); out.append(icon('github', rx + 94, sy + 66, 18, '#181717'))
out.append(icon('postgresql', rx + 20, sy + 104, 28, '#4169E1'))
out.append(text(rx + 56, sy + 116, 'Postgres + Row Level Security', 13))
out.append(text(rx + 56, sy + 136, 'answers / settings', 12, 400, '#4b5563'))
out.append(text(rx + 20, sy + 168, '本人の行だけ読み書き可。複数端末で履歴を共有', 12, 400, '#4b5563'))
gx, yy = (bx + bw + rx) / 2, sy + sh / 2
out.append(arrow(bx + bw, yy, rx, yy, dashed=True, both=True))
out.append(label(gx, yy - 12, 'ログイン時のみ同期')); out.append(label(gx, yy + 24, '回答・設定', 12))

# AI Q&A (optional)
qy, qh = 510, 100
out.append(f'<g filter="url(#shadow)">{box(rx, qy, rw, qh, "#ffffff", "#D97757")}</g>')
out.append(icon('anthropic', rx + 20, qy + 18, 28, '#191919')); out.append(icon('openai', rx + 56, qy + 18, 28, '#000000'))
out.append(text(rx + 96, qy + 36, 'Claude / OpenAI API（任意）', 15, 700))
out.append(text(rx + 20, qy + 64, '採点後の「AIに質問」。利用者自身の API キー', 12, 400, '#4b5563'))
out.append(text(rx + 20, qy + 84, 'キーはブラウザ内のみ。同期・書き出し対象外', 12, 400, '#4b5563'))
qyy = qy + qh / 2
out.append(arrow(bx + bw, qyy, rx, qyy, dashed=True, both=True))
out.append(label(gx, qyy - 12, 'キー設定時のみ')); out.append(label(gx, qyy + 24, '質問・回答', 12))

ly = 655
out.append(f'<line x1="40" y1="{ly}" x2="90" y2="{ly}" stroke="#4b5563" stroke-width="2"/>'); out.append(text(100, ly + 5, '必須の経路', 13, 400, '#4b5563'))
out.append(f'<line x1="200" y1="{ly}" x2="250" y2="{ly}" stroke="#4b5563" stroke-width="2" stroke-dasharray="7 6"/>'); out.append(text(260, ly + 5, '任意（設定した場合のみ）', 13, 400, '#4b5563'))
out.append(text(40, ly + 34, '解析ツール・独自サーバーなし。ログインしない限り、学習データがブラウザの外に出ることはありません。', 13, 400, '#6b7280'))
out.append('</svg>')
OUT.write_text('\n'.join(out))
print(f'wrote {OUT}')
