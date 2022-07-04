function deg2rad(degrees) {
  return (Math.PI / 180) * degrees;
}

function getNextPolylineInfo(centerX, centerY, degree) {
  var x = centerX + radius * Math.cos(deg2rad(degree));
  var y = centerY + radius * Math.sin(deg2rad(degree));
  return `${centerX}, ${centerY} ${x}, ${y}`;
}

function getNextPolygonInfoList(
  centerX,
  centerY,
  radius,
  edgeCount,
  rotationOffset
) {
  const stepSize = (Math.PI * 2) / edgeCount;
  let points = '';
  for (let edgeIndex = 0; edgeIndex <= edgeCount; edgeIndex++) {
    const x =
      centerX + Math.cos(edgeIndex * stepSize + rotationOffset) * radius;
    const y =
      centerY + Math.sin(edgeIndex * stepSize + rotationOffset) * radius;
    points += `${x}, ${y} `;
  }
  return points.trim();
}

function getNextPolylineInfoList(centerX, centerY, degreeList, resultInfoList) {
  while (degreeList.length > 0) {
    const currentDegree = degreeList.shift();
    const nextPointInfo = getNextPolylineInfo(centerX, centerY, currentDegree);
    resultInfoList.push(nextPointInfo);
    getNextPolylineInfoList(centerX, centerY, degreeList, resultInfoList);
  }
  return resultInfoList;
}

function appendSVGChild(elementType, appendToDom, attributes) {
  // https://dev.to/gavinsykes/appending-a-child-to-an-svg-using-pure-javascript-1h9g
  const dom = document.createElementNS(
    'http://www.w3.org/2000/svg',
    elementType
  );
  Object.entries(attributes).map((a) => dom.setAttribute(a[0], a[1]));
  appendToDom.appendChild(dom);
  return dom;
}

function createCubeDom(
  appendToDom,
  polygonPointInfoList,
  polylinePointInfoList,
  polygonStyle,
  polylineStyle
) {
  appendSVGChild('polygon', appendToDom, {
    points: polygonPointInfoList,
    style: polygonStyle,
  });
  appendSVGChild('polyline', appendToDom, {
    points: polylinePointInfoList,
    style: polylineStyle,
  });
}

function setUpSvgDom(boxWidth, boxHeight) {
  const svgDom = document.querySelector('svg');
  svgDom.style.width = `${boxWidth}px`;
  svgDom.style.height = `${boxHeight}px`;
  return svgDom;
}

let rotationOffset = deg2rad(30);
let edgeCount = 6;
let radius = 200;
let boxWidth = 500;
let boxHeight = 500;
let centerX = boxWidth / 2;
let centerY = boxHeight / 2;
let degreeList = [-30, -150, -270];
let polygonPointInfoList = getNextPolygonInfoList(
  centerX,
  centerY,
  radius,
  edgeCount,
  rotationOffset
);

let polylinePointInfoList = getNextPolylineInfoList(
  centerX,
  centerY,
  degreeList,
  []
);

let polygonStyle = `fill:#e49c3e;stroke:#000000;stroke-width:1`;
let polylineStyle = `fill:none;stroke:#000000;stroke-width:1`;

let svgDom = setUpSvgDom(boxWidth, boxHeight);

createCubeDom(
  svgDom,
  polygonPointInfoList,
  polylinePointInfoList,
  polygonStyle,
  polylineStyle
);
