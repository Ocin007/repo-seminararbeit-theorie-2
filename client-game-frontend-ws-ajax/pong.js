/**
 * größe von 'pong-area': 410x, 170y (nach abzug der größe von 'pong-ball')
 */
var direction = {x: -1, y: -1};
document.addEventListener('DOMContentLoaded', function () {
    var pongball = document.getElementById('pong-ball');
    var pongarea = document.getElementById('pong-area');
    var sizeX = pongarea.clientWidth - 30;
    var sizeY = pongarea.clientHeight - 30;
    pongball.style.left = sizeX/2+'px';
    pongball.style.top = sizeY/2+'px';
    pongball.addEventListener('click', function () {
        setInterval(function () {
            var oldX = parseInt(pongball.style.left.slice(0, pongball.style.left.length - 2));
            var oldY = parseInt(pongball.style.top.slice(0, pongball.style.top.length - 2));
            var x = oldX + direction.x;
            var y = oldY + direction.y;
            /**
             * links oder rechts
             */
            if ((x <= 0 && y > 0 && y < sizeY) || (x >= sizeX && y > 0 && y < sizeY)) {
                direction.x = direction.x * (-1);

                /**
                 * oben oder unten
                 */
            } else if ((x > 0 && x < sizeX && y <= 0) || (x > 0 && x < sizeX && y >= sizeY)) {
                direction.y = direction.y * (-1);

                /**
                 * genau ecke: l.o, r.u, l.u, r.o
                 */
            } else if((x <= 0 && y <= 0) || (x > sizeX && y > sizeY) || (x <= 0 && y > sizeY) || (x > sizeX && y <= 0)) {
                direction.x = direction.x * (-1);
                direction.y = direction.y * (-1);
            }
            pongball.style.left = (oldX + direction.x) + 'px';
            pongball.style.top = (oldY + direction.y) + 'px';
        }, 5);
    });
});