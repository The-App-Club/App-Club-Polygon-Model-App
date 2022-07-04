import {createRoot} from 'react-dom/client';
import * as d3 from 'd3';
import {voronoi} from 'd3-voronoi';
import {useState, useMemo} from 'react';
import {css, cx} from '@emotion/css';
import {useTransition, animated} from 'react-spring';
import {Button} from '@mui/material';
import {default as chance} from 'chance';
import {transform} from 'framer-motion';

const width = 300,
  height = 300;

const makePath = (d) => {
  return `path("M ${d.join(' L ')} Z")`;
};

const sleep = (milliseconds) => {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
};

const App = () => {
  const [verticles, setVerticles] = useState([
    [182, 143],
    [269, 45],
    [45, 254],
    [240, 284],
    [222, 213],
    [271, 132],
    [177, 254],
    [2, 167],
    [15, 96],
    [294, 239],
  ]);

  const data = useMemo(() => {
    const v = voronoi().extent([
      [0, 0],
      [width, height],
    ]);
    return v.polygons(verticles).map((cell, i) => {
      const path = makePath(cell);
      return {
        id: i,
        path,
        // x: cell[0][0],
        // y: cell[0][1],
        x: chance().integer({min: -width, max: width}),
        y: chance().integer({min: -height, max: height}),
      };
    });
  }, [verticles]);

  const transitions = useTransition(data, {
    key: (item) => {
      return item.id;
    },
    from: ({x, y}) => {
      return {
        x: 0,
        y: 0,
        opacity: 0,
      };
    },
    enter: ({x, y}) => {
      return {
        x,
        y,
        opacity: 1,
      };
    },
    update:
      ({x, y}) =>
      async (next) => {
        await next({
          x,
          y,
        });
        await sleep(1000);
        await next({
          x: 0,
          y: 0,
        });
      },
    leave: (item) => async (next) => {
      await next({
        opacity: 0,
      });
    },
    config: {mass: 1, tension: 50, friction: 1, frequency: 1, duration: 500},
    trail: 25,
  });

  const handleDo = (e) => {
    const verticles = d3.range(10).map((d) => {
      return [Math.random() * width, Math.random() * height];
    });
    setVerticles(verticles);
  };

  return (
    <>
      <Button variant={'outlined'} onClick={handleDo}>
        Do
      </Button>
      <div
        className={css`
          display: grid;
          place-items: center;
          min-height: 90vh;
          width: 100%;
        `}
      >
        <div
          className={css`
            position: relative;
            width: ${width}px;
            height: ${height}px;
          `}
        >
          {transitions((style, item) => {
            return (
              <animated.div
                style={style}
                className={cx(
                  css`
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    background: ${d3.interpolateSpectral(
                      transform([0, data.length - 1], [0, 1])(item.id)
                    )};
                    /* background-image: url(https://media.giphy.com/media/3TACspcXhhQPK/giphy.gif);
                    background-origin: center center;
                    background-repeat: no-repeat; */
                    clip-path: ${item.path};
                  `,
                  ``
                )}
              ></animated.div>
            );
          })}
          {/* {data.map((d, index) => {
          return (
            <div
              key={index}
              className={css`
                position: absolute;
                top: ${0}px;
                left: ${0}px;
                width: 100%;
                height: 100%;
                background-image: url(https://media.giphy.com/media/3TACspcXhhQPK/giphy.gif);
                background-origin: center center;
                background-repeat: no-repeat;
                clip-path: ${d.path};
              `}
            ></div>
          );
        })} */}
        </div>
      </div>
    </>
  );
};

const container = document.getElementById('root');

const root = createRoot(container);

root.render(<App />);
