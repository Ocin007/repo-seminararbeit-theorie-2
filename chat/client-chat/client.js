var username;
var uuid;
var ws;

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('connect-button').addEventListener("click", connect);
    document.getElementById('username').addEventListener("keydown", connect);
    document.getElementById('send-button').addEventListener("click", sendMessage);
    document.getElementById('message').addEventListener("keydown", sendMessage);
    document.getElementById('close-button').addEventListener("click", disconnect);
    document.getElementById('username').focus();
    showNumOfOnlineUsers('-');
});

//buggy
document.addEventListener('unload', function () {
    console.warn('------------------------------');
    ws.close(1001, 'user '+username+' left the page');
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

function showNumOfOnlineUsers(numOnline) {
    document.getElementById('number-online').innerText = numOnline;
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
    showConnectionButton();
    ws.close(1000, 'user '+username+' disconnected');
    var tag = '<span class="err-message">[Client]</span>';
    insertMessageInDiv(tag, 'Disconnected from server');
}

function showConnectionButton() {
    document.getElementById('connected-user').innerText = '';
    document.getElementById('connect-container').style.display = 'flex';
    document.getElementById('disconnect-container').style.display = 'none';
    document.getElementById('username').focus();
    showNumOfOnlineUsers('-');
}
function initWS() {

    /**
     * Wird ausgeführt, wenn Connection aufgebaut wurde
     */
    ws.onopen = function (e) {
        var tag = '<span class="err-message">[Client]</span>';
        insertMessageInDiv(tag, 'Connection to server opened');
        stopLoading();
        document.getElementById('message').focus();
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
        if(response.numOnline !== undefined) {
            showNumOfOnlineUsers(response.numOnline);
        } else if(response.username === undefined) {
            uuid = response.uuid;
            ws.send(JSON.stringify({
                uuid: response.uuid,
                username: username
            }));
        } else {
            var tag;
            if(username === response.username) {
                tag = '<span class="response-username">['+response.username+']</span>';
            } else if(response.username === 'Server') {
                tag = '<span class="err-message">['+response.username+']</span>';
            } else {
                tag = '<span class="response-otheruser">['+response.username+']</span>';
            }
            insertMessageInDiv(tag, response.message);
        }
        console.log(ev.data);
    };

    /**
     * Wird bei einem Fehler ausgeführt
     */
    ws.onerror = function (err) {
        console.log(err);
        insertMessageInDiv('', 'Connection failed', 'err-message');
        stopLoading();
        showConnectionButton();
    }
}

function insertMessageInDiv(tag, str, errClass) {
    var container = document.getElementById('received-messages');
    var msgDiv = document.createElement('div');
    var message = document.createElement('p');
    msgDiv.classList.add('message');
    msgDiv.innerHTML = tag;
    message.innerText = ' '+str;
    msgDiv.appendChild(message);
    if(errClass !== undefined) {
        message.classList.add(errClass);
    }
    container.insertBefore(msgDiv, container.firstChild);
}

/**
 * Sendet message an den Server
 */
function sendMessage(ev) {
    var textField = document.getElementById('message');
    console.log(ev.key);
    if((ev.key === "Enter" || ev.type === "click") && textField.value !== '') {
        ws.send(JSON.stringify({
            uuid: uuid,
            message: textField.value
        }));
        textField.value = '';
    } else if(ev.key === 'Escape') {
        disconnect();
    }
}