function drawLines() {
    const canvas = document.getElementById("canvas");
    const numLines = parseInt(document.getElementById("numCells").value);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
    }
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const size = Math.floor(width / numLines);
    const offset = (width % numLines) / 2;
    ctx.lineWidth = 1;

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
    const canvas = document.getElementById("canvas");
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