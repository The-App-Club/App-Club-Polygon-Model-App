function enableDraggableDom(targetDom) {
  let moveX = 0;
  let moveY = 0;
  let prevClientX = 0;
  let prevClientY = 0;

  targetDom.onmousedown = dragStart;
  function dragStart(event) {
    console.log('unko');
    event = event || window.event;
    event.preventDefault();
    prevClientX = event.clientX;
    prevClientY = event.clientY;
    document.onmouseup = dragEnd;
    document.onmousemove = dragOver;
  }
  function dragOver(event) {
    event = event || window.event;
    event.preventDefault();
    moveX = prevClientX - event.clientX;
    moveY = prevClientY - event.clientY;
    prevClientX = event.clientX;
    prevClientY = event.clientY;
    targetDom.style.top = `${targetDom.offsetTop - moveY}px`;
    targetDom.style.left = `${targetDom.offsetLeft - moveX}px`;
  }

  function dragEnd() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function deg2rad(degrees) {
  return (Math.PI / 180) * degrees;
}

function getNextPolygonInfoList(
  centerX,
  centerY,
  radius,
  edgeCount,
  rotationOffset,
  degreeList
) {
  const stepSize = (Math.PI * 2) / edgeCount;
  let points = '';
  for (let edgeIndex = 0; edgeIndex < edgeCount; edgeIndex++) {
    const x =
      centerX +
      radius * Math.cos(deg2rad(degreeList[edgeIndex]) + rotationOffset);
    const y =
      centerY +
      radius * Math.sin(deg2rad(degreeList[edgeIndex]) + rotationOffset);
    points += `${x}, ${y} `;
  }
  return points.trim();
}

function appendSVGChild(elementType, appendToDom, attributes, className) {
  // https://dev.to/gavinsykes/appending-a-child-to-an-svg-using-pure-javascript-1h9g
  const dom = document.createElementNS(
    'http://www.w3.org/2000/svg',
    elementType
  );
  dom.classList.add(className);
  Object.entries(attributes).map((a) => dom.setAttribute(a[0], a[1]));
  appendToDom.appendChild(dom);
  return dom;
}

function createPolygonDom(
  appendToDom,
  polygonPointInfoList,
  polygonStyle,
  className
) {
  appendSVGChild(
    'polygon',
    appendToDom,
    {
      points: polygonPointInfoList,
      style: polygonStyle,
    },
    className
  );
}

function setUpSvgDom() {
  const svgDom = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

  // const svgDom = document.querySelector('svg');
  svgDom.style.width = `${boxWidth}px`;
  svgDom.style.height = `${boxHeight}px`;
  document.body.appendChild(svgDom);
  return svgDom;
}

function getAlphabet(n) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
  return alphabet[n - 1];
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

let rotationOffset = deg2rad(30);
let polygonMinCount = 1;
let polygonMaxCount = 3;
let edgeCount = 3;
let radius = 100;
let boxWidth = window.innerWidth / 4;
let boxHeight = window.innerHeight / 4;
let centerX = window.innerWidth / 12;
let centerY = window.innerHeight / 12;
let degreeList = [-30, -110, 120];
let polygonStyle = `stroke:#000000;stroke-width:1`;

for (let index = polygonMinCount; index <= polygonMaxCount; index++) {
  const grp = mod(index, 26) === 0 ? 26 : mod(index, 26);
  const className = getAlphabet(grp);

  const polygonPointInfoList = getNextPolygonInfoList(
    centerX,
    centerY,
    radius,
    edgeCount,
    rotationOffset * index,
    degreeList
  );

  console.log(polygonPointInfoList);

  const svgDom = setUpSvgDom();

  createPolygonDom(svgDom, polygonPointInfoList, polygonStyle, className);

  enableDraggableDom(svgDom);
}
