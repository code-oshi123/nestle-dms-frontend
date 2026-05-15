import re

with open('c:/Users/ushan/nestle-dms-frontend/index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find indices again to be super safe
wh_start, wh_end = -1, -1
wl_start, wl_end = -1, -1
swo_start, pin_start = -1, -1

for i, line in enumerate(lines):
    if 'async function pageWhDashboard()' in line: wh_start = i
    if 'async function pageWhStock()' in line: wh_end = i
    if 'async function pageWhWaitlist()' in line: wl_start = i
    if 'async function pageMyRoutes()' in line: wl_end = i
    if 'function showWaitlistOptions(' in line: swo_start = i
    if 'function pinDigit(' in line: pin_start = i

# Remove the line blocks in reverse order so indices don\'t shift
if swo_start != -1 and pin_start != -1:
    del lines[swo_start:pin_start]
if wl_start != -1 and wl_end != -1:
    # Look back a bit to remove the headers if any
    while '// ── WAREHOUSE WAITLIST' in lines[wl_start-1]:
        wl_start -= 1
    del lines[wl_start:wl_end]
if wh_start != -1 and wh_end != -1:
    while '// ══ WAREHOUSE DASHBOARD' in lines[wh_start-1]:
        wh_start -= 1
    del lines[wh_start:wh_end]

content = "".join(lines)

def safe_sub(pattern, repl, text, flags=0, name=""):
    new_text, count = re.subn(pattern, repl, text, flags=flags)
    print(f"{name}: {count} replacements made.")
    return new_text

content = safe_sub(
    r"✅ Update\$\{totalDemand > 0 \? ' & Notify 🔔' : ''\}",
    "✅ Update",
    content,
    name="Update stock button fix"
)

content = safe_sub(
    r"// ══ WAREHOUSE DASHBOARD ═════════════════════════\s*async function pageWhDashboard\(\) \{.*?\}\s*// ── WAREHOUSE STOCK",
    "// ── WAREHOUSE STOCK",
    content,
    flags=re.DOTALL,
    name="Warehouse dashboard window fix fallback"
)

# Replace the specific waitlist stuff in `updateStock` since the totalDemand might be removed
content = safe_sub(
    r"<td style=\"display:flex;gap:6px;align-items:center;flex-wrap:wrap\">\s*<input type=\"number\" min=\"0\" id=\"units-\$\{p\.id\}\" value=\"\$\{units\}\"\s*style=\"width:80px;padding:6px 8px;border:1\.5px solid var\(--cream-dk\);border-radius:6px;font-family:'Jost',sans-serif;font-size:13px\"/>\s*<button class=\"btn btn-ghost btn-sm\" onclick=\"useSuggested\('\$\{p\.id\}'\)\">← Use</button>\s*<button class=\"btn btn-tan btn-sm\" onclick=\"updateStock\('\$\{p\.id\}','\$\{escapeHtml\(p\.productName \|\| ''\)\}',\$\{p\.availableKg \|\| 0\}\)\">\s*✅ Update.*?\s*</button>\s*</td>",
    r"<td style=\"display:flex;gap:6px;align-items:center;flex-wrap:wrap\">\n              <input type=\"number\" min=\"0\" id=\"units-${p.id}\" value=\"${units}\"\n                style=\"width:80px;padding:6px 8px;border:1.5px solid var(--cream-dk);border-radius:6px;font-family:'Jost',sans-serif;font-size:13px\"/>\n              <button class=\"btn btn-ghost btn-sm\" onclick=\"useSuggested('${p.id}')\">← Use</button>\n              <button class=\"btn btn-tan btn-sm\" onclick=\"updateStock('${p.id}','${escapeHtml(p.productName || '')}',${p.availableKg || 0})\">\n                ✅ Update\n              </button>\n            </td>",
    content,
    flags=re.DOTALL,
    name="Stock level table Update button"
)

with open('c:/Users/ushan/nestle-dms-frontend/index.html', 'w', encoding='utf-8') as f:
    f.write(content)
