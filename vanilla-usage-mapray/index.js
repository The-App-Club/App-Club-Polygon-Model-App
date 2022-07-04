import "array-each-slice";
import Triangulator from "@mapray/mapray-js/dist/es/Triangulator.js";

const make_serial_indices = (start, count) => {
  let array = new Uint32Array(count);
  for (let i = 0; i < count; ++i) {
    array[i] = start + i;
  }
  return array;
};

// https://github.com/sony/mapray-js/blob/master/packages/mapray/tests/triangulator_tests.js#L50-L60
const points = [0, 0, 1, 0, 1, 1, 0, 1]; // flat array of vertices like [ x0,y0, x1,y1, x2,y2, ... ]

let tr = new Triangulator(points, 0, 2, points.length / 2);
tr.addBoundary(make_serial_indices(0, points.length / 2));

const triangles = tr.run();
const size = 100;
const xyList = points.eachSlice(2);
let path = `M ${xyList[0][0] * size},${xyList[0][1] * size}`;
for (let index = 1; index < xyList.length; index++) {
  const [x, y] = xyList[index];
  path = path + `L ${x * size},${y * size}`;
}
path = path + ` Z`;
console.log(path);

const pathInfoList = [];
let id = 0;
// https://github.com/sony/mapray-js/blob/master/packages/mapray/src/Triangulator.js#L61-L64
for (let i = 0; i < triangles.length; i++) {
  const t0 = triangles[i * 3 + 0];
  const t1 = triangles[i * 3 + 1];
  const t2 = triangles[i * 3 + 2];
  let path = ``;
  if (
    points[t0] !== undefined &&
    points[t1] !== undefined &&
    points[t2] !== undefined
  ) {
    path = path + `M ${xyList[t0][0] * size},${xyList[t0][1] * size}`;
    path = path + ` L ${xyList[t1][0] * size},${xyList[t1][1] * size}`;
    path = path + ` L ${xyList[t2][0] * size},${xyList[t2][1] * size}`;
    path = path + ` Z`;
    pathInfoList.push({
      id,
      path,
    });
    id = id + 1;
  }
}

const result = pathInfoList
  .map((pathInfo) => {
    return pathInfo.path;
  })
  .join("");

console.log(result);
