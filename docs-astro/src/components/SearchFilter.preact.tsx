/**
 * SearchFilter Component
 * Client-side search and category filtering for machines
 */

import { useState, useMemo } from 'preact/hooks';

interface Machine {
  id: string;
  name: string;
  category: string;
  description: string;
  states: string[];
  events: string[];
}

interface Props {
  machines: Machine[];
  categories: string[];
}

export default function SearchFilter({ machines, categories }: Props) {
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());

  // Filter machines based on search and categories
  const filtered = useMemo(() => {
    return machines.filter(machine => {
      // Search filter
      const matchesSearch =
        search === '' ||
        machine.name.toLowerCase().includes(search.toLowerCase()) ||
        machine.id.toLowerCase().includes(search.toLowerCase()) ||
        machine.description.toLowerCase().includes(search.toLowerCase());

      // Category filter
      const matchesCategory =
        selectedCategories.size === 0 ||
        selectedCategories.has(machine.category);

      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategories, machines]);

  // Toggle category filter
  const toggleCategory = (category: string) => {
    const next = new Set(selectedCategories);
    if (next.has(category)) {
      next.delete(category);
    } else {
      next.add(category);
    }
    setSelectedCategories(next);
  };

  return (
    <div className="search-filter">
      <div className="search-box">
        <input
          type="search"
          placeholder="Search machines by name, ID, or description..."
          value={search}
          onInput={(e) => setSearch(e.currentTarget.value)}
          className="search-input"
        />
        <p className="search-results">
          Showing {filtered.length} of {machines.length} machines
        </p>
      </div>

      <div className="category-filters">
        <button
          className={`filter-btn ${selectedCategories.size === 0 ? 'active' : ''}`}
          onClick={() => setSelectedCategories(new Set())}
        >
          All Categories
        </button>
        {categories.map(category => (
          <button
            key={category}
            className={`filter-btn ${selectedCategories.has(category) ? 'active' : ''}`}
            onClick={() => toggleCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="machines-grid">
        {filtered.length === 0 ? (
          <div className="no-results">
            <p>No machines found matching your criteria</p>
            <button onClick={() => { setSearch(''); setSelectedCategories(new Set()); }}>
              Clear filters
            </button>
          </div>
        ) : (
          filtered.map(machine => (
            <a key={machine.id} href={`/machine/${machine.id}`} className="machine-card">
              <div className="machine-card-header">
                <h3>{machine.name}</h3>
                <span className="category-tag">{machine.category}</span>
              </div>
              <p className="machine-description">
                {machine.description || 'No description available'}
              </p>
              <div className="machine-stats">
                <span>{machine.states.length} states</span>
                <span>{machine.events.length} events</span>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
