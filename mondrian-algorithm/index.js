import './index.scss';
// generate a grid width x height
const generateGrid = (width, height) => {
  let gridRow = [];
  for (let i = 0; i < width; i++) {
    gridRow.push(0);
  }
  let grid = [];
  for (let g = 0; g < height; g++) {
    grid.push(gridRow);
  }
  for (let d = 0; d < width * height; d++) {
    let section = document.getElementById('grid');
    section.style.gridTemplateColumns = `repeat(${width}, 1fr)`;
    section.style.gridTemplateRows = `repeat(${height}, 1fr)`;
  }
  return grid;
};

//update HTML and CSS
const updateHTMLandCSS = (
  elems, //rectanglesTotal in total
  colIndex, //col
  rowIndex, //row
  cols, //moveRight
  rows, //moveDown
  squareColor //color
) => {
  document
    .getElementById('grid')
    .appendChild(document.createElement('div'))
    .classList.add(`square${elems}`);

  document.querySelector(`.square${elems}`).style.gridArea = `${rowIndex + 1}/${
    colIndex + 1
  }/${rowIndex + rows + 1}/${colIndex + cols + 1}`;
  document.querySelector(`.square${elems}`).style.background = squareColor;
  updateDataId(
    squareColor,
    `${rowIndex + 1}/${colIndex + 1}/${rowIndex + rows + 1}/${
      colIndex + cols + 1
    }`
  );
};

let data_colors = '';
let data_gridArea = '';
const updateDataId = (colorString, gridAreaStr) => {
  data_colors.concat(colorString);
  data_gridArea.concat(gridAreaStr);
  document
    .getElementById('grid')
    .setAttribute('data-id', `${data_colors}${data_gridArea}`);
};

const generateMondrian = () => {
  document.getElementById('grid').innerHTML = '';
  const colorS = [
    '#243982', //blue
    '#e03e33', //red
    '#f0c943', // yellow
    '#edebe0', // white
    '#edebe0', //white
    '#edebe0', //white
    '#d7dee2', // grey
    '#d7dee2', // grey
    '#243982', //blue
    '#e03e33', //red
    '#f0c943', // yellow
    '#edebe0', // white
    '#edebe0', //white
    '#edebe0', //white
    '#d7dee2', // grey
    '#d7dee2', // grey
    '#181411', // black
  ];
  const gridWidth = generateRandomNumber(14, 15);
  const gridHeight = generateRandomNumber(14, 15);
  let grid = generateGrid(gridWidth, gridHeight);
  let rectanglesTotal = 1;

  // loop through rows and columns
  for (let row = 0; row < gridHeight; row++) {
    for (let col = 0; col < gridWidth; col++) {
      if (grid[row][col] === 0) {
        //spots available
        const availabilityDown = gridHeight - row - 1;
        let indxOfNextSpace = col + 1;
        let availabilityRight = 0;

        for (let i = indxOfNextSpace; i < gridWidth; i++) {
          if (grid[row][i] !== 0) {
            break;
          }
          availabilityRight++;
        }

        //how many available spots to move
        const moveRight = generateRandomNumber(1, availabilityRight);
        const moveDown = generateRandomNumber(1, availabilityDown);

        //chose a color and change the grid array item from 0 to color name
        let color = colorS[generateRandomNumber(0, colorS.length - 1)];

        let newGrid = grid.map((rows, index) => {
          if (index >= row && index <= row + moveDown - 1) {
            let newCols = rows.map((cols, i) => {
              if (i >= col && i <= col + moveRight - 1 && cols === 0) {
                return color;
              } else return cols;
            });
            return newCols;
          } else return rows;
        });
        console.log(newGrid);
        grid = newGrid;

        //update HTML and CSS from utils.js
        updateHTMLandCSS(rectanglesTotal, col, row, moveRight, moveDown, color);
        rectanglesTotal++;
      }
    }
  }
};

document.onload = generateMondrian();
document.getElementsByTagName('button')[0].onclick = function () {
  generateMondrian();
};
document.getElementById('grid').onclick = function () {
  generateMondrian();
};
// HELPER FUNCTIONS utils.js
// generate random number between min and max
function generateRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
