"use strict";

requirejs(["./hexhandler2"], function (hexHandler) {
    "use strict";

    var highlightColor = 'yellow';

    var fileChooser = document.getElementById('fileChooser');
    var hexView = document.getElementById('hexView');
    var utfView = document.getElementById('utfView');
    var legend = document.getElementById('legend');
    var fileLabel = document.getElementById('fileLabel');

    var rows = 20;
    var cols = 20;
    var numBytes = rows * cols;

    var hexHighlit = undefined;
    var utfHighlit = undefined;

    var highlight = function highlight(spanId) {
        if (hexHighlit !== undefined) {
            hexHighlit.style.backgroundColor = hexView.style.backgroundColor;
        }

        if (utfHighlit !== undefined) {
            utfHighlit.style.backgroundColor = utfView.style.backgroundColor;
        }

        hexHighlit = hexView.getElementsByClassName(spanId)[0];
        hexHighlit.style.backgroundColor = highlightColor;

        utfHighlit = utfView.getElementsByClassName(spanId)[0];
        utfHighlit.style.backgroundColor = highlightColor;
    };

    var generateSpans = function generateSpans(numSpans) {
        var separator = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
        var breakEvery = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : -1;
        var classNumbering = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

        var spans = '';
        for (var i = 1; i <= numSpans; i++) {
            spans += '<span';

            if (classNumbering) {
                spans += " class=\"" + i + "\"";
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

    var generateUtfArray = function generateUtfArray(data) {
        // All non-printable characters replaced with a '.'
        return String.fromCharCode.apply(null, data).replace(/[\x00-\x1F\x7F-\xA0\s]/g, '.').split('');
    };

    var initialize = function initialize() {
        resizeWindows();
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
        // We use ch (width of 0) because we're using a fixed-width font
        hexView.style.width = cols * 3 + "ch";
        utfView.style.width = cols + "ch";

        hexView.innerHTML = generateSpans(numBytes, ' ', cols);
        utfView.innerHTML = generateSpans(numBytes, '', cols);

        var gen = legendGen(0);
        legend.innerHTML = generateSpans(rows, '', 1, false).replace(/><\//g, function () {
            return ">" + gen.next().value + "</";
        });
    };

    var updateViews = function updateViews(data) {
        var hexIter = generateHexArray(data)[Symbol.iterator]();
        var utfIter = generateUtfArray(data)[Symbol.iterator]();

        // This works by replacing the inside of each span with
        hexView.innerHTML = hexView.innerHTML.replace(/"></g, function () {
            return "\">" + hexIter.next().value + "<";
        });
        utfView.innerHTML = utfView.innerHTML.replace(/"></g, function () {
            return "\">" + utfIter.next().value + "<";
        });
    };

    fileChooser.addEventListener('change', function () {
        var file = fileChooser.files[0];

        if (!file) {
            return;
        }

        hexHandler.setFile(file);
        hexHandler.getBytes(0, numBytes).then(function (data) {
            updateViews(data);
            fileLabel.textContent = file.name;
        }, function (error) {
            console.log(error);
        });
    });

    hexView.addEventListener('click', function (event) {
        //don't highlight the entire area
        if (event.target === hexView) {
            return;
        }

        highlight(event.target.classList[0]);
    });

    utfView.addEventListener('click', function (event) {
        //don't highlight the entire area
        if (event.target === utfView) {
            return;
        }

        highlight(event.target.classList[0]);
    });

    initialize();
});
//# sourceMappingURL=main.js.map