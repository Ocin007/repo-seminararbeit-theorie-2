console.log('WebSocket Chat Server v0.1 by Nicolas Walter');
console.log('--------------------------------------------');
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({port: 8181});
var gameNotStartetYet = true;
var interval;
var player1 = {
    ws: null,
    pos: null
};
var player2 = {
    ws: null,
    pos: null
};
var size = {
    x: 710,
    y: 370
};
var data = {
    type: 'pong-pos',
    x: size.x/2,
    y: size.y/2,
    pointsP1: 0,
    pointsP2: 0
};
var speed = {
    x: 3,
    y: 2
};
function calcMovement() {
    if(!bothReady()) {
        clearInterval(interval);
        if(player1.ws !== null) {
            if(player1.ws.readyState !== 1) {
                console.log(getCurrentTime()+' Player1 left the Game');
                player1.ws = null;
                player1.pos = null;
            }
        }
        if(player2.ws !== null) {
            if (player2.ws.readyState !== 1) {
                console.log(getCurrentTime() + ' Player2 left the Game');
                player2.ws = null;
                player2.pos = null;
            }
        }
        return;
    }
    calcMoves();
}

function calcMoves() {
    var pos1 = player1.pos;
    var pos2 = player2.pos;

    var newX = data.x+speed.x;
    var newY = data.y+speed.y;

    var leftBool = newX <= 0 && newY > 0 && newY < size.y;
    var rightBool = newX >= size.x && newY > 0 && newY < size.y;
    var topBool = newX > 0 && newX < size.x && newY <= 0;
    var bottomBool = newX > 0 && newX < size.x && newY >= size.y;

    var corner_lo = newX <= 0 && newY <= 0;
    var corner_ru = newX > size.x && newY > size.y;
    var corner_lu = newX <= 0 && newY > size.y;
    var corner_ro = newX > size.x && newY <= 0;

    var boolResetPong = false;
    //links oder rechts
    if ((leftBool) || (rightBool)) {
        speed.x *= -1;
        if(leftBool) {
            boolResetPong = calcPoints(pos1, 'pointsP2');
        } else {
            boolResetPong = calcPoints(pos2, 'pointsP1');
        }

        //oben oder unten
    } else if ((topBool) || (bottomBool)) {
        speed.y *= -1;

        //genau ecke: l.o, r.u, l.u, r.o
    } else if((corner_lo) || (corner_ru) || (corner_lu) || (corner_ro)) {
        speed.x *= -1;
        speed.y *= -1;
        if(corner_lo || corner_lu) {
            boolResetPong = calcPoints(pos1, 'pointsP2');
        } else {
            boolResetPong = calcPoints(pos2, 'pointsP1');
        }
    }

    if(!boolResetPong) {
        data.x += speed.x;
        data.y += speed.y;
    } else {
        data.x = size.x/2;
        data.y = size.y/2;
        speed.x *= -1;
    }
    if(player1.ws !== null) {
        if(player1.ws.readyState === 1) {
            player1.ws.send(JSON.stringify(data));
        }
    }
    if(player2.ws !== null) {
        if(player2.ws.readyState === 1) {
            player2.ws.send(JSON.stringify(data));
        }
    }
}

function calcPoints(pos, player) {
    if(!(pos+100 > data.y && pos-30 < data.y)) {
        data[player] += 1;
        console.log(getCurrentTime()+' player('+pos+') pong('+data.y+') -> Point for '+player+'('+data[player]+')');
        return true;
    }
    console.log(getCurrentTime()+' player('+pos+') pong('+data.y+') -> '+player+' hits');
    return false;
}

function startGame() {
    var actualTime = Math.ceil(new Date().getTime()/1000);
    var timestamp = Math.ceil(new Date().getTime()/1000)+5;
    var diff = timestamp-actualTime;
    var oldDiff = diff;
    while(diff > 0) {
        actualTime = Math.ceil(new Date().getTime()/1000);
        diff = timestamp-actualTime;
        if(oldDiff !== diff) {
            console.log(getCurrentTime()+' Countdown: '+diff);
            oldDiff = diff;
            if(player1.ws !== null) {
                if(player1.ws.readyState === 1) {
                    player1.ws.send(JSON.stringify({
                        type: 'countdown',
                        value: diff
                    }));
                }
            }
            if(player2.ws !== null) {
                if(player2.ws.readyState === 1) {
                    player2.ws.send(JSON.stringify({
                        type: 'countdown',
                        value: diff
                    }));
                }
            }
        }
    }
    interval = setInterval(calcMovement, 10);
}

function bothReady() {
    if(player1.ws !== null && player2.ws !== null) {
        return player1.ws.readyState === 1 && player2.ws.readyState === 1;
    }
    return false;
}

function setPlayerPos(player, pos) {
    if(player === 1) {
        if(player2.ws !== null) {
            if(player2.ws.readyState === 1) {
                player1.pos = pos;
                player2.ws.send(JSON.stringify({
                    type: 'player-pos',
                    pos: pos
                }));
            }
        }
    } else if(player === 2) {
        if(player1.ws !== null) {
            if(player1.ws.readyState === 1) {
                player2.pos = pos;
                player1.ws.send(JSON.stringify({
                    type: 'player-pos',
                    pos: pos
                }));
            }
        }
    }
}

wss.on('connection', function (ws) {
    var type;
    var player;
    var message;
    if(player1.ws === null || player1.ws.readyState !== 1) {
        player1.ws = ws;
        type = 'connected';
        player = 1;
    } else if(player2.ws === null || player2.ws.readyState !== 1) {
        player2.ws = ws;
        type = 'connected';
        player = 2;
    } else {
        type = 'warning';
        message = 'server full';
    }
    console.log(getCurrentTime()+' player'+player+'');

    ws.on('message', function (message) {
        var request = JSON.parse(message);
        switch(request.type) {
            case 'set': setPlayerPos(player, request.pos); break;
        }
    });
    ws.on('close', function (code, reason) {
        if(player === 1) {
            player1.ws = null;
            player1.pos = null;
        } else if(player === 2) {
            player2.ws = null;
            player2.pos = null;
        }
        console.log(getCurrentTime()+' Player'+player+' left the Game');
        console.log(getCurrentTime()+' Code '+code+', reason: '+reason);
    });
    ws.send(JSON.stringify({
        type: type,
        player: player,
        message: message
    }));
    if(gameNotStartetYet && bothReady()) {
        gameNotStartetYet = false;
        startGame();
    }
});

function getCurrentTime() {
    var date = new Date();
    return date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()+':'+date.getMilliseconds();
}

console.log(getCurrentTime()+' Server online (ws://nwalter:8181)');
