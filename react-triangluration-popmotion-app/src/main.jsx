import {useState, useMemo} from 'react';
import {createRoot} from 'react-dom/client';
import {css} from '@emotion/css';
import {Spacer} from './components/Spacer';
import {Bebep} from './components/Bebep';
import {Button, Slider} from '@mui/material';
import * as d3 from 'd3';
import {transform} from 'framer-motion';
import '@fontsource/inter';
import './styles/index.scss';

import {Earcut} from 'three/src/extras/Earcut.js';
import 'array-each-slice';

const points = [0, 0, 1, 0, 1, 1, 0, 1]; // flat array of vertices like [ x0,y0, x1,y1, x2,y2, ... ]

const App = () => {
  const [progress, setProgress] = useState(0);
  const [tik, setTik] = useState(new Date());
  // const points = useMemo(() => {
  //   return luxembourg.map((point) => {
  //     return transform(
  //       [Math.min(...luxembourg), Math.max(...luxembourg)],
  //       [0, 1]
  //     )(point);
  //   });
  // }, []);
  const data = useMemo(() => {
    const triangles = Earcut.triangulate(points, null, 2);
    const size = 100;
    const xyList = points.eachSlice(2);
    const pathInfoList = [];
    let id = 0;
    // https://github.com/sony/mapray-js/blob/master/packages/mapray/src/Triangulator.js#L61-L64
    for (let i = 0; i < triangles.length; i++) {
      const t0 = triangles[i * 3 + 0];
      const t1 = triangles[i * 3 + 1];
      const t2 = triangles[i * 3 + 2];
      if (
        points[t0] !== undefined &&
        points[t1] !== undefined &&
        points[t2] !== undefined
      ) {
        pathInfoList.push({
          id,
          points: [
            [xyList[t0][0] * size, xyList[t0][1] * size],
            [xyList[t1][0] * size, xyList[t1][1] * size],
            [xyList[t2][0] * size, xyList[t2][1] * size],
            [xyList[t0][0] * size, xyList[t0][1] * size],
          ],
        });
        id = id + 1;
      }
    }
    return pathInfoList;
  }, []);

  const triangules = useMemo(() => {
    return data.map(({id, points}, index) => {
      return {id, points: d3.pairs(points)};
    });
  }, [data]);
  const handleChange = (e) => {
    setProgress(e.target.value);
  };

  // console.log(triangules);

  return (
    <>
      <div
        className={css`
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          min-height: 100vh;
          width: 100%;
        `}
      >
        <div
          className={css`
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            max-width: 40rem;
            width: 100%;
            margin: 0 auto;
          `}
        >
          <Slider
            defaultValue={0}
            min={0}
            max={1}
            step={0.001}
            value={progress}
            aria-label="Default"
            valueLabelDisplay="auto"
            onChange={handleChange}
          />
        </div>
        <div
          className={css`
            position: relative;
          `}
        >
          {triangules.map((triangule, index) => {
            return (
              <Bebep
                key={index}
                triangule={triangule}
                tik={tik}
                progress={progress}
              />
            );
          })}
        </div>
      </div>
    </>
  );
};

const container = document.getElementById('root');

const root = createRoot(container);

root.render(<App />);
