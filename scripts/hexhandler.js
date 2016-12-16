define(function () {
    "use strict";
    const handler = {};
    const reader = new FileReader();

    let fileRef;

    handler.setFile = function (file) {
        fileRef = file;
    };

    handler.onLoad = function (callback) {
        reader.onload = function () {
            callback(reader.result);
        };
    };

    handler.getBytes = function (offset, size) {
        if (fileRef === undefined) {
            console.log("HexHandler error: Undefined file reference");
            return;
        }

        if (reader.onload === null) {
            console.log("HexHandler error: No onLoad registered");
            return;
        }
        if (Number.isNaN(parseFloat(offset)) || !isFinite(offset)) {
            console.log("HexHandler error: Invalid offset " + offset);
            return;
        }

        let slice = fileRef.slice(offset, offset + size);

        reader.readAsArrayBuffer(slice);
    };

    return handler;
});