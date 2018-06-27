var socket = io();

function scrollToBottom() {
    
    // Selectors 
    var messages = $('#messages');
    var newMessage = messages.children('li:last-child');

    // Heights
    var clientHeight = messages.prop('clientHeight');
    var scrollTop = messages.prop('scrollTop');
    var scrollHeight = messages.prop('scrollHeight');
    var newMessageHeight = newMessage.innerHeight();
    var lastMessageHeight = newMessage.prev().innerHeight();

    if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
        messages.scrollTop(scrollHeight);
    }

};

socket.on('connect', function () {
    console.log('Connected to server!')
});

socket.on('disconnect', function () {
    console.log('Disconnected from the server!');
});

// On newMessage event, append the message as a 'li' item to 'ol'
socket.on('newMessage', function (message) {

    var formattedTime = moment(message.createdAt).format('h:mm a');
    var template = $('#message-template').html();
    var html = Mustache.render(template, {
        text: message.text,
        from: message.from,
        createdAt: formattedTime
    });

    $('#messages').append(html);
    scrollToBottom();

});

socket.on('newLocationMessage', function (message) {

    var formattedTime = moment(message.createdAt).format('h:mm a');
    var template = $('#location-message-template').html();
    var html = Mustache.render(template, {
        url: message.url,
        from: message.from,
        createdAt: formattedTime
    });

    $('#messages').append(html);
    scrollToBottom();

});

// On form submit, emit createMessage event with form data.
$('#message-form').on('submit', function (e) {

    e.preventDefault();

    var messageTextbox = $('[name=message]')

    socket.emit('createMessage', {
        from: 'User',
        text: messageTextbox.val()
    }, function () {
        messageTextbox.val('');
    });

});

// Geolocation logic.
var locationButton = $('#send-location');
locationButton.on('click', function () {
    if (!navigator.geolocation) {
        return alert('Geolocation not supported by your browser');
    }

    locationButton.attr('disabled', 'disabled').text('Sending location...')

    navigator.geolocation.getCurrentPosition(function (position) {
        locationButton.removeAttr('disabled').text('Send location');
        socket.emit('createLocationMessage', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        });
    }, function (params) {
        locationButton.removeAttr('disabled').text('Send location');
        alert('Unable to fetch location!');
    });
});