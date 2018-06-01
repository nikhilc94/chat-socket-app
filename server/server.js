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

    socket.on('createMessage', (message) => {

        socket.emit('newMessage', {
            from: 'Admin',
            text: 'Welcome to the chat app!',
            createdAt: new Date().getTime()
        });

        socket.broadcast.emit('newMessage', {
            from: 'Admin',
            text: `New user joined!`,
            createdAt: new Date().getTime()
        });
        
        io.emit('newMessage', {
            from: message.from,
            text: message.text,
            createdAt: new Date().getTime()
        });

        // socket.broadcast.emit('newMessage', {
        //     from: message.from,
        //     text: message.text,
        //     createdAt: new Date().getTime()
        // })

    });

    socket.on('disconnect', () => {
        console.log('User disconnected!');
    });

});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server started on port ${port}!`);
});