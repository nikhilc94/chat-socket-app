const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const { generateMessage, generateLocationMessage } = require('./utils/message');
const { isRealString } = require('./utils/validation');
const { Users } = require('./utils/users');


const app = express();

app.use(express.static(path.join(__dirname, '../public')));


// let server = http.createServer((req, res) => {
//    THIS IS EQUIVALENT TO BELOW
// });
const server = http.createServer(app);
const io = socketIO(server);

var users = new Users();

io.on('connection', socket => {

    console.log('New user connected!');

    socket.on('join', (params, callback) => {
        if (!isRealString(params.name) || !isRealString(params.room)) {
            return callback('Name & room name are required!');
        }
        socket.join(params.room);

        users.removeUser(socket.id);
        users.addUser(socket.id, params.name, params.room);

        io.to(params.room).emit('updateUserList', users.getUserList(params.room));
        
        // Sending to the specific client.
        socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app!'));

        // Sending to all clients except sender.
        socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined!`));

        callback();
    });

    socket.on('createMessage', (message, callback) => {

        // Sending to all the sockets.
        io.emit('newMessage', generateMessage(message.from, message.text));
        callback();

    });

    socket.on('createLocationMessage', (coords) => {

        // Sending to all the sockets.
        io.emit('newLocationMessage', generateLocationMessage('User', coords.latitude, coords.longitude))

    });

    socket.on('disconnect', () => {
        var user = users.removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('updateUserList', users.getUserList(user.room));
            io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left the chat!`));
        }
    });

});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server started on port ${port}!`);
});