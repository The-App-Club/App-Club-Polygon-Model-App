import {css} from '@emotion/css';

const Spacer = ({height = `1rem`}) => {
  return (
    <div
      className={css`
        width: 100%;
        height: ${height};
      `}
    />
  );
};

export {Spacer};
