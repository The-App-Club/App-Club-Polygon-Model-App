import Quadtree from "https://cdn.skypack.dev/@timohausmann/quadtree-js@1.2.4";
import {
  createQtGrid,
  randomBias,
  randomSnap,
  random
} from "https://cdn.skypack.dev/@georgedoescode/generative-utils";

// import Quadtree from "@timohausmann/quadtree-js";
// import utils from "@georgedoescode/generative-utils";

// const { createQtGrid, randomBias, randomSnap, random } = utils;

const width = 500;
const height = 500;
const focus = {
  x: random(0, width),
  y: random(0, height)
};

const points =  [...Array(100)].map(() => {
  return {
    x: randomBias(0, width, focus.x, 1),
    y: randomBias(0, height, focus.y, 1),
    width: 1,
    height: 1
  };
});

const grid = createQtGrid({
  width,
  height,
  points,
  gap: 2,
  maxQtLevels: 8
});

console.log(grid)

const workspaceDom = document.querySelector(".workspace")

workspaceDom.style.width = `${width}px`
workspaceDom.style.height = `${height}px`

grid.areas.forEach((area) => {
  const boxDom = document.createElement("div")
  boxDom.classList.add("box")
  boxDom.style.top = `${area.y}px`
  boxDom.style.left = `${area.x}px`
  boxDom.style.width = `${area.width}px`
  boxDom.style.height = `${area.height}px`
  workspaceDom.appendChild(boxDom)
});
