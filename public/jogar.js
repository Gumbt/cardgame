var socket = io('http://localhost:3000');
var username = localStorage['user'];
if (username == '' || username == null) {
    window.location = '/';
}

var player1 = { x: 0, y: 0 };
var player2 = { x: 0, y: 0 };
const diff = 5;
const pr = document.getElementById("root");

$('#userWelcome strong').text(username)

socket.on('connect', function () {
    socket.emit('adduser', username);
});


socket.on('dispRooms', function (rooms) {
    $('.sv').remove();
    for (room of rooms) {
        $('.servers').append('<div class="sv" onclick=switchRoom("' + room.name + '")>' +
            room.name + '<span class="svStatus">' + room.status + '</span>' + '<span class="spanR">' + room.q + '/' + room.max + '</span></div>')
    }
});


socket.on('ready', function (start) {
    $('.ssv').remove();

    tempoPreJogo(5, function () {
        socket.emit('go', true);
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
socket.on('gameStart', function (players) {
    $('.timer').remove();
    $('.login').remove();
    $('.game').show();
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
