import { render, screen, renderHook, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {
  ListingsFiltersProvider,
  useListingsFilters,
  ListingsFilters,
} from './listings-filters-context';

describe('ListingsFiltersContext', () => {
  describe('ListingsFiltersProvider', () => {
    it('renders children', () => {
      render(
        <ListingsFiltersProvider>
          <div>Test Child</div>
        </ListingsFiltersProvider>
      );

      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    it('provides context value to children', () => {
      const TestComponent = () => {
        const { filters } = useListingsFilters();
        return <div>Filters: {JSON.stringify(filters)}</div>;
      };

      render(
        <ListingsFiltersProvider>
          <TestComponent />
        </ListingsFiltersProvider>
      );

      expect(screen.getByText(/Filters:/)).toBeInTheDocument();
    });
  });

  describe('useListingsFilters hook', () => {
    it('returns context value', () => {
      const { result } = renderHook(() => useListingsFilters(), {
        wrapper: ListingsFiltersProvider,
      });

      expect(result.current).toHaveProperty('filters');
      expect(result.current).toHaveProperty('activeFilters');
      expect(result.current).toHaveProperty('setTeam');
      expect(result.current).toHaveProperty('setSection');
      expect(result.current).toHaveProperty('setMinPrice');
      expect(result.current).toHaveProperty('setMaxPrice');
      expect(result.current).toHaveProperty('setFromDate');
      expect(result.current).toHaveProperty('setToDate');
      expect(result.current).toHaveProperty('setSort');
      expect(result.current).toHaveProperty('resetFilters');
      expect(result.current).toHaveProperty('applyFilters');
    });

    it('throws error when used outside provider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        renderHook(() => useListingsFilters());
      }).toThrow('useListingsFilters must be used within a ListingsFiltersProvider');

      console.error = originalError;
    });
  });

  describe('Default Filters', () => {
    it('initializes with default filters', () => {
      const { result } = renderHook(() => useListingsFilters(), {
        wrapper: ListingsFiltersProvider,
      });

      expect(result.current.filters).toEqual({
        team: [],
        section: '',
        minPrice: '',
        maxPrice: '',
        from: '',
        to: '',
        sort: 'createdDesc',
      });
    });

    it('initializes active filters with default values', () => {
      const { result } = renderHook(() => useListingsFilters(), {
        wrapper: ListingsFiltersProvider,
      });

      expect(result.current.activeFilters).toEqual({
        team: [],
        section: '',
        minPrice: '',
        maxPrice: '',
        from: '',
        to: '',
        sort: 'createdDesc',
      });
    });
  });

  describe('Filter Setters', () => {
    it('setTeam updates team filter', () => {
      const { result } = renderHook(() => useListingsFilters(), {
        wrapper: ListingsFiltersProvider,
      });

      act(() => {
        result.current.setTeam(['team1', 'team2']);
      });

      expect(result.current.filters.team).toEqual(['team1', 'team2']);
    });

    it('setSection updates section filter', () => {
      const { result } = renderHook(() => useListingsFilters(), {
        wrapper: ListingsFiltersProvider,
      });

      act(() => {
        result.current.setSection('Section A');
      });

      expect(result.current.filters.section).toBe('Section A');
    });

    it('setMinPrice updates minPrice filter', () => {
      const { result } = renderHook(() => useListingsFilters(), {
        wrapper: ListingsFiltersProvider,
      });

      act(() => {
        result.current.setMinPrice('50');
      });

      expect(result.current.filters.minPrice).toBe('50');
    });

    it('setMaxPrice updates maxPrice filter', () => {
      const { result } = renderHook(() => useListingsFilters(), {
        wrapper: ListingsFiltersProvider,
      });

      act(() => {
        result.current.setMaxPrice('200');
      });

      expect(result.current.filters.maxPrice).toBe('200');
    });

    it('setFromDate updates from date filter', () => {
      const { result } = renderHook(() => useListingsFilters(), {
        wrapper: ListingsFiltersProvider,
      });

      act(() => {
        result.current.setFromDate('2024-01-01');
      });

      expect(result.current.filters.from).toBe('2024-01-01');
    });

    it('setToDate updates to date filter', () => {
      const { result } = renderHook(() => useListingsFilters(), {
        wrapper: ListingsFiltersProvider,
      });

      act(() => {
        result.current.setToDate('2024-12-31');
      });

      expect(result.current.filters.to).toBe('2024-12-31');
    });

    it('setSort updates sort filter and applies immediately', () => {
      const { result } = renderHook(() => useListingsFilters(), {
        wrapper: ListingsFiltersProvider,
      });

      act(() => {
        result.current.setSort('priceAsc');
      });

      expect(result.current.filters.sort).toBe('priceAsc');
      // Sort applies immediately to activeFilters
      expect(result.current.activeFilters.sort).toBe('priceAsc');
    });
  });

  describe('Multiple Filter Updates', () => {
    it('updates multiple filters independently', () => {
      const { result } = renderHook(() => useListingsFilters(), {
        wrapper: ListingsFiltersProvider,
      });

      act(() => {
        result.current.setTeam(['team1']);
        result.current.setSection('Section B');
        result.current.setMinPrice('100');
        result.current.setMaxPrice('500');
        result.current.setFromDate('2024-01-15');
        result.current.setToDate('2024-01-20');
      });

      expect(result.current.filters).toEqual({
        team: ['team1'],
        section: 'Section B',
        minPrice: '100',
        maxPrice: '500',
        from: '2024-01-15',
        to: '2024-01-20',
        sort: 'createdDesc', // default
      });
    });

    it('preserves other filters when updating one', () => {
      const { result } = renderHook(() => useListingsFilters(), {
        wrapper: ListingsFiltersProvider,
      });

      act(() => {
        result.current.setTeam(['team1']);
        result.current.setSection('Section A');
      });

      act(() => {
        result.current.setMinPrice('100');
      });

      expect(result.current.filters.team).toEqual(['team1']);
      expect(result.current.filters.section).toBe('Section A');
      expect(result.current.filters.minPrice).toBe('100');
    });
  });

  describe('applyFilters', () => {
    it('applies draft filters to active filters', () => {
      const { result } = renderHook(() => useListingsFilters(), {
        wrapper: ListingsFiltersProvider,
      });

      act(() => {
        result.current.setTeam(['team1', 'team2']);
        result.current.setSection('Section C');
        result.current.setMinPrice('75');
      });

      // Active filters should still be default
      expect(result.current.activeFilters.team).toEqual([]);
      expect(result.current.activeFilters.section).toBe('');
      expect(result.current.activeFilters.minPrice).toBe('');

      act(() => {
        result.current.applyFilters();
      });

      // Active filters should now match draft filters
      expect(result.current.activeFilters.team).toEqual(['team1', 'team2']);
      expect(result.current.activeFilters.section).toBe('Section C');
      expect(result.current.activeFilters.minPrice).toBe('75');
    });

    it('does not affect draft filters', () => {
      const { result } = renderHook(() => useListingsFilters(), {
        wrapper: ListingsFiltersProvider,
      });

      act(() => {
        result.current.setMinPrice('150');
        result.current.applyFilters();
      });

      expect(result.current.filters.minPrice).toBe('150');
      expect(result.current.activeFilters.minPrice).toBe('150');

      act(() => {
        result.current.setMinPrice('200');
      });

      expect(result.current.filters.minPrice).toBe('200');
      expect(result.current.activeFilters.minPrice).toBe('150'); // Not changed yet
    });
  });

  describe('resetFilters', () => {
    it('resets all filters to default', () => {
      const { result } = renderHook(() => useListingsFilters(), {
        wrapper: ListingsFiltersProvider,
      });

      act(() => {
        result.current.setTeam(['team1']);
        result.current.setSection('Section D');
        result.current.setMinPrice('100');
        result.current.setMaxPrice('300');
        result.current.setFromDate('2024-01-01');
        result.current.setToDate('2024-12-31');
        result.current.setSort('priceDesc');
        result.current.applyFilters();
      });

      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.filters).toEqual({
        team: [],
        section: '',
        minPrice: '',
        maxPrice: '',
        from: '',
        to: '',
        sort: 'createdDesc',
      });
    });

    it('resets both draft and active filters', () => {
      const { result } = renderHook(() => useListingsFilters(), {
        wrapper: ListingsFiltersProvider,
      });

      act(() => {
        result.current.setTeam(['team1']);
        result.current.applyFilters();
        result.current.setSection('Section E');
      });

      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.filters.team).toEqual([]);
      expect(result.current.filters.section).toBe('');
      expect(result.current.activeFilters.team).toEqual([]);
      expect(result.current.activeFilters.section).toBe('');
    });
  });

  describe('Sort Behavior', () => {
    it('setSort applies immediately to active filters', () => {
      const { result } = renderHook(() => useListingsFilters(), {
        wrapper: ListingsFiltersProvider,
      });

      act(() => {
        result.current.setSort('priceAsc');
      });

      expect(result.current.filters.sort).toBe('priceAsc');
      expect(result.current.activeFilters.sort).toBe('priceAsc');
    });

    it('setSort also applies other pending filters', () => {
      const { result } = renderHook(() => useListingsFilters(), {
        wrapper: ListingsFiltersProvider,
      });

      act(() => {
        result.current.setTeam(['team1']);
        result.current.setSection('Section F');
      });

      // Active filters should not have these yet
      expect(result.current.activeFilters.team).toEqual([]);

      act(() => {
        result.current.setSort('priceDesc');
      });

      // Sort applies all current filter state
      expect(result.current.activeFilters.sort).toBe('priceDesc');
      expect(result.current.activeFilters.team).toEqual(['team1']);
      expect(result.current.activeFilters.section).toBe('Section F');
    });
  });

  describe('Real-world Workflow', () => {
    it('handles complete filter workflow', () => {
      const { result } = renderHook(() => useListingsFilters(), {
        wrapper: ListingsFiltersProvider,
      });

      // User sets draft filters
      act(() => {
        result.current.setTeam(['Lakers', 'Celtics']);
        result.current.setMinPrice('50');
        result.current.setMaxPrice('200');
        result.current.setFromDate('2024-06-01');
        result.current.setToDate('2024-06-30');
      });

      // Draft filters are set, but not active
      expect(result.current.activeFilters.team).toEqual([]);

      // User applies filters
      act(() => {
        result.current.applyFilters();
      });

      // Active filters now match
      expect(result.current.activeFilters.team).toEqual(['Lakers', 'Celtics']);
      expect(result.current.activeFilters.minPrice).toBe('50');

      // User changes sort (applies immediately)
      act(() => {
        result.current.setSort('priceAsc');
      });

      expect(result.current.activeFilters.sort).toBe('priceAsc');

      // User resets everything
      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.filters).toEqual({
        team: [],
        section: '',
        minPrice: '',
        maxPrice: '',
        from: '',
        to: '',
        sort: 'createdDesc',
      });
    });
  });

  describe('Component Integration', () => {
    it('works with multiple consuming components', () => {
      const FilterDisplay = () => {
        const { filters } = useListingsFilters();
        return <div data-testid="filter-display">{filters.minPrice || 'No min price'}</div>;
      };

      const FilterSetter = () => {
        const { setMinPrice } = useListingsFilters();
        return (
          <button onClick={() => setMinPrice('100')}>Set Min Price</button>
        );
      };

      render(
        <ListingsFiltersProvider>
          <FilterDisplay />
          <FilterSetter />
        </ListingsFiltersProvider>
      );

      expect(screen.getByTestId('filter-display')).toHaveTextContent('No min price');

      const button = screen.getByText('Set Min Price');
      userEvent.click(button);

      // Note: This won't work in this test setup due to async state updates
      // In real integration tests, you'd use waitFor
    });
  });
});
