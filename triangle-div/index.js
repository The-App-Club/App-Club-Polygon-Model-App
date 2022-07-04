function getRadian(start, end) {
  const radian = Math.atan2(end.top - start.top, end.left - start.left);
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
  return Math.sqrt(
    Math.pow(end.left - start.left, 2) + Math.pow(end.top - start.top, 2)
  );
}

function getNextPos(start, radius, radian) {
  const nextPos = {
    left: start.left + radius * Math.cos(radian),
    top: start.top + radius * Math.sin(radian),
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

const a = document.querySelector(`.item:nth-child(1)`);
const aPos = disconnectObserve(a.getBoundingClientRect());
const b = document.querySelector(`.item:nth-child(2)`);
const bPos = disconnectObserve(b.getBoundingClientRect());
const c = document.querySelector(`.item:nth-child(3)`);
const cPos = disconnectObserve(c.getBoundingClientRect());
const a2bRadian = getRadian(aPos, bPos);
const a2cRadian = getRadian(aPos, cPos);
const c2aRadian = getRadian(cPos, aPos);
const b2cRadian = getRadian(bPos, cPos);
const a2bDistance = getDistance(aPos, bPos);
const a2cDistance = getDistance(aPos, cPos);
const b2cDistance = getDistance(bPos, cPos);

let counter = 1;
const a2cNextPosList = getNextPosList(
  aPos,
  aPos.width,
  a2cRadian,
  a2cDistance,
  [],
  counter
);
for (let index = 0; index < a2cNextPosList.length; index++) {
  const a2cNextPos = a2cNextPosList[index];
  const div = document.createElement('div');
  div.classList.add('dot');
  div.style.top = `${a2cNextPos.top}px`;
  div.style.left = `${a2cNextPos.left}px`;
  document.body.appendChild(div);
}

counter = 1;
const b2cNextPosList = getNextPosList(
  bPos,
  bPos.width - 4,
  b2cRadian,
  b2cDistance,
  [],
  counter
);
for (let index = 0; index < b2cNextPosList.length; index++) {
  const b2cNextPos = b2cNextPosList[index];
  const div = document.createElement('div');
  div.classList.add('dot');
  div.style.top = `${b2cNextPos.top}px`;
  div.style.left = `${b2cNextPos.left}px`;
  document.body.appendChild(div);
}

counter = 1;
const a2bNextPosList = getNextPosList(
  aPos,
  aPos.width,
  a2bRadian,
  a2bDistance,
  [],
  counter
);
for (let index = 0; index < a2bNextPosList.length - 1; index++) {
  const a2bNextPos = a2bNextPosList[index];
  const div = document.createElement('div');
  div.classList.add('dot');
  div.style.top = `${a2bNextPos.top}px`;
  div.style.left = `${a2bNextPos.left}px`;
  document.body.appendChild(div);
}
