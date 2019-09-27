const express = require('express');
const path = require('path');
const Deck = require('./src/deck');

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
    socket.on('sendCard', function (infos) {
        var index = rooms.findIndex((e) => e.name === socket.room);
        if (index != -1) {
            if (rooms[index].game.table.turno.player == infos.player) {
                var indexUser = rooms[index].game.players.findIndex((e) => e.id == socket.id);
                var carta = rooms[index].game.players[indexUser].cartas[infos.carta];
                rooms[index].game.players[indexUser].cartas.splice(infos.carta, 1);
                rooms[index].game.players[indexUser].numCartas--;
                rooms[index].game.table.centroMesa.push({ playerId: infos.player, carta })
                if (rooms[index].game.table.turno.player != 4) rooms[index].game.table.turno.player++;
                else rooms[index].game.table.turno.player = 1;
                if (rooms[index].game.table.centroMesa.length == 4) {
                    verificaQuemGanhou(index);
                } else {
                    emitCards(index);
                }
            }
        }
    });
    function verificaQuemGanhou(index) {
        var maior = rooms[index].game.table.centroMesa[0];
        var empate = 0;
        var rankCartas = [
            3, 2, 1, 13, 12, 11, 7, 6, 5, 4
        ];
        var rankNaipes = [
            'c', 'h', 's', 'd'
        ]
        for (var i = 1; i < rooms[index].game.table.centroMesa.length; i++) {
            if (rooms[index].game.table.centroMesa[i].carta.value == (rooms[index].game.table.coringa.value + 1) || (rooms[index].game.table.centroMesa[i].carta.value == 1 && rooms[index].game.table.coringa.value == 13) || (rooms[index].game.table.centroMesa[i].carta.value == 11 && rooms[index].game.table.coringa.value == 7)) {//ve se a carta e coringa
                if (maior.carta.value == (rooms[index].game.table.coringa.value + 1) || (maior.carta.value == 1 && rooms[index].game.table.coringa.value == 13) || (maior.carta.value == 11 && rooms[index].game.table.coringa.value == 7)) {//ve se a maior carta tambem é coringa
                    var rankNaipeMaior = rankNaipes.findIndex((e) => e == maior.carta.suit)
                    var rankNaipeAtual = rankNaipes.findIndex((e) => e == rooms[index].game.table.centroMesa[i].carta.suit);
                    if (rankNaipeAtual < rankNaipeMaior) {
                        maior = rooms[index].game.table.centroMesa[i];
                        empate = 0;
                    }
                } else {
                    maior = rooms[index].game.table.centroMesa[i];
                    empate = 0;
                }

            } else {
                var rankMaior = rankCartas.findIndex((e) => e == maior.carta.value);
                var rankAtual = rankCartas.findIndex((e) => e == rooms[index].game.table.centroMesa[i].carta.value);
                if (rankAtual < rankMaior) {
                    maior = rooms[index].game.table.centroMesa[i];
                }
                if (rankAtual == rankMaior) {//n empata mesmo time
                    var indexUserMaior = rooms[index].game.players.findIndex((e) => e.idTurno == maior.playerId);
                    var indexUserAtual = rooms[index].game.players.findIndex((e) => e.idTurno == rooms[index].game.table.centroMesa[i].playerId);
                    if (rooms[index].game.players[indexUserMaior].team != rooms[index].game.players[indexUserAtual].team) {
                        empate = 1;
                    }
                }
            }
        }
        if (empate != 1) {//adiciona o ponto do round
            rooms[index].game.table.turno.player = maior.playerId;
            var indexUser = rooms[index].game.players.findIndex((e) => e.idTurno == maior.playerId);//pegar time do vencedor
            if (rooms[index].game.players[indexUser].team == 'red') {
                rooms[index].game.table.roundPoints.red++;
            } else {
                rooms[index].game.table.roundPoints.blue++;
            }
        } else {
            rooms[index].game.table.roundPoints.empate++;
        }
        emitCards(index);
        setTimeout(function () {
            rooms[index].game.table.centroMesa = [];//limpa mesa
            //verifica se ja acabou o round
            verificaFimRound(index);

        }, 2000);
    }
    function verificaFimRound(index) {
        var endRound = 0;
        if (rooms[index].game.table.roundPoints.empate > 0) {
            if (rooms[index].game.table.roundPoints.red > 0) {
                rooms[index].game.table.teamsPoint.red += rooms[index].game.table.valueTruco;
                endRound = 1;
            }
            if (rooms[index].game.table.roundPoints.blue > 0) {
                rooms[index].game.table.teamsPoint.blue += rooms[index].game.table.valueTruco;
                endRound = 1;
            }
            if (rooms[index].game.table.roundPoints.empate == 3) {
                endRound = 1;
            }
        }
        if (rooms[index].game.table.roundPoints.red == 2) {
            rooms[index].game.table.teamsPoint.red += rooms[index].game.table.valueTruco;
            endRound = 1;
        }
        if (rooms[index].game.table.roundPoints.blue == 2) {
            rooms[index].game.table.teamsPoint.blue += rooms[index].game.table.valueTruco;
            endRound = 1;
        }
        if (endRound == 1) {//acabou o round
            if (rooms[index].game.table.turno.lastStart == rooms[index].max) {//ve o player q comeca o proximo round
                rooms[index].game.table.turno.player = 1;
                rooms[index].game.table.turno.lastStart = 1;
            } else {
                rooms[index].game.table.turno.lastStart++;
                rooms[index].game.table.turno.player = rooms[index].game.table.turno.lastStart;
            }
            var deck = new Deck();
            for (var i = 0; i < rooms[index].max; i++) {//gera novas cartas pros players
                rooms[index].game.players[i].numCartas = 3;
                rooms[index].game.players[i].cartas = [];
                for (var j = 0; j < 3; j++) {
                    rooms[index].game.players[i].cartas.push(deck.deal());
                }
            }
            rooms[index].game.table.coringa = deck.deal();

            rooms[index].game.table.roundPoints.red = 0;
            rooms[index].game.table.roundPoints.blue = 0;
            rooms[index].game.table.roundPoints.empate = 0;
        }
        emitCards(index);
    }
});


server.listen(process.env.PORT || 3000);