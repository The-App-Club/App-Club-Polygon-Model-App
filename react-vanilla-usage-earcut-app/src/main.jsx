import {useState, useMemo, useRef, useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {css} from '@emotion/css';
import {Spacer} from './components/Spacer';
import {Bebep} from './components/Bebep';
import {Button, Slider} from '@mui/material';
import * as d3 from 'd3';
import {transform} from 'framer-motion';
import '@fontsource/inter';
import './styles/index.scss';
import {default as earcut} from 'earcut';
import 'array-each-slice';
import {samples} from 'culori';

const getDomain = (data, key) => {
  const result = data.reduce(
    (acc, row) => {
      return {
        min: Math.min(acc.min, row[key]),
        max: Math.max(acc.max, row[key]),
      };
    },
    {min: Infinity, max: -Infinity}
  );
  return result;
};

const App = () => {
  const svgDomRef = useRef(null);
  const [resized, setResized] = useState(null);
  const [progress, setProgress] = useState(0);
  const [tik, setTik] = useState(new Date());
  const handleChange = (e) => {
    setProgress(e.target.value);
  };

  const size = useMemo(() => {
    return 1;
  }, []);

  const points = useMemo(() => {
    return [
      6.043073357781111, 50.128051662794235, 6.242751092156993,
      49.90222565367873, 6.186320428094177, 49.463802802114515,
      5.897759230176405, 49.44266714130703, 5.674051954784829,
      49.529483547557504, 5.782417433300906, 50.09032786722122,
      6.043073357781111, 50.128051662794235,
    ]; // flat array of vertices like [ x0,y0, x1,y1, x2,y2, ... ]
  }, []);

  const xyList = useMemo(() => {
    return points.eachSlice(2);
  }, [points]);

  const triangles = useMemo(() => {
    return earcut(points);
  }, [points]);

  const originalPath = useMemo(() => {
    let path = `M ${xyList[0][0] * size},${xyList[0][1] * size}`;
    for (let index = 1; index < xyList.length; index++) {
      const [x, y] = xyList[index];
      path = path + `L ${x * size},${y * size}`;
    }
    path = path + ` Z`;
    return path;
  }, [xyList, size]);

  const {polygonPath, pointList} = useMemo(() => {
    const pathInfoList = [];
    const pointList = [];
    let id = 0;
    for (let i = 0; i < triangles.length; i++) {
      const t0 = triangles[i * 3 + 0];
      const t1 = triangles[i * 3 + 1];
      const t2 = triangles[i * 3 + 2];
      let path = ``;
      if (
        points[t0] !== undefined &&
        points[t1] !== undefined &&
        points[t2] !== undefined
      ) {
        pointList.push({x: xyList[t0][0] * size, y: xyList[t0][1] * size});
        pointList.push({x: xyList[t1][0] * size, y: xyList[t1][1] * size});
        pointList.push({x: xyList[t2][0] * size, y: xyList[t2][1] * size});
        path = path + `M ${xyList[t0][0] * size},${xyList[t0][1] * size}`;
        path = path + ` L ${xyList[t1][0] * size},${xyList[t1][1] * size}`;
        path = path + ` L ${xyList[t2][0] * size},${xyList[t2][1] * size}`;
        path = path + ` Z`;
        pathInfoList.push({
          id,
          path,
        });
        id = id + 1;
      }
    }

    const result = pathInfoList
      .map((pathInfo) => {
        return pathInfo.path;
      })
      .join('');
    return {polygonPath: result, pointList};
  }, [triangles, points, xyList]);

  const clampedPointList = useMemo(() => {
    const {min: minX, max: maxX} = getDomain(pointList, `x`);
    const {min: minY, max: maxY} = getDomain(pointList, `y`);
    return samples(pointList.length).map((t, index) => {
      return {
        x: transform(
          [minX, maxX],
          [minX, window.innerWidth * 0.95]
        )(pointList[index].x),
        y: transform(
          [minY, maxY],
          [minY, window.innerHeight * 0.95]
        )(pointList[index].y),
      };
    });
  }, [resized]);

  const clampedPolygonPath = useMemo(() => {
    const pathInfoList = [];
    const pointList = [];
    const triangles = clampedPointList.eachSlice(3);
    let id = 0;
    for (let i = 0; i < triangles.length; i++) {
      const triangle = triangles[i];
      let path = ``;
      path = path + `M ${triangle[0].x},${triangle[0].y}`;
      path = path + ` L ${triangle[1].x},${triangle[1].y}`;
      path = path + ` L ${triangle[2].x},${triangle[2].y}`;
      path = path + ` Z`;
      pathInfoList.push({
        id,
        path,
      });
      id = id + 1;
    }
    const result = pathInfoList
      .map((pathInfo) => {
        return pathInfo.path;
      })
      .join('');
    return result;
  }, [clampedPointList]);

  // console.log(clampedPolygonPath);
  useEffect(() => {
    const svg = svgDomRef.current;

    const {xMin, xMax, yMin, yMax} = [...svg.children].reduce(
      (acc, el) => {
        const {x, y, width, height} = el.getBBox();
        if (!acc.xMin || x < acc.xMin) {
          acc.xMin = x;
        }
        if (!acc.xMax || x + width > acc.xMax) {
          acc.xMax = x + width;
        }
        if (!acc.yMin || y < acc.yMin) {
          acc.yMin = y;
        }
        if (!acc.yMax || y + height > acc.yMax) {
          acc.yMax = y + height;
        }
        return acc;
      },
      {xMin: 0, yMin: 0, xMax: 300, yMax: 300}
    );

    const viewbox = `${xMin} ${yMin} ${xMax - xMin} ${yMax - yMin}`;

    svg.setAttribute('viewBox', viewbox);
  }, []);
  return (
    <>
      <div
        className={css`
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
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
            width: 100%;
          `}
        >
          <svg
            ref={svgDomRef}
            className={css`
              display: block;
              width: 100%;
            `}
            width={300}
            height={400}
          >
            <g>
              {/* <path
                d={`M 356.25,441.16066541563833 L 233.1581814405229,633.6500000000001 L 72.47621125063337,601.4950310649026 ZM 72.47621125063337,601.4950310649026 L 5.674051954784829,123.44314359489559 L 143.57893874150483,49.44266714130703 ZM 143.57893874150483,49.44266714130703 L 321.463181711411,67.458259325612 L 356.25,441.16066541563833 ZM 356.25,441.16066541563833 L 72.47621125063337,601.4950310649026 L 143.57893874150483,49.44266714130703 Z`}
                stroke={'black'}
                strokeWidth={3}
                fill={'none'}
              ></path> */}
              <path
                d={clampedPolygonPath}
                stroke={'black'}
                strokeWidth={3}
                fill={'none'}
              ></path>
            </g>
          </svg>
        </div>
      </div>
    </>
  );
};

const container = document.getElementById('root');

const root = createRoot(container);

root.render(<App />);
