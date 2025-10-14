const DATES = {
  start: new Date("2024/02/20"),
  end: new Date("2025/11/22"),
  payanDore: new Date("2025/10/01"),
  tahlif: new Date("2024/05/05"),
  taghsim: new Date("2024/05/29"),
  taghsim2: new Date("2024/12/14"),
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function daysBetween(a, b) {
  return (b - a) / MS_PER_DAY;
}

function countWorkingDays(from, to) {
  const start = new Date(from);
  const end = new Date(to);
  if (isNaN(start) || isNaN(end) || start > end) return 0;

  let count = 0;
  const cur = new Date(start);
  while (cur < end) {
    const day = cur.getDay();
    if (day !== 4 && day !== 5) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

function trimFloat(num, digits) {
  return Number.isInteger(num) ? num : Number(num.toFixed(digits));
}

function $(selector) {
  return document.querySelector(selector);
}

function updateCounter() {
  const { start, end, payanDore, tahlif, taghsim, taghsim2 } = DATES;
  const now = new Date() > end ? end : new Date();

  const totalDays = daysBetween(start, end);
  const elapsed = daysBetween(start, now);
  const remaining = Math.max(0, daysBetween(now, end));
  const remainingToPayan = Math.max(0, daysBetween(now, payanDore));
  const percent = trimFloat(Math.min(100, (elapsed * 100) / totalDays), 2);
  const percentPayan = trimFloat(
    Math.min(100, (elapsed * 100) / daysBetween(start, payanDore)),
    2
  );

  const content = {
    ezam: start.toLocaleDateString("fa-ir"),
    emruz:
      now === end
        ? new Date().toLocaleDateString("fa-ir")
        : now.toLocaleDateString("fa-ir"),
    payanDore: payanDore.toLocaleDateString("fa-ir"),
    etmam: end.toLocaleDateString("fa-ir"),

    kol: `${totalDays} ruz`,
    gozashte: `${trimFloat(elapsed, 5)} ruz`,
    mande: `${trimFloat(remaining, 5)} ruz`,
    ruzbarg: `${countWorkingDays(now, end)} ruz`,
    darsad: `${percent} %`,

    payanDore2: `${trimFloat(remainingToPayan, 5)} ruz`,
    ruzbarg2: `${countWorkingDays(now, payanDore)} ruz`,
    darsad2: `${percentPayan} %`,

    amuzeshi: `${daysBetween(start, tahlif)} ruz`,
    yegan: `${trimFloat(daysBetween(tahlif, now), 5)} ruz`,
    pasdari: `${daysBetween(tahlif, taghsim)} ruz`,
    monshi: `${daysBetween(taghsim, taghsim2)} ruz`,
    paya: `${daysBetween(taghsim2, payanDore)} ruz`,
    payanDays: `${trimFloat(Math.max(0, daysBetween(payanDore, now)), 5)} ruz`,
  };

  const tbody = $("table tbody");
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

  const bar1 = $(".bar-estimated");
  if (bar1) {
    bar1.style.width = `${percent}%`;
    bar1.innerText = `${percent}%`;
  }

  const bar2 = $(".bar-estimated2");
  if (bar2) {
    bar2.style.width = `${percentPayan}%`;
    bar2.innerText = `${percentPayan}%`;
  }
}

if (!$("table tbody")) {
  const table = document.createElement("table");
  table.append(document.createElement("tbody"));
  document.body.prepend(table);
}

updateCounter();
setInterval(updateCounter, 1000);
