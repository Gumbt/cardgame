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

$('.selectcard').click(function () {
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
        $('.rightPlayer .p1').text(game.players[0].nome);
        $('.leftPlayer .p2').text(game.players[1].nome);
        $('.topPlayer .p3').text(game.players[2].nome);
        $('.myCards .me').text(game.players[3].nome);
    }
}
