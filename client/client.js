var username;
var uuid;
var ws;

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('connect-button').addEventListener("click", connect);
    document.getElementById('username').addEventListener("keydown", connect);
    document.getElementById('send-button').addEventListener("click", sendMessage);
    document.getElementById('message').addEventListener("keydown", sendMessage);
    document.getElementById('close-button').addEventListener("click", disconnect);
});

//TODO: Event für Schließen der Seite
document.addEventListener('close', function () {
    console.warn('------------------------------');
    ws.close(1001, 'user '+username+' left the side');
});

function setSpinnerVisibility(state) {
    var loading = document.getElementsByClassName('spinner')[0];
    loading.style.visibility = state;
}

function loading() {
    setSpinnerVisibility('visible');
}

function stopLoading() {
    setSpinnerVisibility('hidden');
}

function connect(ev) {
    var textField = document.getElementById('username');
    if((ev.key === "Enter" || ev.type === "click") && textField.value !== '') {
        ws = new WebSocket("ws://nwalter:8181");
        initWS();
        loading();
    }
}

function disconnect() {
    document.getElementById('connected-user').innerText = '';
    document.getElementById('connect-container').style.display = 'flex';
    document.getElementById('disconnect-container').style.display = 'none';
    ws.close(1000, 'user '+username+' disconnected');
    var str = '<span class="err-message">[Client]</span> '+'Disconnected from server';
    insertMessageInDiv(str)
}

function initWS() {

    /**
     * Wird ausgeführt, wenn Connection aufgebaut wurde
     */
    ws.onopen = function (e) {
        var str = '<span class="err-message">[Client]</span> '+'Connection to server opened';
        insertMessageInDiv(str);
        stopLoading();
        username = document.getElementById('username').value;
        document.getElementById('connected-user').innerText = username;
        document.getElementById('connect-container').style.display = 'none';
        document.getElementById('disconnect-container').style.display = 'flex';
        document.getElementById('username').value = '';
        console.log('Connection to server opened');
        console.log(e);
    };

    /**
     * Wird ausgeführt, wenn eine Response vom Server kommt
     */
    ws.onmessage = function (ev) {
        var response = JSON.parse(ev.data);
        if(response.username === undefined) {
            uuid = response.uuid;
            ws.send(JSON.stringify({
                uuid: response.uuid,
                username: username
            }));
        } else {
            var str;
            if(username === response.username) {
                str = '<span class="response-username">['+response.username+']</span> '+response.message;
            } else if(response.username === 'Server') {
                str = '<span class="err-message">['+response.username+']</span> '+response.message;
            } else {
                str = '<span class="response-otheruser">['+response.username+']</span> '+response.message;
            }
            insertMessageInDiv(str);
        }
        console.log(ev.data);
    };

    /**
     * Wird bei einem Fehler ausgeführt
     */
    ws.onerror = function (err) {
        console.log(err);
        insertMessageInDiv('Connection failed', 'err-message');
        stopLoading();
    }
}

function insertMessageInDiv(str, errClass) {
    var container = document.getElementById('received-messages');
    var message = document.createElement('p');
    message.innerHTML = str;
    if(errClass !== undefined) {
        message.classList.add(errClass);
    }
    container.insertBefore(message, container.firstChild);
}

/**
 * Sendet message an den Server
 */
function sendMessage(ev) {
    var textField = document.getElementById('message');
    if((ev.key === "Enter" || ev.type === "click") && textField.value !== '') {
        ws.send(JSON.stringify({
            uuid: uuid,
            message: textField.value
        }));
        textField.value = '';
    }
}