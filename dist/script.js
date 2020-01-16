let grid = [];
let selectedShade = '';
let offset;
let size;
let numLines;
const canvas = document.getElementById("canvas");
canvas.addEventListener("click", shade);


function drawLines() {
    showShading();
    numLines = parseInt(document.getElementById("numCells").value);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
    }
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    size = Math.floor(width / numLines);
    offset = (width % numLines) / 2;
    ctx.lineWidth = 1;
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

                if (grid[i][j].hasOwnProperty('fillStyle')) {
                    shadeCell(grid[i][j]);
                }
            }
        }
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
    return {
        numLines,
        offset
    };
}

function savepdf() {
    canvas.style.visibility = "hidden";
    canvas.style.width = "8.5in";
    canvas.style.height = "11in";
    const options = drawLines();
    const num = options.numLines;
    const imgData = canvas.toDataURL("image/png", 1.0);
    const pdf = new jsPDF({
        unit: "px",
        format: "letter"
    });
    pdf.addImage(imgData, "PNG", 0, 0);
    pdf.save(`${num}x${num} grid.pdf`);
    canvas.style.width = "800px";
    canvas.style.height = "800px";
    drawLines();
    canvas.style.visibility = "visible";
}

function showShading() {
    document.getElementById('shading').classList.remove('hidden');
}

function selectShade(el) {
    addSelected(el);
    selectedShade = window.getComputedStyle(el).getPropertyValue('background-color');
}

function addSelected(el) {
    const element = document.querySelector('.is-focused');
    if (element) {
        element.classList.remove('is-focused');
    }
    el.classList.add('is-focused');
}

function getPosition(event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left - offset,
        y: event.clientY - rect.top - offset
    };
}

function shadeCell(cell) {
    const ctx = canvas.getContext('2d');
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


function shade(event) {

    const pos = getPosition(event);
    if(pos.x < 0 || pos.y < 0){
        return
    }
    const cell = getCell(pos);
    cell.fillStyle = selectedShade;
    shadeCell(cell);


}

// TODO : add shading by dragging