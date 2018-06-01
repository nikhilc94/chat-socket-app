const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const app = express();

app.use(express.static(path.join(__dirname, '../public')));


// let server = http.createServer((req, res) => {
//    THIS IS EQUIVALENT TO BELOW
// });
const server = http.createServer(app);

const io = socketIO(server);

io.on('connection', socket => {

    console.log('New user connected!');

    socket.emit('newMessage', {
        from: 'mike@example.com',
        text: 'Whats up!!',
        createdAt: 123
    });

    socket.on('createMessage', (newMessage) => {
        console.log('createMessage', newMessage);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected!');
    });

});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server started on port ${port}!`);
});