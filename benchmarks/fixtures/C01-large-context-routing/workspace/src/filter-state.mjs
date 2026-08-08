export function updateFilterState(state, query) {
  return {
    ...state,
    filter: { query: String(query ?? '').trim() },
  };
}

export function readFilter(state) {
  return state.filter ?? { query: '' };
}
