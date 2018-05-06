var settings = {
    player: null,
    posX: null,
    posY: null
};

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

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('connect').addEventListener('click', function () {
        sendAjaxRequest('connect', null, function (xhttp) {
            //TODO: Connect
            if (xhttp.status >= 200 && xhttp.status < 300) {
                try {
                    console.log(JSON.parse(xhttp.response));
                } catch (e) {
                    document.getElementById('status').innerHTML = xhttp.response;
                    console.log(xhttp.response);
                }
            } else {
                console.warn('fehlgeschlagen, '+xhttp.status);
            }
        });
    });
    document.getElementsByTagName('body')[0].addEventListener('unload', function () {
        sendAjaxRequest('disconnect', settings.player, function (xhttp) {});
    });
});