import { default as earcut } from "earcut";
import "array-each-slice";
import { Delaunay } from "d3-delaunay";

const buildPoints = ({ edgeCount }) => {
  const stepSize = (Math.PI * 2) / edgeCount;
  return [...Array(edgeCount)].map((_, edgeIndex) => {
    return [Math.cos(edgeIndex * stepSize), Math.sin(edgeIndex * stepSize)];
  });
};

const points = buildPoints({ edgeCount: 7 }); // edge count over 6

const doDelaunay = ({ verticles }) => {
  const d = [];
  const delaunay = Delaunay.from(verticles);
  const { points, triangles } = delaunay;
  for (let i = 0; i < triangles.length; i++) {
    const t0 = triangles[i * 3 + 0];
    const t1 = triangles[i * 3 + 1];
    const t2 = triangles[i * 3 + 2];
    let path = "";
    if (
      points[t0 * 2] !== undefined &&
      points[t0 * 2 + 1] !== undefined &&
      points[t1 * 2] !== undefined &&
      points[t1 * 2 + 1] !== undefined &&
      points[t2 * 2] !== undefined &&
      points[t2 * 2 + 1] !== undefined
    ) {
      path = path + `M${points[t0 * 2]},${points[t0 * 2 + 1]}`;
      path = path + `L${points[t1 * 2]},${points[t1 * 2 + 1]}`;
      path = path + `L${points[t2 * 2]},${points[t2 * 2 + 1]}`;
      path = path + `Z`;
      d.push(path);
    }
  }
  return d.join("");
};

const doEarcut = ({ verticles }) => {
  const triangles = earcut(verticles);
  const xyList = verticles.eachSlice(2);
  const d = [];
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
      path = path + `M${xyList[t0][0]},${xyList[t0][1]}`;
      path = path + `L${xyList[t1][0]},${xyList[t1][1]}`;
      path = path + `L${xyList[t2][0]},${xyList[t2][1]}`;
      path = path + `Z`;
      d.push(path)
    }
  }
  return d.join("")
}

const doOriginal = ({ verticles }) => {
  const xyList = verticles.eachSlice(2);
  let path = `M ${xyList[0][0]},${xyList[0][1]}`;
  for (let index = 1; index < xyList.length; index++) {
    const [x, y] = xyList[index];
    path = path + `L${x},${y}`;
  }
  path = path + `Z`;
  return path;
}

const resultOriginal = doOriginal({ verticles: points.flat() }); // flat array of vertices like [ x0,y0, x1,y1, x2,y2, ... ]
console.log(resultOriginal);

const resultDelaunay = doDelaunay({ verticles: points }); // non flat array of vertices like [ [x0,y0], [x1,y1], [x2,y2], ... ]
console.log(resultDelaunay);

const resultEarcut = doEarcut({ verticles: points.flat() }); // flat array of vertices like [ x0,y0, x1,y1, x2,y2, ... ]
console.log(resultEarcut);
