var socket = io('https://casigumb.herokuapp.com/');
var username = localStorage['user'];
if (username == '' || username == null) {
    window.location = '/';
}
$(".buttonLogout").click(function () {
    localStorage['user'] = '';
    window.location = '/';
});
var turno = 0;
var myPos = 0;
var myTeam = '';
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

function pedirTruco(valueI) {
    socket.emit('pedirTruco', { value: parseInt(valueI) });
}

function statusMaoOnze(valueI) {
    socket.emit('statusMaoOnze', { value: parseInt(valueI) });
}

$('.cards').on('click', '.selectcard', function () {
    if ($(this).hasClass('selected')) {
        if (turno == 1 && myPos != 0) {
            var carta = parseInt($(this).attr('id')) - 1;
            socket.emit('sendCard', { player: myPos, carta });
        }
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
        if (game.endGame == true) {
            $('.trucoShowEndGame').show();
            if (game.teamsPoint.redTeam >= 12) {
                $('.endGame .textStatus').html("<span class='redTT'>TIME VERMELHO VENCEU! " + game.teamsPoint.red + " - " + game.teamsPoint.blue + "</span> ");
            } else {
                $('.endGame .textStatus').html("<span class='blueTT'>TIME AZUL VENCEU! " + game.teamsPoint.blue + " - " + game.teamsPoint.red + "</span> ");
            }
        } else {
            $('.trucoShowNotify').hide();
            if (game.requestTruco.requested == true) {//verifica pedido de truco
                if (game.requestTruco.status != 'Aceitamos' && game.requestTruco.status != 'Vamos correr') {
                    $('.notify .text').html("<span class='" + game.requestTruco.by + "TT'>" + game.requestTruco.playerName + ":</span> " + game.requestTruco.status);
                } else {
                    $('.notify .text').html("<span class='" + game.requestTruco.to + "TT'>" + game.requestTruco.playerName + ":</span> " + game.requestTruco.status);
                }
                $('.textStatus div').remove();
                for (var i = 0; i < game.requestTruco.votosCont; i++) {
                    $('.textStatus').append('<div><span class="' + game.requestTruco.to + 'TT">' + game.requestTruco.votacao[i].player + ':</span> ' + game.requestTruco.votacao[i].text + '</div>');
                }
                $('.notify .buttonGroup button').remove();
                $('.trucoShowNotify').show();
                if (game.requestTruco.status != 'Aceitamos' && game.requestTruco.status != 'Vamos correr') {
                    if (myTeam == game.requestTruco.to) {
                        if (game.requestTruco.value < 12) {
                            $('.notify .buttonGroup').append('<button class="botao buttonG pedirTruco" onClick="pedirTruco(1)">PEDIR ' + (game.requestTruco.value + 3) + '!</button>');
                        }
                        $('.notify .buttonGroup').append('<button class="botao buttonG pedirTruco" onClick="pedirTruco(2)">ACEITAR</button>');
                        $('.notify .buttonGroup').append('<button class="botao buttonG pedirTruco" onClick="pedirTruco(3)">CORRER</button>');
                    }
                }

            } else {
                $('.decideMaoOnze').hide();
                if (game.onze.maoOnzeStatus == 'decide') {
                    $('.decideMaoOnze').show();
                    $('.textStatusMaoOnze div').remove();
                    for (var i = 0; i < game.onze.votosCont; i++) {
                        $('.textStatusMaoOnze').append('<div><span class="' + game.onze.maoOnze + 'TT">' + game.onze.votacao[i].player + ':</span> ' + game.onze.votacao[i].text + '</div>');
                    }
                    if (game.onze.maoOnze == myTeam) {
                        $('.maoNotify .text').html("<span class='" + game.onze.maoOnze + "TT'>Time " + game.onze.maoOnze + ":</span> " + game.onze.message);
                        var cont = 1;
                        for (var i = 0; i < 4; i++) {
                            if (game.players[i].team == game.onze.maoOnze) {
                                $('.maoNotify .cardGroup' + cont + ' .cartas img').remove();
                                $('.maoNotify .cardGroup' + cont + ' span').remove();
                                for (var j = 0; j < game.players[i].numCartas; j++) {
                                    $('.maoNotify .cardGroup' + cont + ' .cartas').append('<img src="./assets/imgs/svg/' + game.players[i].cartas[j].suit + game.players[i].cartas[j].value + '.svg">');
                                }
                                if (myPos == game.players[i].idTurno) {
                                    $('.maoNotify .cardGroup' + cont).prepend("<span>Suas cartas:</span>");
                                } else {
                                    $('.maoNotify .cardGroup' + cont).prepend("<span>Cartas de seu companheiro:</span>");
                                }
                                cont++;
                            }
                        }
                        $('.maoNotify .buttonGroup button').remove();
                        if (game.onze.message != 'Vamos correr' && game.onze.message != 'Aceitamos a mão de onze') {
                            $('.maoNotify .buttonGroup').append('<button class="botao buttonG pedirTruco" onClick="statusMaoOnze(1)">ACEITAR</button>');
                            $('.maoNotify .buttonGroup').append('<button class="botao buttonG pedirTruco" onClick="statusMaoOnze(2)">CORRER</button>');
                        }
                    } else {
                        $('.maoNotify .buttonGroup button').remove();
                        $('.maoNotify .text').html("<span class='" + game.onze.maoOnze + "TT'>Time " + game.onze.maoOnze + ":</span> Estamos decidindo mão de onze");
                    }
                }

                turno = 0;
                $('.isTurno').removeClass('isTurno');
                for (var i = 0; i < 4; i++) {
                    if (game.players[i].isMe == true) {
                        $('.myCards .me').text(game.players[i].nome);
                        $('.myCards .me').addClass(game.players[i].team);
                        myPos = game.players[i].idTurno;
                        myTeam = game.players[i].team;
                        if (game.players[i].idTurno == game.turno.player) {
                            turno = 1;
                            $('.myCards .me').addClass('isTurno');
                        }
                        $('.myCards .cards img').remove();
                        if (game.onze.maoOnze == 'ambos') {
                            for (var j = 0; j < game.players[i].numCartas; j++) {
                                $('.myCards .cards').append('<img src="./assets/imgs/svg/cardback_' + game.players[i].team + '.svg" class="selectcard card' + (j + 1) + '" id="' + (j + 1) + '">')
                            }
                        } else {
                            for (var j = 0; j < game.players[i].cartas.length; j++) {
                                $('.myCards .cards').append('<img src="./assets/imgs/svg/' + game.players[i].cartas[j].suit + game.players[i].cartas[j].value + '.svg" class="selectcard card' + (j + 1) + '" id="' + (j + 1) + '">')
                            }

                        }
                    }
                    if (game.players[i].isMe == false && game.myTeam == game.players[i].team) {
                        $('.topPlayer .p3').text(game.players[i].nome);
                        $('.topPlayer .p3').addClass(game.players[i].team);
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
                        $('.rightPlayer .p1').addClass(game.players[i].team);
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
                        $('.leftPlayer .p2').addClass(game.players[i].team);
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

                $('.placarRound .redTeamRound span').text(game.roundPoints.red);
                $('.placarRound .blueTeamRound span').text(game.roundPoints.blue);
                $('.placarRound .empateRound span').text(game.roundPoints.empate);

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
    }
}
