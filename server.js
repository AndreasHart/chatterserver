// server.js
'use strict'
const express = require('express');
const SocketServer = require('ws').Server;
const uuid = require('node-uuid');
// Set the port to 4000
const PORT = 3001;

// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
   .use(express.static('public'))
   .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));



// Create the WebSockets server
const wss = new SocketServer({ server });

//Creat a variable where the number of users is stored
let userNumber = 0;
// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.
wss.on('connection', (ws) => {
  changeUserCount();

  ws.on('message', handleMessage);
  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => {
    changeUserCount();
    console.log('Client disconnected')
  });
});

wss.broadcast = function(data) {
  wss.clients.forEach(function(client) {
    client.send(data);
  });
};

function changeUserCount(){
  let message = {
    type:'userCount',
    value:wss.clients.length
  }
  wss.broadcast(JSON.stringify(message))
}

function handleMessage(message) {

  let newBoard= JSON.parse(message);
  newBoard.id = uuid.v4();
  console.log("clients:", wss.clients.length);



  if( newBoard.type === 'postMsg' ){
    console.log(newBoard.username + " says: " + newBoard.content)
    wss.broadcast(JSON.stringify(newBoard))
  }else if(newBoard.type === 'postNotice'){
    newBoard.content=newBoard.oldname +" changed their name to "+ newBoard.username;
    wss.broadcast(JSON.stringify(newBoard))

  }
};