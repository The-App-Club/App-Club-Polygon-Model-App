const controllerDom = document.querySelector(`.stack`);
let stackMapInfo = new Map();
const radius = 10;
const boxWidth = 1000;
const boxHeight = 700;
const centerX = boxWidth / 2;
const centerY = boxHeight / 2;

const xmlns = 'http://www.w3.org/2000/svg';
function median(numbers) {
  const half = (numbers.length / 2) | 0;
  const arr = numbers.sort((a, b) => {
    return a - b;
  });

  if (arr.length % 2) {
    return arr[half];
  }
  return (arr[half - 1] + arr[half]) / 2;
}

function range(n) {
  return [...Array(n).keys()];
}

function a(prepareStackMaxNumber) {
  const u = new Map();
  for (let index = 1; index <= prepareStackMaxNumber; index++) {
    if (index === 1) {
      u.set(index, []);
    } else if (index === 2) {
      u.set(index, [
        {x: [150], y: [30]},
        {x: [30], y: [30]},
      ]);
    } else if (index === 3) {
      u.set(index, [
        {x: [150, 150], y: [30, 30]},
        {x: [90, 90, 90], y: [30, 30]},
        {x: [30, 30], y: [30, 30]},
      ]);
    } else if (index % 2 === 1) {
      const l = u.get(index - 1);
      const n = [];
      for (let i = 0; i < l.length; i++) {
        const e = l[i];
        const {x, y} = {...e};
        // console.log(i, x,y,index,l)
        if (i < l.length / 2) {
          n.push({
            x: [...x, 150],
            y: [...y, 30],
          });
        } else if (i >= l.length / 2) {
          n.push({
            x: [...x, 30],
            y: [...y, 30],
          });
        }
      }
      // console.log("n", n)
      const _l = u.get(index - 2);
      const _e = _l[median(range(_l.length))];
      const {x, y} = {..._e};
      n.push({
        x: [...x, 90],
        y: [...y, 30, 30],
      });
      const nl = [
        ...n.slice(0, median(range(n.length))),
        ...n.slice(-1),
        ...n.slice(median(range(n.length)), n.length - 1),
      ];
      // console.log(index, nl)
      u.set(index, nl);
    } else if (index % 2 === 0) {
      const l = u.get(index - 1);
      const n = [];
      // console.log(index, l)
      for (let i = 0; i < l.length; i++) {
        const e = l[i];
        const {x, y} = {...e};
        if (i < median(range(l.length))) {
          n.push({
            x: [...x, 150],
            y: [...y, 30],
          });
        }
        if (i === median(range(l.length))) {
          n.push({
            x: [...x.slice(0, index - 2), 150],
            y: [...y.slice(0, index - 2), 30],
          });
          n.push({
            x: [...x.slice(0, index - 2), 30],
            y: [...y.slice(0, index - 2), 30],
          });
        }
        if (i > median(range(l.length))) {
          n.push({
            x: [...x, 30],
            y: [...y, 30],
          });
        }
      }
      u.set(index, n);
    }
  }
  return u;
}
const aa = a(117);
stackMapInfo = aa;

controllerDom.addEventListener('change', (event) => {
  const _svgDom = document.querySelector('svg');
  if (_svgDom) {
    _svgDom.parentElement.removeChild(_svgDom);
  }
  function deg2rad(degrees) {
    return (Math.PI / 180) * degrees;
  }
  function getNextPointInfo(centerX, centerY, degree) {
    const x = centerX + radius * Math.cos(deg2rad(degree));
    const y = centerY + radius * Math.sin(deg2rad(degree));
    return `${centerX}, ${centerY} ${x}, ${y}`;
  }
  function getNextPointX(centerX, degree) {
    const x = centerX + radius * Math.cos(deg2rad(degree));
    return x;
  }
  function getNextPointY(centerY, degree) {
    const y = centerY + radius * Math.sin(deg2rad(degree));
    return y;
  }
  function executeGetNextPointX(centerX, degreeList, stackNumber) {
    let result = getNextPointX(centerX, degreeList[0]);
    for (let index = 1; index < degreeList.length; index++) {
      const degree = degreeList[index];
      result = getNextPointX(result, degree);
    }
    return result;
  }
  function executeGetNextPointY(radius, centerY, degreeList, stackNumber) {
    let result = getNextPointY(stackNumber * radius + centerY, degreeList[0]);
    for (let index = 1; index < degreeList.length; index++) {
      const degree = degreeList[index];
      result = getNextPointY(result, degree);
    }
    return result;
  }
  function cube(svgDom, centerX, centerY, radius, edgeCount, rotationOffset) {
    const stepSize = (Math.PI * 2) / edgeCount;
    let points = '';
    for (var edgeIndex = 0; edgeIndex <= edgeCount; edgeIndex++) {
      const x =
        centerX + Math.cos(edgeIndex * stepSize + rotationOffset) * radius;
      const y =
        centerY + Math.sin(edgeIndex * stepSize + rotationOffset) * radius;
      points += `${x}, ${y} `;
    }
    // https://stackoverflow.com/questions/59883674/how-to-add-a-svg-and-subsequently-a-polygon-element-including-attributes-in
    const polygon = document.createElementNS(xmlns, 'polygon');
    polygon.setAttribute('points', points);
    polygon.classList.add('polygon');
    const polyline1 = document.createElementNS(xmlns, 'polyline');
    polyline1.setAttribute('points', getNextPointInfo(centerX, centerY, -30));
    polyline1.classList.add('polyline');
    const polyline2 = document.createElementNS(xmlns, 'polyline');
    polyline2.setAttribute('points', getNextPointInfo(centerX, centerY, -150));
    polyline2.classList.add('polyline');
    const polyline3 = document.createElementNS(xmlns, 'polyline');
    polyline3.setAttribute('points', getNextPointInfo(centerX, centerY, -270));
    polyline3.classList.add('polyline');
    svgDom.appendChild(polygon);
    svgDom.appendChild(polyline1);
    svgDom.appendChild(polyline2);
    svgDom.appendChild(polyline3);
  }

  const stackSize = Number(event.target.value);
  const svgDom = document.createElementNS(xmlns, 'svg');
  svgDom.style.width = `${boxWidth}px`;
  svgDom.style.height = `${boxHeight}px`;
  document.body.appendChild(svgDom);

  for (const [stackNumber, stackInfoList] of stackMapInfo.entries()) {
    if (stackNumber <= stackSize) {
      if (stackNumber === 1) {
        cube(svgDom, centerX, radius + centerY / 32, radius, 6, Math.PI * 1.5);
      } else {
        for (let index = 0; index < stackInfoList.length; index++) {
          const statckInfo = stackInfoList[index];
          const {x, y} = {...statckInfo};
          const curentCenterX = executeGetNextPointX(centerX, x, stackNumber);
          const curentCenterY = executeGetNextPointY(
            radius,
            centerY / 32,
            y,
            stackNumber
          );
          cube(svgDom, curentCenterX, curentCenterY, radius, 6, Math.PI * 1.5);
        }
      }
    }
  }
});
