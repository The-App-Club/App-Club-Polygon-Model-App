import simplify from "simplify-js";
import bspline from "b-spline";
import { samples } from "culori";
import { interpolate } from "popmotion";
import SVGPathCommander from "svg-path-commander";
import nj from "numjs";
import { default as chance } from "chance";

const divmod = (n, m) => {
  const quotient = Math.floor(n / m);
  const remainder = n % m;
  return { factor: quotient, fraction: remainder };
};

const niceBspline = ({ points = [], n = 100, degree = 3, periodic = true }) => {
  let knots = [];
  let count = points.length;
  let weights = points.map((p) => {
    return 1;
    // return chance().integer({ min: 1, max: 10 });
  });
  // If periodic, extend the point array by count+degree+1
  if (periodic) {
    const { factor, fraction } = divmod(count + degree + 1, count);
    points = [
      ...[...Array(factor).keys()]
        .map((_, index) => {
          return points;
        })
        .flat(),
      ...points.slice(0, fraction),
    ];
    count = points.length;
    weights = points.map((p) => {
      return chance().integer({ min: 1, max: 10 });
    });
    // https://numpy.org/doc/stable/reference/generated/numpy.clip.html
    // https://github.com/nicolaspanel/numjs
    degree = nj.clip(degree, 1, degree).tolist()[0];
  } else {
    // If opened, prevent degree from exceeding count-1
    degree = nj.clip(degree, 1, count - 1).tolist()[0];
  }

  // Calculate knot vector
  if (periodic) {
    knots.push(...nj.arange(0 - degree, count + degree + degree - 1).tolist());
    knots = knots.slice(0, count + degree + 1);
    // knots = knots.slice(degree + 1)
  } else {
    knots.push(
      ...[...Array(degree).keys()].map((_, index) => {
        return 0;
      })
    );
    knots.push(...nj.arange(count - degree + 1).tolist());
    knots.push(
      ...[...Array(degree).keys()].map((_, index) => {
        return count - degree;
      })
    );
  }
  // Calculate query range
  const splinePoints = samples(100).map((t) => {
    return bspline(t, degree, points, knots);
  });
  return { count, degree, points, knots, splinePoints };
};

const makePath = ({ points, noZ }) => {
  let path = `M ${points[0][0]},${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    path = path + ` L ${points[i][0]},${points[i][1]}`;
  }
  path = path + (noZ ? `` : ` Z`);
  return path;
};

const formatPoint = ([x, y]) => {
  return { x, y };
};

const unFormatPoint = ({ x, y }) => {
  return [x, y];
};

const highQuality = true;
const tolerance = 0.03;

const points = [
  [50, 25],
  [59, 12],
  [50, 10],
  [57, 2],
  [40, 4],
  [40, 14],
];

const { count, degree, knots, splinePoints } = niceBspline({
  points,
  periodic: true,
});

console.log({ count, degree, knots }, knots.length, count + degree + 1);

const originalPath = makePath({ points, noZ: false });
const splinePath = makePath({ points: splinePoints, noZ: true });
const simplified = simplify(
  splinePoints.map((point) => {
    return formatPoint([...point]);
  }),
  tolerance,
  highQuality
);
const simplifiedSplinePoints = simplified.map((point) => {
  return unFormatPoint({ ...point });
});
const simplifiedSplinePath = makePath({
  points: simplifiedSplinePoints,
  noZ: true,
});
console.log(originalPath);
// console.log(splinePath);
console.log(simplifiedSplinePath);
