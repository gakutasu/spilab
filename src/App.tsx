import { HashRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { SessionPage } from './pages/SessionPage';
import { SummaryPage } from './pages/SummaryPage';

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/session" element={<SessionPage />} />
          <Route path="/summary" element={<SummaryPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
