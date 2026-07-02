const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
  console.log("Connection opened");
}

ws.onmessage = (event) => {
  console.log(event.data);
}

var selected = null;

popup = document.getElementById("popup")
popup.style.display = "none";

// need to make this anywhere except a card
//document.getElementById("play").addEventListener('click', (event) => {
//  console.log(event.target);
//  popup.style.display = "none";
//})

document.addEventListener("keydown", (event) => {
  if (event.key == "Escape") {
    popup.style.display = "none";
  }
});

popup.addEventListener('click', () => {
  console.log(event.target.innerHTML);
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
  constructor(name, area) {
    this.name = name;
    this.area = area;

    this.domElement = document.createElement('div');
    document.getElementById(area).appendChild(this.domElement);
    // here we fetch for card data
    this.domElement.id = "testcard"
    this.domElement.classList.add("card");
    this.image = "https://i.redd.it/jw1pc6irt59d1.png"
    this.domElement.style.backgroundImage = `url(${this.image})`
    this.text = "This card Can't be interacted with by your opponents in any way conceivable by the human mind. When you cast this spell, take as many turns as you may possibly wish for. Flying, protection from the entirety of the electromagnetic spectrum, annihilator N0. When 50 Fucking Emrakuls is put into any zone from the battlefield, its owner is sentenced to execution by guillotine.";
    this.type = "Legendary Creatures";
    this.tribe = "Emrakuls";
    this.health = 750;
    this.attack = 750;
    this.rank = "Captain";
    this.flavor = "The vibrations of battle resonate inside the nest.";
    this.domElement.addEventListener('click', (event) => {
      console.log("activating")
      popup.style.display = "flex";
      popup.style.top = (document.body.offsetHeight>popup.offsetHeight+event.clientY ? event.clientY : document.body.offsetHeight-popup.offsetHeight)+"px";
      popup.style.left = event.clientX+"px";
      selected = this;
    });
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
      <p>Flavour: ${this.flavor}</p>`
    return;
  }
  sendTo(area) {
    if (this.area == area) {
      return;
    }
    document.getElementById(area).appendChild(this.domElement);
    this.area = area
  }
}

var card = new Card("Calyx, Weaver of Webs", "hand");

