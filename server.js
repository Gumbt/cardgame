const express = require('express');
const path = require('path');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const Game = require('./src/game');

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use('/', (req, res) => {
    res.render('index.html');
});
app.use('/jogar', (req, res) => {
    res.render('jogar.html');
});

var rooms = [{ name: 'room1', q: 0, max: 4, status: 'waiting...', usersid: [], usersname: [], game: { active: false }, gameStatus: 1 },
{ name: 'room2', q: 0, max: 4, status: 'waiting...', usersid: [], usersname: [], game: { active: false }, gameStatus: 1 },
{ name: 'room3', q: 0, max: 4, status: 'waiting...', usersid: [], usersname: [], game: { active: false }, gameStatus: 1 }];

io.on('connection', socket => {
    console.log(socket.id);
    socket.on('adduser', function (username) {
        socket.username = username;

        socket.emit('dispRooms', rooms);
    });
    socket.on('switchRoom', function (newroom) {
        var index2 = rooms.findIndex((e) => e.name === newroom);
        if (index2 != -1) {
            if (rooms[index2].q == rooms[index2].max) {
                //fullgame
            } else {
                var index = rooms.findIndex((e) => e.name === socket.room);
                if (index != -1) {
                    rooms[index].q--;
                    socket.leave(socket.room);
                }
                if (rooms[index2].gameStatus == 2) {//se o jogo tiver ativo adiciona o id
                    var playerIndex = rooms[index2].game.players.findIndex((e) => e.id == '');

                    if (playerIndex != -1) {
                        rooms[index2].game.players[playerIndex].id = socket.id;
                        rooms[index2].game.players[playerIndex].nome = socket.username;
                        emitCards(index2);
                    }

                }
                rooms[index2].q++;
                rooms[index2].usersid.push(socket.id);
                rooms[index2].usersname.push(socket.username);
                socket.join(newroom);
                socket.room = newroom;
                socket.roomId = index2;
                if (rooms[index2].q == rooms[index2].max) {
                    io.in(socket.room).emit('ready', true);
                }
                updateRoom();
                io.emit('dispRooms', rooms);
            }
        }
    });
    socket.on('go', function () {
        var index = rooms.findIndex((e) => e.name === socket.room);
        rooms[index].readyCont++;
        if (rooms[index].gameStatus != 2) {
            rooms[index].gameStatus = 2;
            rooms[index].status = 'IN GAME';
            rooms[index] = { ...rooms[index], ...new Game(rooms[index].usersname, rooms[index].usersid) };
        }
        emitCards(index);
        io.emit('dispRooms', rooms);
    });
    function emitCards(index) {
        for (var j = 0; j < 4; j++) {
            var privatePlayers = [];
            for (var i = 0; i < 4; i++) {
                if (rooms[index].game.players[i].id == rooms[index].game.players[j].id) {//entra aki se for eu
                    privatePlayers.push({
                        isMe: true,
                        ...rooms[index].game.players[i]
                    });
                } else {
                    privatePlayers.push({
                        isMe: false,
                        idTurno: rooms[index].game.players[i].idTurno,
                        nome: rooms[index].game.players[i].nome,
                        id: rooms[index].game.players[i].id,
                        team: rooms[index].game.players[i].team,
                        numCartas: rooms[index].game.players[i].numCartas,
                    })
                }
            }
            var removeCards = {
                active: true,
                myTeam: rooms[index].game.players[j].team,
                ...rooms[index].game.table,
                players: privatePlayers
            }
            io.to(`${rooms[index].game.players[j].id}`).emit('gameStart', removeCards);
        }
    }


    socket.on('disconnect', function () {
        var index = rooms.findIndex((e) => e.name === socket.room);
        if (index != -1) {
            rooms[index].q--;
            if (rooms[index].q == 0) {
                rooms[index].gameStatus = 1;
                rooms[index].status = 'waiting...';
                rooms[index].game = { active: false };
            }
            if (rooms[index].gameStatus == 2) {//se o jogo tiver ativo remove o id
                for (var i = 0; i < 4; i++) {
                    if (rooms[index].game.players[i].id == socket.id) {
                        rooms[index].game.players[i].id = '';
                    }
                }
            }
            var indexUser = rooms[index].usersid.findIndex((e) => e == socket.id);
            rooms[index].usersid.splice(indexUser, 1);
            rooms[index].usersname.splice(indexUser, 1);
            socket.leave(socket.room);
            updateRoom();
        }
        io.emit('dispRooms', rooms);
    });

    function updateRoom() {
        for (room of rooms) {
            if (room.gameStatus != 2) {
                if (room.q == room.max) {
                    room.status = 'ready';
                } else {
                    room.status = 'waiting...';
                }
            }
        }
    }
});


server.listen(process.env.PORT || 3000);