import { Search } from 'lucide-react';

export default function SearchInput({ value, onChange, label = 'Buscar', placeholder }) {
  return (
    <label className="search">
      <span className="sr-only">{label}</span>
      <Search size={18} aria-hidden="true" />
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder ?? label} />
    </label>
  );
}
