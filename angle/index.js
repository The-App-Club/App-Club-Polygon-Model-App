function enableDraggableDom(targetDom) {
  let moveX = 0;
  let moveY = 0;
  let prevClientX = 0;
  let prevClientY = 0;

  targetDom.onmousedown = dragStart;
  function dragStart(event) {
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

function niceRolling(domList, currentAngleInfo) {
  let count = 0;
  let moveX = 0;

  function marquee(domList, currentAngleInfo) {
    function mod(n, m) {
      return ((n % m) + m) % m;
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

    function getVertexInfoList(domList) {
      const vertexInfoList = [];
      for (let index = 0; index < domList.length; index++) {
        const dom = domList[index];
        const domPos = disconnectObserve(dom.getBoundingClientRect());
        const domVertex = {x: domPos.x, y: domPos.y};
        vertexInfoList.push(domVertex);
      }
      return vertexInfoList;
    }

    function findAngle(p0, p1, p2) {
      const b = Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2);
      const a = Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
      const c = Math.pow(p2.x - p0.x, 2) + Math.pow(p2.y - p0.y, 2);
      return Math.acos((a + b - c) / Math.sqrt(4 * a * b));
    }

    function rad2deg(radian) {
      const degree = radian * (180 / Math.PI);
      return degree;
    }

    function getVertexHasMax(vertexInfoList, coord) {
      const [aVertex, bVertex, cVertex] = [...vertexInfoList];
      const n = Math.max(
        aVertex[`${coord}`],
        bVertex[`${coord}`],
        cVertex[`${coord}`]
      );
      if (aVertex[coord] === n) {
        return aVertex;
      }
      if (bVertex[coord] === n) {
        return bVertex;
      }
      if (cVertex[coord] === n) {
        return cVertex;
      }
    }

    function getVertexHasMin(vertexInfoList, coord) {
      const [aVertex, bVertex, cVertex] = [...vertexInfoList];
      const n = Math.min(
        aVertex[`${coord}`],
        bVertex[`${coord}`],
        cVertex[`${coord}`]
      );
      if (aVertex[coord] === n) {
        return aVertex;
      }
      if (bVertex[coord] === n) {
        return bVertex;
      }
      if (cVertex[coord] === n) {
        return cVertex;
      }
    }

    function getCenterVertex(vertexInfoList, minVertexInfo, maxVertexInfo) {
      return vertexInfoList.filter((vertexInfo) => {
        return vertexInfo !== minVertexInfo && vertexInfo !== maxVertexInfo;
      })[0];
    }

    function reflector(selector, value) {
      const displayDom = document.querySelector(`.${selector}`);
      displayDom.innerHTML = value;
    }

    let a = new Date();
    moveX++;
    requestAnimationFrame(() => {
      marquee(domList, currentAngleInfo);
    });
    if (mod(moveX, 13) + 1 === 13) {
      const vertexInfoList = getVertexInfoList(domList);
      const minVertexInfo = getVertexHasMin(vertexInfoList, 'x');
      const maxVertexInfo = getVertexHasMax(vertexInfoList, 'x');
      const centerVertex = getCenterVertex(
        vertexInfoList,
        minVertexInfo,
        maxVertexInfo
      );
      const radian = findAngle(minVertexInfo, centerVertex, maxVertexInfo);
      const degree = rad2deg(radian);
      currentAngleInfo = {
        vertexInfoList: vertexInfoList,
        minVertexInfo: minVertexInfo,
        centerVertex: centerVertex,
        maxVertexInfo: maxVertexInfo,
        degree: degree,
        radian: radian,
      };
      reflector(
        `left`,
        `[left] x:${currentAngleInfo.minVertexInfo.x} y:${currentAngleInfo.minVertexInfo.y}`
      );
      reflector(
        `center`,
        `[center] x:${currentAngleInfo.centerVertex.x} y:${currentAngleInfo.centerVertex.y}`
      );
      reflector(
        `right`,
        `[right] x:${currentAngleInfo.maxVertexInfo.x} y:${currentAngleInfo.maxVertexInfo.y}`
      );
      reflector(`degree`, `[degree] ${currentAngleInfo.degree}`);
      reflector(`radian`, `[radian] ${currentAngleInfo.radian}`);
    }
  }
  marquee(domList, currentAngleInfo);
}

const aDom = document.querySelector(`.item:nth-child(1)`);
const bDom = document.querySelector(`.item:nth-child(2)`);
const cDom = document.querySelector(`.item:nth-child(3)`);

enableDraggableDom(aDom);
enableDraggableDom(bDom);
enableDraggableDom(cDom);
const domList = [aDom, bDom, cDom];
let currentAngleInfo = {
  vertexInfoList: [],
  minVertexInfo: {},
  centerVertex: {},
  maxVertexInfo: {},
  degree: 0,
  radian: 0,
};
niceRolling(domList, currentAngleInfo);
