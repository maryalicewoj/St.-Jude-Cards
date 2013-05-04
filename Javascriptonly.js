var canvas = document.getElementById('Drawing');
var paint = false;
var context = canvas.getContext('2d');

var clickX = new Array();
var clickY = new Array();
var clickDrag = new Array();

context.fillStyle = (255, 255, 255, 0.5);
canvas.width = 500;
canvas.height = 500;

canvas.addEventListener('mousemove', function (evt) {
    //var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;

    if (paint) {
        var mousePos = getMousePos(canvas, evt);
        addClick(mousePos.x, mousePos.y, true);
        redraw();
    }

    //writeMessage(canvas, message);
}, false);

canvas.addEventListener('mousedown', function (evt) {
    var mousePos = getMousePos(canvas, evt);
    paint = true;
    addClick(mousePos.x, mousePos.y);
    redraw();
}, false);

canvas.addEventListener('mouseup', function (evt) {
    paint = false;
}, false);

canvas.addEventListener('mouseleave', function (evt) {
    paint = false;
}, false);

//function writeMessage(canvas, message) {
//    var context = canvas.getContext('2d');
//    context.clearRect(0, 0, canvas.width, canvas.height);
//    context.font = '18pt Calibri';
//    context.fillStyle = 'black';
//    context.fillText(message, 10, 25);
//}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function addClick(x, y, dragging) {
    clickX.push(x);
    clickY.push(y);
    clickDrag.push(dragging)
}

function redraw() {
    canvas.width = canvas.width; //clears the canvas
    context.strokeStyle = "#df4b26";
    context.lineJoin = "round";
    context.lineWidth = 5;

    for (var i = 0; i < clickX.length; i++) {
        context.beginPath();
        if (clickDrag[i] && i) {
            context.moveTo(clickX[i - 1], clickY[i - 1]);
        } else {
            context.moveTo(clickX[i] - 1, clickY[i]);
        }
        context.lineTo(clickX[i], clickY[i]);
        context.closePath();
        context.stroke();
    }
}