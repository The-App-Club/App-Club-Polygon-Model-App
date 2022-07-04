import {createRoot} from 'react-dom/client';
import * as d3 from 'd3';
import {Scene} from './components/Scene';
import './styles/index.scss';

const App = () => {
  return (
    <>
      <Scene
        color={d3.interpolateSinebow}
        pcSectionHeight={`500%`}
        spSectionHeight={`1000%`}
      />
      <Scene
        color={d3.interpolateRainbow}
        pcSectionHeight={`500%`}
        spSectionHeight={`1000%`}
      />
    </>
  );
};

const container = document.getElementById('root');

const root = createRoot(container);

root.render(<App />);
