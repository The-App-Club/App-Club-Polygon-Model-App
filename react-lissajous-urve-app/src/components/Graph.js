import {css} from '@emotion/css';
import {Grid} from './Grid';
import {useState} from 'react';
import {Slider} from '@mui/material';
const Graph = ({color, progress}) => {
  const [debugProgress, setDebugProgress] = useState(0);

  const handleChange = (e) => {
    setDebugProgress(e.target.value);
  };

  return (
    <>
      <div
        className={css`
          max-width: 300px;
          padding: 1rem;
        `}
      >
        <Slider
          defaultValue={0}
          value={debugProgress}
          aria-label="Default"
          valueLabelDisplay="auto"
          onChange={handleChange}
        />
      </div>
      <div
        className={css`
          display: grid;
          place-items: center;
          min-height: 100vh;
        `}
      >
        <Grid
          color={color}
          count={1000}
          progress={progress}
          debugProgress={debugProgress}
        />
      </div>
    </>
  );
};

export {Graph};
