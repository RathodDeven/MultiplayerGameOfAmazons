const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const app = express();
const server = http.createServer(app);
const io = socketio(server);
app.use(express.static(path.join(__dirname,'..','frontend')))


const {makeid} = require('./utils');
const {userJoin,getUser,userLeave,getRoomUsers} = require('./users');



io.on('connection',client =>{
    
    client.on('newGame', handleNewGame);
    client.on('joinGame', handleJoinGame);
    client.on('makeMove_server',handlemakeMove);
    client.on('makeMoveForBlock_server',handleMakeMoveForBlock);
    client.on('White_won',handleWhite_won);
    client.on('Black_won',handleBlack_won);
    client.on('ChangePlayer',handleChangePlayer);

    function handleChangePlayer(){
        let user = getUser(client.id);
        io.to(user.room)
            .emit('ChangePlayer');

        client.broadcast
            .to(user.room)
            .emit('givePiecesEventListener');
    }

    function handleWhite_won(){
        let user = getUser(client.id)
        io.to(user.room)
            .emit('White_won')
    }
    function handleBlack_won(){
        let user = getUser(client.id);
        io.to(user.room)
            .emit('Black_won')
    }

    function handleMakeMoveForBlock(number){
        let user = getUser(client.id)
        io.to(user.room)
            .emit('makeMoveForBlock_server',number);
    }

    function handlemakeMove(data){
        let user = getUser(client.id);
        io.to(user.room)
            .emit('makeMove_server',data)
        client.emit('y');
    }

    function handleJoinGame({code,name}) {
        let room = code;

        let allUsers;
        console.log(room);
        console.log(name);
        allUsers = getRoomUsers(room);
        console.log(allUsers);

        let numClients = 0;
        numClients = allUsers.length;
        console.log(numClients);

        if (numClients === 0) {
          client.emit('unknownCode');
          return;
        } else if (numClients > 1) {
          client.emit('tooManyPlayers');
          return;
        }
    
        const user = userJoin(client.id,name,room);
        client.emit('gameCode',user.room);
        client.join(user.room);
        client.number = 2;
        client.emit('init', 2);


        client.broadcast
            .to(user.room)
            .emit('givePiecesEventListener')

    }
    
    function handleNewGame(name) {
        let room = makeid(5);
        const user = userJoin(client.id,name,room);
        client.emit('gameCode',user.room);
        client.join(user.room);
        client.number = 1;
        client.emit('init', 1);
    }


    client.on('disconnect',()=>{
        const user = userLeave(client.id);
    })
    
})

const PORT = process.env.PORT || 3000

server.listen(PORT,() => console.log(`Server running on PORT ${PORT}`))