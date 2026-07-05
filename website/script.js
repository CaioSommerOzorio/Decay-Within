const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
  console.log("Connection opened");
};

ws.onmessage = (event) => {
  console.log(event.data);
};

const cardBack = "https://i.pinimg.com/736x/80/4f/9a/804f9abe92c8e214a0ecb51d4c151059.jpg";
const bin = document.getElementById("bin");
const obin = document.getElementById("obin")
const eview = document.getElementById("expandview");
const deck = document.getElementById("deck");
const odeck = document.getElementById("odeck");
const hand = document.getElementById("hand")
const ohand = document.getElementById("ohand");
const energy = document.getElementById("energy");
const core = document.getElementById("core");
const control = document.getElementById("control");
const oenergy = document.getElementById("oenergy");
const ocore = document.getElementById("ocore");
const ocontrol = document.getElementById("ocontrol");
const popup = document.getElementById("popup");
popup.style.display = "none";

var selected = null;
var cardDict = {};
var options = ["View","Send to energy","Send to core","Send to control","Send to hand","Send to bin","Send to deck","Threadmark"];

var gameState = {
  "energy": [],
  "core": [],
  "control": [],
  "oenergy": [],
  "ocore": [],
  "ocontrol": [],
  "hand": [],
  "ohand": [],
  "deck": [],
  "odeck": [],
  "bin": [],
  "obin": [],
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
      event.target.innerHTML != "Threadmarked" &&
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
    case "Send to energy":
      selected.sendTo("energy");
      break;
    case "Send to core":
      selected.sendTo("core");
      break;
    case "Send to control":
      selected.sendTo("control");
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

    if (this.area == "energy") {
      energy.lastChild.remove();
      if (gameState.energy.length > 0) {
        var energyThumbnail = document.createElement("div");
        energyThumbnail.style.backgroundImage = `url(${gameState['energy'].at(-1).image})`;
        energyThumbnail.className = "card";
        energyThumbnail.id = "energythumbnail";
        energy.appendChild(energyThumbnail);
      }
    }

    if (this.area == "oenergy") {
      oenergy.lastChild.remove();
      if (gameState.oenergy.length > 0) {
        var oenergyThumbnail = document.createElement("div");
        oenergyThumbnail.style.backgroundImage = `url(${gameState['oenergy'].at(-1).image})`;
        oenergyThumbnail.className = "card";
        oenergyThumbnail.id = "oenergythumbnail";
        oenergy.appendChild(oenergyThumbnail);
      }
    }

    if (this.area == "core") {
      core.lastChild.remove();
      if (gameState.core.length > 0) {
        var coreThumbnail = document.createElement("div");
        coreThumbnail.style.backgroundImage = `url(${gameState['core'].at(-1).image})`;
        coreThumbnail.className = "card";
        coreThumbnail.id = "corethumbnail";
        core.appendChild(coreThumbnail);
      }
    }

    if (this.area == "ocore") {
      ocore.lastChild.remove();
      if (gameState.ocore.length > 0) {
        var ocoreThumbnail = document.createElement("div");
        ocoreThumbnail.style.backgroundImage = `url(${gameState['ocore'].at(-1).image})`;
        ocoreThumbnail.className = "card";
        ocoreThumbnail.id = "ocorethumbnail";
        ocore.appendChild(ocoreThumbnail);
      }
    }

    if (this.area == "control") {
      control.lastChild.remove();
      if (gameState.control.length > 0) {
        var controlThumbnail = document.createElement("div");
        controlThumbnail.style.backgroundImage = `url(${gameState['control'].at(-1).image})`;
        controlThumbnail.className = "card";
        controlThumbnail.id = "controlthumbnail";
        control.appendChild(controlThumbnail);
      }
    }

    if (this.area == "ocontrol") {
      ocontrol.lastChild.remove();
      if (gameState.ocontrol.length > 0) {
        var ocontrolThumbnail = document.createElement("div");
        ocontrolThumbnail.style.backgroundImage = `url(${gameState['ocontrol'].at(-1).image})`;
        ocontrolThumbnail.className = "card";
        ocontrolThumbnail.id = "ocontrolthumbnail";
        ocontrol.appendChild(ocontrolThumbnail);
      }
    }

    if (this.area == "bin") {
      bin.lastChild.remove();
      if (gameState.bin.length > 0) {
        var binThumbnail = document.createElement("div");
        binThumbnail.style.backgroundImage = `url(${gameState['bin'].at(-1).image})`;
        binThumbnail.className = "card";
        binThumbnail.id = "binthumbnail";
        bin.appendChild(binThumbnail);
      }
    }

    if (this.area == "obin") {
      obin.lastChild.remove();
      if (gameState["obin"].length > 0) {
        var obinThumbnail = document.createElement("div");
        obinThumbnail.style.backgroundImage = `url(${gameState['bin'].at(-1).image})`;
        obinThumbnail.className = "card";
        obinThumbnail.id = "obinthumbnail";
        obin.appendChild(obinThumbnail);
      }
    }

    if (this.area == "deck") {
      this.domElement.style.backgroundImage = `url(${this.image})`;
      this.known = true;
      if (gameState["deck"].length == 0) {
        deck.lastChild.remove();
      }
    }

    if (this.area == "odeck") {
      this.domElement.style.backgroundImage = `url(${this.image})`;
      this.known = true;
      if (gameState["odeck"].length == 0) {
        odeck.lastChild.remove();
      }
    }

    if (["hand","ohand"].includes(this.area)) {
      document.getElementById(this.area).removeChild(this.domElement);
    }

    if (this.area == "threadmark") {
      this.domElement.replaceChildren();
    }

    if (area == "bin") {
      if (bin.lastChild) {
        bin.lastChild.remove()
      }
      binThumbnail = document.createElement("div");
      binThumbnail.style.backgroundImage = `url(${this.image})`;
      binThumbnail.className = "card";
      binThumbnail.id = "binthumbnail";
      bin.appendChild(binThumbnail);
    }

    else if (area == "obin") {
      if (obin.lastChild) {
        obin.lastChild.remove()
      }
      obinThumbnail = document.createElement("div");
      obinThumbnail.style.backgroundImage = `url(${this.image})`;
      obinThumbnail.className = "card";
      obinThumbnail.id = "obinthumbnail";
      obin.appendChild(obinThumbnail);
    }
    else if (area == "energy") {
      if (energy.lastChild) {
        energy.lastChild.remove()
      }
      energyThumbnail = document.createElement("div");
      energyThumbnail.style.backgroundImage = `url(${this.image})`;
      energyThumbnail.className = "card";
      energyThumbnail.id = "energythumbnail";
      energy.appendChild(energyThumbnail);
    }

    else if (area == "oenergy") {
      if (oenergy.lastChild) {
        oenergy.lastChild.remove()
      }
      oenergyThumbnail = document.createElement("div");
      oenergyThumbnail.style.backgroundImage = `url(${this.image})`;
      oenergyThumbnail.className = "card";
      oenergyThumbnail.id = "oenergythumbnail";
      oenergy.appendChild(oenergyThumbnail);
    }
    else if (area == "core") {
      if (core.lastChild) {
        core.lastChild.remove()
      }
      coreThumbnail = document.createElement("div");
      coreThumbnail.style.backgroundImage = `url(${this.image})`;
      coreThumbnail.className = "card";
      coreThumbnail.id = "corethumbnail";
      core.appendChild(coreThumbnail);
    }

    else if (area == "ocore") {
      if (ocore.lastChild) {
        ocore.lastChild.remove()
      }
      ocoreThumbnail = document.createElement("div");
      ocoreThumbnail.style.backgroundImage = `url(${this.image})`;
      ocoreThumbnail.className = "card";
      ocoreThumbnail.id = "ocorethumbnail";
      ocore.appendChild(ocoreThumbnail);
    }
    else if (area == "control") {
      if (control.lastChild) {
        control.lastChild.remove()
      }
      controlThumbnail = document.createElement("div");
      controlThumbnail.style.backgroundImage = `url(${this.image})`;
      controlThumbnail.className = "card";
      controlThumbnail.id = "controlthumbnail";
      control.appendChild(controlThumbnail);
    }

    else if (area == "ocontrol") {
      if (ocontrol.lastChild) {
        ocontrol.lastChild.remove()
      }
      ocontrolThumbnail = document.createElement("div");
      ocontrolThumbnail.style.backgroundImage = `url(${this.image})`;
      ocontrolThumbnail.className = "card";
      ocontrolThumbnail.id = "ocontrolthumbnail";
      ocontrol.appendChild(ocontrolThumbnail);
    }
    else if (area == "odeck") {
      if (odeck.lastChild) {
        odeck.lastChild.remove();
      }
      this.known = false;
      this.domElement.style.backgroundImage = `url(${cardBack})`
      var odeckThumbnail = document.createElement("div");
      odeckThumbnail.style.backgroundImage = `url(${cardBack})`
      odeckThumbnail.className = "card";
      odeckThumbnail.id = "odeckthumbnail";
      odeck.appendChild(odeckThumbnail);
      this.options = ["Draw", "Shuffle"];
    }

    else if (area == "deck") {
      if (deck.lastChild) {
        deck.lastChild.remove();
      }
      this.known = false;
      this.domElement.style.backgroundImage = `url(${cardBack})`
      var deckThumbnail = document.createElement("div");
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
    if (area == "ohand") {
      console.log("hand")
      this.known = false;
      this.domElement.style.backgroundImage = `url(${cardBack})`
    }
    this.area = area;
    this.options = options.filter(item => item != `Send to ${this.area}`);
    // Clean up view
    popup.style.display = "none";
    eview.style.display = "none";
  }
}

var card = new Card("Calyx, Weaver of Webs", "1");
var othercard = new Card("some bs", "2");
othercard.sendTo("hand");
