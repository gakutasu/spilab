import { HashRouter, Route, Routes } from 'react-router-dom';

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<h1>SPILAB</h1>} />
      </Routes>
    </HashRouter>
  );
}
