import * as d3 from "d3";
import { samples } from "culori";
import { degreesToRadians } from "popmotion";
import BABYLON from "babylonjs";
const { Scalar } = BABYLON;

const generateRadList = ({ edgeCount, rotationAngleOffset }) => {
  rotationAngleOffset = Scalar.NormalizeRadians(
    degreesToRadians(rotationAngleOffset)
  );
  return d3.range(edgeCount).map((num) => {
    return (num / edgeCount) * (2 * Math.PI) + rotationAngleOffset;
  });
};

const createPolygon = ({ edgeCount, scaler, rotationAngleOffset }) => {
  const resultList = [];
  const radList = generateRadList({ edgeCount, rotationAngleOffset });
  let path = `M${scaler(Math.cos(radList[0]))},${scaler(Math.sin(radList[0]))}`;
  radList.slice(1).forEach((item) => {
    path = path + `L${scaler(Math.cos(item))},${scaler(Math.sin(item))}`;
  });
  path = path + `Z`;
  return path;
};

const createScaler = ({ width }) => {
  return d3
    .scaleLinear()
    .domain([-1, 1])
    .range([-width / 2, width / 2]);
};

const createNestPolygon = ({
  width,
  edgeCount,
  nestCount,
  rotationAngleOffset,
}) => {
  const widthInfoList = samples(nestCount + 1)
    .slice(1)
    .map((t) => {
      return { t, w: width * t };
    });
  let resultPath = ``;
  for (let index = 0; index < widthInfoList.length; index++) {
    const widthInfo = widthInfoList[index];
    resultPath =
      resultPath +
      createPolygon({
        edgeCount,
        scaler: createScaler({ width: widthInfo.w }),
        rotationAngleOffset,
      });
  }
  return resultPath;
};

const result = createNestPolygon({
  edgeCount: 3,
  nestCount: 3,
  width: 2,
  rotationAngleOffset: 60,
});

console.log(result);
