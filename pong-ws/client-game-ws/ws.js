var ws;
var settings = {
    player: null,
    pos: 0
};
var otherPlayer = {
    player: null,
    html: null,
    pos: 0
};
var pong = {
    html: null,
    sizeX: null,
    sizeY: null,
    pointsP1: null,
    pointsP2: null
};

function setCountDown(second) {
    if(second === 0) {
        setPongToStartPoint();
        pong.html.style.visibility = 'visible';
    }
    document.getElementById('countdown').innerText = second.toString();
}

function refreshPongAndPoints(response) {
    movePongTo(response.x, response.y);
    pong.pointsP1.innerHTML = response.pointsP1;
    pong.pointsP2.innerHTML = response.pointsP2;
}

function connectToServer() {
    ws = new WebSocket("ws://nwalter:8181");

    //Wird ausgeführt, wenn Connection aufgebaut wurde
    ws.onopen = function () {
        console.log('verbindung zum server hergestellt')
    };

    //Wird ausgeführt, wenn eine Response vom Server kommt
    ws.onmessage = function (ev) {
        var response = JSON.parse(ev.data);
        switch(response.type) {
            case 'pong-pos': refreshPongAndPoints(response); break;
            case 'player-pos': setOtherPlayerPos(response); break;
            case 'countdown': setCountDown(response.value); break;
            case 'connected': saveConnectionInfos(response); break;
            case 'warning': closeConnection(response); break;
            case 'error': closeConnection(response); break;
        }
    };

    //Wird bei einem Fehler ausgeführt
    ws.onerror = function (err) {
        setStatus('disconnected', 'Connection failed');
        console.log(err);
    };
}

function closeConnection(response) {
    setStatus('disconnected', response.message);
    ws.close(1000, 'closed because server full');
}

function setOtherPlayerPos(response) {
    otherPlayer.pos = response.pos;
    otherPlayer.html.style.top = response.pos+'px';
}

function movePlayerWithKey(ev, player) {
    var boolUp = ev.key === 'ArrowUp' || ev.key === 'w';
    var boolDown = ev.key === 'ArrowDown' || ev.key === 's';
    if(boolUp) {
        if(settings.pos-20 >= 0) {
            settings.pos = settings.pos - 20;
        } else if(settings.pos-20 < 0) {
            settings.pos = 0;
        }
    } else if(boolDown) {
        if(settings.pos+20 <= 300) {
            settings.pos = settings.pos + 20;
        } else if(settings.pos+20 > 300) {
            settings.pos = 300;
        }
    }
    if(boolUp || boolDown) {
        sendPosition(player);
    }
}

function movePlayerWithMouse(ev, player) {
    // console.log('y = '+(ev.y-155));
    var pos = ev.y-205;
    if(pos > 300) {
        pos = 300;
    } else if(pos < 0) {
        pos = 0;
    }
    settings.pos = pos;
    sendPosition(player);
}

function sendPosition(player) {
    player.style.top = settings.pos.toString()+'px';
    ws.send(JSON.stringify({
        type: 'set',
        player: settings.player,
        pos: settings.pos
    }));
}

function movePongTo(x, y) {
    pong.html.style.left = x+'px';
    pong.html.style.top = y+'px';
}

function setPongToStartPoint() {
    movePongTo(pong.sizeX/2, pong.sizeY/2);
}

function enableMovement() {
    var player;
    if(settings.player === 1) {
        player = document.getElementById('player1');
        otherPlayer.html = document.getElementById('player2');
        otherPlayer.player = 2;
    } else {
        player = document.getElementById('player2');
        otherPlayer.html = document.getElementById('player1');
        otherPlayer.player = 1;
    }
    player.addEventListener('keypress', function (ev) {
        movePlayerWithKey(ev, player);
    });
    document.getElementById('play-area').addEventListener('mousemove', function (ev) {
        movePlayerWithMouse(ev, player);
    });
    document.getElementById('play-area').addEventListener('click', function () {
        player.focus();
    });
    player.tabIndex = 1;
    player.focus();
}

function saveConnectionInfos(response) {
    setStatus('connected', 'connected as player '+response.player);
    settings.player = response.player;
    enableMovement();
}

function setStatus(status, message) {
    var element = document.getElementById('status');
    element.dataset.status = status;
    element.innerHTML = message;
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('connect').addEventListener('click', connectToServer);
    pong.html = document.getElementById('pong-ball');
    var pongarea = document.getElementById('pong-area');
    pong.sizeX = pongarea.clientWidth - 30;
    pong.sizeY = pongarea.clientHeight - 30;
    pong.pointsP1 = document.getElementById('player1-points');
    pong.pointsP2 = document.getElementById('player2-points');
});