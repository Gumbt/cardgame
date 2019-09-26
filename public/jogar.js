var socket = io('http://localhost:3000/');
var username = localStorage['user'];
if (username == '' || username == null) {
    window.location = '/';
}
$(".buttonLogout").click(function () {
    localStorage['user'] = '';
    window.location = '/';
});

var player1 = { x: 0, y: 0 };
var player2 = { x: 0, y: 0 };
const diff = 5;
const pr = document.getElementById("root");

$('#userWelcome strong').text(username)

socket.on('connect', function () {
    socket.emit('adduser', username);
});


socket.on('dispRooms', function (rooms) {
    $('.sv').hide();
    for (room of rooms) {
        $('.servers').append('<div class="sv buttonG buttonServer" onclick=switchRoom("' + room.name + '")>' +
            room.name + '<span class="svStatus">' + room.status + '</span>' + '<span class="spanR">' + room.q + '/' + room.max + '</span></div>')
    }
});


socket.on('ready', function (start) {
    $('.ssv').hide();

    socket.emit('go', true);
    tempoPreJogo(5, function () {
        $('.timer').hide();
        $('.login').hide();
        $('.game').show();
    });

});
function tempoPreJogo(i, callback) {
    callback = callback || function () { };
    var int = setInterval(function () {
        $('.timer strong').text(i);
        $('.timer').show();
        i-- || (clearInterval(int), callback());
    }, 1000);
}

function switchRoom(room) {
    socket.emit('switchRoom', room);
}
socket.on('gameStart', function (game) {
    gameS(game);
})

$('.cards').on('click', '.selectcard', function () {
    if ($(this).hasClass('selected')) {
        alert('mandou a cartas');
    } else {
        $('.selected').removeClass('selected')
        $('.card1').css({ "x-index": "10", "-webkit-transform": "translate(0,0)" });
        $('.card2').css({ "x-index": "11", "-webkit-transform": "translate(0,0)" });
        $('.card3').css({ "x-index": "12", "-webkit-transform": "translate(0,0)" });
        $(this).css({ "-webkit-transform": "translate(0,-20px)" });
        $(this).addClass('selected');
    }
});

function gameS(game) {
    console.log(game);
    if (game.active == true) {
        var myPos;

        for (var i = 0; i < 4; i++) {
            if (game.players[i].isMe == true) {
                $('.myCards .me').text(game.players[i].nome);
                myPos = game.players[i].idTurno;
                if (game.players[i].idTurno == game.turno.player) {
                    $('.myCards .me').addClass('isTurno');
                }
                $('.myCards .cards img').remove();
                for (var j = 0; j < game.players[i].cartas.length; j++) {
                    $('.myCards .cards').append('<img src="./assets/imgs/svg/' + game.players[i].cartas[j].suit + game.players[i].cartas[j].value + '.svg" class="selectcard card' + (j + 1) + '" id="' + (j + 1) + '">')
                }
            }
            if (game.players[i].isMe == false && game.myTeam == game.players[i].team) {
                $('.topPlayer .p3').text(game.players[i].nome);
                if (game.players[i].idTurno == game.turno.player) {
                    $('.topPlayer .p3').addClass('isTurno');
                }
                $('.topPlayer .cards img').remove();
                for (var j = 0; j < game.players[i].numCartas; j++) {
                    $('.topPlayer .cards').append('<img src="./assets/imgs/svg/cardback_' + game.players[i].team + '.svg" >')
                }
            }
        }
        for (var i = 0; i < 4; i++) {//falta arrumar aqui, player saem com mesmo nome
            if (game.players[i].idTurno == (myPos + 1) || (myPos == 4 && game.players[i].idTurno == 1)) {
                $('.rightPlayer .p1').text(game.players[i].nome);
                if (game.players[i].idTurno == game.turno.player) {
                    $('.rightPlayer .p1').addClass('isTurno');
                }
                $('.rightPlayer .cards img').remove();
                for (var j = 0; j < game.players[i].numCartas; j++) {
                    $('.rightPlayer .cards').append('<img src="./assets/imgs/svg/cardback_' + game.players[i].team + '.svg" >')
                }
            }
            if (game.players[i].idTurno == (myPos - 1) || (myPos == 1 && game.players[i].idTurno == 4)) {
                $('.leftPlayer .p2').text(game.players[i].nome);
                if (game.players[i].idTurno == game.turno.player) {
                    $('.leftPlayer .p2').addClass('isTurno');
                }
                $('.leftPlayer .cards img').remove();
                for (var j = 0; j < game.players[i].numCartas; j++) {
                    $('.leftPlayer .cards').append('<img src="./assets/imgs/svg/cardback_' + game.players[i].team + '.svg" >')
                }
            }
        }
        $('.placar .redTeam span').text(game.teamsPoint.red);/// pontuacao
        $('.placar .blueTeam span').text(game.teamsPoint.blue);
        $('.coringa img').attr("src", "./assets/imgs/svg/" + game.coringa.suit + game.coringa.value + ".svg");

        $('.centerCards img').remove();//// centro da mesa
        for (var i = 0; i < game.centroMesa.length; i++) {
            if (game.centroMesa[i].playerId == myPos) {
                $('.centerCards').append('<img src="./assets/imgs/svg/' + game.centroMesa[i].carta.suit + game.centroMesa[i].carta.value + '.svg" class="fromBottomCard">')
            }
            if (game.centroMesa[i].playerId == (myPos - 1) || (myPos == 1 && game.centroMesa[i].playerId == 4)) {
                $('.centerCards').append('<img src="./assets/imgs/svg/' + game.centroMesa[i].carta.suit + game.centroMesa[i].carta.value + '.svg" class="fromLeftCard">')
            }
            if (game.centroMesa[i].playerId == (myPos + 1) || (myPos == 4 && game.centroMesa[i].playerId == 1)) {
                $('.centerCards').append('<img src="./assets/imgs/svg/' + game.centroMesa[i].carta.suit + game.centroMesa[i].carta.value + '.svg" class="fromRightCard">')
            }
            if (game.centroMesa[i].playerId == (myPos - 2) || game.centroMesa[i].playerId == (myPos + 2)) {
                $('.centerCards').append('<img src="./assets/imgs/svg/' + game.centroMesa[i].carta.suit + game.centroMesa[i].carta.value + '.svg" class="fromTopCard">')
            }
        }
    }
}
