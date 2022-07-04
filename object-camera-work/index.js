import * as THREE from 'three';
// https://threejs.org/docs/#examples/en/controls/OrbitControls
// https://www.npmjs.com/package/@three-ts/orbit-controls
import {OrbitControls} from '@three-ts/orbit-controls';

function init() {
  // サイズを指定
  const width = parameter.workspaceWidth;
  const height = parameter.workspaceHeight;

  // レンダラーを作成
  const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('.workspace'),
  });
  renderer.setSize(width, height);

  // シーンを作成
  const scene = new THREE.Scene();

  // カメラを作成
  const camera = new THREE.PerspectiveCamera(45, width / height);

  // 平行光源を作成
  const directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);

  // マテリアルを作成
  const material = new THREE.MeshPhongMaterial({
    map: new THREE.TextureLoader().load(
      'https://s3-us-west-2.amazonaws.com/s.cdpn.io/6043/css_globe_diffuse.jpg'
    ),
    side: THREE.DoubleSide,
  });

  // 球体の形状を作成
  const geometry = new THREE.SphereGeometry(300, 30, 30);

  // 形状とマテリアルからメッシュを作成
  const earthMesh = new THREE.Mesh(geometry, material);

  // シーンにメッシュを追加
  scene.add(earthMesh);

  tick();

  function deg2rad(degree) {
    return (degree * Math.PI) / 180;
  }

  // 毎フレーム時に実行されるループイベント
  function tick() {
    // チカチカせずに原点方向を見つめつつ回転したい
    camera.position.x = parameter.cameraPositionX;
    camera.position.y = parameter.cameraPositionY;
    camera.position.z = parameter.cameraPositionZ;

    // 原点方向を見つめる
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    if (parameter.isCameraRotationMode) {
      // https://github.com/mrdoob/three.js/issues/730
      camera.rotation.x = deg2rad(parameter.cameraRotationX);
      camera.rotation.y = deg2rad(parameter.cameraRotationY);
      camera.rotation.z = deg2rad(parameter.cameraRotationZ);
    }

    // 地球は常に回転させておく
    earthMesh.rotation.y += 0.01;

    // レンダリング
    renderer.render(scene, camera);

    requestAnimationFrame(tick);
  }
}

let stats;
stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = 0;
stats.domElement.style.top = 0;
document.body.appendChild(stats.domElement);

let parameter = {
  workspaceWidth: window.innerWidth,
  workspaceHeight: window.innerHeight,

  cameraPositionX: 0,
  cameraPositionY: 0,
  cameraPositionZ: 2000,

  isCameraRotationMode: false,

  cameraRotationX: 0,
  cameraRotationY: 0,
  cameraRotationZ: 0,
};

let controllerInfo = {
  'Camera Position X': 0,
  'Camera Position Y': 0,
  'Camera Position Z': 2000,

  'Camera Look At': false,

  'Camera Rotation X': 0,
  'Camera Rotation Y': 0,
  'Camera Rotation Z': 0,
};

const gui = new dat.GUI();
gui.width = 300;
gui
  .add(controllerInfo, 'Camera Position X', -3000, 3000, 1)
  .onChange((event) => {
    detectChangeParameter(event, 'Camera Position X');
  });
gui
  .add(controllerInfo, 'Camera Position Y', -3000, 3000, 1)
  .onChange((event) => {
    detectChangeParameter(event, 'Camera Position Y');
  });
gui
  .add(controllerInfo, 'Camera Position Z', -3000, 3000, 1)
  .onChange((event) => {
    detectChangeParameter(event, 'Camera Position Z');
  });

gui.add(controllerInfo, 'Camera Look At').onChange((event) => {
  detectChangeParameter(event, 'Camera Look At');
});

gui.add(controllerInfo, 'Camera Rotation X', -360, 360, 1).onChange((event) => {
  detectChangeParameter(event, 'Camera Rotation X');
});
gui.add(controllerInfo, 'Camera Rotation Y', -360, 360, 1).onChange((event) => {
  detectChangeParameter(event, 'Camera Rotation Y');
});
gui.add(controllerInfo, 'Camera Rotation Z', -360, 360, 1).onChange((event) => {
  detectChangeParameter(event, 'Camera Rotation Z');
});

function detectChangeParameter(event, keyName) {
  if (keyName === 'Camera Position X') {
    parameter.cameraPositionX = event;
  }
  if (keyName === 'Camera Position Y') {
    parameter.cameraPositionY = event;
  }
  if (keyName === 'Camera Position Z') {
    parameter.cameraPositionZ = event;
  }
  if (keyName === 'Camera Look At') {
    parameter.isCameraRotationMode = event;
  }
  if (keyName === 'Camera Rotation X') {
    parameter.cameraRotationX = event;
  }
  if (keyName === 'Camera Rotation Y') {
    parameter.cameraRotationY = event;
  }
  if (keyName === 'Camera Rotation Z') {
    parameter.cameraRotationZ = event;
  }
}

function loop() {
  requestAnimationFrame(loop);
  stats.begin();
  stats.end();
}

loop();

window.addEventListener('load', init);
