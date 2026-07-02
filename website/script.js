const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
  console.log("Connection opened");
}

ws.onmessage = (event) => {
  console.log(event.data);
}
