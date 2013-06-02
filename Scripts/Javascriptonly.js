var canvas;
var carousel;
var paint = false;
var context;
var urls = [];
var clickX = new Array();
var clickY = new Array();
var clickDrag = new Array();
var clickColor = new Array();
var clickBrushShape = new Array();
var clickWidth = new Array();
var onGoingTouches = new Array();
var strokeWidth = 5;
var strokeColor = "#000000"; //"#df4b26";
var strokeBrushShape = "round";

function initCanvasDrawing() {
    canvas = document.getElementById('Drawing');
    carousel = document.getElementById('carousel');
    context = canvas.getContext('2d');
    context.fillStyle = (255, 255, 255, 0.5);
    canvas.width = 500;
    canvas.height = 500;

    loadList();
    
    canvas.addEventListener("touchstart", handleStart, false);
    canvas.addEventListener("touchmove", handleMove, false);
    canvas.addEventListener("touchend", handleEnd, false);
    canvas.addEventListener("touchcancel", handleCancel, false);
    canvas.addEventListener("touchleave", handleEnd, false);

    function handleCancel(evt) {
        evt.preventDefault();

        var touches = evt.changedTouches;
        paint = false;

        for (var i = 0; i < touches.length; i++) {
            onGoingTouches.splice(i, 1);  // remove it; we're done
        }
    }

    function handleEnd(evt) {
        var touches = evt.changedTouches;
        
        for (var i = 0; i < touches.length; i++) {
            var position = getOffsetPosition(canvas, touches[i]);
            addClick(position);
            onGoingTouches.splice(i, 1);  // remove it; we're done
        }
    }

    function handleStart(evt) {
        evt.preventDefault();

        paint = true;

        var touches = evt.changedTouches;

        for (var i = 0; i < touches.length; i++) {
            onGoingTouches.push(touches[i]);
            var position = getOffsetPosition(canvas, touches[i]);
            addClick(position);
            redraw();
        }
    }

    function handleMove(evt) {
        if (paint) {
            evt.preventDefault();

            var touches = evt.changedTouches;

            for (var i = 0; i < touches.length; i++) {
                var idx = ongoingTouchIndexById(touches[i].identifier);
                var position = getOffsetPosition(canvas, touches[i]);
                addClick(position, true);
                onGoingTouches.splice(idx, 1, touches[i]);  // swap in the new touch record
                redraw();
            }
        }
    }

    function ongoingTouchIndexById(idToFind) {
        for (var i = 0; i < onGoingTouches.length; i++) {
            var id = onGoingTouches[i].identifier;

            if (id == idToFind) {
                return i;
            }
        }
        return -1;    // not found
    }

    canvas.addEventListener('mousemove', function (evt) {
        if (paint) {
            var position = getOffsetPosition(canvas, evt);
            addClick(position, true);
            redraw();
        }
    }, false);

    canvas.addEventListener('mousedown', function (evt) {
        var position = getOffsetPosition(canvas, evt);
        paint = true;
        addClick(position);
        redraw();
    }, false);

    canvas.addEventListener('mouseup', function (evt) {
        paint = false;
    }, false);

    canvas.addEventListener('mouseleave', function (evt) {
        paint = false;
    }, false);

}

function getOffsetPosition(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function addClick(position, dragging) {
    clickX.push(position.x);
    clickY.push(position.y);
    clickDrag.push(dragging);
    clickColor.push(strokeColor);
    clickBrushShape.push(strokeBrushShape);
    clickWidth.push(strokeWidth);
}

function redraw() {
    canvas.width = canvas.width; //clears the canvas
    
    for (var i = 0; i < clickX.length; i++) {
        context.strokeStyle = clickColor[i];
        context.lineJoin = clickBrushShape[i];
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
    clickColor = new Array();
    clickBrushShape = new Array();
    clickWidth = new Array();
    onGoingTouches = new Array();
    strokeWidth = 5;
    strokeColor = "#000000"; //"#df4b26";
    strokeBrushShape = "round";

    var preview = document.getElementById('preview');
    preview.visible = false;
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
    var preview = document.getElementById('preview');

    preview.addEventListener('click', function () {
        view(url);
    }, false);
    preview.visible = true;

    alert('Your card has been uploaded.');

    urls.push(url);
    saveList();
    appendCarouselSlide(url);
}

//This will handle saving the list of urls to storage
function saveList() {
    localStorage.cards = urls.join(',');
}

function appendCarouselSlide(url) {
    var img = document.createElement('img');
    img.src = url;
    img.style = "position: relative;";
    img.border = "0";
    img.height = carousel.height;
    img.addEventListener('click',
        function () {
            view(this.src);
        },
        false);
    carousel.appendChild(img);
}

//This will handle loading the list of urls from storage
function loadList() {
    urls = !localStorage.cards || localStorage.cards == undefined
        ? []
        : localStorage.cards.split(',');

    carousel.innerHTML = '';
    
    for (var i = 0, url; url = urls[i]; i++)
        appendCarouselSlide(url);
}

function colorSelect(color) {
    strokeColor = color;
}

function widthSelect(width) {
    strokeWidth = width;
}

function view(imgsrc) {
    window.open(imgsrc, 'view', 'width=500,height=500');
}