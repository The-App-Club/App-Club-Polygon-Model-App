import bspline from "b-spline";
import { samples } from "culori";
import { interpolate } from "popmotion";
import nj from "numjs";

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
      return 1;
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
  // do spline
  const splinePoints = samples(100).map((t) => {
    return bspline(t, degree, points, knots, weights);
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

const buildPoints = ({ edgeCount }) => {
  const stepSize = (Math.PI * 2) / edgeCount;
  return [...Array(edgeCount)].map((_, edgeIndex) => {
    return [Math.cos(edgeIndex * stepSize), Math.sin(edgeIndex * stepSize)];
  });
};

const points = buildPoints({ edgeCount: 3 });

const { splinePoints: a } = niceBspline({
  points,
  periodic: true,
  degree: 3,
});

const { splinePoints: b } = niceBspline({
  points,
  periodic: true,
  degree: 4,
});

const { splinePoints: c } = niceBspline({
  points,
  periodic: true,
  degree: 5,
});

const { splinePoints: d } = niceBspline({
  points,
  periodic: true,
  degree: 10,
});

const originalPath = makePath({ points, noZ: false });
const splinePathA = makePath({ points: a, noZ: true });
const splinePathB = makePath({ points: b, noZ: true });
const splinePathC = makePath({ points: c, noZ: true });
const splinePathD = makePath({ points: d, noZ: true });
console.log(originalPath);
console.log(splinePathA);
console.log(splinePathB);
console.log(splinePathC);
console.log(splinePathD);
