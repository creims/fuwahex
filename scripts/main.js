import hexHandler from './hexhandler.js';

const highlightColor = 'yellow';

const fileChooser = document.getElementById('fileChooser');
const hexView = document.getElementById('hexView');
const utfView = document.getElementById('utfView');
const legend = document.getElementById('legend');
const fileLabel = document.getElementById('fileLabel');

const btnScrollUp = document.getElementById('scrollUp');
const btnScrollDown = document.getElementById('scrollDown');
const btnChunkUp = document.getElementById('chunkUp');
const btnChunkDown = document.getElementById('chunkDown');

let rows = 30;
let cols = 15;
let numBytes = rows * cols;

let currRow = 0;
let maxRow = 0;

let highlitSpan = undefined;

let hexSpans = undefined;
let utfSpans = undefined;
let legendSpans = undefined;

// Given a span ID, highlights the corresponding character and hex code in both hex and utf views
const highlight = function highlight(spanId) {
    spanId = spanId.substr(1);

    if (highlitSpan !== undefined) {
        document.getElementById('h' + highlitSpan).style.backgroundColor = hexView.style.backgroundColor;
    }

    if (highlitSpan !== undefined) {
        document.getElementById('u' + highlitSpan).style.backgroundColor = utfView.style.backgroundColor;
    }

    document.getElementById('h' + spanId).style.backgroundColor = highlightColor;
    document.getElementById('u' + spanId).style.backgroundColor = highlightColor;

    highlitSpan = spanId;
};

// Generates an HTML string containing spans
// Called once for each view (hex, utf, legend) when the view is resized
const generateSpans = function generateSpans(numSpans,
    separator = '',
    breakEvery = -1,
    idNumbering = undefined) {
    let spans = '';
    for (let i = 1; i <= numSpans; i++) {
        spans += '<span';

        if (idNumbering !== undefined) {
            spans += ` id="${idNumbering}${i}"`;
        }
        spans += '></span>';

        //We need to manually add breaks because whitespace wraps are disabled in CSS. This is because
        //some of the printed characters also print newlines on Chrome etc and would mess up formatting
        if (breakEvery > 0 && (i % breakEvery === 0)) {
            spans += '<br>';
        } else { // If there's no break, we separate with the separator
            spans += separator;
        }
    }

    return spans;
};

// Formats an array of characters into displayable hex format
const generateHexArray = function generateHexArray(data) {
    return Array.prototype.map.call(data, function(datum) {
        let hexArray = datum
            .toString(16)
            .toUpperCase();

        if (datum < 16) {
            hexArray = '0' + hexArray;
        }

        return hexArray;
    });
};

// Replaces non-printable characters in a string with a '.'

const generateUtfString = function generateUtfString(data) {
    return String.fromCharCode.apply(null, data)
        .replace(/[\x00-\x20\x7F-\xA0\xAD]/g, '.');
};

// Yields the byte offset of the first byte displayed on a row
const legendGen = function* legendGen(startingRow) {
    let counter = startingRow;

    while (true) {
        yield counter++ * cols;
    }
};

// Resize the hex, utf, and legend views on init or when rows/columns change
const resizeWindows = function resizeWindows() {
    // We use ch (width of '0' char) because we're using a fixed-width font
    hexView.style.width = `${cols * 3}ch`;
    utfView.style.width = `${cols}ch`;

    hexView.innerHTML = generateSpans(numBytes, ' ', cols, 'h');
    utfView.innerHTML = generateSpans(numBytes, '', cols, 'u');
    legend.innerHTML = generateSpans(rows, '', 1, 'l');

    hexSpans = Array.from(hexView.children)
        .filter(s => s.nodeName === 'SPAN');
    utfSpans = Array.from(utfView.children)
        .filter(s => s.nodeName === 'SPAN');
    legendSpans = Array.from(legend.children)
        .filter(s => s.nodeName === 'SPAN');
};

// Populates the hex, utf, and legend views with a chunk of bytes
const updateViews = function updateViews(data) {
    const hexIter = generateHexArray(data)[Symbol.iterator]();
    const utfIter = generateUtfString(data)[Symbol.iterator]();
    const gen = legendGen(currRow);

    // Iterate through the children updating them. Should be ~10 times faster than regex
    for (let i = 0; i < numBytes; i++) {
        hexSpans[i].textContent = hexIter.next().value;
        utfSpans[i].textContent = utfIter.next().value;
    }

    for (let s of legendSpans) {
        s.textContent = gen.next().value;
    }

    // Update scroll bars
    if (currRow === maxRow) {
        btnScrollDown.disabled = true;
        btnChunkDown.disabled = true;
    } else {
        btnScrollDown.disabled = false;
        btnChunkDown.disabled = false;
    }

    if (currRow === 0) {
        btnScrollUp.disabled = true;
        btnChunkUp.disabled = true;
    } else {
        btnScrollUp.disabled = false;
        btnChunkUp.disabled = false;
    }
};

// Read a chunk of bytes from the file and update the views
const updateData = function updateData() {
    hexHandler.getBytes(currRow * cols, numBytes).then(function(data) {
        updateViews(data);
    });
};

const initialize = function initialize() {
    resizeWindows();

    fileChooser.addEventListener('change', function() {
        const file = fileChooser.files[0];

        if (!file) {
            return;
        }

        hexHandler.setFile(file);
        hexHandler.getBytes(0, numBytes).then(
            function(data) {
                fileLabel.textContent = file.name;

                currRow = 0;
                maxRow = Math.ceil(file.size / cols) - rows;
                if (maxRow < 0) {
                    maxRow = 0;
                }

                updateViews(data);
            },
            function(error) {
                console.log(error);
            }
        );
    });

    hexView.addEventListener('click', function(event) {
        //don't highlight the entire area
        if (event.target === hexView) {
            return;
        }

        highlight(event.target.id);
    });

    utfView.addEventListener('click', function(event) {
        //don't highlight the entire area
        if (event.target === utfView) {
            return;
        }

        highlight(event.target.id);
    });

    btnScrollUp.addEventListener('click', function() {
        if (currRow === 0) {
            return;
        }

        currRow--;
        updateData();
    });

    btnScrollDown.addEventListener('click', function() {
        if (currRow === maxRow) {
            return;
        }

        currRow++;
        updateData();
    });

    btnChunkUp.addEventListener('click', function() {
        if (currRow === 0) {
            return;
        }

        currRow -= rows - 1;
        if (currRow < 0) {
            currRow = 0;
        }

        updateData();
    });

    btnChunkDown.addEventListener('click', function() {
        if (currRow === maxRow) {
            return;
        }

        currRow += rows - 1;
        if (currRow > maxRow) {
            currRow = maxRow;
        }

        updateData();
    });
};

initialize();
