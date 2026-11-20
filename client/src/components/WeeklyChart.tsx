import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Stats } from '../types';

const DAY_MS = 24 * 60 * 60 * 1000;

// weekStart is a plain date ("2026-11-02"), which JavaScript reads as midnight
// UTC. Format it in UTC too, or anyone west of London would see "1 Nov".
function formatWeek(weekStart: string) {
  return new Date(weekStart).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
}

// MongoDB only returns weeks that have applications. Put the quiet weeks back
// in as 0, so a three-week gap looks like a gap instead of disappearing.
function fillWeeks(perWeek: Stats['perWeek']) {
  if (perWeek.length === 0) return [];
  const counts = new Map(perWeek.map((w) => [w.weekStart, w.count]));
  const first = new Date(perWeek[0].weekStart).getTime();
  const last = new Date(perWeek[perWeek.length - 1].weekStart).getTime();

  const weeks = [];
  for (let time = first; time <= last; time += 7 * DAY_MS) {
    const weekStart = new Date(time).toISOString().slice(0, 10);
    weeks.push({
      weekStart,
      label: formatWeek(weekStart),
      count: counts.get(weekStart) ?? 0,
    });
  }
  return weeks;
}

export default function WeeklyChart({ perWeek }: { perWeek: Stats['perWeek'] }) {
  if (perWeek.length === 0) {
    return (
      <div className="state-box">
        <p>No applications with an applied date yet. Set one to see your weekly activity.</p>
      </div>
    );
  }

  const weeks = fillWeeks(perWeek);
  // the first week with the highest count
  const busiest = weeks.reduce((best, week) => (week.count > best.count ? week : best));

  return (
    <>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={weeks} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="label"
            tick={{ fill: 'var(--text)', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: 'var(--border)' }}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: 'var(--text)', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: 'var(--accent-bg)' }}
            labelFormatter={(label) => `Week of ${label}`}
            contentStyle={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              color: 'var(--text-h)',
            }}
          />
          <Bar
            dataKey="count"
            name="Applications"
            fill="var(--accent)"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
      {/* the chart is a picture to a screen reader, so say the main point in words */}
      <p className="chart-summary">
        You sent {busiest.count} {busiest.count === 1 ? 'application' : 'applications'} in the
        busiest week (week of {busiest.label}).
      </p>
    </>
  );
}
