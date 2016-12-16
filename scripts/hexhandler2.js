//hexHandler returning a promise

define(function () {
    "use strict";
    const handler = {};
    const reader = new FileReader();

    let fileRef;

    handler.setFile = function (file) {
        fileRef = file;
    };

    handler.getBytes = function (offset, size) {
        return new Promise(
            function (resolve, reject) {
                if (fileRef === undefined) {
                    reject("File reference undefined.");
                    return;
                }

                if (Number.isNaN(parseFloat(offset)) || !isFinite(offset)) {
                    reject("Invalid offset.");
                    return;
                }

                reader.readAsArrayBuffer(fileRef.slice(offset, offset + size));

                reader.onload = function () {
                    resolve(new Uint8Array(reader.result));
                };

                reader.onerror = function() {
                    reject(reader.error);
                };
            }
        );
    };

    return handler;
});