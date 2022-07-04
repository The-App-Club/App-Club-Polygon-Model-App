import {cx, css} from '@emotion/css';
import {useRef, useEffect, useState, useMemo} from 'react';
import {
  animate,
  progress,
  reverseEasing,
  linear,
  clamp,
  pointFromVector,
  steps,
  snap,
} from 'popmotion';
import {samples} from 'culori';
import {useTransition, animated} from 'react-spring';
import {Vector2} from 'three';

const bebopLerp = (startVector = new Vector2(0, 0)) => {
  return (from = new Vector2(0, 0)) => {
    return (to = new Vector2(0, 0)) => {
      return (t) => {
        // https://threejs.org/docs/#api/en/math/Vector2.lerpVectors
        return startVector.lerpVectors(from, to, t);
      };
    };
  };
};

const Bebep = ({tik, triangule, progress = 0}) => {
  const bebopDomRef = useRef(null);
  const data = useMemo(() => {
    const {id, points} = triangule;
    return points.map(([from, to], index) => {
      const startVec = new Vector2(from[0], from[1]);
      const endVec = new Vector2(to[0], to[1]);
      const lerp = bebopLerp(new Vector2(0, 0))(startVec)(endVec);
      return {mover: lerp};
    });
  }, [triangule]);
  // console.log(data[0].mover(1));
  return (
    <>
      {data.map((item, index) => {
        return (
          <div
            key={index}
            className={css`
              position: absolute;
              background: red;
              width: 10px;
              height: 10px;
              top: ${item.mover(progress).y}px;
              left: ${item.mover(progress).x}px;
            `}
          />
        );
      })}
    </>
  );
};

export {Bebep};
