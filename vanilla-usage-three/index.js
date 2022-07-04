import { Earcut } from "three/src/extras/Earcut.js";
import "array-each-slice";
const points = [
  6.043073357781111, 50.128051662794235, 6.242751092156993, 49.90222565367873,
  6.186320428094177, 49.463802802114515, 5.897759230176405, 49.44266714130703,
  5.674051954784829, 49.529483547557504, 5.782417433300906, 50.09032786722122,
  6.043073357781111, 50.128051662794235,
]; // flat array of vertices like [ x0,y0, x1,y1, x2,y2, ... ]
const triangles = Earcut.triangulate(points, null, 2);
const size = 1;
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
