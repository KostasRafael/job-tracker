import type { ReactNode } from 'react';
import WeeklyChart from '../components/WeeklyChart';
import { useStats } from '../hooks/useStats';
import type { Stats } from '../types';
import { usePageTitle } from '../hooks/usePageTitle';

const SUMMARY_CARDS: { label: string; value: (stats: Stats) => number }[] = [
  { label: 'Total', value: (s) => s.total },
  { label: 'Active', value: (s) => s.byStatus.applied + s.byStatus.interview },
  { label: 'Interviews', value: (s) => s.byStatus.interview },
  { label: 'Offers', value: (s) => s.byStatus.offer },
];

export default function StatsPage() {
  usePageTitle('Stats');
  const { data, loading, error, refetch } = useStats();

  let content: ReactNode;

  if (loading && !data) {
    content = (
      <>
        <p className="visually-hidden" role="status">
          Loading stats...
        </p>
        <div className="stat-cards" aria-hidden="true">
          {SUMMARY_CARDS.map((card) => (
            <div key={card.label} className="stat-card">
              <span className="skeleton stat-card-skeleton" />
              <span className="stat-card-label">{card.label}</span>
            </div>
          ))}
        </div>
      </>
    );
  } else if (error || !data) {
    content = (
      <div className="state-box state-error" role="alert">
        <p>Could not load your stats: {error}</p>
        <button type="button" className="state-button" onClick={() => void refetch()}>
          Try again
        </button>
      </div>
    );
  } else if (data.total === 0) {
    content = (
      <div className="state-box">
        <p>No applications yet. Add some on the Board or List page to see your stats.</p>
      </div>
    );
  } else {
    content = (
      <>
        <dl className="stat-cards">
          {SUMMARY_CARDS.map((card) => (
            <div key={card.label} className="stat-card">
              {/* dt before dd for screen readers; CSS puts the number on top */}
              <dt className="stat-card-label">{card.label}</dt>
              <dd className="stat-card-value">{card.value(data)}</dd>
            </div>
          ))}
        </dl>
        <section className="stats-section">
          <h2>Applications per week</h2>
          <WeeklyChart perWeek={data.perWeek} />
        </section>
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1>Stats</h1>
      </div>
      {content}
    </>
  );
}
