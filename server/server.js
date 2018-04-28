var WebSocketServer = require('ws').Server;
var uuidv1 = require('uuid/v1');

var connectedClients = [];
var wss = new WebSocketServer({port: 8181});

function setUserName(request) {
    for(var i = 0; i < connectedClients.length; i++) {
        if(connectedClients[i].uuid === request.uuid) {
            console.log('10: '+request.username+' --> '+request.uuid);
            connectedClients[i].username = request.username;
            break;
        }
    }
}

function getUsernameFromUuid(uuid) {
    for(var i = 0; i < connectedClients.length; i++) {
        console.log('19: ClientArray['+i+'] -> '+connectedClients[i].uuid);
        console.log('20: Compare with -> '+uuid);
        if(connectedClients[i].uuid === uuid) {
            console.log('22: Same, Username = '+connectedClients[i].username);
            return connectedClients[i].username;
        }
    }
}

function sendMsgToAllCliends(message, username) {
    for(var i = 0; i < connectedClients.length; i++) {
        var clientSocket = connectedClients[i].ws;
        if(clientSocket.readyState === 1) {
            console.log("32: Send message from "+username+" to "+connectedClients[i].username);
            clientSocket.send(JSON.stringify({
                username: username,
                message: message
            }));
        } else {
            console.warn('38: User '+connectedClients[i].username+' has disconnected');
        }
    }
}

function removeDisconnectedUsers() {
    connectedClients = connectedClients.filter(function(value) {
        return value.ws.readyState === 1;
    });
}

wss.on('connection', function (ws) {
    console.log('50: New client connected');
    var uuid = uuidv1();
    connectedClients.push({
        uuid: uuid,
        username: '',
        ws: ws
    });
    ws.send(JSON.stringify({
        uuid: uuid
    }));

    ws.on('message', function (message) {
        console.log('62: Got message: '+message);
        var request = JSON.parse(message);
        if(request.message === undefined) {
            setUserName(request);
        } else {
            var username = getUsernameFromUuid(request.uuid);
            sendMsgToAllCliends(request.message, username);
        }
    });

    ws.on('close', function (code, reason) {
        removeDisconnectedUsers();
        console.log('74: Client closed connection, code '+code+': '+reason);
    })
});