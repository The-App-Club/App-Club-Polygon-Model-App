import {css} from '@emotion/css';

const Spacer = ({height = `1rem`}) => {
  return (
    <div
      className={css`
        height: ${height};
        width: 100%;
      `}
    ></div>
  );
};

export {Spacer};
