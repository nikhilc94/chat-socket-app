const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const { generateMessage } = require('./utils/message');

const app = express();

app.use(express.static(path.join(__dirname, '../public')));


// let server = http.createServer((req, res) => {
//    THIS IS EQUIVALENT TO BELOW
// });
const server = http.createServer(app);

const io = socketIO(server);

io.on('connection', socket => {

    console.log('New user connected!');

    socket.emit('newMessage',
        generateMessage('Admin', 'Welcome to the chat app!')
    );

    socket.broadcast.emit('newMessage',
        generateMessage('Admin', 'New user joined!')
    );

    socket.on('createMessage', (message, callback) => {
    
        io.emit('newMessage', generateMessage(message.from, message.text));
        callback('This is from the server');

    });

    socket.on('disconnect', () => {
        console.log('User disconnected!');
    });

});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server started on port ${port}!`);
});