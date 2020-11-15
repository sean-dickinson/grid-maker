// import jspdf
import {jsPDF} from "./jspdf/jspdf.es.min.js";

// defining and initializing global variables
let grid = [];
let selectedShade = "";
let offset;
let size;
let numLines;
let width;
let height;
let isDragging = false;

// save references to important elements
const numLinesInput = document.getElementById("numCells");
const showGridCheckbox = document.getElementById("showGrid");
const canvas = document.getElementById("canvas");

// adding event listeners
canvas.addEventListener("mousedown", startDrag);
canvas.addEventListener("mouseup", endDrag);
canvas.addEventListener("mousemove", shade);
numLinesInput.addEventListener("keydown", updateGrid);
showGridCheckbox.addEventListener("change", renderGrid);
document.getElementById('save').addEventListener('click', savepdf);
document.getElementById('reset').addEventListener('click', resetGrid);

document.querySelectorAll('#shading .button').forEach(el => {
  el.addEventListener("click", () => {
    selectShade(el);
  });
})

renderGrid();

function updateGrid(e) {
  if (e.keyCode === 13) {
    renderGrid();
  }
}

function renderGrid() {
  updateCanvasSize();
  clearCanvas();
  updateGridArray();
  drawGridLines();
  shadeCells();
}

function updateCanvasSize() {
  width = canvas.clientWidth;
  height = canvas.clientHeight;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  numLines = parseInt(numLinesInput.value);
  size = Math.floor(width / numLines);
  offset = (width % numLines) / 2;
}


function clearCanvas() {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function updateGridArray() {
  const shouldCreateGrid = grid.length !== numLines;
  if (shouldCreateGrid) {
    grid = [];
  }

  for (let i = 0; i < numLines; i++) {
    if (shouldCreateGrid) {
      grid.push([]);
    }
    for (let j = 0; j < numLines; j++) {
      if (shouldCreateGrid) {
        grid[i].push({
          x: j * size,
          y: size * i
        });
      } else {
        grid[i][j].x = j * size;
        grid[i][j].y = size * i;
      }
    }
  }
}

function drawGridLines() {
  const ctx = canvas.getContext("2d");
  if (!showGridCheckbox.checked) {
    console.log('here');
    return;
  }

  for (let x = offset; x <= width - offset; x += size) {
    ctx.beginPath();
    ctx.moveTo(x, offset);
    ctx.lineTo(x, width - offset);
    ctx.stroke();
  }
  for (let y = offset; y <= width - offset; y += size) {
    ctx.beginPath();
    ctx.moveTo(offset, y);
    ctx.lineTo(width - offset, y);
    ctx.stroke();
  }
}

function shadeCells(){
    for(const row of grid){
        for(const cell of row){
            if (cell.hasOwnProperty("fillStyle")) {
                shadeCell(cell);
              }
        }
    }
}

function savepdf() {
  // hide the grid during resizing
  canvas.style.visibility = "hidden";
  canvas.style.width = "8.5in";
  canvas.style.height = "11in";
  renderGrid();
  const imgData = canvas.toDataURL("image/png", 1.0);
  const pdf = new jsPDF({
    unit: "px",
    format: "letter"
  });
  pdf.addImage(imgData, "PNG", 0, 0);
  pdf.save(`${numLines}x${numLines} grid.pdf`);
  // change grid back to previous size and show it
  canvas.style.width = "800px";
  canvas.style.height = "800px";
  renderGrid();
  canvas.style.visibility = "visible";
}

function selectShade(el) {
  addSelected(el);
  selectedShade = window
    .getComputedStyle(el)
    .getPropertyValue("background-color");
}

function addSelected(el) {
  const element = document.querySelector(".is-focused");
  if (element) {
    element.classList.remove("is-focused");
  }
  el.classList.add("is-focused");
}

function getPosition(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left - offset,
    y: event.clientY - rect.top - offset
  };
}

function shadeCell(cell) {
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = cell.fillStyle;
  ctx.beginPath();
  ctx.rect(cell.x + offset, cell.y + offset, size, size);
  ctx.fill();
  ctx.stroke();
}

function getCell(pos) {
  const x = Math.floor(pos.x / size);
  const y = Math.floor(pos.y / size);
  const cell = grid[y][x];
  return cell;
}

function startDrag(event) {
  isDragging = true;
}

function endDrag(event) {
  isDragging = false;
  const pos = getPosition(event);
  if (isOutOfBounds(pos)) {
    return;
  }
  const cell = getCell(pos);
  cell.fillStyle = selectedShade;
  shadeCell(cell);
}

function shade(event) {
  if (isDragging) {
    const pos = getPosition(event);
    if (isOutOfBounds(pos)) {
      isDragging = false;
      return;
    }
    const cell = getCell(pos);
    if (cell) {
      cell.fillStyle = selectedShade;
      shadeCell(cell);
    } else {
      isDragging = false;
    }
  }
}

function isOutOfBounds(pos) {
  const outBefore = pos.x < 0 || pos.y < 0;
  const outAfter = pos.y > 800 - offset || pos.x > 800 - offset;
  return outBefore || outAfter;
}

function resetGrid() {
  grid = [];
  renderGrid();
}
