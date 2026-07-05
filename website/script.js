const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
  console.log("Connection opened");
};

ws.onmessage = (event) => {
  console.log(event.data);
};

const cardBack = "https://i.pinimg.com/736x/80/4f/9a/804f9abe92c8e214a0ecb51d4c151059.jpg";
const bin = document.getElementById("bin");
const eview = document.getElementById("expandview");
const deck = document.getElementById("deck");
const popup = document.getElementById("popup");
popup.style.display = "none";

var selected = null;
var cardDict = {};
var options = ["View","Send to play","Send to hand","Send to bin","Send to deck","Threadmark"];
var binThumbnail = null;
var deckThumbnail = null;

gameState = {
  "play": [],
  "hand": [],
  "deck": [],
  "bin": [],
  "threadmark": [],
  "playerlife": 50,
  "playerdecay": 0
};

document.getElementById('life').innerHTML = gameState['playerlife']
document.getElementById('decay').innerHTML = gameState['playerdecay']

Array.prototype.shuffle = function() {
  const result = this
    .map(value => ({ value, sortKey: Math.random() }))
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(({ value }) => value);

  this.splice(0, this.length, ...result);
  return this;
}

function isNumeric(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

function assign(obj, val) {
  cardDict[obj].notes = val;
}

function buildPopup(options, e) {
  popup.replaceChildren();
  var spanOption;
  options.forEach((element) => {
    spanOption = document.createElement("span");
    spanOption.innerHTML = element;
    popup.appendChild(spanOption);
  })
  popup.style.display = "flex";
  popup.style.top = (document.body.offsetHeight>popup.offsetHeight+event.clientY ? event.clientY : document.body.offsetHeight-popup.offsetHeight)+"px";
  popup.style.left = e.clientX+"px";
}

function cardClick(card, e) {
  buildPopup(card.options, e);
  selected = card;
}

function showThreadmark() {
  eview.style.display = "flex";
  eview.replaceChildren();
  gameState["threadmark"].forEach((element) => {
    eview.appendChild(element.domElement);
    element.domElement.replaceChildren();
    var counter = document.createElement("div");
    counter.className = "counter";
    counter.innerHTML = element.threadmark;
    element.domElement.appendChild(counter);
    counter.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      element.threadmark--;
      counter.innerHTML = element.threadmark;
    });
    counter.addEventListener("click", () => {
      element.threadmark++;
      counter.innerHTML = element.threadmark;
    });
  });
}

document.body.addEventListener('click', (event) => {
  if (event.target.className != "card") {
    popup.style.display = "none";
    if (
      event.target.id != "expandview" &&
      event.target.className != "bin" &&
      event.target.innerHTML != "Show Threadmark Summons" &&
      event.target.className != "counter") {
      eview.style.display = "none";
    }
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key == "Escape") {
    if (popup.style.display == "none") {
      eview.style.display = "none";
    }
    popup.style.display = "none";
  }
});

deck.addEventListener('click', (e) => {
  buildPopup(["Draw","Shuffle"], e);
  popup.style.display = "flex";
});

bin.addEventListener('click', () => {
  eview.style.display = "flex";
  gameState["bin"].forEach((element) => {
    eview.appendChild(element.domElement);
  });
});

popup.addEventListener('click', () => {
  var action = event.target.innerHTML.trim();
  console.log(`Player chose ${action}`)
  switch (action) {
    case "View":
      selected.view();
      break;
    case "Send to play":
      selected.sendTo("play");
      break;
    case "Send to bin":
      selected.sendTo("bin");
      break;
    case "Send to deck":
      selected.sendTo("deck");
      break;
    case "Send to hand":
      selected.sendTo("hand");
      break;
    case "Threadmark":
      selected.threadmark = window.prompt("How many threadmark counters?");
      if (!isNumeric(selected.threadmark)) {
        selected.threadmark = 0;
      }
      selected.sendTo("threadmark")
      break;
    case "Draw":
      gameState["deck"].at(-1).sendTo("hand");
      break;
    case "Shuffle":
      gameState["deck"].shuffle();
      break;
  }
  popup.style.display = "none";
})

class Card {
  constructor(name, id) {
    // Card Data
    this.area = "hand";
    this.known = false;
    this.id = id;
    this.options = options.filter(item => item != `Send to ${this.area}`);
    gameState[this.area].push(this)
    cardDict[id] = this
    // DOM configuring
    this.domElement = document.createElement('div');
    document.getElementById(this.area).appendChild(this.domElement);
    this.domElement.id = id
    this.image = "https://i.redd.it/jw1pc6irt59d1.png"
    this.domElement.classList.add("card");
    this.domElement.style.backgroundImage = `url(${this.image})`
    this.domElement.onclick = (e) => cardClick(this,e);
    // Card content
    this.name = name;
    this.text = "This card Can't be interacted with by your opponents in any way conceivable by the human mind. When you cast this spell, take as many turns as you may possibly wish for. Flying, protection from the entirety of the electromagnetic spectrum, annihilator N0. When 50 Fucking Emrakuls is put into any zone from the battlefield, its owner is sentenced to execution by guillotine.";
    this.type = "Legendary Creatures";
    this.tribe = "Emrakuls";
    this.health = 750;
    this.attack = 750;
    this.rank = "Captain";
    this.flavor = "The vibrations of battle resonate inside the nest.";
    this.notes = "";
    this.sendTo("deck");
  }

  view() {
    document.getElementById("cardpreview").style.backgroundImage = `url(${selected.image})`;
    document.getElementById("carddetails").innerHTML = 
      `<p>Name: ${this.name}</p>
      <p>Type: ${this.type}</p>
      <p>Tribe: ${this.tribe}</p>
      <p>Text: ${this.text}</p>
      <p>Rank: ${this.rank}</p>
      <p>Attack/Health: ${this.attack}/${this.health}</p>
      <p>Flavour: ${this.flavor}</p>
      <p>Notes: <input id='notes' type='textarea' value='${this.notes}'></p>
      <p><button onclick='assign(${this.domElement.id}, document.getElementById("notes").value)'>Update</button></p>`
    return;
  }

  sendTo(area) {
    gameState[this.area].splice(gameState[this.area].indexOf(this),1)
    gameState[area].push(this);

    if (this.area == "bin") {
      bin.firstChild.remove();
      if (gameState.bin.length > 0) {
        binThumbnail = document.createElement("div");
        binThumbnail.style.backgroundImage = `url(${gameState['bin'].at(-1).image})`;
        binThumbnail.className = "card";
        binThumbnail.id = "binthumbnail";
        bin.appendChild(binThumbnail);
      }
    }

    if (this.area == "deck") {
      this.domElement.style.backgroundImage = `url(${this.image})`;
      this.known = true;
      if (gameState["deck"].length == 0) {
        deck.firstChild.remove();
      }
    }

    if (["hand","play"].includes(this.area)) {
      document.getElementById(this.area).removeChild(this.domElement);
    }

    if (this.area == "threadmark") {
      this.domElement.replaceChildren();
    }

    if (area == "bin") {
      if (bin.firstChild) {
        bin.firstChild.remove()
      }
      binThumbnail = document.createElement("div");
      binThumbnail.style.backgroundImage = `url(${this.image})`;
      binThumbnail.className = "card";
      binThumbnail.id = "binthumbnail";
      bin.appendChild(binThumbnail);
    }
    else if (area == "deck") {
      if (deck.firstChild) {
        deck.firstChild.remove();
      }
      this.known = false;
      this.domElement.style.backgroundImage = `url(${cardBack})`
      deckThumbnail = document.createElement("div");
      deckThumbnail.style.backgroundImage = `url(${cardBack})`
      deckThumbnail.className = "card";
      deckThumbnail.id = "deckthumbnail";
      deck.appendChild(deckThumbnail);
      this.options = ["Draw", "Shuffle"];
    }
    else if (area == "threadmark") {
    }
    else {
      document.getElementById(area).appendChild(this.domElement);
    }
    this.area = area;
    this.options = options.filter(item => item != `Send to ${this.area}`);
    this.options = options.filter(item => item != `Send to ${this.area}`);
    // Clean up view
    popup.style.display = "none";
    eview.style.display = "none";
  }
}

var card = new Card("Calyx, Weaver of Webs", "1");
var othercard = new Card("some bs", "2");
othercard.sendTo("hand");
