var pongball;
var direction = {x: -1, y: -1};
document.addEventListener('DOMContentLoaded', function () {
    pongball = document.getElementById('pong-ball');
    pongball.style.left = '205px';
    pongball.style.top = '85px';
    pongball.addEventListener('click', function () {
        setInterval(function () {
            var oldX = parseInt(pongball.style.left.slice(0, pongball.style.left.length - 2));
            var oldY = parseInt(pongball.style.top.slice(0, pongball.style.top.length - 2));
            var x = oldX + direction.x;
            var y = oldY + direction.y;
            if ((x <= 0 && y > 0 && y < 170) || (x >= 410 && y > 0 && y < 170)) {//links oder rechts
                direction.x = direction.x * (-1);
            } else if ((x > 0 && x < 410 && y <= 0) || (x > 0 && x < 410 && y >= 170)) {//oben oder unten
                direction.y = direction.y * (-1);
            } else if((x <= 0 && y <= 0) || (x > 410 && y > 170) || (x <= 0 && y > 170) || (x > 410 && y <= 0)) {//genau ecke: l.o, r.u,
                direction.x = direction.x * (-1);
                direction.y = direction.y * (-1);
            }
            pongball.style.left = (oldX + direction.x) + 'px';
            pongball.style.top = (oldY + direction.y) + 'px';
        }, 5);
    });
});
/*410 * 170*/