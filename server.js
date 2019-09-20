const express = require('express');
const path = require('path');

const  app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use('/', (req, res) => {
    res.render('index.html');
});
var usernames = {};

var rooms = [{name: 'room1', q: 0, max: 2, status: 'waiting...', usersid: [], gameStatus: 1},
            {name: 'room2', q: 0, max: 2, status: 'waiting...', usersid: [], gameStatus: 1},
            {name: 'room3', q: 0, max: 4, status: 'waiting...', usersid: [], gameStatus: 1}];

io.on('connection', socket => {
    console.log(socket.id);
    socket.on('adduser', function(username){
        socket.username = username;

        socket.emit('dispRooms', rooms);
	});
    socket.on('switchRoom', function(newroom){
        console.log(newroom)
        var index2 = rooms.findIndex((e) => e.name === newroom);
        if(index2 != -1){
            if(rooms[index2].q==rooms[index2].max){
                //fullgame
            }else{
                var index = rooms.findIndex((e) => e.name === socket.room);
                if (index != -1){
                    rooms[index].q--;
                    socket.leave(socket.room);
                }
                rooms[index2].q++;
                rooms[index2].usersid.push({id:socket.id,name:socket.username})
                socket.join(newroom);
                socket.room = newroom;
                socket.roomId = index2;
                if(rooms[index2].q==rooms[index2].max){
                    io.in(socket.room).emit('ready', true);
                }
                updateRoom();
                io.emit('dispRooms', rooms);
            }
        }
    });
    socket.on('go', function(){
        var index = rooms.findIndex((e) => e.name === socket.room);     
        io.in(socket.room).emit('gameStart', {players: rooms[index]});
    })


    socket.on('disconnect', function(){
		// remove the username from global usernames list
		delete usernames[socket.username];

        var index = rooms.findIndex((e) => e.name === socket.room);
        if (index != -1){
            rooms[index].q--;
        }
        socket.leave(socket.room);
        updateRoom();
        socket.emit('dispRooms', rooms);
		socket.broadcast.emit('dispRooms', rooms);
	});
    
    function updateRoom(){
        for(room of rooms){
            if(room.q == room.max){
                room.status = 'ready';
            }else{
                room.status = 'waiting...';  
            }
        }
    }
});


server.listen(process.env.PORT || 3000);