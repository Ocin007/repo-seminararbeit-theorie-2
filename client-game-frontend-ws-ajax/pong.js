/**
 * größe von 'pong-area': 410x, 170y (nach abzug der größe von 'pong-ball')
 */
document.addEventListener('DOMContentLoaded', function () {
    var direction = {x: -3, y: -2};
    var pongball = document.getElementById('pong-ball');
    var pongarea = document.getElementById('pong-area');
    var sizeX = pongarea.clientWidth - 30;
    var sizeY = pongarea.clientHeight - 30;
    var factorX = -1.1;
    var factorY = -1.1;
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
                direction.x = direction.x * factorX;
                console.log('Vektor: [%.3fx, %.3fy]', direction.x, direction.y);
                /**
                 * oben oder unten
                 */
            } else if ((x > 0 && x < sizeX && y <= 0) || (x > 0 && x < sizeX && y >= sizeY)) {
                direction.y = direction.y * factorY;
                console.log('Vektor: [%.3fx, %.3fy]', direction.x, direction.y);
                /**
                 * genau ecke: l.o, r.u, l.u, r.o
                 */
            } else if((x <= 0 && y <= 0) || (x > sizeX && y > sizeY) || (x <= 0 && y > sizeY) || (x > sizeX && y <= 0)) {
                console.log('Vektor: [%.3fx, %.3fy]', direction.x, direction.y);
                direction.x = direction.x * factorX;
                direction.y = direction.y * factorY;
            }
            pongball.style.left = (oldX + direction.x) + 'px';
            pongball.style.top = (oldY + direction.y) + 'px';
        }, 5);
    });
});