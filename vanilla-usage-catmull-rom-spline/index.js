import { samples } from "culori";
import { interpolate } from "popmotion";
import { spline } from "./spline.js";

const makePath = ({ points }) => {
  let path = `M ${points[0][0]},${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    path = path + ` L ${points[i][0]},${points[i][1]}`;
  }
  path = path + ` Z`;
  return path;
};

const buildPoints = ({ edgeCount }) => {
  const stepSize = (Math.PI * 2) / edgeCount;
  const resultList = [];
  [...Array(edgeCount)].forEach((_, edgeIndex) => {
    resultList.push([
      Math.cos(edgeIndex * stepSize),
      Math.sin(edgeIndex * stepSize),
    ]);
  });
  return resultList;
};

const makeSplinePath = ({ points, tension = 1, closed = true }) => {
  return spline(points, tension, closed) + `Z`;
};

const edgeCount = 4;
const degree = 2;
const tension = 1;

const points = buildPoints({ edgeCount });
const originalPath = makePath({ points });
const splinePath = makeSplinePath({ points, tension });
console.log(originalPath);
console.log(splinePath);
