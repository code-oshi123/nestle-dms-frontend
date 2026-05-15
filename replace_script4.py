import re

with open('c:/Users/ushan/nestle-dms-frontend/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r"<td style=\"display:flex;gap:6px;align-items:center;flex-wrap:wrap\">\s*<input type=\"number\" min=\"0\" id=\"units-\$\{p\.id\}\" value=\"\$\{units\}\"\s*style=\"width:80px;padding:6px 8px;border:1\.5px solid var\(--cream-dk\);border-radius:6px;font-family:'Jost',sans-serif;font-size:13px\"/>\s*<button class=\"btn btn-ghost btn-sm\" onclick=\"useSuggested\('\$\{p\.id\}'\)\">← Use</button>\s*<button class=\"btn btn-tan btn-sm\" onclick=\"updateStock\('\$\{p\.id\}','\$\{escapeHtml\(p\.productName \|\| ''\)\}',\$\{p\.availableKg \|\| 0\}\)\\">\s*✅ Update.*?\s*</button>\s*</td>",
    r"<td style=\"display:flex;gap:6px;align-items:center;flex-wrap:wrap\">\n              <input type=\"number\" min=\"0\" id=\"units-${p.id}\" value=\"${units}\"\n                style=\"width:80px;padding:6px 8px;border:1.5px solid var(--cream-dk);border-radius:6px;font-family:'Jost',sans-serif;font-size:13px\"/>\n              <button class=\"btn btn-ghost btn-sm\" onclick=\"useSuggested('${p.id}')\">← Use</button>\n              <button class=\"btn btn-tan btn-sm\" onclick=\"updateStock('${p.id}','${escapeHtml(p.productName || '')}')\">\n                ✅ Update\n              </button>\n            </td>",
    content,
    flags=re.DOTALL
)

with open('c:/Users/ushan/nestle-dms-frontend/index.html', 'w', encoding='utf-8') as f:
    f.write(content)
