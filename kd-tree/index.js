// https://joeloughton.com/blog/programming/kd-tree-in-javascript/
// https://towardsdatascience.com/understanding-k-dimensional-trees-1cdbf6075f22

function kdtree(vertexInfoList, depth, me) {
  let axis;
  let median = Math.floor(vertexInfoList.length / 2);
  let node = {};

  if (!vertexInfoList || vertexInfoList.length == 0) {
    return;
  }

  // alternate between the axis
  axis = depth % 2;

  // sort point array
  vertexInfoList.sort((a, b) => {
    return a[axis] - b[axis];
  });

  // build and return node

  node.point = {x: vertexInfoList[median].x, y: vertexInfoList[median].y};

  node.left = kdtree(vertexInfoList.slice(0, median), depth + 1);

  node.right = kdtree(vertexInfoList.slice(median + 1), depth + 1);

  return node;
}

let vertexInfoList = [
  {x: 8, y: 6},
  {x: 10, y: 1},
  {x: 5, y: 8},
  {x: 9, y: 7},
  {x: 2, y: 1},
  {x: 3, y: 5},
  {x: 1, y: 7},
  {x: 7, y: 10},
  {x: 2, y: 9},
  {x: 6, y: 2},
];

console.log(JSON.stringify(kdtree(vertexInfoList, 0)));
