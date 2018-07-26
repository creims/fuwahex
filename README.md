# fuwahex
A light hex viewer made as a learning project.

For those wondering, "fuwa" refers to the Japanese term "fuwafuwa" (フワフワ), an onomatopoeia meaning "frivolously," "soft," or "buoyantly."

This project is inspired by the free hex editor Frhed: http://frhed.sourceforge.net/en/

NOTE: Unlike Frhed, this is NOT meant to be a hex editor, merely a hex viewer.

## Project Goals
- Code a useful thing in JavaScript!
- Use the new ECMAScript 6 additions where they make sense (read: everywhere!)
- ~~Get used to using transpilation (babel) and a module system (require.js)~~
- ^ Updated to use ES6 modules now that modern browsers support them. Not as portable, but simpler.

## Desired Features
- Should be able to load a local file and view the file's bytes
- Resizable hexadecimal and UTF views for byte data
- Click a byte to highlight it in both views
- Scroll bar and seek functions to view the bytes you're interested in

## To Do
- Seek function
- Resize data views via user-supplied row/column counts
