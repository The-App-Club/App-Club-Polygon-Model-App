import {createRoot} from 'react-dom/client';
import {css} from '@emotion/css';

import {Loading} from './components/Loading';

import '@fontsource/inter';
import './styles/index.scss';

const App = () => {
  return <Loading />;
};

const container = document.getElementById('root');

const root = createRoot(container);

root.render(<App />);
