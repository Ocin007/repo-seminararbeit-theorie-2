var settings = {
    player: null,
    uuid: null,
    pos: 0
};
var pong = {
    html: null,
    posX: null,
    posY: null,
    speedX: null,
    speedY: null,
    sizeX: null,
    sizeY: null,
    pointsP1: null,
    pointsP2: null
};
var otherPlayer = {
    player: null,
    html: null,
    pos: 0
};
var interval = {
    game: null,
    timestamp: null
};

function sendAjaxRequest(type, data, callback) {
    var msg = JSON.stringify({
        type: type,
        data: data
    });
    var xhttp = new XMLHttpRequest();
    xhttp.open('POST', 'http://nwalter/seminararbeit-theorie-2/repo-seminararbeit-theorie-2/pong-ajax/server-game-ajax/', true);
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhttp.addEventListener('load', function () {
        callback(xhttp);
    });
    xhttp.send('request='+msg);
}

function setStatus(status, message) {
    var element = document.getElementById('status');
    element.dataset.status = status;
    element.innerHTML = message;
}

//Im Intervall (per long-polling) die Position des 2. Spielers abfragen
function getOtherPlayerMovement() {
    sendAjaxRequest('pos-get', {
        pos: otherPlayer.pos,
        player: otherPlayer.player
    }, function (xhttp) {
        responseCallback(xhttp, onError, function (xhttp) {
            var resObj = JSON.parse(xhttp.response);
            if(resObj['response'] !== undefined) {
                var pos = resObj['response'].pos;
                if(pos !== null) {
                    otherPlayer.pos = pos;
                    otherPlayer.html.style.top = pos+'px';
                    console.log('Empfangen: '+new Date().getTime());
                }
                getOtherPlayerMovement();
            } else if(resObj['error'] !== undefined) {
                console.log(resObj);
                setStatus('disconnected', resObj['error']);
            } else {
                console.log(resObj);
                setStatus('disconnected', resObj['exception']);
            }
        });
    });
}

//Timestamp (per long-polling) abfragen
function getStartTime() {
    sendAjaxRequest('timer', null, function (xhttp) {
        responseCallback(xhttp, onError, function (xhttp) {
            var resObj = JSON.parse(xhttp.response);
            console.log(resObj);
            if(resObj['response'] !== undefined) {
                var timestamp = resObj['response'].timestamp;
                if(isNaN(timestamp) || timestamp === '""' || timestamp === "") {
                    getStartTime();
                } else {
                    interval.timestamp = setInterval(countDown, 10, timestamp);
                }
            } else if(resObj['error'] !== undefined) {
                console.log(resObj);
                setStatus('disconnected', resObj['error']);
            } else {
                console.log(resObj);
                setStatus('disconnected', resObj['exception']);
            }
        });
    });
}

function countDown(timestamp) {
    var actualTime = Math.ceil(new Date().getTime()/1000);
    var diff = timestamp-actualTime;
    console.log('current: '+actualTime+' server: '+timestamp+' -> '+(timestamp-actualTime));
    document.getElementById('countdown').innerText = diff.toString();
    if(diff <= 0) {
        clearInterval(interval.timestamp);
        setPongToStartPoint();
        pong.html.style.visibility = 'visible';
        interval.game = setInterval(pongGame, 10);
        // pongGame();
    }
}

function setPongToStartPoint() {
    movePongTo(pong.sizeX/2, pong.sizeY/2);
}

function movePongTo(x, y) {
    pong.html.style.left = x+'px';
    pong.html.style.top = y+'px';
}

function pongGame() {
    var xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'http://nwalter:8080', true);
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhttp.addEventListener('load', function () {
        responseCallback(xhttp, onError, function (xhttp) {
            var resObj = JSON.parse(xhttp.response);
            if(resObj.x !== undefined && resObj.y !== undefined) {
                movePongTo(resObj.x, resObj.y);
            }
            if(resObj.player1 !== undefined && resObj.player2 !== undefined) {
                pong.pointsP1.innerHTML = resObj.player1;
                pong.pointsP2.innerHTML = resObj.player2;
            }
            // pongGame();
        });
    });
    xhttp.send();
}

function saveConnectionInfos(resObj) {
    if(resObj.uuid === null) {
        setStatus('disconnected', 'already 2 players online');
    } else {
        setStatus('connected', 'connected, you are now player '+resObj.number);
        settings.player = resObj.number;
        settings.uuid = resObj.uuid;
        enableMovement();
        getOtherPlayerMovement();
        getStartTime();
    }
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
        console.log('Gesendet: '+new Date().getTime());
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
    sendAjaxRequest('pos-set', settings, function (xhttp) {
        responseCallback(xhttp, onError, posSetCallback);
    });
}

function posSetCallback(xhttp) {
    // var response = JSON.parse(xhttp.response);
    // console.log(response);
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

function responseCallback(xhttp, onError, onSuccess) {
    if (xhttp.status >= 200 && xhttp.status < 300) {
        try {
            onSuccess(xhttp);
        } catch (e) {
            onError(e, xhttp);
        }
    } else {
        console.warn('fehlgeschlagen, '+xhttp.status);
    }
}

function onError(errMsg, xhttp) {
    console.log(xhttp.response);
    console.warn(errMsg);
    setStatus('none', xhttp.response);
}

function connectPlayer(xhttp) {
    var resObj = JSON.parse(xhttp.response);
    console.log(resObj);
    if(resObj['response'] !== undefined) {
        saveConnectionInfos(resObj['response']);
    } else if(resObj['exception'] !== undefined) {
        document.getElementById('status').innerHTML = 'exception: '+resObj['exception'];
    } else {
        document.getElementById('status').innerHTML = 'error: '+resObj['error'];
    }
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('connect').addEventListener('click', function () {
        sendAjaxRequest('connect', null, function (xhttp) {
            responseCallback(xhttp, onError, connectPlayer);
        });
    });
    document.getElementsByTagName('body')[0].addEventListener('unload', function () {
        sendAjaxRequest('disconnect', settings.player, function (xhttp) {});
    });
    pong.html = document.getElementById('pong-ball');
    var pongarea = document.getElementById('pong-area');
    pong.sizeX = pongarea.clientWidth - 30;
    pong.sizeY = pongarea.clientHeight - 30;
    pong.pointsP1 = document.getElementById('player1-points');
    pong.pointsP2 = document.getElementById('player2-points');
});