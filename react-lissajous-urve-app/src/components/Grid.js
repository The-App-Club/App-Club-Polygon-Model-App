import {css} from '@emotion/css';
import {useState, useEffect} from 'react';
import {transform} from 'framer-motion';

const deg2Rad = (deg) => {
  return (deg * Math.PI) / 180.0;
};

const Grid = ({color, count, progress, debugProgress}) => {
  const [lineData, setLineData] = useState([]);
  useEffect(() => {
    const t = transform([0, 1], [0, count])(debugProgress / 100);

    setLineData([
      ...lineData,
      {
        x: 100 * Math.cos(deg2Rad(1 * t)),
        y: 100 * Math.sin(deg2Rad(2 * t)),
      },
    ]);
    // eslint-disable-next-line
  }, [debugProgress, count]);

  useEffect(() => {
    const t = transform([0, 1], [0, count])(progress);

    setLineData([
      ...lineData,
      {
        x: 100 * Math.cos(deg2Rad(6 * t)),
        y: 100 * Math.sin(deg2Rad(2 * t)),
      },
    ]);
    // eslint-disable-next-line
  }, [progress, count]);
  return (
    <div
      className={css`
        position: relative;
      `}
    >
      {lineData?.map((d, index) => {
        return (
          <div
            className={css`
              position: absolute;
              top: ${d.y}px;
              left: ${d.x}px;
              width: 0.5rem;
              height: 0.5rem;
              border-radius: 50%;
              background: ${color(transform([0, count - 1], [0, 1])(index))};
            `}
            key={index}
          ></div>
        );
      })}
    </div>
  );
};

export {Grid};
