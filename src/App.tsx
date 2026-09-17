import { HashRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { QuestionBankProvider } from './questions/bank';
import { HomePage } from './pages/HomePage';
import { SessionPage } from './pages/SessionPage';
import { SummaryPage } from './pages/SummaryPage';
import { HistoryPage } from './pages/HistoryPage';
import { QuestionDetailPage } from './pages/QuestionDetailPage';
import { SettingsPage } from './pages/SettingsPage';
import { GeneratePage } from './pages/GeneratePage';

export function App() {
  return (
    <QuestionBankProvider>
      <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/session" element={<SessionPage />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/history/:questionId" element={<QuestionDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/generate" element={<GeneratePage />} />
        </Route>
      </Routes>
      </HashRouter>
    </QuestionBankProvider>
  );
}
