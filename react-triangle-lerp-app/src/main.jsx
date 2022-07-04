import {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
  createRef,
} from 'react';
import {createRoot} from 'react-dom/client';
import {css} from '@emotion/css';
import {Spacer} from './components/Spacer';
import {Button, Slider} from '@mui/material';
import * as d3 from 'd3';
import {transform} from 'framer-motion';
import '@fontsource/inter';
import './styles/index.scss';
import 'array-each-slice';
import {samples} from 'culori';
import {MathUtils, Vector2} from 'three';
import {default as lerp} from 'lerp';

const triangles = [
  {
    start: {x: 10, y: 20, angle: 20},
    end: {x: 50, y: 10, angle: 320},
    imageURL: `https://media.giphy.com/media/4ilFRqgbzbx4c/giphy.gif`,
  },
  {
    start: {x: -130, y: 40, angle: -80},
    end: {x: 50, y: 10, angle: 420},
    imageURL: `https://media.giphy.com/media/xdgisqRDFyO9G/giphy.gif`,
  },
  {
    start: {x: -20, y: 160, angle: -400},
    end: {x: 35, y: 10, angle: 20},
    imageURL: `https://media.giphy.com/media/3TACspcXhhQPK/giphy.gif`,
  },
];
const App = () => {
  const [tik, setTik] = useState(new Date());
  const [progress, setProgress] = useState(0);
  const handleChange = (e) => {
    setProgress(e.target.value);
  };
  const triangleRefs = useMemo(() => {
    return triangles.map((triangle, index) => {
      return createRef();
    });
  }, []);
  const lerpTriangle = useCallback((start) => {
    const fromPoint = new Vector2(start.x, start.y);
    return (end) => {
      const endPoint = new Vector2(end.x, end.y);
      return (t) => {
        const {x, y} = fromPoint.lerp(endPoint, t);
        return {
          x,
          y,
          angle: lerp(start.angle, end.angle, t),
        };
      };
    };
  }, []);
  useEffect(() => {
    const triangleDomList = triangleRefs.map((triangleRef) => {
      return triangleRef.current;
    });
    triangles.forEach((triangle, index) => {
      const {x, y, angle} = lerpTriangle(triangle.start)(triangle.end)(
        progress
      );
      const triangleDom = triangleDomList[index];
      triangleDom.style.transform = `translate(${x}px, ${y}px) rotate(${angle}deg)`;
    });
  }, [progress]);
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
            padding: 3rem;
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
          {triangles.map((triangle, index) => {
            return (
              <div
                key={index}
                ref={triangleRefs[index]}
                className={css`
                  position: absolute;
                  top: ${triangle.start.y}px;
                  left: ${triangle.start.x}px;
                  width: 100px;
                  height: 120px;
                  transform: translate(0, 0);
                  transition: transform 0ms ease-in-out;
                `}
              >
                <img
                  src={triangle.imageURL}
                  alt=""
                  className={css`
                    width: 100%;
                    max-width: 100%;
                    display: block;
                  `}
                />
              </div>
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
