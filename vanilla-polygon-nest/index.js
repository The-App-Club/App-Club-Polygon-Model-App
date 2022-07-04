import BABYLON from "babylonjs";
import { pointFromVector, degreesToRadians, radiansToDegrees } from "popmotion";
import { samples } from "culori";
import SVGPathCommander from "svg-path-commander";
const { Scalar } = BABYLON;
const move = ({ fromPoint, angle, pathLength, rotationAngleOffset }) => {
  angle = radiansToDegrees(
    Scalar.NormalizeRadians(degreesToRadians(angle + rotationAngleOffset))
  );
  return pointFromVector(fromPoint, angle, pathLength);
};

const createPolygon = ({ edgeCount, pathLength, rotationAngleOffset }) => {
  const fromPoint = { x: 0, y: 0 };
  let path = ``;
  for (let angle = 0; angle <= 360; angle = angle + 360 / edgeCount) {
    const p = move({ fromPoint, angle, pathLength, rotationAngleOffset });
    if (angle === 0) {
      path = path + `M${p.x},${p.y}`;
    } else {
      path = path + `L${p.x},${p.y}`;
    }
  }

  return path;
};

const nestPolygon = ({ edgeCount }) => {
  return ({ nest }) => {
    return ({ rotationAngleOffset = 0 }) => {
      let path = "";
      samples(nest + 1)
        .slice(1)
        .map((n) => {
          path =
            path +
            createPolygon({ edgeCount, pathLength: n, rotationAngleOffset });
        });
      return new SVGPathCommander(path).normalize().toString();
    };
  };
};

let result = nestPolygon({
  edgeCount: 3,
})({ nest: 3 })({ rotationAngleOffset: 0 });

console.log(result);

result = nestPolygon({
  edgeCount: 3,
})({ nest: 3 })({ rotationAngleOffset: 60 });

console.log(result);

result = nestPolygon({
  edgeCount: 3,
})({ nest: 3 })({ rotationAngleOffset: 120 });

console.log(result);

