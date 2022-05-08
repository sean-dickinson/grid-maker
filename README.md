# grid-maker
A simple web page designed to generate a printable grid of a custom size. This grid can be shaded in with colors of the users choice. The intention behind this page was to help teach students about fractal geometry.

## Live Version
https://grid-maker-1a221.firebaseapp.com

### Features to add
- [x] ability to shade
- [x] ability to select color (for shading)
- [x] ability to shade by dragging
- [x] ability to clear the grid
- [x] ability to hide the grid
- [x] cache last worked on design in local storage
- [x] color-picker rather than preset colors

## Local Development

In order to run this application locally you need the firebase-cli set up so you can test the hosting via the firebase server. 

- Clone the repo
- Run `npm install`
- Run `npm run build` (needed to package the pdf library for the browser)
- Run `firebase serve`