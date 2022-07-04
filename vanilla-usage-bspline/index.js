import bspline from "b-spline";
import { samples } from "culori";
import { interpolate, snap } from "popmotion";

const makePath = ({ points }) => {
  let path = `M ${points[0][0]},${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    path = path + ` L ${points[i][0]},${points[i][1]}`;
  }
  path = path + ` Z`;
  return path;
};

const createKnots = ({ n, k = 0.25 }) => {
  const nuts = [...Array(n).keys()].slice(3, n - 3);
  const min = Math.min(...nuts);
  const max = Math.max(...nuts);
  const snapTo = snap(k);
  const knots = nuts.map((t) => {
    return snapTo(interpolate([min, max], [0.2, 0.8])(t));
  });
  knots.unshift(0);
  knots.unshift(0);
  knots.unshift(0);
  knots.push(1);
  knots.push(1);
  knots.push(1);
  return knots;
};

const points = [
  [0.0, -0.5], // c0 ここは動かさないほうがきれいに丸みを帯びる
  [-0.5, -0.5],
  [-0.5, -0.15], // c1 -0.5<=x<=0.5
  [-0.5, 0.5],
  [0.2, 0.5], // c2 -0.5<=x<=0.5
  [0.5, 0.5],
  [0.5, 0.2], // c3 -0.5<=x<=0.5
  [0.5, -0.5],
  [0.0, -0.5],
];

const degree = 2;
const w = Math.pow(2, 0.5) / 12;
const weights = [1, w, 1, w, 1, w, 1, w, 1];
const knots = createKnots({ n: points.length + degree + 1 });
const splinePoints = [];
for (let t = 0; t < 1; t += 0.01) {
  const point = bspline(t, degree, points, knots, weights);
  splinePoints.push(point);
}

const originalPath = makePath({ points: points });
const splinePath = makePath({ points: splinePoints });
console.log(originalPath);
console.log(splinePath);
