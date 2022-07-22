import {css} from '@emotion/css';
import {useEffect, useMemo, useRef} from 'react';
import anime from 'animejs/lib/anime.es.js';
import item1 from '../assets/Food-and-Drinks-03.png';
import item2 from '../assets/Food-and-Drinks-04.png';
import item3 from '../assets/Food-and-Drinks-12.png';
import {useState} from 'react';

import unit from 'parse-unit';

const Loading = ({tik}) => {
  const image1DomRef = useRef(null);
  const image2DomRef = useRef(null);
  const image3DomRef = useRef(null);
  const [clipPath1, setClipPath1] = useState(`50% 10%`);
  const [clipPath2, setClipPath2] = useState(`5% 90%`);
  const [clipPath3, setClipPath3] = useState(`95% 90%`);

  const gutter = 0;

  const tl1 = useMemo(() => {
    return anime.timeline({
      easing: 'linear',
      loop: true,
      update: function (e) {
        const value = window.getComputedStyle(
          image1DomRef.current
        ).backgroundPosition;
        const gram = value
          .split(/ /)
          .map((item) => {
            return unit(item)[0];
          })
          .flat();
        setClipPath1(`${gram[0] - gutter}% ${gram[1] - gutter}%`);
      },
      complete: function (e) {
        setClipPath1(``);
      },
    });
  }, []);
  const tl2 = useMemo(() => {
    return anime.timeline({
      easing: 'linear',
      loop: true,
      update: function (e) {
        const value = window.getComputedStyle(
          image2DomRef.current
        ).backgroundPosition;
        const gram = value
          .split(/ /)
          .map((item) => {
            return unit(item)[0];
          })
          .flat();
        setClipPath2(`${gram[0] - gutter}% ${gram[1] - gutter}%`);
      },
      complete: function (e) {
        setClipPath2(``);
      },
    });
  }, []);
  const tl3 = useMemo(() => {
    return anime.timeline({
      easing: 'linear',
      loop: true,
      update: function (e) {
        const value = window.getComputedStyle(
          image3DomRef.current
        ).backgroundPosition;
        const gram = value
          .split(/ /)
          .map((item) => {
            return unit(item)[0];
          })
          .flat();
        setClipPath3(`${gram[0] - gutter}% ${gram[1] - gutter}%`);
      },
      complete: function (e) {
        setClipPath3(``);
      },
    });
  }, []);

  useEffect(() => {
    tl1
      .add({
        targets: image1DomRef.current,
        keyframes: [
          {backgroundPosition: `50% 10%`},
          {backgroundPosition: `5% 90%`},
        ],
        duration: 1200,
      })
      .add({
        targets: image1DomRef.current,
        keyframes: [
          {backgroundPosition: `5% 90%`},
          {backgroundPosition: `95% 90%`},
        ],
        duration: 1200,
      })
      .add({
        targets: image1DomRef.current,
        keyframes: [
          {backgroundPosition: `95% 90%`},
          {backgroundPosition: `50% 10%`},
        ],
        duration: 1200,
      });
    tl2
      .add({
        targets: image2DomRef.current,
        keyframes: [
          {backgroundPosition: `5% 90%`},
          {backgroundPosition: `95% 90%`},
        ],
        duration: 1200,
      })
      .add({
        targets: image2DomRef.current,
        keyframes: [
          {backgroundPosition: `95% 90%`},
          {backgroundPosition: `50% 10%`},
        ],
        duration: 1200,
      })
      .add({
        targets: image2DomRef.current,
        keyframes: [
          {backgroundPosition: `50% 10%`},
          {backgroundPosition: `5% 90%`},
        ],
        duration: 1200,
      });
    tl3
      .add({
        targets: image3DomRef.current,
        keyframes: [
          {backgroundPosition: `95% 90%`},
          {backgroundPosition: `50% 10%`},
        ],
        duration: 1200,
      })
      .add({
        targets: image3DomRef.current,
        keyframes: [
          {backgroundPosition: `50% 10%`},
          {backgroundPosition: `5% 90%`},
        ],
        duration: 1200,
      })
      .add({
        targets: image3DomRef.current,
        keyframes: [
          {backgroundPosition: `5% 90%`},
          {backgroundPosition: `95% 90%`},
        ],
        duration: 1200,
      });
  }, []);

  return (
    <div
      className={css`
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
      `}
    >
      <div
        className={css`
          position: relative;
          height: 100%;
          max-width: 22rem;
          min-height: 22rem;
          @media (max-width: 768px) {
            max-width: 18rem;
            min-height: 18rem;
          }
          width: 100%;
          > div {
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            width: 100%;
            background-size: auto 80px;
            @media (max-width: 1400px) {
              background-size: auto 70px;
            }
            @media (max-width: 768px) {
              background-size: auto 60px;
            }
            background-repeat: no-repeat;
          }
        `}
      >
        <div
          className={css`
            transform: scale(0.9);
            height: 100%;
            width: 100%;
            background: rgb(255, 220, 196);
            clip-path: polygon(${clipPath1}, ${clipPath2}, ${clipPath3});
          `}
        />
        <p
          className={css`
            font-size: 1.5rem;
            @media (max-width: 768px) {
              font-size: 1.2rem;
            }
            font-weight: bold;
            display: flex;
            justify-content: center;
            align-items: center;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, calc(-50% + 1.25rem));
          `}
        >
          Loading...
        </p>
        <div
          ref={image1DomRef}
          className={css`
            background-image: url(${item1});
            background-position: 50% 10%;
          `}
        />
        <div
          ref={image2DomRef}
          className={css`
            background-image: url(${item2});
            background-position: 5% 90%;
          `}
        />
        <div
          ref={image3DomRef}
          className={css`
            background-image: url(${item3});
            background-position: 95% 90%;
          `}
        />
      </div>
    </div>
  );
};

export {Loading};
