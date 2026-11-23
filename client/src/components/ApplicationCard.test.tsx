import { render, screen } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import ApplicationCard from './ApplicationCard';
import type { Application } from '../types';

const sample: Application = {
  _id: 'app-1',
  company: 'Acme Corp',
  role: 'Frontend Developer',
  status: 'applied',
  salary: 65000,
  appliedAt: '2026-11-05T00:00:00.000Z',
  position: 0,
  createdAt: '2026-11-05T00:00:00.000Z',
};

// The card uses useSortable, so give it the same drag-and-drop context the board does.
function renderCard(application: Application) {
  render(
    <DndContext>
      <SortableContext items={[application._id]}>
        <ApplicationCard application={application} onEdit={vi.fn()} />
      </SortableContext>
    </DndContext>
  );
}

it('shows the company and role', () => {
  renderCard(sample);

  expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
});

it('shows the salary when there is one', () => {
  renderCard(sample);

  expect(screen.getByText('Salary')).toBeInTheDocument();
  expect(screen.getByText((65000).toLocaleString())).toBeInTheDocument();
});

it('shows no salary text when the application has no salary', () => {
  renderCard({ ...sample, salary: undefined });

  expect(screen.queryByText('Salary')).not.toBeInTheDocument();
  expect(screen.queryByText((65000).toLocaleString())).not.toBeInTheDocument();
});
