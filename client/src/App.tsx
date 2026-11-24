import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import './App.css';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BoardPage from './pages/BoardPage';
import ListPage from './pages/ListPage';
import StatsPage from './pages/StatsPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  // If a component throws while rendering, show this instead of a blank page.
  return (
    <ErrorBoundary
      fallback={
        <p className="auth-page" role="alert">
          Something went wrong. Please reload the page.
        </p>
      }
    >
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<BoardPage />} />
            <Route path="/list" element={<ListPage />} />
            <Route path="/stats" element={<StatsPage />} />
          </Route>
        </Route>
        {/* last: any URL no route above matched */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
