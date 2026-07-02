const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
  console.log("Connection opened");
}

ws.onmessage = (event) => {
  console.log(event.data);
}

const bin = document.getElementById("bin");
const popup = document.getElementById("popup")
popup.style.display = "none";
const eview = document.getElementById("expandview")

var selected = null;
var cardDict = {};
var options = ["View","Send to play","Send to hand","Send to bin"]

gameState = {
  "play": [],
  "hand": [],
  "bin": [],
};

function assign(obj, val) {
  cardDict[obj].notes = val;
}

function buildPopup(card, options) {
  popup.replaceChildren();
  var spanOption
  options.forEach((element) => {
    spanOption = document.createElement("span");
    spanOption.innerHTML = element;
    popup.appendChild(spanOption);
  })
}

function cardClick(card) {
  buildPopup(card, card.options);
  popup.style.display = "flex";
  popup.style.top = (document.body.offsetHeight>popup.offsetHeight+event.clientY ? event.clientY : document.body.offsetHeight-popup.offsetHeight)+"px";
  popup.style.left = event.clientX+"px";
  selected = card;
}

// need to make this anywhere except a card
//document.getElementById("play").addEventListener('click', (event) => {
//  console.log(event.target);
//  popup.style.display = "none";
//})

bin.addEventListener('click', () => {
  eview.style.display = "flex";
  gameState["bin"].forEach((element) => {
    eview.appendChild(element.domElement);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key == "Escape") {
    if (popup.style.display == "none") {
      eview.style.display = "none";
    }
    popup.style.display = "none";
  }
});

popup.addEventListener('click', () => {
  //console.log(event.target.innerHTML);
  if (event.target.innerHTML == "View") {
    selected.view();
  }
  if (event.target.innerHTML == "Send to play") {
    selected.sendTo("play");
  }
  else if (event.target.innerHTML == "Send to hand") {
    selected.sendTo("hand");
  }
  else if (event.target.innerHTML == "Send to bin") {
    selected.sendTo("bin");
  }
  popup.style.display = "none";
})
class Card {
  constructor(name, id) {
    // Card Daata
    this.area = "hand";
    this.known = true;
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
    this.domElement.onclick = () => cardClick(this);
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
    // Probably don't need this but just in case
    if (this.area == area) {
      return;
    }
    // Get rid of previous thumbnail
    if (this.area == "bin") {
      bin.removeChild(bin.firstChild);
    }

    // Populate new thumbnail
    if (area == "bin") {
      document.getElementById(this.area).removeChild(this.domElement);
      var binThumbnail = document.createElement("div");
      binThumbnail.style.backgroundImage = `url(${this.image})`;
      binThumbnail.className = "card";
      bin.appendChild(binThumbnail);
    }
    else {
      document.getElementById(area).appendChild(this.domElement);
    }
    
    // Update game state and this card's area
    gameState[this.area].splice(gameState[this.area].indexOf(this),1)
    gameState[area].push(this);
    this.area = area;
    this.options = options.filter(item => item != `Send to ${this.area}`);

    // Clean up view
    popup.style.display = "none";
    eview.style.display = "none";
  }
}

var card = new Card("Calyx, Weaver of Webs", "1");
var othercard = new Card("some bs", "2");
