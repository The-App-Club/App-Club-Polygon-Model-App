function buildPoints(edgeCount, rotationOffset = 0) {
  const stepSize = (Math.PI * 2) / edgeCount;
  return [...new Array(edgeCount)].map((_, edgeIndex) => {
    return {
      x: Math.cos(edgeIndex * stepSize + rotationOffset),
      y: Math.sin(edgeIndex * stepSize + rotationOffset),
    };
  });
}

function drawPolygon(canvasDomContext, x, y, radius, pointInfoList) {
  canvasDomContext.lineWidth = 1;
  canvasDomContext.strokeStyle = '#4a4a4a';
  canvasDomContext.beginPath();
  canvasDomContext.moveTo(
    x + pointInfoList[0].x * radius,
    y + pointInfoList[0].y * radius
  );
  pointInfoList.map((pointInfo) => {
    // https://stackoverflow.com/questions/43396822/how-do-i-compute-for-the-x-and-y-coordinates-of-the-end-angle-of-a-html-canvas-a
    canvasDomContext.lineTo(x + pointInfo.x * radius, y + pointInfo.y * radius);
  });
  canvasDomContext.closePath();
  canvasDomContext.stroke();
}

function triangleNest(
  canvasDomContext,
  centerX,
  centerY,
  radius,
  plotInfoList
) {
  const newRadius = radius / 2;
  for (let index = 0; index < plotInfoList.length; index++) {
    const plotInfo = plotInfoList[index];
    const newX = centerX + plotInfo.x * newRadius;
    const newY = centerY + plotInfo.y * newRadius;
    drawPolygon(canvasDomContext, newX, newY, newRadius, plotInfoList);
  }
}

function deg2rad(degrees) {
  return (Math.PI / 180) * degrees;
}

function initialize() {
  const canvasDom = document.querySelector('.workspace');
  canvasDom.width = parameter.width;
  canvasDom.height = parameter.height;
  canvasDomContext = canvasDom.getContext('2d');
  canvasDomContext.clearRect(0, 0, parameter.width, parameter.height);
}

function loop() {
  requestAnimationFrame(loop);
  stats.begin();
  stats.end();
}

function reCalculate() {
  triangleNest(
    canvasDomContext,
    parameter.x,
    parameter.y,
    parameter.radius,
    buildPoints(parameter.vertexCount, deg2rad(parameter.degree))
  );
}

let stats;
stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = 0;
stats.domElement.style.top = 0;
document.body.appendChild(stats.domElement);

let canvasDomContext;
let parameter = {
  x: window.innerWidth / 4,
  y: window.innerHeight / 4,
  radius: 110,
  width: 700,
  height: 700,
  degree: 30,
  vertexCount: 3,
};

let controllerInfo = {
  Radius: 30,
  X: 110,
  Y: 110,
  'Workspace Width': 700,
  'Workspace Height': 700,
  Degree: 30,
  'Vertex Count': 3,
};

const gui = new dat.GUI();
gui.width = 300;
gui.add(controllerInfo, 'Radius', 1, 500, 1).onChange((event) => {
  detectChangeParameter(event, 'Radius');
});
gui.add(controllerInfo, 'X', 1, 500, 1).onChange((event) => {
  detectChangeParameter(event, 'X');
});
gui.add(controllerInfo, 'Y', 1, 500, 1).onChange((event) => {
  detectChangeParameter(event, 'Y');
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
gui
  .add(controllerInfo, 'Degree', 1, window.innerHeight, 1)
  .onChange((event) => {
    detectChangeParameter(event, 'Degree');
  });
gui
  .add(controllerInfo, 'Vertex Count', 1, window.innerHeight, 1)
  .onChange((event) => {
    detectChangeParameter(event, 'Vertex Count');
  });

function detectChangeParameter(event, keyName) {
  if (keyName === 'Radius') {
    parameter.radius = event;
  }
  if (keyName === 'X') {
    parameter.x = event;
  }
  if (keyName === 'Y') {
    parameter.y = event;
  }
  if (keyName === 'Workspace Width') {
    parameter.width = event;
  }
  if (keyName === 'Workspace Height') {
    parameter.height = event;
  }
  if (keyName === 'Degree') {
    parameter.degree = event;
  }
  if (keyName === 'Vertex Count') {
    parameter.vertexCount = event;
  }

  initialize();
  reCalculate();
}

initialize();
reCalculate();
loop();
