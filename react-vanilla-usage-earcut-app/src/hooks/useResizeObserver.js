import ResizeObserver from 'resize-observer-polyfill';
import {useEffect, useState} from 'react';
const useResizeObserver = ({ref}) => {
  const [dimensions, setDimensions] = useState(null);
  useEffect(() => {
    const observeTarget = ref.current;
    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        setDimensions(JSON.parse(JSON.stringify(entry.contentRect)));
      });
    });
    const boxInfo = ref.current.getBoundingClientRect();
    if (boxInfo) {
      setDimensions(JSON.parse(JSON.stringify(boxInfo)));
    }
    resizeObserver.observe(observeTarget);
    return () => {
      resizeObserver.unobserve(observeTarget);
    };
  }, [ref]);
  return dimensions;
};

export {useResizeObserver};
