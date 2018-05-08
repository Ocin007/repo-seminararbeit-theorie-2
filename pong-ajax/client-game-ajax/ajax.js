var settings = {
    player: null,
    uuid: null,
    pos: 0
};
var pong = {
    posX: null,
    posY: null,
    speedX: null,
    speedY: null
};
var intervalID;

function sendAjaxRequest(type, data, callback) {
    var msg = JSON.stringify({
        type: type,
        data: data
    });
    var xhttp = new XMLHttpRequest();
    xhttp.open('POST', 'http://nwalter/seminararbeit-theorie-2/repo-seminararbeit-theorie-2/pong-ajax/server-game-ajax/');
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

//TODO: Im Intervall (per long-polling) die Position des 2. Spielers abfragen
function getOtherPlayerMovement() {
    sendAjaxRequest('pos-get', settings, function (xhttp) {
        responseCallback(xhttp, onError, function (xhttp) {

        });
    });
}

//TODO: Timestamp (per long-polling) abfragen
function getStartTime() {
    sendAjaxRequest('timer', null, function (xhttp) {
        responseCallback(xhttp, onError, function (xhttp) {

        });
    });
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
    if(boolUp && settings.pos > 0) {
        settings.pos = settings.pos - 20;
    } else if(boolDown && settings.pos < 300) {
        settings.pos = settings.pos + 20;
    }
    if(boolUp || boolDown) {

        //TODO: mögliche code-dublizierung vermeiden
        player.style.top = settings.pos.toString()+'px';
        sendAjaxRequest('pos-set', settings, function (xhttp) {
            responseCallback(xhttp, onError, posSetCallback);
        });


    }
}

//TODO: Bewegen mit der Maus
//TODO: Übermitteln der Bewegungen an den Server
function movePlayerWithMouse(ev, player) {
    console.log('movePlayerWithMouse');
    console.log(ev);
}

//TODO: Übermitteln der Bewegungen an den Server
function posSetCallback(xhttp) {

}

function enableMovement() {
    var player = (settings.player === 1) ? document.getElementById('player1') : document.getElementById('player2');
    player.addEventListener('keypress', function (ev) {
        movePlayerWithKey(ev, player);
    });
    document.getElementById('play-area').addEventListener('mousemove', function (ev) {
        movePlayerWithMouse(ev, player);
    });
    document.getElementById('play-area').addEventListener('click', function (ev) {
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
});