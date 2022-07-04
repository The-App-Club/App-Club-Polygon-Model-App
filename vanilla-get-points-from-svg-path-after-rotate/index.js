import { samples } from "culori";
import { interpolate } from "popmotion";
import { spline } from "./spline.js";

import SVGPathCommander from "svg-path-commander";

const makePath = ({ points }) => {
  let path = `M ${points[0][0]},${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    path = path + ` L ${points[i][0]},${points[i][1]}`;
  }
  path = path + ` Z`;
  return path;
};

const unFormatPoint = ({ x, y }) => {
  return [x, y];
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
  return spline(points, tension, closed);
};

const rotate = 30;
const edgeCount = 3;
const degree = 2;
const tension = 1;

const points = buildPoints({ edgeCount });
const originalPath = makePath({ points });
const splinePath = makeSplinePath({ points, tension });

const instance = new SVGPathCommander(splinePath).transform({ rotate });

const rotatedPoints = instance.segments.slice(1, -1).map((points) => {
  return points.slice(-2);
});

console.log(rotatedPoints);

const rotatedPath = instance.toString();

console.log(rotatedPath);

const nicePath = makePath({ points: rotatedPoints });
console.log(nicePath);
