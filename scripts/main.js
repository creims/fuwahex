requirejs(["./hexhandler2"], function (hexHandler) {
    "use strict";
    const highlightColor = 'yellow';

    const fileChooser = document.getElementById('fileChooser');
    const hexView = document.getElementById('hexView');
    const utfView = document.getElementById('utfView');
    const legend = document.getElementById('legend');
    const fileLabel = document.getElementById('fileLabel');

    let rows = 20;
    let cols = 20;
    let numBytes = rows * cols;

    let hexHighlit = undefined;
    let utfHighlit = undefined;

    const highlight = function highlight(spanId) {
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

    const generateSpans = function generateSpans(numSpans,
                                                 separator = '',
                                                 breakEvery = -1,
                                                 classNumbering = true) {
        let spans = '';
        for (let i = 1; i <= numSpans; i++) {
            spans += '<span';

            if (classNumbering) {
                spans += ` class="${i}"`;
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

    const generateHexArray = function generateHexArray(data) {
        return Array.prototype.map.call(data, function (datum) {
            let hexArray = datum
                .toString(16)
                .toUpperCase();

            if (datum < 16) {
                hexArray = '0' + hexArray;
            }

            return hexArray;
        });
    };

    const generateUtfArray = function generateUtfArray(data) {
        // All non-printable characters replaced with a '.'
        return String.fromCharCode.apply(null, data)
            .replace(/[\x00-\x1F\x7F-\xA0\s]/g, '.')
            .split('');
    };

    const initialize = function initialize() {
        resizeWindows();
    };

    const legendGen = function *legendGen(startingRow) {
        let counter = startingRow;

        while(true)
            yield counter++ * cols;
    };

    const resizeWindows = function resizeWindows() {
        // We use ch (width of 0) because we're using a fixed-width font
        hexView.style.width = `${cols * 3}ch`;
        utfView.style.width = `${cols}ch`;

        hexView.innerHTML = generateSpans(numBytes, ' ', cols);
        utfView.innerHTML = generateSpans(numBytes, '', cols);

        const gen = legendGen(0);
        legend.innerHTML = generateSpans(rows, '', 1, false)
            .replace(/><\//g, () => `>${gen.next().value}</`);
    };

    const updateViews = function updateViews(data) {
        const hexIter = generateHexArray(data)[Symbol.iterator]();
        const utfIter = generateUtfArray(data)[Symbol.iterator]();

        // This works by replacing the inside of each span with
        hexView.innerHTML = hexView.innerHTML.replace(/"></g, () => `">${hexIter.next().value}<`);
        utfView.innerHTML = utfView.innerHTML.replace(/"></g, () => `">${utfIter.next().value}<`);
    };

    fileChooser.addEventListener('change', function () {
        const file = fileChooser.files[0];

        if (!file) {
            return;
        }

        hexHandler.setFile(file);
        hexHandler.getBytes(0, numBytes).then(
            function (data) {
                updateViews(data);
                fileLabel.textContent = file.name;
            }, function (error) {
                console.log(error);
            }
        );
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

