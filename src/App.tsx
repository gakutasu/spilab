import { HashRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { SessionPage } from './pages/SessionPage';
import { SummaryPage } from './pages/SummaryPage';
import { HistoryPage } from './pages/HistoryPage';
import { QuestionDetailPage } from './pages/QuestionDetailPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/session" element={<SessionPage />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/history/:questionId" element={<QuestionDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
