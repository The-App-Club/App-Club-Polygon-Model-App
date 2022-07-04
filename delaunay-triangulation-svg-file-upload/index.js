// Constrained Delaunay Triangulation code in JavaScript
// Copyright 2018 Savithru Jayasinghe
// Licensed under the MIT License (LICENSE.txt)
// https://github.com/savithru-j/cdt-js

'use strict';

//Some variables for rendering

const xmlns = 'http://www.w3.org/2000/svg';
let min_coord = new Point(0, 0);
let max_coord = new Point(1, 1);
let screenL = 1.0; // 必須

let boundingL = 1000.0;

//Data structure for storing triangulation info
let globalMeshData = {
  vert: [],
  scaled_vert: [],
  bin: [],
  tri: [],
  adj: [],
  comb: [],
};

function loadVertices(vertexPosList) {
  globalMeshData.vert = [];
  globalMeshData.comb = [];

  min_coord = new Point(Number.MAX_VALUE, Number.MAX_VALUE);
  max_coord = new Point(-Number.MAX_VALUE, -Number.MAX_VALUE);

  for (let i = 0; i < vertexPosList.length; i++) {
    let vertexPos = vertexPosList[i];
    globalMeshData.vert.push(vertexPos);

    min_coord.x = Math.min(min_coord.x, vertexPos.x);
    min_coord.y = Math.min(min_coord.y, vertexPos.y);
    max_coord.x = Math.max(max_coord.x, vertexPos.x);
    max_coord.y = Math.max(max_coord.y, vertexPos.y);
  }

  screenL = Math.max(max_coord.x - min_coord.x, max_coord.y - min_coord.y);
}

function getTriangleCombinationVertex(meshData) {
  const verts = meshData.vert;
  const triangles = meshData.tri;
  for (let i = 0; i < triangles.length; i++) {
    const canvas_coord0 = verts[triangles[i][0]];
    const canvas_coord1 = verts[triangles[i][1]];
    const canvas_coord2 = verts[triangles[i][2]];

    if (isTriangleVisible(canvas_coord0, canvas_coord1, canvas_coord2)) {
      meshData.comb.push([canvas_coord0, canvas_coord1, canvas_coord2]);
    }
  }
}

function isTriangleVisible(p0, p1, p2) {
  const p_min = new Point(
    Math.min(Math.min(p0.x, p1.x), p2.x),
    Math.min(Math.min(p0.y, p1.y), p2.y)
  );
  const p_max = new Point(
    Math.max(Math.max(p0.x, p1.x), p2.x),
    Math.max(Math.max(p0.y, p1.y), p2.y)
  );
  return (
    p_min.x < parameter.workspaceWidth &&
    p_max.x >= 0 &&
    p_min.y < parameter.workspaceHeight &&
    p_max.y >= 0
  );
}

function reset() {
  const canvasDom = document.querySelector('.reflector');
  const canvasDomContext = canvasDom.getContext('2d');
  canvasDomContext.clearRect(0, 0, canvasDom.width, canvasDom.height);

  const workspaceDom = document.querySelector('.workspace');
  const polygonDomList = [...workspaceDom.querySelectorAll('*')];
  for (let index = 0; index < polygonDomList.length; index++) {
    const polygonDom = polygonDomList[index];
    polygonDom.parentElement.removeChild(polygonDom);
  }

  //Clear mesh data
  globalMeshData.vert = [];
  globalMeshData.scaled_vert = [];
  globalMeshData.bin = [];
  globalMeshData.tri = [];
  globalMeshData.adj = [];
  globalMeshData.comb = [];
}

function triangulate() {
  const nVertex = globalMeshData.vert.length;
  delaunay(globalMeshData);
  getTriangleCombinationVertex(globalMeshData);
  reflectWorkspace();
}

function reflectWorkspace() {
  const trianglePointCombList = globalMeshData.comb;
  const workspaceDom = document.querySelector('.workspace');
  const svgDom = document.createElementNS(xmlns, 'svg');
  svgDom.style.width = `${parameter.workspaceWidth}px`;
  svgDom.style.height = `${parameter.workspaceHeight}px`;
  workspaceDom.appendChild(svgDom);

  for (let index = 0; index < trianglePointCombList.length; index++) {
    const trianglePointComb = trianglePointCombList[index];
    const [p1, p2, p3] = [...trianglePointComb];

    // https://stackoverflow.com/questions/59883674/how-to-add-a-svg-and-subsequently-a-polygon-element-including-attributes-in
    // https://codepen.io/xmatic/pen/dwXWLZ
    // https://stackoverflow.com/questions/11257015/how-to-give-hsl-color-value-to-an-svg-element
    const polygonDom = document.createElementNS(xmlns, 'polygon');
    polygonDom.setAttribute('fill', `#444`);
    polygonDom.setAttribute('strokeWidth', `5px`);
    polygonDom.setAttribute('stroke', `#fff`);
    // polygonDom.setAttribute('fill-opacity', `${0.001 * index}`);
    polygonDom.setAttribute(
      'points',
      `${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`
    );
    polygonDom.classList.add('polygon');
    svgDom.appendChild(polygonDom);
  }
}

function binSorter(a, b) {
  if (a.bin == b.bin) {
    return 0;
  } else {
    return a.bin < b.bin ? -1 : 1;
  }
}

function setupDelaunay(meshData) {
  const nVertex = meshData.vert.length;
  const nBinsX = Math.round(Math.pow(nVertex, 0.25));
  const nBins = nBinsX * nBinsX;

  //Compute scaled vertex coordinates and assign each vertex to a bin
  const scaledverts = [];
  const bin_index = [];
  for (let i = 0; i < nVertex; i++) {
    const scaled_x = (meshData.vert[i].x - min_coord.x) / screenL;
    const scaled_y = (meshData.vert[i].y - min_coord.y) / screenL;
    scaledverts.push(new Point(scaled_x, scaled_y));

    const ind_i = Math.round((nBinsX - 1) * scaled_x);
    const ind_j = Math.round((nBinsX - 1) * scaled_y);

    let bin_id;
    if (ind_j % 2 === 0) {
      bin_id = ind_j * nBinsX + ind_i;
    } else {
      bin_id = (ind_j + 1) * nBinsX - ind_i - 1;
    }
    bin_index.push({ind: i, bin: bin_id});
  }

  //Add super-triangle vertices (far away)
  const D = boundingL;
  scaledverts.push(new Point(-D + 0.5, -D / Math.sqrt(3) + 0.5));
  scaledverts.push(new Point(D + 0.5, -D / Math.sqrt(3) + 0.5));
  scaledverts.push(new Point(0.5, (2 * D) / Math.sqrt(3) + 0.5));

  for (let i = nVertex; i < nVertex + 3; i++)
    meshData.vert.push(
      new Point(
        screenL * scaledverts[i].x + min_coord.x,
        screenL * scaledverts[i].y + min_coord.y
      )
    );

  //Sort the vertices in ascending bin order
  bin_index.sort(binSorter);

  meshData.scaled_vert = scaledverts;
  meshData.bin = bin_index;

  //Super-triangle connectivity
  meshData.tri = [[nVertex, nVertex + 1, nVertex + 2]];
  meshData.adj = [[-1, -1, -1]];
}

//Function for computing the unconstrained Delaunay triangulation
function delaunay(meshData) {
  //Sort input vertices and setup super-triangle
  setupDelaunay(meshData);

  const verts = meshData.scaled_vert;
  const bins = meshData.bin;
  const triangles = meshData.tri;
  const adjacency = meshData.adj;

  const N = verts.length - 3; //vertices includes super-triangle nodes

  let ind_tri = 0; //points to the super-triangle
  let nhops_total = 0;

  for (let i = 0; i < N; i++) {
    const new_i = bins[i].ind;

    const res = findEnclosingTriangle(verts[new_i], meshData, ind_tri);
    ind_tri = res[0];
    nhops_total += res[1];

    if (ind_tri === -1)
      throw 'Could not find a triangle containing the new vertex!';

    let cur_tri = triangles[ind_tri]; //vertex indices of triangle containing new point
    let new_tri0 = [cur_tri[0], cur_tri[1], new_i];
    let new_tri1 = [new_i, cur_tri[1], cur_tri[2]];
    let new_tri2 = [cur_tri[0], new_i, cur_tri[2]];

    //Replace the triangle containing the point with new_tri0, and
    //fix its adjacency
    triangles[ind_tri] = new_tri0;

    const N_tri = triangles.length;
    const cur_tri_adj = adjacency[ind_tri]; //neighbors of cur_tri
    adjacency[ind_tri] = [N_tri, N_tri + 1, cur_tri_adj[2]];

    //Add the other two new triangles to the list
    triangles.push(new_tri1); //triangle index N_tri
    triangles.push(new_tri2); //triangle index (N_tri+1)

    adjacency.push([cur_tri_adj[0], N_tri + 1, ind_tri]); //adj for triangle N_tri
    adjacency.push([N_tri, cur_tri_adj[1], ind_tri]); //adj for triangle (N_tri+1)

    //stack of triangles which need to be checked for Delaunay condition
    //each element contains: [index of tri to check, adjncy index to goto triangle that contains new point]
    let stack = [];

    if (cur_tri_adj[2] >= 0) {
      //if triangle cur_tri's neighbor exists
      //Find the index for cur_tri in the adjacency of the neighbor
      const neigh_adj_ind = adjacency[cur_tri_adj[2]].indexOf(ind_tri);

      //No need to update adjacency, but push the neighbor on to the stack
      stack.push([cur_tri_adj[2], neigh_adj_ind]);
    }
    if (cur_tri_adj[0] >= 0) {
      //if triangle N_tri's neighbor exists
      //Find the index for cur_tri in the adjacency of the neighbor
      const neigh_adj_ind = adjacency[cur_tri_adj[0]].indexOf(ind_tri);
      adjacency[cur_tri_adj[0]][neigh_adj_ind] = N_tri;
      stack.push([cur_tri_adj[0], neigh_adj_ind]);
    }

    if (cur_tri_adj[1] >= 0) {
      //if triangle (N_tri+1)'s neighbor exists
      //Find the index for cur_tri in the adjacency of the neighbor
      const neigh_adj_ind = adjacency[cur_tri_adj[1]].indexOf(ind_tri);
      adjacency[cur_tri_adj[1]][neigh_adj_ind] = N_tri + 1;
      stack.push([cur_tri_adj[1], neigh_adj_ind]);
    }

    restoreDelaunay(new_i, meshData, stack);
  } //loop over vertices

  removeBoundaryTriangles(meshData);
}

//Uses edge orientations - based on Peter Brown's Technical Report 1997
function findEnclosingTriangle(target_vertex, meshData, ind_tri_cur) {
  const vertices = meshData.scaled_vert;
  const triangles = meshData.tri;
  const adjacency = meshData.adj;
  const max_hops = Math.max(10, adjacency.length);

  let nhops = 0;
  let found_tri = false;
  let path = [];

  while (!found_tri && nhops < max_hops) {
    if (ind_tri_cur === -1) {
      //target is outside triangulation
      return [ind_tri_cur, nhops];
    }

    const tri_cur = triangles[ind_tri_cur];

    //Orientation of target wrt each edge of triangle (positive if on left of edge)
    const orients = [
      getPointOrientation(
        [vertices[tri_cur[1]], vertices[tri_cur[2]]],
        target_vertex
      ),
      getPointOrientation(
        [vertices[tri_cur[2]], vertices[tri_cur[0]]],
        target_vertex
      ),
      getPointOrientation(
        [vertices[tri_cur[0]], vertices[tri_cur[1]]],
        target_vertex
      ),
    ];

    if (orients[0] >= 0 && orients[1] >= 0 && orients[2] >= 0)
      //target is to left of all edges, so inside tri
      return [ind_tri_cur, nhops];

    let base_ind = -1;
    for (let iedge = 0; iedge < 3; iedge++) {
      if (orients[iedge] >= 0) {
        base_ind = iedge;
        break;
      }
    }
    const base_p1_ind = (base_ind + 1) % 3;
    const base_p2_ind = (base_ind + 2) % 3;

    if (orients[base_p1_ind] >= 0 && orients[base_p2_ind] < 0) {
      ind_tri_cur = adjacency[ind_tri_cur][base_p2_ind]; //should move to the triangle opposite base_p2_ind
      path[nhops] = vertices[tri_cur[base_ind]]
        .add(vertices[tri_cur[base_p1_ind]])
        .scale(0.5);
    } else if (orients[base_p1_ind] < 0 && orients[base_p2_ind] >= 0) {
      ind_tri_cur = adjacency[ind_tri_cur][base_p1_ind]; //should move to the triangle opposite base_p1_ind
      path[nhops] = vertices[tri_cur[base_p2_ind]]
        .add(vertices[tri_cur[base_ind]])
        .scale(0.5);
    } else {
      const vec0 = vertices[tri_cur[base_p1_ind]].sub(
        vertices[tri_cur[base_ind]]
      ); //vector from base_ind to base_p1_ind
      const vec1 = target_vertex.sub(vertices[tri_cur[base_ind]]); //vector from base_ind to target_vertex
      if (vec0.dot(vec1) > 0) {
        ind_tri_cur = adjacency[ind_tri_cur][base_p2_ind]; //should move to the triangle opposite base_p2_ind
        path[nhops] = vertices[tri_cur[base_ind]]
          .add(vertices[tri_cur[base_p1_ind]])
          .scale(0.5);
      } else {
        ind_tri_cur = adjacency[ind_tri_cur][base_p1_ind]; //should move to the triangle opposite base_p1_ind
        path[nhops] = vertices[tri_cur[base_p2_ind]]
          .add(vertices[tri_cur[base_ind]])
          .scale(0.5);
      }
    }

    nhops++;
  }

  if (!found_tri) {
    throw (
      'Could not locate the triangle that encloses (' +
      target_vertex.x +
      ', ' +
      target_vertex.y +
      ')!'
    );
  }

  return [ind_tri_cur, nhops - 1];
}

function restoreDelaunay(ind_vert, meshData, stack) {
  const vertices = meshData.scaled_vert;
  const triangles = meshData.tri;
  const adjacency = meshData.adj;
  const v_new = vertices[ind_vert];

  while (stack.length > 0) {
    const ind_tri_pair = stack.pop(); //[index of tri to check, adjncy index to goto triangle that contains new point]
    const ind_tri = ind_tri_pair[0];

    const ind_tri_vert = triangles[ind_tri]; //vertex indices of the triangle
    let v_tri = [];
    for (let i = 0; i < 3; i++) {
      v_tri[i] = vertices[ind_tri_vert[i]];
    }

    if (!isDelaunay(v_tri, v_new)) {
      //v_new lies inside the circumcircle of the triangle, so need to swap diagonals

      const outernode_tri = ind_tri_pair[1]; // [0,1,2] node-index of vertex that's not part of the common edge
      const ind_tri_neigh = adjacency[ind_tri][outernode_tri];

      if (ind_tri_neigh < 0) {
        throw 'negative index';
      }

      //Swap the diagonal between the adjacent triangles
      swapDiagonal(meshData, ind_tri, ind_tri_neigh);

      //Add the triangles opposite the new vertex to the stack
      const new_node_ind_tri = triangles[ind_tri].indexOf(ind_vert);
      const ind_tri_outerp2 = adjacency[ind_tri][new_node_ind_tri];
      if (ind_tri_outerp2 >= 0) {
        const neigh_node = adjacency[ind_tri_outerp2].indexOf(ind_tri);
        stack.push([ind_tri_outerp2, neigh_node]);
      }

      const new_node_ind_tri_neigh = triangles[ind_tri_neigh].indexOf(ind_vert);
      const ind_tri_neigh_outer =
        adjacency[ind_tri_neigh][new_node_ind_tri_neigh];
      if (ind_tri_neigh_outer >= 0) {
        const neigh_node =
          adjacency[ind_tri_neigh_outer].indexOf(ind_tri_neigh);
        stack.push([ind_tri_neigh_outer, neigh_node]);
      }
    } //is not Delaunay
  }
}

//Swaps the diagonal of adjacent triangles A and B
function swapDiagonal(meshData, ind_triA, ind_triB) {
  const triangles = meshData.tri;
  const adjacency = meshData.adj;

  //Find the node index of the outer vertex in each triangle
  const outernode_triA = adjacency[ind_triA].indexOf(ind_triB);
  const outernode_triB = adjacency[ind_triB].indexOf(ind_triA);

  //Indices of nodes after the outernode (i.e. nodes of the common edge)
  const outernode_triA_p1 = (outernode_triA + 1) % 3;
  const outernode_triA_p2 = (outernode_triA + 2) % 3;

  const outernode_triB_p1 = (outernode_triB + 1) % 3;
  const outernode_triB_p2 = (outernode_triB + 2) % 3;

  //Update triangle nodes
  triangles[ind_triA][outernode_triA_p2] = triangles[ind_triB][outernode_triB];
  triangles[ind_triB][outernode_triB_p2] = triangles[ind_triA][outernode_triA];

  //Update adjacencies for triangle opposite outernode
  adjacency[ind_triA][outernode_triA] = adjacency[ind_triB][outernode_triB_p1];
  adjacency[ind_triB][outernode_triB] = adjacency[ind_triA][outernode_triA_p1];

  //Update adjacency of neighbor opposite triangle A's (outernode+1) node
  const ind_triA_neigh_outerp1 = adjacency[ind_triA][outernode_triA_p1];
  if (ind_triA_neigh_outerp1 >= 0) {
    const neigh_node = adjacency[ind_triA_neigh_outerp1].indexOf(ind_triA);
    adjacency[ind_triA_neigh_outerp1][neigh_node] = ind_triB;
  }

  //Update adjacency of neighbor opposite triangle B's (outernode+1) node
  const ind_triB_neigh_outerp1 = adjacency[ind_triB][outernode_triB_p1];
  if (ind_triB_neigh_outerp1 >= 0) {
    const neigh_node = adjacency[ind_triB_neigh_outerp1].indexOf(ind_triB);
    adjacency[ind_triB_neigh_outerp1][neigh_node] = ind_triA;
  }

  //Update adjacencies for triangles opposite the (outernode+1) node
  adjacency[ind_triA][outernode_triA_p1] = ind_triB;
  adjacency[ind_triB][outernode_triB_p1] = ind_triA;
}

function removeBoundaryTriangles(meshData) {
  const verts = meshData.scaled_vert;
  const triangles = meshData.tri;
  const adjacency = meshData.adj;
  const N = verts.length - 3;

  let del_count = 0;
  const indmap = [];
  for (let i = 0; i < triangles.length; i++) {
    let prev_del_count = del_count;
    for (let j = i; j < triangles.length; j++) {
      if (triangles[j][0] < N && triangles[j][1] < N && triangles[j][2] < N) {
        indmap[i + del_count] = i;
        break;
      } else {
        indmap[i + del_count] = -1;
        del_count++;
      }
    }

    let del_length = del_count - prev_del_count;
    if (del_length > 0) {
      triangles.splice(i, del_length);
      adjacency.splice(i, del_length);
    }
  }

  //Update adjacencies
  for (let i = 0; i < adjacency.length; i++) {
    for (let j = 0; j < 3; j++) {
      adjacency[i][j] = indmap[adjacency[i][j]];
    }
  }

  //Delete super-triangle nodes
  meshData.scaled_vert.splice(-3, 3);
  meshData.vert.splice(-3, 3);
}

function isDelaunay(v_tri, p) {
  const vecp0 = v_tri[0].sub(p);
  const vecp1 = v_tri[1].sub(p);
  const vecp2 = v_tri[2].sub(p);

  const p0_sq = vecp0.x * vecp0.x + vecp0.y * vecp0.y;
  const p1_sq = vecp1.x * vecp1.x + vecp1.y * vecp1.y;
  const p2_sq = vecp2.x * vecp2.x + vecp2.y * vecp2.y;

  const det =
    vecp0.x * (vecp1.y * p2_sq - p1_sq * vecp2.y) -
    vecp0.y * (vecp1.x * p2_sq - p1_sq * vecp2.x) +
    p0_sq * (vecp1.x * vecp2.y - vecp1.y * vecp2.x);

  if (det > 0) {
    //p is inside circumcircle of v_tri
    return false;
  } else {
    return true;
  }
}

function loadImageDom(publicURL) {
  return new Promise((resolve, reject) => {
    const imageDom = new Image();
    imageDom.crossOrigin = 'anonymous';
    imageDom.onload = (event) => {
      resolve({
        imageDom: imageDom,
        imageDomWidth: imageDom.width,
        imageDomHeight: imageDom.height,
      });
    };
    imageDom.onerror = (event) => {
      reject(event);
    };
    imageDom.src = publicURL;
  });
}

function reflectImage2Canvas(dataURL) {
  // https://github.com/GRI-Inc/App-Club-Scroll-Telling-App/blob/main/app/src/components/chroma-key-slide/index.js
  return new Promise(async (resolve, reject) => {
    const {imageDom, imageDomWidth, imageDomHeight} = await loadImageDom(
      dataURL
    );
    const canvasDom = document.querySelector(`.reflector`);
    const canvasContext = canvasDom.getContext('2d');
    canvasDom.width = imageDomWidth;
    canvasDom.height = imageDomHeight;
    canvasContext.drawImage(imageDom, 0, 0, imageDomWidth, imageDomHeight);
    resolve({resizedWidth: imageDomWidth, resizedHeight: imageDomHeight});
  });
}

function getColorDistance(rgb1, rgb2) {
  // https://ja.wikipedia.org/wiki/%E3%83%A6%E3%83%BC%E3%82%AF%E3%83%AA%E3%83%83%E3%83%89%E8%B7%9D%E9%9B%A2
  return Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
      Math.pow(rgb1.g - rgb2.g, 2) +
      Math.pow(rgb1.b - rgb2.b, 2)
  );
}

function chromaKey(
  chromaKeyColor,
  colorDistance,
  imageDomWidth,
  imageDomHeight
) {
  const canvasDom = document.querySelector(`.reflector`);
  const canvasContext = canvasDom.getContext('2d');
  const imageData = canvasContext.getImageData(
    0,
    0,
    imageDomWidth,
    imageDomHeight
  );
  const data = imageData.data;
  for (let index = 0; index < data.length; index++) {
    const rgb = {
      r: data[index],
      g: data[index + 1],
      b: data[index + 2],
    };
    if (getColorDistance(chromaKeyColor, rgb) < colorDistance) {
      // alpha値を0にすることで見えなくする
      data[index + 3] = 10;
    }
  }
  // 書き換えたdataをimageDataにもどし、描画する
  // https://stackoverflow.com/questions/11098419/imagedata-data-assignment-in-strict-mode
  canvasContext.putImageData(imageData, 0, 0);
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

function mod(n, m) {
  return ((n % m) + m) % m;
}

function rgbToHex(r, g, b) {
  if (r > 255 || g > 255 || b > 255) {
    throw 'Invalid color component';
  }
  return ((r << 16) | (g << 8) | b).toString(16);
}

function drawLine() {
  const dotPointInfoList = [];
  const canvasDom = document.querySelector(`.reflector`);
  const canvasContext = canvasDom.getContext('2d');
  const {width, height} = {
    ...disconnectObserve(canvasDom.getBoundingClientRect()),
  };
  let seq = 0;
  let dotId = 0;
  let throttle = 9;
  for (let i = 0; i <= width; i++) {
    for (let j = 0; j <= height; j++) {
      const x = i;
      const y = j;
      const pixcelListPerMousePoint = canvasContext.getImageData(
        x,
        y,
        1,
        1
      ).data;
      const hexColor =
        '#' +
        (
          '000000' +
          rgbToHex(
            pixcelListPerMousePoint[0],
            pixcelListPerMousePoint[1],
            pixcelListPerMousePoint[2]
          )
        ).slice(-6);
      if (hexColor !== '#000000' && !hexColor.match(/^#f/)) {
        seq++;
        if (mod(seq, throttle) + 1 === throttle) {
          dotPointInfoList.push(new Point(x, y));
        }
      }
    }
  }
  return dotPointInfoList;
}

function tearDown() {
  const fileDom = document.querySelector(`.file`);
  fileDom.value = '';
  const canvasDom = document.querySelector(`.reflector`);
  const canvasContext = canvasDom.getContext('2d');
  canvasDom.style.visibility = `hidden`;
}

function coolImageCompression(filObject) {
  // https://github.com/Donaldcwl/browser-image-compression#usage
  return new Promise(async (resolve, reject) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };
    try {
      const compressedFile = await imageCompression(filObject, options);
      console.log(
        `compressedFile size ${compressedFile.size / 1024 / 1024} MB`
      ); // smaller than maxSizeMB
      resolve(compressedFile);
    } catch (error) {
      reject(error);
    }
  });
}

function convertFileObjectToBase64URL(fileObject) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target.result);
    };
    reader.onerror = (event) => {
      reject(event);
    };
    reader.readAsDataURL(fileObject);
  });
}

function niceResizer(
  imageDom,
  resizedImageDomWidth,
  imageDomWidth,
  imageDomHeight
) {
  // https://stackoverflow.com/questions/19262141/resize-image-with-javascript-canvas-smoothly
  const resizedImageDomHeight =
    imageDomHeight * (resizedImageDomWidth / imageDomWidth);

  const canvasDom = document.createElement('canvas');
  canvasDom.width = resizedImageDomWidth;
  canvasDom.height = resizedImageDomHeight;
  const canvasDomContext = canvasDom.getContext('2d');
  return new Promise(async (resolve, reject) => {
    const imageBitmap = await createImageBitmap(imageDom, {
      resizeWidth: resizedImageDomWidth,
      resizeHeight: resizedImageDomHeight,
      resizeQuality: 'high',
    });
    canvasDomContext.drawImage(
      imageBitmap,
      0,
      0,
      resizedImageDomWidth,
      resizedImageDomHeight
    );
    resolve({
      canvasDom: canvasDom,
    });
  });
}

let isDone = false;
let willResizedImageURL = '';
const transparentColorInfo = {r: 0, g: 0, b: 0};
const colorDistance = 12;

let stats;
stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = 0;
stats.domElement.style.top = 0;
document.body.appendChild(stats.domElement);

let parameter = {
  workspaceWidth: 700,
  workspaceHeight: 700,
};

// https://github.com/GRI-Inc/App-Club-Image-Clean-App/blob/main/image-proportion/index.js#L251
let controllerInfo = {
  'Workspace Width': 700,
  'Workspace Height': 700,
  'File Upload': () => {
    // http://zhangwenli.com/blog/2015/05/29/upload-images-with-dat-gui/
    const fileDom = document.querySelector('.file');
    fileDom.addEventListener('change', async (event) => {
      const fileObject = event.target.files[0];

      if (!isDone && fileObject) {
        isDone = true;
        reset();

        console.log(
          `uncompressedFile size ${fileObject.size / 1024 / 1024} MB`
        ); // smaller than maxSizeMB

        const compressedFileObject = await coolImageCompression(fileObject);

        console.log(compressedFileObject);

        willResizedImageURL = await convertFileObjectToBase64URL(
          compressedFileObject
        );

        console.log(willResizedImageURL.slice(0, 10));

        const {imageDom, imageDomWidth, imageDomHeight} = await loadImageDom(
          willResizedImageURL
        );

        const {canvasDom} = await niceResizer(
          imageDom,
          parameter.workspaceWidth,
          imageDomWidth,
          imageDomHeight
        );

        const {resizedWidth, resizedHeight} = await reflectImage2Canvas(
          canvasDom.toDataURL()
        );

        console.log(
          'canvasDom, resizedWidth, resizedHeight',
          canvasDom,
          resizedWidth,
          resizedHeight
        );
        parameter.workspaceWidth = resizedWidth;
        parameter.workspaceHeight = resizedHeight;
        chromaKey(
          transparentColorInfo,
          colorDistance,
          imageDomWidth,
          imageDomHeight
        );
        const dotPointInfoList = drawLine();

        console.log(dotPointInfoList);

        loadVertices(dotPointInfoList);

        triangulate();

        tearDown();
        initialize();

        for (let i in gui.__controllers) {
          gui.__controllers[i].updateDisplay();
        }
      }

      isDone = false;
    });
    fileDom.click();
  },
};

const gui = new dat.GUI();
gui.width = 300;
gui.add(controllerInfo, 'File Upload');
gui.add(controllerInfo, 'Workspace Width', 1, 1000, 1).onChange((event) => {
  detectChangeParameter(event, 'Workspace Width');
});
gui
  .add(controllerInfo, 'Workspace Height', 1, window.innerHeight, 1)
  .onChange((event) => {
    detectChangeParameter(event, 'Workspace Height');
  });

function detectChangeParameter(event, keyName) {
  if (keyName === 'Workspace Width') {
    parameter.workspaceWidth = event;
  }
  if (keyName === 'Workspace Height') {
    parameter.workspaceHeight = event;
  }

  initialize();
}

function initialize() {
  const canvasDom = document.querySelector(`.reflector`);
  const workspaceDom = document.querySelector('.workspace');
  canvasDom.width = parameter.workspaceWidth;
  canvasDom.height = parameter.workspaceHeight;
  workspaceDom.style.width = `${parameter.workspaceWidth}px`;
  workspaceDom.style.height = `${parameter.workspaceHeight}px`;
}

function loop() {
  requestAnimationFrame(loop);
  stats.begin();
  stats.end();
}

initialize();
loop();
