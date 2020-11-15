// import jspdf
import {jsPDF} from "./jspdf/jspdf.es.min.js";

// defining and initializing global variables
let grid = [];
let selectedShade = "#00d1b2";
let offset;
let size;
let numLines;
let width;
let height;
let isDragging = false;
let usedColors = [];

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

// check local storage
checkStorage();
// draw grid
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
  shadeCells();
  drawGridLines();
  updateUsedColors();
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

function shadeCells() {
  for (const row of grid) {
    for (const cell of row) {
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

function selectShade(color) {
  selectedShade = color;
}

function buttonColorSelect(event){
  const el = event.target;
  const buttons = document.querySelectorAll('#usedColors .button');
  for(const button of buttons){
    button.classList.remove('is-focused');
  }
  
  el.classList.add('is-focused');
  const color = el.dataset.color;
  selectedShade = color;

}

function updateUsedColors(){
  const usedColorContainer = document.getElementById('usedColors');
  usedColorContainer.innerHTML = '';
  for(const color of usedColors){
    const el = document.createElement('button');
    el.classList.add('button');
    el.style = `background-color: ${color}`;
    el.dataset.color = color;
    usedColorContainer.appendChild(el);
    el.addEventListener('click', buttonColorSelect)
  }
}

function usedColorRemove(color){
  if(!color){
    return
  }
  for (const row of grid) {
    for (const cell of row) {
      if(cell.hasOwnProperty('fillStyle')){
        if(cell.fillStyle === color){
          return
        }
      }
    }
  }
  const i = usedColors.indexOf(color);
  usedColors.splice(i, 1);
  updateUsedColors();
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
  if(!cell.hasOwnProperty('fillStyle')){
    ctx.fillStyle = '#fff';
  } else {
    ctx.fillStyle = cell.fillStyle;
    if(!usedColors.includes(cell.fillStyle)){
      usedColors.push(cell.fillStyle);
      updateUsedColors();
    }
  }
  ctx.beginPath();
  ctx.rect(cell.x + offset, cell.y + offset, size, size);
  ctx.fill();
  updateStorage();
  drawGridLines();
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
  const isShift = event.shiftKey;
  const cell = getCell(pos);
  const color = cell.fillStyle;
  if(isShift){
    delete cell.fillStyle;
  } else {  
    cell.fillStyle = selectedShade;
  }
  shadeCell(cell);
  usedColorRemove(color);
}

function shade(event) {
  if (isDragging) {
    const pos = getPosition(event);
    if (isOutOfBounds(pos)) {
      isDragging = false;
      return;
    }
    const isShift = event.shiftKey;
    const cell = getCell(pos);
    if (cell) {
      const color = cell.fillStyle;
      if(isShift){
        delete cell.fillStyle;
      } else {
        cell.fillStyle = selectedShade;
      }
      shadeCell(cell);
      usedColorRemove(color);
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
  deleteStorage();
  renderGrid();
  usedColors = [];
  updateUsedColors();
}

function checkStorage() {
  const savedGrid = window.localStorage.getItem("savedGrid");
  if (savedGrid) {
    grid = JSON.parse(savedGrid);
    numLinesInput.value = grid.length;
    showNotification();
  }
}

function updateStorage() {
  window.localStorage.setItem("savedGrid", JSON.stringify(grid));
}

function deleteStorage() {
  window.localStorage.removeItem("savedGrid");
}

function showNotification() {
  const notification = document.createElement("div");
  notification.classList.add("notification");
  notification.classList.add("is-info");
  notification.classList.add("hidden");
  notification.classList.add("fixed-notification");
  const button = document.createElement("button");
  button.classList.add("delete");
  button.onclick = removeNotification;
  notification.appendChild(button);
  notification.appendChild(
    document.createTextNode(
      "We've loaded the last grid you were working on for you"
    )
  );
  document.body.appendChild(notification);
  setTimeout(() => notification.classList.remove('hidden'), 300);
}

function removeNotification(event) {
  const element = event.toElement;
  element.parentNode.remove();
}
