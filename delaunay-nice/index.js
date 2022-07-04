import Delaunator from "delaunator";
import { readFileSync } from "fs";
import * as THREE from "three";
const { Vector2 } = { ...THREE };

function loadJSON(path) {
  return JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8"));
}

(async () => {
  const points = await loadJSON("./ukraine.json");
  const d = new Delaunator([].concat(...points));
  const triangles = d.triangles;
  const coordinates = [];

  for (let index = 0; index < triangles.length; index++) {
    coordinates.push([
      points[triangles[index]],
      points[triangles[index + 1]],
      points[triangles[index + 2]],
    ]);
  }
  const normarizedCoordinates = [];
  const norm = 1;
  for (let i = 0; i < coordinates.length; i++) {
    const tmp=[]
    for (let j = 0; j < coordinates[i].length; j++) {
      const n = coordinates[i][j];
      if (n) {
        const { x, y } = { ...new Vector2(...n).normalize() };
        tmp.push({ x: x * norm, y: y * norm });
      }
    }
    normarizedCoordinates.push(tmp)
  }
  console.log(JSON.stringify(normarizedCoordinates));
})();
