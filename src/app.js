const container = document.querySelector(".container");
const usedPokemons = [];
const scoreBar = document.querySelector(".scoreBar");
const body = document.querySelector("body");

const typeList = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};

let firstPlay = true;
const gameState = {
  pkm1: null,
  pkm2: null,
  stat: null,
  result: null,
  score: 0,
  highScore: 0,
};
gameState.highScore = Number(localStorage.getItem("highScore")) || 0;
async function fetchData(number) {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${number}`);
    if (!res.ok) {
      throw new Error("error en la red");
    }
    const datos = await res.json();

    return {
      name: datos.name,
      stats: datos.stats,
      sprite: datos.sprites.other["official-artwork"].front_default,
      type: datos.types[0].type.name,
    };
  } catch (error) {
    console.error(error);
  }
}

function getStat() {
  const stats = [
    "hp",
    "attack",
    "defense",
    "special-attack",
    "special-defense",
    "speed",
  ];

  return stats[Math.floor(Math.random() * stats.length)];
}

function getID() {
  return Math.floor(Math.random() * 649) + 1;
}

async function createPokemons() {
  let id;
  do {
    id = getID();
  } while (usedPokemons.includes(id));

  const pkm = await fetchData(id);
  return {
    id,
    name: pkm.name,
    sprite: pkm.sprite,
    stats: pkm.stats,
    type: pkm.type,
  };
}

function mapStats(stats) {
  return Object.fromEntries(
    stats.map((stat) => [stat.stat.name, stat.base_stat])
  );
}

async function getPokemon() {
  const pkm = await createPokemons();
  usedPokemons.push(pkm.id);
  return {
    name: pkm.name,
    sprite: pkm.sprite,
    ...mapStats(pkm.stats),
    type: pkm.type,
  };
}

function comparePokemons(pkm1, pkm2) {
  if (Number(pkm2[`${gameState.stat}`]) > Number(pkm1[`${gameState.stat}`])) {
    return "higher";
  }

  if (Number(pkm2[`${gameState.stat}`]) < Number(pkm1[`${gameState.stat}`])) {
    return "lower";
  }

  return "draw";
}

function validateAnswer(action) {
  const statElement = document.getElementById("stat-to-animate");
  container.style.pointerEvents = "none";
  const finalValue = gameState.pkm2[gameState.stat];
  if (statElement) {
    animateValue(statElement, 0, finalValue, 1000);
  }

  if (action === gameState.result) {
    setTimeout(() => {
      gameState.score++;
      container.style.pointerEvents = "all";
      startGame();
    }, 1300);
  } else if (action === "try") {
    container.style.pointerEvents = "all";
    startGame();
  } else {
    container.style.pointerEvents = "all";
    setTimeout(()=>{
      gameOver();
    }, 1200);
    
  }
}

function gameOver() {
  container.innerHTML = "";

  const h1 = document.createElement("h1");
  const div = document.createElement("div");
  const p = document.createElement("p");
  const tryAgain = document.createElement("button");
  tryAgain.dataset.action = "try";
  tryAgain.textContent = "Try Again!";
  h1.textContent = "Game Over";
  h1.className = `font-extrabold text-5xl text-white text-shadow-lg/30`;
  p.textContent = `Score: ${gameState.score}`;
  p.className = `place-self-center text-white text-shadow-lg/30`;
  div.className = `grid col-span-2 gap-4`;

  tryAgain.className = `text-white text-shadow-lg/30 hover:text-green-400`;

  div.appendChild(h1);
  div.appendChild(p);

  div.appendChild(tryAgain);
  container.appendChild(div);
  isHighScore();
}

function isHighScore() {
  if (gameState.score > gameState.highScore) {
    gameState.highScore = gameState.score;
    localStorage.setItem("highScore", gameState.highScore);
  }
  gameState.score = 0;
}

async function startGame() {
  if (firstPlay) {
    gameState.pkm1 = await getPokemon();
    gameState.pkm2 = await getPokemon();
    firstPlay = false;
  } else {
    gameState.pkm1 = gameState.pkm2;
    gameState.pkm2 = await getPokemon();
  }
  gameState.stat = getStat();

  gameState.result = comparePokemons(gameState.pkm1, gameState.pkm2); 
  renderPokemon(gameState.pkm1, gameState.pkm2);
}

function renderPokemon(pkm1, pkm2) {
  container.innerHTML = "";
  scoreBar.innerHTML = "";
  const first = document.createElement("div");
  const firstText = document.createElement("span");
  const firstImg = document.createElement("img");
  if (!firstPlay) {
    first.classList.add("animate-slide");
  }
  const statNumber = document.createElement("Span");
  statNumber.id = "stat-to-animate";
  statNumber.className = "text-5xl ml-2 text-white text-shadow-lg/30";
  statNumber.textContent = "???";

  const score = document.createElement("p");
  const highScore = document.createElement("p");
  const second = document.createElement("div");
  const secondText = document.createElement("span");
  const secondImg = document.createElement("img");
  const buttonContainer = document.createElement("div");
  const higher = document.createElement("button");
  const lower = document.createElement("button");
  const draw = document.createElement("button");
  const firstStat = document.createElement("span");
  firstText.textContent = `${pkm1.name} base ${gameState.stat} is..`;
  firstStat.textContent = pkm1[gameState.stat];
  firstStat.className = `text-5xl ml-2 text-white text-shadow-lg/30`;
  firstText.className = `text-center text-white text-shadow-lg/30`;
  secondText.className = `text-center text-white text-shadow-lg/30`;
  secondText.textContent = `Has ${pkm2.name}..`;
  firstImg.src = `${pkm1.sprite}`;
  higher.textContent = "Higher";
  draw.textContent = "Draw";
  lower.textContent = "Lower";
  first.classList.add ("text-center");

  firstImg.className = "w-100 h-100 object-contain";

  secondImg.src = `${pkm2.sprite}`;
  secondImg.className = "w-100 h-100 object-contain";
  second.className =
    "relative flex flex-col items-center text-center animate-fade";
  buttonContainer.className = `buttons flex flex-col gap-2 absolute z-10 top-1/2`;

  first.appendChild(firstText);
  first.appendChild(firstImg);
  container.appendChild(first);

  higher.dataset.action = "higher";
  draw.dataset.action = "draw";
  lower.dataset.action = "lower";

  score.textContent = `Score: ${gameState.score}`;
  highScore.textContent = `Highscore: ${gameState.highScore}`;

  higher.className = `text-center text-white text-shadow-lg/30 hover:text-green-400`;
  lower.className = `text-center text-white text-shadow-lg/30 hover:text-green-400`;
  draw.className = `text-center text-white text-shadow-lg/30 hover:text-green-400`;
  buttonContainer.appendChild(higher);
  buttonContainer.appendChild(lower);
  buttonContainer.appendChild(draw);

  second.appendChild(buttonContainer);
  second.appendChild(secondText);
  second.appendChild(secondImg);
  container.appendChild(second);
  scoreBar.appendChild(highScore);
  scoreBar.appendChild(score);
  second.appendChild(statNumber);
  first.appendChild(firstStat);
  changeBg();
}

function changeBg() {
  const firstCol = typeList[gameState.pkm1.type];
  const secondCol = typeList[gameState.pkm2.type];

  body.className = `min-h-screen flex flex-col`;
  body.style.background = `
    linear-gradient(
    to right,
    ${firstCol},
    #e5e5e5,
    ${secondCol}
    )
    `;
}

container.addEventListener("click", (e) => {
  if (e.target.tagName !== "BUTTON") {
    return;
  }
  const { action } = e.target.dataset;
  validateAnswer(action);
});

function animateValue(element, start, end, duration) {
  let startTimestamp = null;

  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;

    const progress = Math.min((timestamp - startTimestamp) / duration, 1);

    element.textContent = Math.floor(progress * (end - start) + start);

    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      element.classList.add("scale-125", "transition-transform");
      setTimeout(() => element.classList.remove("scale-125"), 200);
    }
  };

  window.requestAnimationFrame(step);
}

startGame();
