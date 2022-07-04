class Point2D {
  constructor(x, y) {
    this.x = typeof x === 'number' ? x : 0;
    this.y = typeof y === 'number' ? y : 0;
  }
}

class Point3D extends Point2D {
  constructor(x, y, z) {
    super(x, y);
    this.z = typeof z === 'number' ? z : 0;
  }
}

class Cube {
  constructor(center, size) {
    const d = size / 2;

    this.vertices = [
      new Point3D(center.x - d, center.y - d, center.z + d),
      new Point3D(center.x - d, center.y - d, center.z - d),
      new Point3D(center.x + d, center.y - d, center.z - d),
      new Point3D(center.x + d, center.y - d, center.z + d),
      new Point3D(center.x + d, center.y + d, center.z + d),
      new Point3D(center.x + d, center.y + d, center.z - d),
      new Point3D(center.x - d, center.y + d, center.z - d),
      new Point3D(center.x - d, center.y + d, center.z + d),
    ];

    this.faces = [
      [this.vertices[0], this.vertices[1], this.vertices[2], this.vertices[3]],
      [this.vertices[3], this.vertices[2], this.vertices[5], this.vertices[4]],
      [this.vertices[4], this.vertices[5], this.vertices[6], this.vertices[7]],
      [this.vertices[7], this.vertices[6], this.vertices[1], this.vertices[0]],
      [this.vertices[7], this.vertices[0], this.vertices[3], this.vertices[4]],
      [this.vertices[1], this.vertices[6], this.vertices[5], this.vertices[2]],
    ];
  }

  render(svgDom, dx, dy) {
    svgDom.innerHTML = '';
    const cubeFaceColor = `rgba(135, 202, 241, 0.1)`;
    const cubeStrokeColor = `rgba(0, 0, 0, 0.1)`;
    for (let i = 0, ii = this.faces.length; i < ii; i++) {
      let face = this.faces[i];
      let point = createProjection(face[0]);
      let str = `<path d="M${point.x + dx} ${-point.y + dy}`;
      for (let o = 1, oo = face.length; o < oo; o++) {
        point = createProjection(face[o]);
        str += ` L ${point.x + dx} ${-point.y + dy}`;
      }
      str += ` Z" fill="${cubeFaceColor}" stroke="${cubeStrokeColor}">`;
      svgDom.innerHTML += str;
    }
  }
}

function createProjection(vertice) {
  return new Point2D(vertice.x, vertice.z);
}

function rotation(vertice, center, theta, phi) {
  let ct = Math.cos(theta);
  let st = Math.sin(theta);
  let cp = Math.cos(phi);
  let sp = Math.sin(phi);
  let x = vertice.x - center.x;
  let y = vertice.y - center.y;
  let z = vertice.z - center.z;

  vertice.x = ct * x - st * cp * y + st * sp * z + center.x;
  vertice.y = st * x + ct * cp * y - ct * sp * z + center.y;
  vertice.z = sp * y + cp * z + center.z;
}

function tiktoker(xDegree, yDegree) {
  for (let i = 0, ii = 8; i < ii; i++) {
    // 初期表示の回転オフセット
    rotation(cube.vertices[i], center, Math.PI / xDegree, Math.PI / yDegree);
  }
  cube.render(svgDom, dx, dy);
}

function scrollAnimation(event) {
  function mod(n, m) {
    return ((n % m) + m) % m;
  }
  const scrollTop = contentDom.scrollTop;
  tiktoker(mod(scrollTop, 360) + 1, mod(scrollTop, 180) + 1);
}

function handleMouseDown(event) {
  mouse.down = true;
  mouse.x = event.clientX;
  mouse.y = event.clientY;
}

function handleMouseMove(event) {
  if (mouse.down) {
    let theta = ((event.clientX - mouse.x) * Math.PI) / 360;
    let phi = ((event.clientY - mouse.y) * Math.PI) / 180;

    for (let i = 0, ii = 8; i < ii; i++) {
      rotation(cube.vertices[i], center, theta, phi);
    }

    mouse.x = event.clientX;
    mouse.y = event.clientY;

    cube.render(svgDom, dx, dy);
  }
}

function handleMouseUp(event) {
  mouse.down = false;
}

function handleTouchStart(event) {
  touch.down = true;
  touch.x = event.changedTouches[0].clientX;
  touch.y = event.changedTouches[0].clientY;
}

function handleTouchMove(event) {
  event.preventDefault();
  const clientX = event.changedTouches[0].clientX;
  const clientY = event.changedTouches[0].clientY;
  if (touch.down) {
    let theta = ((event.changedTouches[0].clientX - touch.x) * Math.PI) / 360;
    let phi = ((event.changedTouches[0].clientY - touch.y) * Math.PI) / 180;

    for (let i = 0, ii = 8; i < ii; i++) {
      rotation(cube.vertices[i], center, theta, phi);
    }

    touch.x = clientX;
    touch.y = clientY;

    cube.render(svgDom, dx, dy);
  }
}

function handleTouchEnd(event) {
  touch.down = false;
}

const contentDom = document.querySelector(`.content`);
const svgDom = document.querySelector('.polygon');
const width = window.innerWidth;
const height = window.innerHeight / 2;
svgDom.style.width = `${width}px`;
svgDom.style.height = `${height}px`;
const dx = width / 2;
const dy = height / 2;
const size = height / 4;
const center = new Point3D(0, 10, 0);
const cube = new Cube(center, size);
const mouse = {
  down: false,
  x: 0,
  y: 0,
};
const touch = {
  down: false,
  x: 0,
  y: 0,
};

cube.render(svgDom, dx, dy);

contentDom.addEventListener('scroll', scrollAnimation);
svgDom.addEventListener('mousedown', handleMouseDown);
svgDom.addEventListener('mousemove', handleMouseMove);
svgDom.addEventListener('mouseup', handleMouseUp);
svgDom.addEventListener('touchstart', handleTouchStart);
svgDom.addEventListener('touchmove', handleTouchMove);
svgDom.addEventListener('touchend', handleTouchEnd);

tiktoker(30, 30);
