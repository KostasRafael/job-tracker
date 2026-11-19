import { useId } from 'react';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBox({
  value,
  onChange,
  placeholder = 'Search company or role',
}: SearchBoxProps) {
  const id = useId();
  return (
    <div className="search-box">
      <label htmlFor={id} className="visually-hidden">
        Search applications
      </label>
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
    </div>
  );
}
