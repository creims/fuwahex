"use strict";

requirejs(["./hexhandler2"], function (hexHandler) {
    "use strict";

    var highlightColor = 'yellow';

    var fileChooser = document.getElementById('fileChooser');
    var hexView = document.getElementById('hexView');
    var utfView = document.getElementById('utfView');
    var legend = document.getElementById('legend');
    var fileLabel = document.getElementById('fileLabel');

    var btnScrollUp = document.getElementById('scrollUp');
    var btnScrollDown = document.getElementById('scrollDown');
    var btnChunkUp = document.getElementById('chunkUp');
    var btnChunkDown = document.getElementById('chunkDown');

    var rows = 20;
    var cols = 20;
    var numBytes = rows * cols;

    var currRow = 0;
    var maxRow = 0;

    var highlitSpan = undefined;

    var highlight = function highlight(spanId) {
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

    var generateSpans = function generateSpans(numSpans) {
        var separator = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
        var breakEvery = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : -1;
        var idNumbering = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : undefined;

        var spans = '';
        for (var i = 1; i <= numSpans; i++) {
            spans += '<span';

            if (idNumbering !== undefined) {
                spans += " id=\"" + idNumbering + i + "\"";
            }
            spans += '></span>';

            //We need to manually add breaks because whitespace wraps are disabled in CSS. This is because
            //some of the printed characters also print newlines on Chrome etc and would mess up formatting
            if (breakEvery > 0 && i % breakEvery === 0) {
                spans += '<br>';
            } else {
                // If there's no break, we separate with the separator
                spans += separator;
            }
        }

        return spans;
    };

    var generateHexArray = function generateHexArray(data) {
        return Array.prototype.map.call(data, function (datum) {
            var hexArray = datum.toString(16).toUpperCase();

            if (datum < 16) {
                hexArray = '0' + hexArray;
            }

            return hexArray;
        });
    };

    var generateUtfString = function generateUtfString(data) {
        // All non-printable characters replaced with a '.'
        return String.fromCharCode.apply(null, data).replace(/[\x00-\x1F\x7F-\xA0\s]/g, '.');
    };

    var legendGen = regeneratorRuntime.mark(function legendGen(startingRow) {
        var counter;
        return regeneratorRuntime.wrap(function legendGen$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        counter = startingRow;

                    case 1:
                        if (!true) {
                            _context.next = 6;
                            break;
                        }

                        _context.next = 4;
                        return counter++ * cols;

                    case 4:
                        _context.next = 1;
                        break;

                    case 6:
                    case "end":
                        return _context.stop();
                }
            }
        }, legendGen, this);
    });

    var resizeWindows = function resizeWindows() {
        // We use ch (width of '0' char) because we're using a fixed-width font
        hexView.style.width = cols * 3 + "ch";
        utfView.style.width = cols + "ch";

        hexView.innerHTML = generateSpans(numBytes, ' ', cols, 'h');
        utfView.innerHTML = generateSpans(numBytes, '', cols, 'u');
    };

    var escapeHTML = function escapeHTML(c) {
        if (!c) {
            return '';
        }

        return c.replace(/&"<>/g, function () {
            return {
                '&': "&amp;",
                '"': "&quot;",
                '<': "&lt;",
                '>': "&gt;"
            }[c];
        });
    };

    var updateViews = function updateViews(data) {
        var hexIter = generateHexArray(data)[Symbol.iterator]();
        var utfIter = generateUtfString(data)[Symbol.iterator]();

        // These work by replacing the inside of each span with the next new value
        hexView.innerHTML = hexView.innerHTML.replace(/">(?:[0-9A-F]{2})?</g, function () {
            return "\">" + (hexIter.next().value || '') + "<";
        });

        //Checks for the closing / character in </span> to prevent false positives in case the character is '<'
        //Must escape some characters to avoid HTML doing HTML things
        utfView.innerHTML = utfView.innerHTML.replace(/">.*?<\//g, function () {
            return "\">" + escapeHTML(utfIter.next().value) + "</";
        });

        //update scroll bars
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

        //update legend
        var gen = legendGen(currRow);
        legend.innerHTML = generateSpans(rows, '', 1, false).replace(/><\//g, function () {
            return ">" + gen.next().value + "</";
        });
    };

    var updateData = function updateData() {
        hexHandler.getBytes(currRow * cols, numBytes).then(function (data) {
            updateViews(data);
        });
    };

    var initialize = function initialize() {
        resizeWindows();

        fileChooser.addEventListener('change', function () {
            var file = fileChooser.files[0];

            if (!file) {
                return;
            }

            hexHandler.setFile(file);
            hexHandler.getBytes(0, numBytes).then(function (data) {
                fileLabel.textContent = file.name;

                currRow = 0;
                maxRow = Math.ceil(file.size / cols) - rows;
                if (maxRow < 0) {
                    maxRow = 0;
                }

                updateViews(data);
            }, function (error) {
                console.log(error);
            });
        });

        hexView.addEventListener('click', function (event) {
            //don't highlight the entire area
            if (event.target === hexView) {
                return;
            }

            highlight(event.target.id);
        });

        utfView.addEventListener('click', function (event) {
            //don't highlight the entire area
            if (event.target === utfView) {
                return;
            }

            highlight(event.target.id);
        });

        btnScrollUp.addEventListener('click', function () {
            if (currRow === 0) {
                return;
            }

            currRow--;
            updateData();
        });

        btnScrollDown.addEventListener('click', function () {
            if (currRow === maxRow) {
                return;
            }

            currRow++;
            updateData();
        });

        btnChunkUp.addEventListener('click', function () {
            if (currRow === 0) {
                return;
            }

            currRow -= rows - 1;
            if (currRow < 0) {
                currRow = 0;
            }

            updateData();
        });

        btnChunkDown.addEventListener('click', function () {
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
});
//# sourceMappingURL=main.js.map