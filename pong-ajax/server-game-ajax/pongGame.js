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
    y: 2,
    res: 4
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
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Request-Method', '*');
    response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    response.setHeader('Access-Control-Allow-Headers', '*');
    response.setHeader('Content-Type', 'application/x-www-form-urlencoded');
    response.writeHead(200);
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
            interval.game = setInterval(calcMoves, 10);
        }, 10);
    } else {
        console.log(getCurrentTime()+' less than 2 players connected');
    }
}

function resetSpeed() {
    speed.res = 4;
    speed.x = (speed.x < 0) ? -3 : 3;
    speed.y = (speed.y < 0) ? -2 : 2;
}

function calcSpeed(alpha) {
    if(alpha < -50) {
        alpha = -50;
    } else if(alpha > 50) {
        alpha = 50;
    }
    var factorX = (speed.x < 0) ? -1 : 1;
    var factorY = (alpha < 0) ? 1 : -1;
    speed.res += 0.5;
    speed.x = (Math.cos((alpha*2*Math.PI)/360) * speed.res) * factorX;
    speed.y = (Math.sqrt(Math.pow(speed.res, 2)-Math.pow(speed.x, 2))) * factorY;
    console.log(getCurrentTime()+' Speed: x='+speed.x+' y='+speed.y+' res='+speed.res);
}

function calcPoints(pos, player) {
    if(!(pos+100 > data.y && pos-30 < data.y)) {
        data[player] += 1;
        console.log(getCurrentTime()+' player('+pos+') pong('+data.y+') -> Point for '+player+'('+data[player]+')');
        return true;
    }
    calcSpeed((pos+50) - (data.y+15));
    console.log(getCurrentTime()+' player('+pos+') pong('+data.y+') -> '+player+' hits');
    return false;
}

function calcMoves() {
    var p1String = fs.readFileSync(files.player1, 'utf8');
    var p2String = fs.readFileSync(files.player2, 'utf8');
    if(p1String === '""' || p2String === '""') {
        console.log(getCurrentTime()+' server resettet, stop calcMoves()');
        clearInterval(interval.game);
        interval.test = setInterval(testWhenStart, 1000);
        data.player1 = 0;
        data.player2 = 0;
        return;
    }
    try {
        var pos1 = JSON.parse(p1String).pos;
        var pos2 = JSON.parse(p2String).pos;
    } catch (e){
        console.log(getCurrentTime()+' JSON.parse Error: p1: '+p1String+' p2: '+p2String);
        return;
    }

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
        resetSpeed();
    }
}

function getCurrentTime() {
    var date = new Date();
    return date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()+':'+date.getMilliseconds();
}

interval.test = setInterval(testWhenStart, 1000);

http.createServer(onRequest).listen(8080);