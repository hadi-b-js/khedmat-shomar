/*
  Cleaned and refactored date/progress utilities.

  - Split calculation and DOM update logic into small helpers.
  - Guarded against negative values and invalid ranges.
  - Safe DOM updates (no crashes when elements are missing).
  - Reduced the update frequency to once per minute (days don't need per-second updates).
*/

const DATES = {
  start: new Date("2024/02/20"),
  end: new Date("2025/11/22"),
  payanDore: new Date("2025/10/01"),
  tahlif: new Date("2024/05/05"),
  taghsim: new Date("2024/05/29"),
  taghsim2: new Date("2024/12/14"),
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Return number of days (including fractional) between two dates: (b - a) / MS_PER_DAY
 * If a or b is invalid, returns NaN.
 */
function daysBetween(a, b) {
  return (b - a) / MS_PER_DAY;
}

/**
 * Count working days (Mon-Wed, Sat-Sun depending on locale) between two dates inclusive.
 * If `from > to` returns 0.
 */
function countWorkingDays(from, to) {
  const start = new Date(from);
  const end = new Date(to);
  if (isNaN(start) || isNaN(end) || start > end) return 0;

  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const day = cur.getDay();
    // keep original behavior: treat 4 and 5 as weekend days to exclude
    if (day !== 4 && day !== 5) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

function clamp(v, min = 0, max = 100) {
  return Math.min(max, Math.max(min, v));
}

function formatDays(n) {
  // show up to 2 decimal places for fractional days, as a readable string
  return `${(n >= 0 ? n : 0).toFixed(5)} ruz`;
}

function formatPercent(p) {
  return `${clamp(p, 0, 100).toFixed(1)} %`;
}

/**
 * Calculate all derived values used by the UI. This keeps the computation separate from DOM code
 * and makes the logic easier to test.
 */
function calculateProgressData(
  { start, end, payanDore, tahlif, taghsim, taghsim2 },
  now = new Date()
) {
  const totalDays = daysBetween(start, end);
  const elapsedRaw = daysBetween(start, now);
  const remainingRaw = daysBetween(now, end);
  const remainingToPayanRaw = daysBetween(now, payanDore);

  const elapsed = Math.max(0, elapsedRaw);
  const remaining = Math.max(0, remainingRaw);
  const remainingToPayan = Math.max(0, remainingToPayanRaw);

  // percent over the start->end span
  let percent = 0;
  if (isNaN(totalDays) || totalDays <= 0) {
    percent = now >= end ? 100 : 0;
  } else if (now < start) {
    percent = 0;
  } else if (now >= end) {
    percent = 100;
  } else {
    percent = (elapsedRaw * 100) / totalDays;
  }

  // percent for payanDore relative to start->payanDore span when possible
  let percentPayan = 0;
  if (payanDore <= start) {
    percentPayan = now >= payanDore ? 100 : 0;
  } else if (now < start) {
    percentPayan = 0;
  } else if (now >= payanDore) {
    percentPayan = 100;
  } else {
    const span = daysBetween(start, payanDore);
    percentPayan =
      span > 0
        ? (daysBetween(start, now) * 100) / span
        : (elapsedRaw * 100) / (totalDays || 1);
  }

  percent = clamp(percent, 0, 100);
  percentPayan = clamp(percentPayan, 0, 100);

  return {
    now,
    start,
    end,
    payanDore,
    totalDays: totalDays > 0 ? totalDays : 0,
    elapsed,
    remaining,
    remainingToPayan,
    percent,
    percentPayan,
    tahlif,
    taghsim,
    taghsim2,
  };
}

/**
 * Safe DOM helpers: query and no-op if not present.
 */
function $(selector) {
  return document.querySelector(selector);
}

function updateCounter() {
  const data = calculateProgressData(DATES, new Date());

  const content = {
    ezam: data.start.toLocaleDateString("fa-ir"),
    emruz: data.now.toLocaleDateString("fa-ir"),
    payanDore: data.payanDore.toLocaleDateString("fa-ir"),
    etmam: data.end.toLocaleDateString("fa-ir"),
    kol: `${data.totalDays.toFixed(0)} ruz`,
    gozashte: formatDays(data.elapsed),
    mande: formatDays(data.remaining),
    ruzbarg: `${countWorkingDays(data.now, data.end)} ruz`,
    darsad: formatPercent(data.percent),
    payanDore2:
      data.remainingToPayan === 0 && data.now >= data.payanDore
        ? `0 ruz`
        : `${data.remainingToPayan.toFixed(5)} ruz`,
    ruzbarg2: `${countWorkingDays(data.now, data.payanDore)} ruz`,
    darsad2: formatPercent(data.percentPayan),
    yegan: `${daysBetween(data.tahlif, data.now).toFixed(0)} ruz`,
    pasdari: `${daysBetween(data.tahlif, data.taghsim).toFixed(0)} ruz`,
    monshi: `${daysBetween(data.taghsim, data.taghsim2).toFixed(0)} ruz`,
    paya: `${daysBetween(data.taghsim2, data.now).toFixed(0)} ruz`,
  };

  const tbody = $("table tbody");
  if (tbody) {
    tbody.innerHTML = Object.entries(content)
      .map(
        ([key, value]) => `
      <tr>
        <td>${key}</td>
        <td>:</td>
        <td>${value}</td>
      </tr>
    `
      )
      .join("");
  }

  const estimatedBar = $(".bar-estimated");
  if (estimatedBar) {
    estimatedBar.style.width = `${data.percent}%`;
    estimatedBar.innerText = `${data.percent.toFixed(1)}%`;
  }

  const estimatedBar2 = $(".bar-estimated2");
  if (estimatedBar2) {
    estimatedBar2.style.width = `${data.percentPayan}%`;
    estimatedBar2.innerText = `${data.percentPayan.toFixed(1)}%`;
  }
}

// Setup table only once if not present
(function setupTable() {
  if (!$("table tbody")) {
    const table = document.createElement("table");
    table.append(document.createElement("tbody"));
    document.body.prepend(table);
  }
})();

// Update once immediately, then once per minute (days-level accuracy is fine at 60s)
updateCounter();
setInterval(updateCounter, 1000);
