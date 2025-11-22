import './QuickFilters.css'

interface QuickFilter {
  key: string
  title: string
  selectType: string
}

interface QuickFiltersProps {
  filters: QuickFilter[]
  activeFilters: Set<string>
  onFilterToggle: (filterKey: string) => void
}

export default function QuickFilters({ filters, activeFilters, onFilterToggle }: QuickFiltersProps) {
  const getFilterIcon = (key: string) => {
    if (key.includes('RECOMMENDED')) return '⭐'
    if (key.includes('EXCITING_DISCOUNTS')) return '⚡'
    if (key.includes('NEW_CAR')) return '🆕'
    if (key.includes('ELECTRIC')) return '🔋'
    return ''
  }

  return (
    <div className="quick-filters">
      <h3 className="filters-title">Quick Filters</h3>
      <div className="filters-container">
        {filters.map((filter) => {
          const isActive = activeFilters.has(filter.key)
          return (
            <button
              key={filter.key}
              className={`filter-button ${isActive ? 'active' : ''}`}
              onClick={() => onFilterToggle(filter.key)}
            >
              <span className="filter-icon">{getFilterIcon(filter.key)}</span>
              <span>{filter.title}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

