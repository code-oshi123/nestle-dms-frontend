import re

with open('c:/Users/ushan/nestle-dms-frontend/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

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
    name="Warehouse dashboard window fix"
)

content = safe_sub(
    r"// ── WAREHOUSE WAITLIST ───────────────────────────\s*async function pageWhWaitlist\(\) \{.*?\}\s*// ── SALES REP WAITLIST \(city-scoped\) ─────────────\s*async function pageSrWaitlist\(\) \{.*?\}\s*// ── ROUTE MANAGEMENT",
    "// ── ROUTE MANAGEMENT",
    content,
    flags=re.DOTALL,
    name="Waitlist pages fix"
)

content = safe_sub(
    r"async function placePartialOrder\(\) \{.*?\}\s*async function joinWaitingList\(\) \{.*?\}\s*// ── OFFLINE CAPABILITY",
    "// ── OFFLINE CAPABILITY",
    content,
    flags=re.DOTALL,
    name="placePartialOrder/joinWaitingList fix"
)

content = safe_sub(
    r"function showWaitlistOptions\(failed, city, area\) \{.*?async function joinWaitlist\(productId, productName, qty, type, city, area\) \{.*?\}\s*function pollBadge\(\)",
    "function pollBadge()",
    content,
    flags=re.DOTALL,
    name="showWaitlistOptions/joinWaitlist fix"
)

with open('c:/Users/ushan/nestle-dms-frontend/index.html', 'w', encoding='utf-8') as f:
    f.write(content)
