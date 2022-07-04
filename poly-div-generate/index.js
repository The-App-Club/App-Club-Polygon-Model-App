function enableDraggableDom(targetDom, polygonPointList) {
  let moveXOnDrag = 0;
  let moveYOnDrag = 0;
  let prevClientXOnDrag = 0;
  let prevClientYOnDrag = 0;
  let centerOfGravity = 0;
  let mode;
  let startDegree = 0;
  let degree = 0;
  let rotateDegree = 0;

  let polygonWidth = parameter.radius * 2 + 5;
  let polygonHeight = parameter.radius * 2 + 5;

  let moveXOnResize = 0;
  let moveYOnResize = 0;
  let prevClientXOnResize = 0;
  let prevClientYOnResize = 0;

  const itemDom = targetDom.querySelector('.item');
  targetDom.onmousedown = dragStart;

  function getOtherVertexInfoList(resizedVertexDom) {
    const otherVertexInfoList = [];
    let currentVertexInfo = {};
    const vertexInfoList = getVertexInfoList();
    for (let index = 0; index < vertexInfoList.length; index++) {
      // https://github.com/GRI-Inc/Scroll-Story-Telling-Webapp/blob/development/app/components/Item/ZoomArea.vue#L79
      const vertexInfo = vertexInfoList[index];
      const vertexDom = vertexInfo[0];
      if (vertexDom !== resizedVertexDom) {
        otherVertexInfoList.push({x: vertexInfo[1], y: vertexInfo[2]});
      } else {
        currentVertexInfo = {x: vertexInfo[1], y: vertexInfo[2]};
      }
    }
    return {currentVertexInfo, otherVertexInfoList};
  }

  function reflectVertex() {
    const vertexInfoList = getVertexInfoList();
    for (let index = 0; index < vertexInfoList.length; index++) {
      const vertexInfo = vertexInfoList[index];
      const vertexDom = vertexInfo[0];
      vertexDom.style.top = `${vertexDom.offsetTop}px`;
      vertexDom.style.left = `${vertexDom.offsetLeft}px`;
    }
  }

  function reflectSurface() {
    const vertexInfoList = getVertexInfoList();
    let polygonPointInfoList = [];
    for (let index = 0; index < vertexInfoList.length; index++) {
      const vertexInfo = vertexInfoList[index];
      const vertexDom = vertexInfo[0];
      polygonPointInfoList.push(
        `${vertexDom.offsetLeft + 5}px ${vertexDom.offsetTop + 5}px`
      );
    }
    itemDom.style.setProperty(
      '--clipPath',
      `polygon(${polygonPointInfoList.join(', ')})`
    );
  }

  const vertexInfoList = getVertexInfoList();
  for (let index = 0; index < vertexInfoList.length; index++) {
    // https://github.com/GRI-Inc/Scroll-Story-Telling-Webapp/blob/development/app/components/Item/ZoomArea.vue#L79
    const vertexInfo = vertexInfoList[index];
    const vertexDom = vertexInfo[0];
    const vertexDomPosX = vertexInfo[1];
    const vertexDomPosY = vertexInfo[2];
    vertexDom.onmousedown = startResize;

    function startResize(e) {
      e.preventDefault();
      startDegree = 0;
      // degree = 0; // 回転角度の累積和は保持しておく
      rotateDegree = 0;
      prevClientXOnResize = e.clientX;
      prevClientYOnResize = e.clientY;
      document.onmousemove = resize;
      document.onmouseup = stopResize;
    }

    function nice(targetDom) {
      // https://www.titanwolf.org/Network/q/a67ce8bf-2093-4bc2-ba6e-702c032cd189/y
      // https://stackoverflow.com/questions/7287173/retrieving-correct-offsettop-and-offsetleft-of-an-element-after-a-css3-rotation/10169886
      // http://thenewcode.com/1124/Rotating-Elements-To-Mouse-and-Touch-Locations-Using-JavaScript
      let offsetLeft = 0;
      let offsetTop = 0;

      do {
        offsetLeft += targetDom.offsetLeft;
        offsetTop += targetDom.offsetTop;

        targetDom = targetDom.offsetParent;
      } while (targetDom);

      return {x: offsetLeft, y: offsetTop};
    }

    function resize(e) {
      moveXOnResize = prevClientXOnResize - e.clientX;
      moveYOnResize = prevClientYOnResize - e.clientY;
      prevClientXOnResize = e.clientX;
      prevClientYOnResize = e.clientY;
      vertexDom.style.top = `${vertexDom.offsetTop - moveYOnResize}px`;
      vertexDom.style.left = `${vertexDom.offsetLeft - moveXOnResize}px`;
      reflectSurface();
      const {currentVertexInfo, otherVertexInfoList} =
        getOtherVertexInfoList(vertexDom);
      const newDegreeList = getDegreesWith(
        currentVertexInfo,
        otherVertexInfoList
      );
      // parameter.degree1 = newDegreeList[0];
      // parameter.degree2 = newDegreeList[1];
      // parameter.degree3 = newDegreeList[2];
      // controllerInfo['Degree 1'] = newDegreeList[0];
      // controllerInfo['Degree 2'] = newDegreeList[1];
      // controllerInfo['Degree 3'] = newDegreeList[2];
      // for (let i in gui.__controllers) {
      //   gui.__controllers[i].updateDisplay();
      // }
    }
    function stopResize() {
      document.onmousemove = null;
      document.onmouseup = null;
    }
  }

  function convertObjectToJson(targetObject) {
    return JSON.stringify(targetObject);
  }

  function convertJsonToObject(targetJson) {
    return JSON.parse(targetJson);
  }

  function disconnectObserve(targetObject) {
    return convertJsonToObject(convertObjectToJson(targetObject));
  }
  function getVertexInfoList() {
    const vertexInfoList = [];
    const vertexDomList = [...targetDom.querySelectorAll('.vertex')];
    for (let index = 0; index < vertexDomList.length; index++) {
      const vertexDom = vertexDomList[index];
      const resultInfo = disconnectObserve(vertexDom.getBoundingClientRect());
      const resultList = [vertexDom, resultInfo.x, resultInfo.y];
      vertexInfoList.push(resultList);
    }
    return vertexInfoList;
  }

  function getDegreesWith(currentVertexInfo, otherVertexInfoList) {
    // https://imagingsolution.blog.fc2.com/blog-entry-50.html
    // https://ics.media/entry/15321/
    // http://www5d.biglobe.ne.jp/~noocyte/Programming/Geometry/RotationDirection.html
    // ６．２つのＮ次元ベクトルのなす角 (回転角) θと回転方向を求める．

    let resultAngleList = [];

    let ba = new Array(2);
    ba[0] = currentVertexInfo.x - otherVertexInfoList[0].x;
    ba[1] = currentVertexInfo.y - otherVertexInfoList[0].y;
    let bc = new Array(2);
    bc[0] = otherVertexInfoList[1].x - otherVertexInfoList[0].x;
    bc[1] = otherVertexInfoList[1].y - otherVertexInfoList[0].y;

    let babc = ba[0] * bc[0] + ba[1] * bc[1];
    let ban = ba[0] * ba[0] + ba[1] * ba[1];
    let bcn = bc[0] * bc[0] + bc[1] * bc[1];
    let radian = Math.acos(babc / Math.sqrt(ban * bcn));
    let angle = (radian * 180) / Math.PI;

    resultAngleList.push(angle);

    ba[0] = currentVertexInfo.x - otherVertexInfoList[1].x;
    ba[1] = currentVertexInfo.y - otherVertexInfoList[1].y;
    bc[0] = otherVertexInfoList[0].x - otherVertexInfoList[1].x;
    bc[1] = otherVertexInfoList[0].y - otherVertexInfoList[1].y;

    babc = ba[0] * bc[0] + ba[1] * bc[1];
    ban = ba[0] * ba[0] + ba[1] * ba[1];
    bcn = bc[0] * bc[0] + bc[1] * bc[1];
    radian = Math.acos(babc / Math.sqrt(ban * bcn));
    angle = (radian * 180) / Math.PI;

    resultAngleList.push(angle);

    const remainAngle =
      180 -
      resultAngleList.reduce((a, c) => {
        return a + c;
      }, 0);

    resultAngleList.push(remainAngle);

    return resultAngleList;
  }

  function getDegrees(start, end) {
    // https://stackoverflow.com/questions/17574424/how-to-use-atan2-in-combination-with-other-radian-angle-systems
    // https://stackoverflow.com/questions/1311049/how-to-map-atan2-to-degrees-0-360
    const radians = Math.atan2(end.y - start.y, end.x - start.x);
    const degrees = Math.round(radians * (180 / Math.PI));
    return degrees;
  }

  function getCenterOfGravityOnTriangle(s1, s2, s3) {
    // http://www.mathlion.jp/article/ar130.html
    return {
      x: (s1.x + s2.x + s3.x) / 3,
      y: (s1.y + s2.y + s3.y) / 3,
    };
  }

  function getCenterOfGravityOnRectangle() {
    const resultInfo = disconnectObserve(targetDom.getBoundingClientRect());
    return {
      x: resultInfo.x + resultInfo.width / 2,
      y: resultInfo.y + resultInfo.height / 2,
    };
  }

  function dragStart(event) {
    event = event || window.event;
    event.preventDefault();
    if (event.target.classList.contains('rotate')) {
      // 実装ムズイ...
      // return;
      mode = 'rotate';
      centerOfGravity = getCenterOfGravityOnRectangle();

      // https://bl.ocks.org/joyrexus/7207044
      const radians = Math.atan2(
        event.clientY - centerOfGravity.y,
        event.clientX - centerOfGravity.x
      );
      startDegree = Math.round(radians * (180 / Math.PI));
      document.onmousemove = rotateOver;
    }
    if (event.target.classList.contains('item')) {
      mode = 'item';
      document.onmousemove = dragOver;
    }
    prevClientXOnDrag = event.clientX;
    prevClientYOnDrag = event.clientY;
    document.onmouseup = dragEnd;
  }

  function rotateOver(event) {
    // https://stackoverflow.com/questions/33449101/rotate-a-div-towards-the-direction-of-the-mouse-using-atan2
    // https://jsfiddle.net/o5jjosvu/65/
    event = event || window.event;
    event.preventDefault();
    prevClientXOnDrag = event.clientX;
    prevClientYOnDrag = event.clientY;

    centerOfGravity = getCenterOfGravityOnRectangle();
    const start = {x: centerOfGravity.x, y: centerOfGravity.y};
    const end = {x: event.clientX, y: event.clientY};
    rotateDegree = getDegrees(start, end) - startDegree;
    targetDom.style.transform = `rotate(${degree + rotateDegree}deg)`;
  }

  function dragOver(event) {
    event = event || window.event;
    event.preventDefault();
    moveXOnDrag = prevClientXOnDrag - event.clientX;
    moveYOnDrag = prevClientYOnDrag - event.clientY;
    prevClientXOnDrag = event.clientX;
    prevClientYOnDrag = event.clientY;
    targetDom.style.top = `${targetDom.offsetTop - moveYOnDrag}px`;
    targetDom.style.left = `${targetDom.offsetLeft - moveXOnDrag}px`;
    centerOfGravity = getCenterOfGravityOnRectangle();
    reflectVertex();
  }

  function dragEnd() {
    document.onmouseup = null;
    document.onmousemove = null;
    degree = degree + rotateDegree;
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
  let points = [];
  for (let edgeIndex = 0; edgeIndex < edgeCount; edgeIndex++) {
    const x =
      centerX +
      radius * Math.cos(deg2rad(degreeList[edgeIndex]) + rotationOffset);
    const y =
      centerY +
      radius * Math.sin(deg2rad(degreeList[edgeIndex]) + rotationOffset);
    points.push(`${x}px ${y}px`);
  }
  return points.join(',');
}

function removeTailUnit(targetValueWithUnit) {
  return Number(targetValueWithUnit.replace(/px$/, ''));
}

function attachSurfaceDom(
  polygonPointInfoList,
  className,
  boxWidth,
  boxHeight
) {
  const surfaceDom = document.createElement('div');
  surfaceDom.style.width = `${boxWidth}px`;
  surfaceDom.style.height = `${boxHeight}px`;
  surfaceDom.classList.add('surface');

  const itemDom = document.createElement('div');
  itemDom.style.width = `${boxWidth}px`;
  itemDom.style.height = `${boxHeight}px`;
  itemDom.classList.add('item');
  itemDom.classList.add(className);

  const polygonPointList = getVertxPositionInfo(polygonPointInfoList);
  itemDom.style.setProperty('--clipPath', `polygon(${polygonPointInfoList})`);
  surfaceDom.appendChild(itemDom);

  const rectVertxClassNameList = [
    'rotate-top-left',
    'rotate-top-right',
    'rotate-bottom-left',
    'rotate-bottom-right',
  ];

  for (let index = 0; index < rectVertxClassNameList.length; index++) {
    const rectVertxClassName = rectVertxClassNameList[index];
    const rectVertxDom = document.createElement('div');
    rectVertxDom.classList.add('rotate');
    rectVertxDom.classList.add(rectVertxClassName);
    surfaceDom.appendChild(rectVertxDom);
  }

  for (let index = 0; index < polygonPointList.length; index++) {
    const polygonPoint = polygonPointList[index];
    const [x, y] = [...polygonPoint];
    const vertexDom = document.createElement('div');
    vertexDom.classList.add('vertex');
    vertexDom.classList.add(`vertex-${index}`);
    vertexDom.style.top = `${y - 5}px`;
    vertexDom.style.left = `${x - 5}px`;
    surfaceDom.appendChild(vertexDom);
  }

  document.body.appendChild(surfaceDom);
  return surfaceDom;
}

function getVertxPositionInfo(polygonPointInfoList) {
  const polygonPointList = polygonPointInfoList.split(',').map((item) => {
    return item.split(' ').map((point) => {
      return removeTailUnit(point);
    });
  });
  return polygonPointList;
}

function getAlphabet(n) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
  return alphabet[n - 1].toUpperCase();
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

function attachStickDom(appendToDom, centerOfGravity) {
  const stickDom = document.createElement('div');
  stickDom.classList.add('stick');
  stickDom.style.top = `${centerOfGravity.y}px`;
  stickDom.style.left = `${centerOfGravity.x}px`;
  appendToDom.appendChild(stickDom);
  return stickDom;
}

function getDistance(start, end) {
  return Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
}

function loop() {
  requestAnimationFrame(loop);
  stats.begin();
  stats.end();
}

function isExistsDom(includedRootDom, targetDom) {
  const domList = [...includedRootDom.querySelectorAll('*')];
  for (let index = 0; index < domList.length; index++) {
    const dom = domList[index];
    if (dom === targetDom) {
      return true;
    }
  }
  return false;
}

function removeSurface(activeSurfaceDom) {
  if (activeSurfaceDom) {
    activeSurfaceDom.parentElement.removeChild(activeSurfaceDom);
  }
}

function addSurface(keyName) {
  for (
    let index = parameter.polygonMinCount;
    index <= parameter.polygonMaxCount;
    index++
  ) {
    const grp = mod(index, 26) === 0 ? 26 : mod(index, 26);
    const className = getAlphabet(grp);

    const polygonPointInfoList = getNextPolygonInfoList(
      (parameter.radius * 2 + 5) / 2 + 5,
      (parameter.radius * 2 + 5) / 2 + 5,
      parameter.radius,
      parameter.edgeCount,
      deg2rad(parameter.rotationOffsetDegree) * index,
      [
        parameter.degree1 - 360,
        parameter.degree2 - 360,
        parameter.degree3 - 360,
      ]
    );
    const polygonPointList = getVertxPositionInfo(polygonPointInfoList);
    const attachedSurfaceDom = attachSurfaceDom(
      polygonPointInfoList,
      className,
      parameter.radius * 2 + 5,
      parameter.radius * 2 + 5
    );

    attachedSurfaceDom.addEventListener('click', () => {
      toggleActivateSurfaceDom(attachedSurfaceDom);
    });

    enableDraggableDom(attachedSurfaceDom, polygonPointList);
  }
}

function reCalculate(isActiveSurfaceDom, keyName) {
  if (isActiveSurfaceDom) {
    activeSurfaceDom.style.width = `${parameter.radius * 2 + 5}px`;
    activeSurfaceDom.style.height = `${parameter.radius * 2 + 5}px`;

    const itemDom = activeSurfaceDom.querySelector('.item');

    itemDom.style.width = `${parameter.radius * 2 + 5}px`;
    itemDom.style.height = `${parameter.radius * 2 + 5}px`;
    itemDom.style.background = parameter.fillColor;
    itemDom.style.opacity = parameter.fillColorOpacity;

    const polygonPointInfoList = getNextPolygonInfoList(
      (parameter.radius * 2 + 5) / 2 + 5,
      (parameter.radius * 2 + 5) / 2 + 5,
      parameter.radius,
      parameter.edgeCount,
      deg2rad(parameter.rotationOffsetDegree) * 1,
      [
        parameter.degree1 - 360,
        parameter.degree2 - 360,
        parameter.degree3 - 360,
      ]
    );
    const polygonPoint2DList = getVertxPositionInfo(polygonPointInfoList);

    const polygonPointList = polygonPoint2DList
      .map((polygonPoint2D) => {
        return `${polygonPoint2D[0]}px ${polygonPoint2D[1]}px `;
      })
      .join(',');

    itemDom.style.setProperty('--clipPath', `polygon(${polygonPointList})`);

    const vertexDomList = [...activeSurfaceDom.querySelectorAll('.vertex')];
    for (let index = 0; index < vertexDomList.length; index++) {
      const vertexDom = vertexDomList[index];
      const polygonPoint2D = polygonPoint2DList[index];
      vertexDom.style.top = `${polygonPoint2D[1] - 5}px`;
      vertexDom.style.left = `${polygonPoint2D[0] - 5}px`;
    }

    return;
  }
  for (
    let index = parameter.polygonMinCount;
    index <= parameter.polygonMaxCount;
    index++
  ) {
    const grp = mod(index, 26) === 0 ? 26 : mod(index, 26);
    const className = getAlphabet(grp);

    const polygonPointInfoList = getNextPolygonInfoList(
      (parameter.radius * 2 + 5) / 2 + 5,
      (parameter.radius * 2 + 5) / 2 + 5,
      parameter.radius,
      parameter.edgeCount,
      deg2rad(parameter.rotationOffsetDegree) * index,
      [
        parameter.degree1 - 360,
        parameter.degree2 - 360,
        parameter.degree3 - 360,
      ]
    );
    const polygonPointList = getVertxPositionInfo(polygonPointInfoList);
    const attachedSurfaceDom = attachSurfaceDom(
      polygonPointInfoList,
      className,
      parameter.radius * 2 + 5,
      parameter.radius * 2 + 5
    );

    attachedSurfaceDom.addEventListener('click', () => {
      toggleActivateSurfaceDom(attachedSurfaceDom);
    });

    enableDraggableDom(attachedSurfaceDom, polygonPointList);
  }
}

function initialize() {
  const willRemovedDomList = [...document.body.querySelectorAll('.surface')];
  for (let index = 0; index < willRemovedDomList.length; index++) {
    const willRemovedDom = willRemovedDomList[index];
    willRemovedDom.parentElement.removeChild(willRemovedDom);
  }
}

function inActivateSurfaceDom() {
  const surfaceDomList = [...document.querySelectorAll('.surface')];
  for (let index = 0; index < surfaceDomList.length; index++) {
    const surfaceDom = surfaceDomList[index];
    surfaceDom.classList.remove('is-active');
  }
}

function toggleActivateSurfaceDom(surfaceDom) {
  inActivateSurfaceDom();
  if (surfaceDom) {
    if (!isActiveSurfaceDom) {
      isActiveSurfaceDom = true;
      activeSurfaceDom = surfaceDom;
      surfaceDom.classList.add('is-active');
    } else {
      isActiveSurfaceDom = false;
      activeSurfaceDom = null;
      surfaceDom.classList.remove('is-active');
    }
  }
}

function resetRotate(surfaceDom) {
  if (surfaceDom) {
    surfaceDom.style.transform = '';
  }
}

let stats;
stats = new Stats();
stats.domElement.style.position = 'fixed';
stats.domElement.style.left = 0;
stats.domElement.style.top = 0;
document.body.appendChild(stats.domElement);

let isActiveSurfaceDom;
let activeSurfaceDom;

let parameter = {
  fillColor: '#8600ff',
  fillColorOpacity: 1,
  rotationOffsetDegree: 11,
  polygonMinCount: 1,
  polygonMaxCount: 1,
  edgeCount: 3,
  radius: 100,
  degree1: -30,
  degree2: -110,
  degree3: 120,
};

// https://github.com/GRI-Inc/App-Club-Cowboy-Bebop-App/blob/main/bsp-split-with-gui/index.js
let controllerInfo = {
  'Fill Color': '#8600ff',
  'Fill Color Opacity': 1,
  'Rotation Offset Degree': 11,
  'Polygon Min Count': 1,
  'Polygon Max Count': 1,
  Radius: 100,
  'Degree 1': -30,
  'Degree 2': -110,
  'Degree 3': 120,
  'Add Surface': () => {
    addSurface();
  },
  'Remove Surface': () => {
    removeSurface(activeSurfaceDom);
  },
  'Remove Surface All': () => {
    initialize();
  },
};

const gui = new dat.GUI();
gui.width = 400;
gui.addColor(controllerInfo, 'Fill Color').onChange((event) => {
  detectChangeParameter(event, 'Fill Color');
});
gui.add(controllerInfo, 'Fill Color Opacity', 0, 1, 0.001).onChange((event) => {
  detectChangeParameter(event, 'Fill Color Opacity');
});

gui
  .add(controllerInfo, 'Rotation Offset Degree', -360, 360, 1)
  .onChange((event) => {
    detectChangeParameter(event, 'Rotation Offset Degree');
  });
gui.add(controllerInfo, 'Polygon Min Count', 1, 100, 1).onChange((event) => {
  detectChangeParameter(event, 'Polygon Min Count');
});
gui.add(controllerInfo, 'Polygon Max Count', 1, 100, 1).onChange((event) => {
  detectChangeParameter(event, 'Polygon Max Count');
});
gui.add(controllerInfo, 'Radius', 1, 500, 1).onChange((event) => {
  detectChangeParameter(event, 'Radius');
});
gui.add(controllerInfo, 'Degree 1', -360, 360, 1).onChange((event) => {
  detectChangeParameter(event, 'Degree 1');
});
gui.add(controllerInfo, 'Degree 2', -360, 360, 1).onChange((event) => {
  detectChangeParameter(event, 'Degree 2');
});
gui.add(controllerInfo, 'Degree 3', -360, 360, 1).onChange((event) => {
  detectChangeParameter(event, 'Degree 3');
});
gui.add(controllerInfo, 'Add Surface');
gui.add(controllerInfo, 'Remove Surface');
gui.add(controllerInfo, 'Remove Surface All');

function detectChangeParameter(event, keyName) {
  if (keyName === 'Fill Color') {
    parameter.fillColor = event;
  }
  if (keyName === 'Fill Color Opacity') {
    parameter.fillColorOpacity = event;
  }
  if (keyName === 'Rotation Offset Degree') {
    parameter.rotationOffsetDegree = event;
  }
  if (keyName === 'Polygon Min Count') {
    parameter.polygonMinCount = event;
    return;
  }
  if (keyName === 'Polygon Max Count') {
    parameter.polygonMaxCount = event;
    return;
  }
  if (keyName === 'Edge Count') {
    parameter.edgeCount = event;
  }
  if (keyName === 'Radius') {
    parameter.radius = event;
  }
  if (keyName === 'Degree 1') {
    parameter.degree1 = event;
  }
  if (keyName === 'Degree 2') {
    parameter.degree2 = event;
  }
  if (keyName === 'Degree 3') {
    parameter.degree3 = event;
  }

  if (isActiveSurfaceDom) {
    // パラメータ個別適用
    reCalculate(isActiveSurfaceDom, keyName);
  } else {
    initialize();
    reCalculate();
  }
}

initialize();
reCalculate();
loop();
