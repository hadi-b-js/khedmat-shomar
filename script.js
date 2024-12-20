let start = new Date("2024/02/20");
let end = new Date("2025/11/23");
let tahlif = new Date("2024/05/05");
let taghsim = new Date("2024/05/29");
let taghsim2 = new Date("2024/12/14")

const counterRuz = function () {
  let ruzbarg = 0;
  for (let i = new Date(); i <= end; i.setTime(i.getTime() + 86400000)) {
    if (i.getDay() === 5 || i.getDay() === 4) {
      continue;
    } else {
      ruzbarg += 1;
    }
  }
  return ruzbarg;
};

const counter = function () {
  let today = new Date();
  let total = (end - start) / 1000 / 60 / 60 / 24;
  let estimated = (today - start) / 1000 / 60 / 60 / 24;
  let remained = (end - today) / 1000 / 60 / 60 / 24;
  let yegan = (today - tahlif) / 1000 / 60 / 60 / 24;
  let pasdari = (taghsim - tahlif) / 1000 / 60 / 60 / 24;
  let monshi = (taghsim2 - taghsim) / 1000 / 60 / 60 / 24;
  let paya = (today - taghsim2) / 1000 / 60 / 60 / 24;
  let percent = (estimated * 100) / total;

  let contentObject = {
    ezam: start.toLocaleDateString("fa-ir"),
    emruz: today.toLocaleDateString("fa-ir"),
    etmam: end.toLocaleDateString("fa-ir"),
    kol: `${total} ruz`,
    gozashte: `${estimated.toFixed(5)} ruz`,
    mande: `${remained.toFixed(5)} ruz`,
    ruzbarg: `${counterRuz()} ruz`,
    yegan: `${yegan.toFixed()} ruz`,
    pasdari:`${pasdari.toFixed()} ruz`,
    monshi: `${monshi.toFixed()} ruz`,
    paya: `${paya.toFixed()} ruz`,
    darsad: `${percent.toFixed(5)} %`,
  };

  let element = document.querySelector("table tbody");
  element.innerHTML = "";
  for (i in contentObject) {
    element.innerHTML += `
			<tr>
				<td>
					${i}
				</td>
				<td>
					:
				</td>
				<td>
					${contentObject[i]}
				</td>
			</tr>
		`;
  }

  let estimatedBar = document.querySelector(".bar-estimated");
  estimatedBar.style.width = `${percent}%`;
  estimatedBar.innerText = `${percent.toFixed(1)}%`;
};

let element = document.createElement("table");
element.append(document.createElement("tbody"));
document.body.prepend(element);

setInterval(counter, 1000);
