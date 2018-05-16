var http = require('http');
var fs = require('fs');

var size = {
    x: 710,
    y: 370
};
var data = {
    x: size.x/2,
    y: size.y/2,
    player1: 0,
    player2: 0
};

var speed = {
    x: 3,
    y: 2
};

var files = {
    player1: 'C:\\inetpub\\wwwroot\\seminararbeit-theorie-2\\repo-seminararbeit-theorie-2\\pong-ajax\\server-game-ajax\\src\\players\\player1.txt',
    player2: 'C:\\inetpub\\wwwroot\\seminararbeit-theorie-2\\repo-seminararbeit-theorie-2\\pong-ajax\\server-game-ajax\\src\\players\\player2.txt',
    timestamp: 'C:\\inetpub\\wwwroot\\seminararbeit-theorie-2\\repo-seminararbeit-theorie-2\\pong-ajax\\server-game-ajax\\timestamp.txt'
};

var interval = {
    game: null,
    test: null
};

function onRequest(request, response) {
    console.log(request);
    response.writeHead(200, {"Context-Type": "text/plain"});
    response.write(JSON.stringify(data));
    response.end();
}

function testWhenStart() {
    var timestamp = fs.readFileSync(files.timestamp, 'utf8');
    if(timestamp !== '""') {
        console.log(getCurrentTime()+' 2 players online, start calcMoves()');
        clearInterval(interval.test);
        setTimeout(function () {
            var actualTime = Math.ceil(new Date().getTime()/1000);
            var diff = timestamp-actualTime;
            var oldDiff = diff;
            while(diff > 0) {
                actualTime = Math.ceil(new Date().getTime()/1000);
                diff = timestamp-actualTime;
                if(oldDiff !== diff) {
                    console.log(getCurrentTime()+' Countdown: '+diff);
                    oldDiff = diff;
                }
            }
            interval.game = setInterval(calcMoves, 1000);
        }, 10);
    } else {
        console.log(getCurrentTime()+' less than 2 players connected');
    }
}

function calcPoints(pos, player) {
    if(data.y-30 > pos || data.y < pos+100) {
        data[player] += 1;
        return true;
    }
    return false;
}

function calcMoves() {
    var p1String = fs.readFileSync(files.player1, 'utf8');
    var p2String = fs.readFileSync(files.player2, 'utf8');
    if(p1String === '""' || p2String === '""') {
        console.log(getCurrentTime()+' server resettet, stop calcMoves()');
        clearInterval(interval.game);
        interval.test = setInterval(testWhenStart, 1000);
        return;
    }
    var pos1 = JSON.parse(p1String).pos;
    var pos2 = JSON.parse(p2String).pos;

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
            boolResetPong = calcPoints(pos1, 'player2');
        } else {
            boolResetPong = calcPoints(pos2, 'player1');
        }

        //oben oder unten
    } else if ((topBool) || (bottomBool)) {
        speed.y *= -1;

        //genau ecke: l.o, r.u, l.u, r.o
    } else if((corner_lo) || (corner_ru) || (corner_lu) || (corner_ro)) {
        speed.x *= -1;
        speed.y *= -1;
        if(corner_lo || corner_lu) {
            boolResetPong = calcPoints(pos1, 'player2');
        } else {
            boolResetPong = calcPoints(pos2, 'player1');
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

    console.log(getCurrentTime()+
        ' pos1: '+pos1+', x: '+data.x+', y: '+data.y+
        ', pos2: '+pos2+' |  Points: '+data.player1+
        ' : '+data.player2);
}

function getCurrentTime() {
    var date = new Date();
    return date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()+':'+date.getMilliseconds();
}

interval.test = setInterval(testWhenStart, 1000);

http.createServer(onRequest).listen(8080);