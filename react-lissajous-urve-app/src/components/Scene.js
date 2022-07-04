import {useState, useCallback} from 'react';
import * as d3 from 'd3';

import {ScrollTriggerProvider} from './ScrollTriggerProvider';
import {Graph} from './Graph';

const Scene = ({
  color = d3.interpolateBlues,
  pcSectionHeight = `100%`,
  spSectionHeight = `200%`,
}) => {
  const [progress, setProgress] = useState(0);

  const handleProgress = useCallback((e) => {
    setProgress(e);
  }, []);

  return (
    <>
      <ScrollTriggerProvider
        pcSectionHeight={pcSectionHeight}
        spSectionHeight={spSectionHeight}
        handleProgress={handleProgress}
      >
        <Graph color={color} progress={progress} />
      </ScrollTriggerProvider>
    </>
  );
};
export {Scene};
