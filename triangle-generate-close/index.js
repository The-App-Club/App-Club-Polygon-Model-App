function drawLine(start, end, borderStyle, targetElement) {
  const e = document.createElement('div');
  e.classList.add('line');
  targetElement.appendChild(e);
  e.style.borderTop = borderStyle;

  const borderTopWidth = parseFloat(getComputedStyle(e).borderTopWidth);
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const deg = (Math.atan2(dy, dx) * 180) / Math.PI;

  e.style.position = 'absolute';
  e.style.width = `${distance}px`;
  e.style.left = `${start.x - distance / 2}px`;
  e.style.top = `${start.y - borderTopWidth / 2}px`;
  e.style.transform = `rotate(${deg}deg) translate(50%)`;

  return e;
}
function getRadian(start, end) {
  const radian = Math.atan2(end.y - start.y, end.x - start.x);
  return radian;
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

function rad2deg(radian) {
  const degree = radian * (180 / Math.PI);
  return degree;
}

function deg2rad(degree) {
  const radian = (degree * Math.PI) / 180;
  return radian;
}

function getDistance(start, end) {
  return Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
}

function getNextPos(start, radius, radian) {
  const nextPos = {
    x: start.x + radius * Math.cos(radian),
    y: start.y + radius * Math.sin(radian),
  };
  return nextPos;
}

function getNextPosList(
  startPos,
  radius,
  radian,
  distance,
  resultList,
  counter
) {
  if (counter === Math.ceil(distance / radius)) {
    return resultList;
  }
  const nextPos = getNextPos(startPos, radius, radian);
  resultList.push(nextPos);
  counter++;
  return getNextPosList(nextPos, radius, radian, distance, resultList, counter);
}
function getRandomRangeNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function executeCreateDot() {
  vertexInfoList = [];
  for (
    let index = parameter.minDotCount;
    index <= parameter.maxDotCount;
    index++
  ) {
    const dotDom = createDot(index);
    vertexInfoList.push(dotDom);
  }
}

function createDot(index) {
  const workspaceDom = document.querySelector(`.workspace`);
  const dotDom = document.createElement('div');
  dotDom.classList.add('dot');
  dotDom.style.setProperty('data-dot-number', `dot-${index}`);
  const top = getRandomRangeNumber(0, parameter.height * 0.98);
  const left = getRandomRangeNumber(0, parameter.width * 0.98);
  dotDom.style.top = `${top}px`;
  dotDom.style.left = `${left}px`;
  dotDom.style.width = `${parameter.radius}px`;
  dotDom.style.height = `${parameter.radius}px`;
  workspaceDom.appendChild(dotDom);
  return {dotId: `dot-${index}`, x: left, y: top, dom: dotDom};
}

function clear() {
  const workspaceDom = document.querySelector(`.workspace`);
  workspaceDom.parentElement.removeChild(workspaceDom);
}

function setUp() {
  const workspaceDom = document.createElement('div');
  workspaceDom.classList.add('workspace');
  workspaceDom.style.width = `${parameter.width}px`;
  workspaceDom.style.height = `${parameter.height}px`;
  document.body.appendChild(workspaceDom);
}

let stats;
stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = 0;
stats.domElement.style.top = 0;
document.body.appendChild(stats.domElement);

let vertexInfoList = [];
let parameter = {
  radius: 1,
  width: 1100,
  height: 700,
  minDotCount: 1,
  maxDotCount: 4,
};

let controllerInfo = {
  Radius: 1,
  'Workspace Width': 1100,
  'Workspace Height': 700,
  'Min Dot Count': 1,
  'Max Dot Count': 4,
  'Generate Graph': () => {
    reCalculate();
  },
};

const gui = new dat.GUI();
gui.width = 300;
gui.add(controllerInfo, 'Radius', 1, 10, 1).onChange((event) => {
  detectChangeParameter(event, 'Radius');
});
gui
  .add(controllerInfo, 'Workspace Width', 1, window.innerWidth, 1)
  .onChange((event) => {
    detectChangeParameter(event, 'Workspace Width');
  });
gui
  .add(controllerInfo, 'Workspace Height', 1, window.innerHeight, 1)
  .onChange((event) => {
    detectChangeParameter(event, 'Workspace Height');
  });
gui.add(controllerInfo, 'Min Dot Count', 1, 100, 1).onChange((event) => {
  detectChangeParameter(event, 'Min Dot Count');
});
gui.add(controllerInfo, 'Max Dot Count', 1, 100, 1).onChange((event) => {
  detectChangeParameter(event, 'Max Dot Count');
});
gui.add(controllerInfo, 'Generate Graph');

function detectChangeParameter(event, keyName) {
  if (keyName === 'Radius') {
    parameter.radius = event;
  }
  if (keyName === 'Workspace Width') {
    parameter.width = event;
  }
  if (keyName === 'Workspace Height') {
    parameter.height = event;
  }
  if (keyName === 'Min Dot Count') {
    parameter.minDotCount = event;
  }
  if (keyName === 'Max Dot Count') {
    parameter.maxDotCount = event;
  }
  reCalculate();
}

function loop() {
  requestAnimationFrame(loop);
  stats.begin();
  stats.end();
}

function getEnableVertexInfoList() {
  const combList = vertexInfoList;
  return combList;
}

function reCalculate() {
  clear();
  setUp();
  executeCreateDot();
  const enableVertexInfoList = getEnableVertexInfoList();
  if (enableVertexInfoList.length === 0) {
    return;
  }
  let firstEnableVertexInfo = enableVertexInfoList[0];
  let lastEnableVertexInfo = enableVertexInfoList.slice(-1)[0];
  let prevEnableVertexInfo;
  const workspaceDom = document.querySelector(`.workspace`);
  for (let index = 0; index < enableVertexInfoList.length; index++) {
    const enableVertexInfo = enableVertexInfoList[index];
    if (prevEnableVertexInfo && enableVertexInfo) {
      drawLine(
        {x: enableVertexInfo.x, y: enableVertexInfo.y},
        {x: prevEnableVertexInfo.x, y: prevEnableVertexInfo.y},
        '1px #000 solid',
        workspaceDom
      );
    }
    prevEnableVertexInfo = enableVertexInfo;
  }
  drawLine(
    {x: lastEnableVertexInfo.x, y: lastEnableVertexInfo.y},
    {x: firstEnableVertexInfo.x, y: firstEnableVertexInfo.y},
    '1px #000 solid',
    workspaceDom
  );
}

function combinations(set, k) {
  // https://gist.github.com/axelpale/3118596
  let combs;
  let head;
  let tailcombs;

  if (k > set.length || k <= 0) {
    return [];
  }

  if (k == set.length) {
    return [set];
  }

  if (k == 1) {
    combs = [];
    for (let i = 0; i < set.length; i++) {
      combs.push([set[i]]);
    }
    return combs;
  }

  combs = [];
  for (let i = 0; i < set.length - k + 1; i++) {
    head = set.slice(i, i + 1);
    tailcombs = combinations(set.slice(i + 1), k - 1);
    for (let j = 0; j < tailcombs.length; j++) {
      const a = head.concat(tailcombs[j]);
      const selfPos = {x: a[0].x, y: a[0].y};
      const otherPos = {x: a[1].x, y: a[1].y};
      combs.push({
        self: a[0],
        other: a[1],
      });
    }
  }
  return combs;
}

setUp();
reCalculate();
loop();
