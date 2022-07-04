function drawLine(start, end, borderStyle, targetElement) {
  const e = document.createElement('div');
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

function handleMouseDown(event) {
  const ex = event.pageX;
  const ey = event.pageY;
  if (sx !== undefined && sy !== undefined) {
    drawLine({x: sx, y: sy}, {x: ex, y: ey}, '1px brown solid', document.body);
  }
  [sx, sy] = [ex, ey];
}

let sx, sy;
window.addEventListener('mousedown', handleMouseDown);
