let sandGrid;
let cellSize = 2; // Size of each cell in the grid aka the size of the sand grains
let numCols, numRows;
let sandHue = 200; // Hue value for the sand color
let colorModeToggle = false;
let eraseModeToggle = false;

function createGrid(cols, rows) {
    let array = new Array(cols);
    for (let col = 0; col < cols; col++) {
        array[col] = new Array(rows).fill(0);
    }
    return array;
}

// Function to check if a given column and row are valid

function isValidCol(col) {
    return col >= 0 && col < numCols;
}

function isValidRow(row) {
    return row >= 0 && row < numRows;
}



function setup() {

    // Set up the canvas according to the window size
    const canvasWidth = floor(windowWidth * 0.6);
    const canvasHeight = floor(windowHeight * 0.6);

    let toggleMode = document.getElementById("toggleMode");
    let toggleErase = document.getElementById("toggleErase");
    let clearCanvas = document.getElementById("clearCanvas");

    let canvas = createCanvas(canvasWidth, canvasHeight);

    let canvasWrapper = document.getElementById("canvas-wrapper");
    canvasWrapper.style.width = `${canvasWidth}px`;
    canvasWrapper.style.height = `${canvasHeight}px`;

    canvas.parent(canvasWrapper);

    let buttonContainer = document.getElementById("button-container");
    buttonContainer.style.width = `${canvasWidth}px`;

    // numCols and numRows are the number of columns and rows in the grid
    colorMode(HSB, 360, 255, 255);
    numCols = floor(width / cellSize); 
    numRows = floor(height / cellSize); 
    sandGrid = createGrid(numCols, numRows);

    toggleMode.addEventListener("click", () => {
        if (toggleMode.classList.contains("active")) {
            toggleMode.classList.remove("active");
            resetCSSColors();
        } else {
            toggleMode.classList.add("active");
            toggleErase.classList.remove("active");
        }

        colorModeToggle = !colorModeToggle;
        eraseModeToggle = false;
    });

    toggleErase.addEventListener("click", () => {
        if (toggleErase.classList.contains("active")) {
            toggleErase.classList.remove("active");
        } else {
            resetCSSColors();
            toggleErase.classList.add("active");
            toggleMode.classList.remove("active");
        }
        eraseModeToggle = !eraseModeToggle;
        colorModeToggle = false;
    });

    clearCanvas.addEventListener("click", () => {
        sandGrid = createGrid(numCols, numRows); // Reset the grid
        background(0); // Clear the visual canvas
        console.log("Canvas cleared");
    });
}


// Function to resize the canvas when the window is resized
// thanks to chatgpt for help with this function
function windowResized() {
    const canvasWidth = floor(windowWidth * 0.6);
    const canvasHeight = floor(windowHeight * 0.6);

    resizeCanvas(canvasWidth, canvasHeight);

    let canvasWrapper = document.getElementById("canvas-wrapper");
    canvasWrapper.style.width = `${canvasWidth}px`;
    canvasWrapper.style.height = `${canvasHeight}px`;

    let buttonContainer = document.getElementById("button-container");
    buttonContainer.style.width = `${canvasWidth}px`;

    numCols = floor(width / cellSize); // Ensure integers
    numRows = floor(height / cellSize); // Ensure integers
    sandGrid = createGrid(numCols, numRows); // Recalculate grid
}


function mouseDragged() {
    let centerX = floor(mouseX / cellSize);
    let centerY = floor(mouseY / cellSize);


    // Draw a circle of sand around the mouse again ty to chatgpt for doing the math
    let radius = 5;
    for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
            let distance = sqrt(dx * dx + dy * dy);

            if (distance <= radius) {
                let targetCol = centerX + dx;
                let targetRow = centerY + dy;

                // check if its in the grid
                if (isValidCol(targetCol) && isValidRow(targetRow)) {
                    if (eraseModeToggle) {
                        // Erase the sand
                        sandGrid[targetCol][targetRow] = 0;
                    } else if (sandGrid[targetCol][targetRow] === 0) {
                        // Draw sand if erase mode is off
                        if (colorModeToggle) {
                            sandGrid[targetCol][targetRow] = sandHue;
                        } else {
                            sandGrid[targetCol][targetRow] = random(30, 50);
                        }
                    }
                }
            }
        }
    }

    if (colorModeToggle && !eraseModeToggle) {
        sandHue = (sandHue + 1) % 360;
        updateCSSColors(sandHue);
    }
}

function updateCSSColors(hue) {
    const hueColor = `hsl(${hue}, 100%, 50%)`;

    document.querySelector("h1").style.color = hueColor;

    document.getElementById("canvas-wrapper").style.borderColor = hueColor;

    document.querySelectorAll("button").forEach((button) => {
        button.style.backgroundColor = hueColor;
        button.style.borderColor = hueColor;
        button.style.color = "white";
    });
}

function resetCSSColors() {

    const title = document.querySelector("h1");
    title.style.color = ""; 

    // Reset canvas border color
    const canvasWrapper = document.getElementById("canvas-wrapper");
    canvasWrapper.style.borderColor = "";

    // Reset button colors
    document.querySelectorAll("button").forEach((button) => {
        button.style.backgroundColor = ""; 
        button.style.borderColor = ""; 
        button.style.color = "";
    });
}


function draw() {
    background(225, 150, 255);
    frameRate(200);

    for (let col = 0; col < numCols; col++) {
        for (let row = 0; row < numRows; row++) {
            let hueValue = sandGrid[col][row];
            if (hueValue > 0) {
                fill(hueValue, colorModeToggle ? 255 : 255, colorModeToggle ? 255 : 255);
                noStroke();
                square(col * cellSize, row * cellSize, cellSize);
            }
        }
    }

    let nextGrid = createGrid(numCols, numRows);

    // Main logic for the sand simulation
    // basically if there is sand in a cell, check if the cell below is empty
    // if it is, move the sand to the cell below
    // the direction the sand falls is either left or right with the random function
    for (let col = 0; col < numCols; col++) {
        for (let row = 0; row < numRows; row++) {
            let hueValue = sandGrid[col][row];

            if (hueValue > 0) {
                let below = sandGrid[col][row + 1];
                let direction = random(1) < 0.5 ? -1 : 1;

                let belowLeft = isValidCol(col - direction) ? sandGrid[col - direction][row + 1] : -1;
                let belowRight = isValidCol(col + direction) ? sandGrid[col + direction][row + 1] : -1;

                if (below === 0) {
                    nextGrid[col][row + 1] = hueValue;
                } else if (belowLeft === 0) {
                    nextGrid[col - direction][row + 1] = hueValue;
                } else if (belowRight === 0) {
                    nextGrid[col + direction][row + 1] = hueValue;
                } else {
                    nextGrid[col][row] = hueValue;
                }
            }
        }
    }

    sandGrid = nextGrid;
}