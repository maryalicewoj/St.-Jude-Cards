var canvas = document.getElementById('Drawing');
canvas.width = 500;
canvas.height = 500;
var context = canvas.getContext('2d');

canvas.addEventListener('mousemove', function (evt) {
    var mousePos = getMousePos(canvas, evt);
    var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;

    draw(context, mousePos.x, mousePos.y);

    writeMessage(canvas, message);
}, false);

function writeMessage(canvas, message) {
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = '18pt Calibri';
    context.fillStyle = 'black';
    context.fillText(message, 10, 25);
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function draw(context, x, y) {
    //context.fillRect(x, y, 5, 5);
    context.lineWidth = 1;
    context.beginPath();
    context.stroke();
    //width and heigth could be changed based on how big the user wants the marker, it could be passed as a parameter

    //turn pixel location (variable) black
    // do I need to be constantly checking for mousemove
}