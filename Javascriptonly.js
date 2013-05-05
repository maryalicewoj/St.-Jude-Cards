var canvas;
var paint = false;
var context;
var urls = [];
var clickX = new Array();
var clickY = new Array();
var clickDrag = new Array();
var clickColor = new Array();
var clickJoin = new Array();
var clickWidth = new Array();
var strokeWidth = 5;
var strokeColor = "#000000"; //"#df4b26";
var strokeJoin = "round";

function initCanvasDrawing() {
    loadList();
    canvas = document.getElementById('Drawing');
    context = canvas.getContext('2d');
    context.fillStyle = (255, 255, 255, 0.5);
    canvas.width = 500;
    canvas.height = 500;

    canvas.addEventListener("touchstart", handleStart, false);
    canvas.addEventListener("touchmove", handleMove, false);
    canvas.addEventListener("touchend", handleStop, false);
    canvas.addEventListener("touchcancel", handleStop, false);
    canvas.addEventListener("touchleave", handleStop, false);

    function handleStop(evt) {
        paint = false;
    }

    function handleStart(evt) {
        evt.preventDefault();

        paint = true;

        var touches = evt.changedTouches;
        var offset = getCanvasOffset(canvase);

        for (var i = 0; i < touches.length; i++) {
            addClick(touches[i].pageX - offset.x, touches[i].pageY - offset.y);
            redraw();
        }
    }

    function handleMove(evt) {
        if (paint) {
            evt.preventDefault();

            var touches = evt.changedTouches;
            var offset = getCanvasOffset(canvas);
            for (var i = 0; i < touches.length; i++) {
                addClick(touches[i].pageX - offset.x, touches[i].pageY - offset.y);
                redraw();
            }
        }
    }

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

}

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

function getCanvasOffset(canvas) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: rect.left,
        y: rect.top
    };
}

function addClick(x, y, dragging) {
    clickX.push(x);
    clickY.push(y);
    clickDrag.push(dragging)
    clickColor.push(strokeColor);
    clickJoin.push(strokeJoin);
    clickWidth.push(strokeWidth);
}

function redraw() {
    canvas.width = canvas.width; //clears the canvas
    
    for (var i = 0; i < clickX.length; i++) {
        context.strokeStyle = clickColor[i];
        context.lineJoin = clickJoin[i];
        context.lineWidth = clickWidth[i];

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

//This will reset the canvas and drawing variables
function resetCanvas() {
    canvas.width = canvas.width;
    paint = false;
    clickX = new Array();
    clickY = new Array();
    clickDrag = new Array();

    var test = document.getElementById('url');
    test.href = null;
    test.innerText = null;
}

//This saves the canvas to a PNG and uploads it to the server
function saveCanvas() {
    var base64PNG = canvas.toDataURL().split(',')[1];
    var fd = new FormData();
    fd.append("base64Image", base64PNG);
    fd.append("client", "stjudes.demo");
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', imageUploaded, false);
    xhr.open('POST', 'http://stjudes.mercury.io/upload/');
    xhr.send(fd);
}

//This will push the url the server sends back to the list for saving
function imageUploaded(evt) {
    var json = JSON.parse(evt.target.response);
    var url = json.url;
    var test = document.getElementById('url');

    test.href = url;
    test.innerText = 'Click here to get your card.';

    alert('Your card has been uploaded.');

    //Ellie - You can use the 'url' variable to push into your list.
    urls.push(url);
    saveList();
}

//This will handle saving the list of urls to storage
function saveList() {
    debugger;
    localStorage.cards = urls;
    alert(urls[0]);
}

//This will handle loading the list of urls from storage
function loadList() {
    debugger;
    urls = !localStorage.cards || localStorage.cards == undefined
        ? []
        : localStorage.cards;

    if (urls && urls.length > 0)
        alert(urls[0]);
}

function colorSelect(color){
    strokeColor = color;
}