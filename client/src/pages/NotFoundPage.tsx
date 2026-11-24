import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';

// Shown for any URL that matches no other route (the path="*" route in App).
export default function NotFoundPage() {
  usePageTitle('Page not found');

  return (
    <div className="auth-page">
      <h1>Page not found</h1>
      <p>The page you were looking for does not exist or has moved.</p>
      <p className="auth-switch">
        <Link to="/">Back to the board</Link>
      </p>
    </div>
  );
}
