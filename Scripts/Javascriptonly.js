var canvas;
var carousel;
var paint = false;
var eraser = false;
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
        eraser = false;

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
            if (!eraser) {
                var position = getOffsetPosition(canvas, evt);
                addClick(position, true);
                redraw();
            } else {
                erase(evt);
            }
        }
    }, false);

    function erase(evt) {
        if (paint && eraser) {
            var offset = strokeWidth / 2;
            var position = getOffsetPosition(canvas, evt);
            var top = Math.max(position.y - offset, 0);
            var bottom = Math.min(position.y + offset, canvas.height);
            var left = Math.max(position.x - offset, 0);
            var right = Math.min(position.x + offset, canvas.width);

            console.log('xMin = ' + left + ", xMax = " + right + ',yMin = ' + top + ', yMax = ' + bottom);

            //loop through all x coordinates in order
            //all arrays are parallel arrays
            for (var i = 0; i < clickX.length; i++) {
                var x = clickX[i];
                var y = clickY[i];
                var log = [];

                if (x >= left && x <= right //falls into the vertical boundary
                    && y >= top && y <= bottom) { //falls into the horizontal boundary
                    var newX = x;
                    var newY = y;

                    log.push('i = ' + i);
                    log.push('x = ' + x);
                    log.push('y = ' + y);

                    var spliceRun = 1;

                    //Follow the path to find other points that live in the boundary and can be collapse
                    for (var j = i + 1; j < clickX.length - 1; j++)
                        if (clickX[j] > left && clickX[j] < right //falls into the vertical boundary
                            && clickY[j] > top && clickY[j] < bottom //falls into the horizontal boundary
                            && clickDrag[j]) //line between this position and the current position
                            spliceRun++;
                        else //the point is not within the boundary or is not connected
                            break;

                    var spliceX = clickX[j + spliceRun];
                    var spliceY = clickY[j + spliceRun];

                    if (spliceX <= left) newX = left - 1;
                    else if (spliceX >= right) newX = right + 1;
                    if (spliceY <= top) newY = top - 1;
                    else if (spliceY >= bottom) newY = bottom + 1;

                    log.push('newX = ' + newX);
                    log.push('newY = ' + newY);
                    log.push('splice run = ' + spliceRun);

                    clickX[j] = newX; //clickX[j + spliceRun];
                    clickY[j] = newY; //clickY[j + spliceRun];
                    clickDrag[j] = clickDrag[j + spliceRun];
                    clickColor[j] = clickColor[j + spliceRun];
                    clickBrushShape[j] = clickBrushShape[j + spliceRun];
                    clickWidth[j] = clickWidth[j + spliceRun];

                    //Move the rest
                    for (var j = i + spliceRun + 1; j < clickX.length; j++) {
                        clickX[j] = clickX[j + 1];
                        clickY[j] = clickY[j + 1];
                        clickDrag[j] = clickDrag[j + 1];
                        clickColor[j] = clickColor[j + 1];
                        clickBrushShape[j] = clickBrushShape[j + 1];
                        clickWidth[j] = clickWidth[j + 1];
                    }


                    clickX.splice(i + spliceRun > 1 ? 1 : 0, spliceRun);
                    clickY.splice(i + spliceRun > 1 ? 1 : 0, spliceRun);
                    clickDrag.splice(i + spliceRun > 1 ? 1 : 0, spliceRun);
                    clickColor.splice(i + spliceRun > 1 ? 1 : 0, spliceRun);
                    clickBrushShape.splice(i + spliceRun > 1 ? 1 : 0, spliceRun);
                    clickWidth.splice(i + spliceRun > 1 ? 1 : 0, spliceRun);
                    
                } else
                    log.push('did not move');

                console.log(log.join(', '));
            }
        }
    }

    canvas.addEventListener('mousedown', function (evt) {
        var position = getOffsetPosition(canvas, evt);
        paint = true;
        if(!eraser)
            addClick(position);
        else
            erase(evt);
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
    eraser = false;
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
    if (eraser) eraser = false;
    strokeColor = color;
}

function eraserSelect() {
    eraser = true;
    strokeWidth = 60;
}

function widthSelect(width) {
    strokeWidth = width;
}

function view(imgsrc) {
    window.open(imgsrc, 'view', 'width=500,height=500');
}