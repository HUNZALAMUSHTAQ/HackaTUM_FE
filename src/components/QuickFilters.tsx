import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Zap, Sparkles, Battery } from 'lucide-react'

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
    if (key.includes('RECOMMENDED')) return Star
    if (key.includes('EXCITING_DISCOUNTS')) return Zap
    if (key.includes('NEW_CAR')) return Sparkles
    if (key.includes('ELECTRIC')) return Battery
    return null
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">Quick Filters</h3>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const isActive = activeFilters.has(filter.key)
          const Icon = getFilterIcon(filter.key)
          return (
            <Button
              key={filter.key}
              variant={isActive ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => onFilterToggle(filter.key)}
            >
              {Icon && <Icon className="h-3 w-3 mr-1.5" />}
              {filter.title}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
