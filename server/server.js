var WebSocketServer = require('ws').Server;
var uuidv1 = require('uuid/v1');
var connectedClients = [];
var wss = new WebSocketServer({port: 8181});

console.log('WebSocket Chat Server v0.1 by Nicolas Walter');
console.log('--------------------------------------------');
console.log(getCurrentTime()+' line 07: Server online (ws://nwalter:8181)');

function setUserName(request) {
    for(var i = 0; i < connectedClients.length; i++) {
        if(connectedClients[i].uuid === request.uuid) {
            console.log(getCurrentTime()+' line 13: '+request.username+' --> '+request.uuid);
            connectedClients[i].username = request.username;
            break;
        }
    }
}

function getUsernameFromUuid(uuid) {
    for(var i = 0; i < connectedClients.length; i++) {
        console.log(getCurrentTime()+' line 22: ClientArray['+i+'] -> '+connectedClients[i].uuid);
        console.log(getCurrentTime()+' line 23: Compare with -> '+uuid);
        if(connectedClients[i].uuid === uuid) {
            console.log(getCurrentTime()+' line 25: Same, Username = '+connectedClients[i].username);
            return connectedClients[i].username;
        }
    }
}

function sendMsgToAllCliends(message, username) {
    for(var i = 0; i < connectedClients.length; i++) {
        var clientSocket = connectedClients[i].ws;
        if(clientSocket.readyState === 1) {
            console.log(getCurrentTime()+' line 35: Send message from '+username+' to '+connectedClients[i].username);
            clientSocket.send(JSON.stringify({
                username: username,
                message: message
            }));
        } else {
            console.warn(getCurrentTime()+' line 41: User '+connectedClients[i].username+' has disconnected');
        }
    }
}

function removeDisconnectedUsers() {
    connectedClients = connectedClients.filter(function(value) {
        return value.ws.readyState === 1;
    });
}

function refreshNumOfOnlineUsers() {
    console.log(getCurrentTime()+' line 53: Refreshed number of online Users ('+connectedClients.length+' online)');
    for (var i = 0; i < connectedClients.length; i++) {
        var clientSocket = connectedClients[i].ws;
        if(clientSocket.readyState === 1) {
            clientSocket.send(JSON.stringify({
                numOnline: connectedClients.length
            }));
        }
    }
}

wss.on('connection', function (ws) {
    sendMsgToAllCliends('User Connected', 'Server');
    console.log(getCurrentTime()+' line 66: New client connected');
    var uuid = uuidv1();
    connectedClients.push({
        uuid: uuid,
        username: '',
        ws: ws
    });
    ws.send(JSON.stringify({
        uuid: uuid
    }));
    refreshNumOfOnlineUsers();

    ws.on('message', function (message) {
        console.log(getCurrentTime()+' line 79: Got message: '+message);
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
        refreshNumOfOnlineUsers();
        sendMsgToAllCliends('User Disconnected', 'Server');
        console.log(getCurrentTime()+' line 93: Client closed connection, code '+code+': '+reason);
    })
});
function getCurrentTime() {
    var date = new Date();
    return date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()+':'+date.getMilliseconds();
}