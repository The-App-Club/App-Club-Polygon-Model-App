import { samples } from "culori";
import { interpolate } from "popmotion";
import { default as chance } from "chance";
import nurbs from "nurbs";
import linspace from "linspace";

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

const curveToTrace = (c) => {
  const pointList = [];
  const splinePointList = [];
  const xy = [];
  const {
    points,
    domain,
    size: [niceSize],
  } = c;
  for (let i = 0; i < niceSize; i++) {
    pointList.push([points[i][0], points[i][1]]);
  }
  const min = domain[0][0];
  const max = domain[0][1];
  const tList = samples(100).map((t) => {
    return interpolate([0, 1], [min, max])(t);
  });
  tList.forEach((t, i) => {
    c.evaluate(xy, t);
    splinePointList.push([xy[0], xy[1]]);
  });
  return { pointList, splinePointList, tList };
};

const createKnots = ({ points, degree = 0 }) => {
  // uniformly spaced knot vector
  // https://nurbs-python.readthedocs.io/en/latest/module_knotvector.html
  // https://github.com/orbingol/NURBS-Python/blob/5.x/geomdl/knotvector.py#L15-L65
  // https://pages.mtu.edu/~shene/COURSES/cs3621/NOTES/INT-APP/PARA-knot-generation.html

  const knots = [];

  for (let index = 0; index < degree; index++) {
    knots.unshift(0);
  }

  const segment = points.length - (degree + 1);

  knots.push(...linspace(0, 1, segment + 2));

  for (let index = 0; index < degree; index++) {
    knots.push(1);
  }

  return knots;
};

const degree = 2;

const points = buildPoints({ edgeCount: 3 });
const originalPath = makePath({ points });
const knots = createKnots({ points, degree });

const curve = nurbs({
  points,
  degree,
  boundary: "closed",
  // knots,
  weights: [5,5,5],
  // weights: points.map((p) => {
  //   return chance().integer({ min: 1, max: 10 });
  // }),
});

const { pointList, splinePointList, tList } = curveToTrace(curve);
const a = makePath({ points: pointList });
console.log(a);
const b = makePath({ points: splinePointList });
console.log(b);
