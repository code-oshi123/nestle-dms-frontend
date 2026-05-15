import re

with open('c:/Users/ushan/nestle-dms-frontend/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

def safe_sub(pattern, repl, text, flags=0, name=""):
    new_text, count = re.subn(pattern, repl, text, flags=flags)
    print(f"{name}: {count} replacements made.")
    return new_text

# 1. Nav roles
content = safe_sub(r"\{ id: 'wh-dashboard', ico: '📊', lbl: 'Dashboard' \}, ", "", content, name="Nav roles wh-dashboard")
content = safe_sub(r", \{ id: 'wh-waitlist', ico: '⏳', lbl: 'Waitlist' \}", "", content, name="Nav roles wh-waitlist")
content = safe_sub(r", \{ id: 'sr-waitlist', ico: '⏳', lbl: 'Waitlist' \}", "", content, name="Nav roles sr-waitlist")

# 2. Routes
content = safe_sub(r"\s*if \(id === 'wh-dashboard'\) await pageWhDashboard\(\);", "", content, name="Routes wh-dashboard")
content = safe_sub(r"\s*if \(id === 'wh-waitlist'\) await pageWhWaitlist\(\);", "", content, name="Routes wh-waitlist")
content = safe_sub(r"\s*if \(id === 'sr-waitlist'\) await pageSrWaitlist\(\);", "", content, name="Routes sr-waitlist")

# 3. Modals ms-partial-btn / ms-wait-btn
content = safe_sub(
    r"<button class=\"btn btn-tan\" id=\"ms-partial-btn\".*?📦 Place Partial Order\s*</button>\s*<button class=\"btn\" id=\"ms-wait-btn\".*?📋 Join Waiting List\s*</button>",
    "",
    content,
    flags=re.DOTALL,
    name="Modals partial/wait buttons"
)

# 4. Remove notes from smart order
content = safe_sub(
    r"\s*<div class=\"fg\" style=\"grid-column:1/-1\">\s*<label>Notes</label>\s*<input id=\"i-notes\" placeholder=\"[^\"]*\"/>\s*</div>",
    "",
    content,
    name="Smart order notes"
)

# 5. Remove total units and total kg
content = safe_sub(
    r"\s*<span>🔢 <strong id=\"sum-items\">0</strong> total (units|items)</span>\s*<span>⚖️ <strong id=\"sum-kg\">0\.0</strong> kg total</span>",
    "",
    content,
    name="Smart order total units/kg"
)

# 6. Warehouse stock level table header
content = safe_sub(
    r"<th>Weight</th><th>Threshold</th><th>Demand</th>",
    r"<th>Threshold</th>",
    content,
    name="Stock level table header"
)

# 7. Warehouse stock level table body
content = safe_sub(
    r"<td style=\"font-weight:700;color:var\(--blue\)\">\$\{p\.availableKg \? parseFloat\(p\.availableKg\)\.toFixed\(1\) \+ 'kg' : '—'\}</td>",
    "",
    content,
    name="Stock level available kg"
)

# The demand column
content = safe_sub(
    r"<td(?:(?!<td).)*?\$\{totalDemand > 0(?:(?!</td>).)*?</td>",
    "",
    content,
    flags=re.DOTALL,
    name="Stock level demand column"
)

# Update Stock button
content = safe_sub(
    r"✅ Update\$\{totalDemand > 0 \? ' & Notify 🔔' : ''\}",
    "✅ Update",
    content,
    name="Update stock button"
)

# Auto notify banner
content = safe_sub(
    r"🔔 <strong>Auto-notify:</strong> Updating stock notifies waiting list retailers and those with rejected \"Out of Stock\" orders\.\s*&nbsp;·&nbsp;",
    "",
    content,
    name="Auto notify banner"
)

# 8. Remove warehouse dashboard window
content = safe_sub(
    r"// ══ WAREHOUSE DASHBOARD ═════════════════════════\s*async function pageWhDashboard\(\) \{.*?\}\s*// ══ WAREHOUSE ",
    "// ══ WAREHOUSE ",
    content,
    flags=re.DOTALL,
    name="Warehouse dashboard window"
)

# 9. Remove waitlist pages
content = safe_sub(
    r"// ── WAREHOUSE WAITLIST ───────────────────────────\s*async function pageWhWaitlist\(\) \{.*?\}\s*// ── SALES REP WAITLIST \(city-scoped\) ─────────────\s*async function pageSrWaitlist\(\) \{.*?\}\s*function loadAllProducts\(\)",
    "function loadAllProducts()",
    content,
    flags=re.DOTALL,
    name="Waitlist pages"
)

# 10. Bulk order waitlist logic (m-waitlist-content buttons)
content = safe_sub(
    r"<button class=\"btn btn-green\" onclick=\"closeModal\('m-waitlist-modal'\);_executeBatchWithWaitlist\(\);\">\$\{canPlace\.length \? 'Place available \+ Join Waitlist' : 'Join Waitlist'\}</button>",
    r"${canPlace.length ? `<button class=\"btn btn-green\" onclick=\"closeModal('m-waitlist-modal');_executeBatch();\">Place available</button>` : ''}",
    content,
    name="Bulk order waitlist button"
)

content = content.replace("async function _executeBatchWithWaitlist() {", "async function _executeBatch() {")
content = safe_sub(
    r"for \(const p of \(toWaitlist \|\| \[\]\)\) \{\s*await joinWaitlist\(p\.productId, p\.productName, p\.requestedQty, 'full', province, resolvedArea\);\s*\}",
    "",
    content,
    name="Bulk order toWaitlist loop"
)
content = content.replace("toast('✅ Added to waitlist', '#16a34a');", "toast('✅ Order submitted', '#16a34a');")
content = content.replace("toast(`❌ All lines failed — see waitlist options below`, '#B71C1C');\n          showWaitlistOptions(r.failed, cityEl.value, areaEl.value);", "toast(`❌ All lines failed due to stock issues.`, '#B71C1C');")
content = content.replace("toast(`⚠️ Placed ${r.successCount}. ${r.failedCount} failed — see waitlist options.`, '#ea580c');\n        showWaitlistOptions(r.failed, cityEl.value, areaEl.value);", "toast(`⚠️ Placed ${r.successCount}. ${r.failedCount} failed.`, '#ea580c');")
content = content.replace("if (skipped) { showWaitlistOptions(r.failed, province, resolvedArea); } else { nav('my-orders'); }", "nav('my-orders');")
content = content.replace("showWaitlistOptions(r.failed, province, resolvedArea);", "")
content = safe_sub(
    r"<div id=\"waitlist-options\".*?</div>",
    "",
    content,
    name="Waitlist options div"
)

# 11. Remove joinWaitingList and placePartialOrder functions completely
content = safe_sub(
    r"async function placePartialOrder\(\) \{.*?\}\s*async function joinWaitingList\(\) \{.*?\}\s*// ── OFFLINE CAPABILITY",
    "// ── OFFLINE CAPABILITY",
    content,
    flags=re.DOTALL,
    name="placePartialOrder/joinWaitingList"
)

# 12. Modify showStockModal logic
content = safe_sub(
    r"\? `<strong>\$\{prodName\}</strong> is currently out of stock\.<br><br>Join the waiting list and we will notify you as soon as stock is replenished\.`\s*: `Only <strong>\$\{avail\} units</strong> of <strong>\$\{prodName\}</strong> are available\.<br>You requested <strong>\$\{requestedQty\} units</strong>\.<br><br>You can place a partial order for the available quantity, or join the waiting list for the full amount\.`;",
    "? `<strong>${prodName}</strong> is currently out of stock.` : `Only <strong>${avail} units</strong> of <strong>${prodName}</strong> are available.<br>You requested <strong>${requestedQty} units</strong>.`;",
    content,
    name="showStockModal text"
)

content = safe_sub(
    r"const partialBtn = document\.getElementById\('ms-partial-btn'\);.*?const waitBtn = document\.getElementById\('ms-wait-btn'\);\s*waitBtn\.textContent = `📋 Join Waiting List for \$\{requestedQty\} units`;",
    "",
    content,
    flags=re.DOTALL,
    name="showStockModal buttons logic"
)

# Remove joinWaitlist and showWaitlistOptions entirely
content = safe_sub(
    r"function showWaitlistOptions\(failed, city, area\) \{.*?async function joinWaitlist\(productId, productName, qty, type, city, area\) \{.*?\}\s*function pollBadge\(\)",
    "function pollBadge()",
    content,
    flags=re.DOTALL,
    name="showWaitlistOptions/joinWaitlist"
)

with open('c:/Users/ushan/nestle-dms-frontend/index.html', 'w', encoding='utf-8') as f:
    f.write(content)
