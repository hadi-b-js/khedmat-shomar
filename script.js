const DATES = {
  start: new Date("2024/02/20"),
  end: new Date("2025/11/22"),
  payanDore: new Date("2025/09/23"),
  tahlif: new Date("2024/05/05"),
  taghsim: new Date("2024/05/29"),
  taghsim2: new Date("2024/12/14"),
};

function countWorkingDays(from, to) {
  let count = 0;
  let current = new Date(from);
  while (current <= to) {
    const day = current.getDay();
    if (day !== 4 && day !== 5) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

function daysBetween(a, b) {
  const MS_PER_DAY = 86400000;
  return (b - a) / MS_PER_DAY;
}

function updateCounter() {
  const today = new Date();
  const { start, end, payanDore, tahlif, taghsim, taghsim2 } = DATES;

  const totalDays = daysBetween(start, end);
  const elapsedDays = daysBetween(start, today);
  const remainingDays = daysBetween(today, end);
  const remainingToPayan = daysBetween(today, payanDore);

  const percent = (elapsedDays * 100) / totalDays;
  const percent2 = 100 - (remainingToPayan * 100) / totalDays;

  const content = {
    ezam: start.toLocaleDateString("fa-ir"),
    emruz: today.toLocaleDateString("fa-ir"),
    payanDore: payanDore.toLocaleDateString("fa-ir"),
    etmam: end.toLocaleDateString("fa-ir"),
    kol: `${totalDays.toFixed(0)} ruz`,
    gozashte: `${elapsedDays.toFixed(6)} ruz`,
    mande: `${remainingDays.toFixed(6)} ruz`,
    ruzbarg: `${countWorkingDays(today, end)} ruz`,
    darsad: `${percent.toFixed(2)} %`,
    payanDore2: `${remainingToPayan.toFixed(6)} ruz`,
    ruzbarg2: `${countWorkingDays(today, payanDore)} ruz`,
    darsad2: `${percent2.toFixed(2)} %`,
    yegan: `${daysBetween(tahlif, today).toFixed(0)} ruz`,
    pasdari: `${daysBetween(tahlif, taghsim).toFixed(0)} ruz`,
    monshi: `${daysBetween(taghsim, taghsim2).toFixed(0)} ruz`,
    paya: `${daysBetween(taghsim2, today).toFixed(0)} ruz`,
  };

  const tbody = document.querySelector("table tbody");
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

  const estimatedBar = document.querySelector(".bar-estimated");
  estimatedBar.style.width = `${percent}%`;
  estimatedBar.innerText = `${percent.toFixed(1)}%`;

  const estimatedBar2 = document.querySelector(".bar-estimated2");
  estimatedBar2.style.width = `${percent2}%`;
  estimatedBar2.innerText = `${percent2.toFixed(1)}%`;
}

// Setup table only once
(function setupTable() {
  const table = document.createElement("table");
  table.append(document.createElement("tbody"));
  document.body.prepend(table);
})();

setInterval(updateCounter, 1000);
