import * as turf from "@turf/turf";

const polygon = turf.polygon( [
  [
    [6.043073357781111, 50.128051662794235],
    [6.242751092156993, 49.90222565367873],
    [6.186320428094177, 49.463802802114515],
    [5.897759230176405, 49.44266714130703],
    [5.674051954784829, 49.529483547557504],
    [5.782417433300906, 50.09032786722122],
    [6.043073357781111, 50.128051662794235]
  ]
])

// const polygon = turf.polygon([
//   [
//     [11, 0],
//     [22, 4],
//     [31, 0],
//     [31, 11],
//     [21, 15],
//     [11, 11],
//     [11, 0],
//   ],
// ]);

const smoothed = turf.polygonSmooth(polygon, { iterations: 3 });

const size = 1;

const makePath = ({ coordinates }) => {
  const pathInfoList = [];
  let id = 0;
  let path = `M ${coordinates[0][0] * size},${coordinates[0][1] * size}`;
  for (let i = 1; i < coordinates.length; i++) {
    path = path + ` L ${coordinates[i][0] * size},${coordinates[i][1] * size}`;
  }
  path = path + ` Z`;
  return path;
};

const original = makePath({coordinates: polygon.geometry.coordinates.flat()})
console.log(original);
const morph = makePath({coordinates: smoothed.features[0].geometry.coordinates.flat()})
console.log(morph);
