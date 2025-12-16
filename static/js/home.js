// Store the filters panel open state in localStorage
// Used in: home.html
function setFiltersPanelOpen(open) {
  try { localStorage.setItem('filtersPanelOpen', open ? '1' : '0'); } catch (e) {}
}

// Save current filter state to localStorage
// Used in: home.html
function saveFilterState(formData) {
  try {
    let filterParams = {};
    
    if (formData) {
      // If form data is provided, use it directly
      filterParams = {
        q: formData.get('q') || '',
        grad_year: formData.get('grad_year') || '',
        hometown: formData.get('hometown') || '',
        homestate: formData.get('homestate') || '',
        dorm: formData.get('dorm') || '',
        major: formData.get('major') || '',
        minor: formData.get('minor') || '',
        course: formData.get('course') || '',
        professor: formData.get('professor') || '',
        club: formData.get('club') || '',
        company: formData.get('company') || '',
        role: formData.get('role') || '',
        per_page: formData.get('per_page') || '12'
      };
    } else {
      // Otherwise, read from current URL
      const url = new URL(window.location.href);
      filterParams = {
        q: url.searchParams.get('q') || '',
        grad_year: url.searchParams.get('grad_year') || '',
        hometown: url.searchParams.get('hometown') || '',
        homestate: url.searchParams.get('homestate') || '',
        dorm: url.searchParams.get('dorm') || '',
        major: url.searchParams.get('major') || '',
        minor: url.searchParams.get('minor') || '',
        course: url.searchParams.get('course') || '',
        professor: url.searchParams.get('professor') || '',
        club: url.searchParams.get('club') || '',
        company: url.searchParams.get('company') || '',
        role: url.searchParams.get('role') || '',
        per_page: url.searchParams.get('per_page') || '12'
      };
    }
    
    localStorage.setItem('homeFilters', JSON.stringify(filterParams));
  } catch (e) {
    console.error('Failed to save filter state:', e);
  }
}

// Restore filter state from localStorage and redirect if needed
// Used in: home.html
function restoreFilterState() {
  try {
    const url = new URL(window.location.href);
    const savedFilters = localStorage.getItem('homeFilters');
    
    if (!savedFilters) return;
    
    const filters = JSON.parse(savedFilters);
    let hasFilters = false;
    let needsRedirect = false;
    
    // Check if any filters are set in saved state
    for (const [key, value] of Object.entries(filters)) {
      if (key !== 'per_page' && value) {
        hasFilters = true;
        // Check if current URL doesn't have this filter
        if (!url.searchParams.has(key) || url.searchParams.get(key) !== value) {
          needsRedirect = true;
        }
      }
    }
    
    // If we have saved filters and they're not in the URL, restore them
    if (hasFilters && needsRedirect) {
      const newUrl = new URL(window.location.origin + window.location.pathname);
      
      // Add all saved filters to the new URL
      for (const [key, value] of Object.entries(filters)) {
        if (value) {
          newUrl.searchParams.set(key, value);
        }
      }
      
      // Always start at page 1 when restoring filters
      newUrl.searchParams.set('page', '1');
      
      window.location.href = newUrl.toString();
      return true;
    }
    
    return false;
  } catch (e) {
    console.error('Failed to restore filter state:', e);
    return false;
  }
}

// Clear saved filter state from localStorage
// Used in: home.html
function clearFilterState() {
  try {
    localStorage.removeItem('homeFilters');
  } catch (e) {
    console.error('Failed to clear filter state:', e);
  }
}

// Toggle the advanced filters panel visibility
// Used in: home.html
function toggleFilters() {
  const panel = document.getElementById('filters-panel');
  const willShow = !panel.classList.contains('show');
  panel.classList.toggle('show', willShow);
  setFiltersPanelOpen(willShow);
}

// Clear the search query and reset to page 1
// Used in: home.html
function clearSearch(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  const url = new URL(window.location.href);
  url.searchParams.delete('q');
  url.searchParams.set('page', '1');
  try {
    const saved = localStorage.getItem('homeFilters');
    if (saved) {
      const filters = JSON.parse(saved);
      filters.q = '';
      localStorage.setItem('homeFilters', JSON.stringify(filters));
    }
  } catch (e) {
    console.error('Failed to clear saved search state:', e);
  }
  window.location.href = url.toString();
  return false;
}

// Clear a specific filter and reset to page 1
// Used in: home.html
function clearFilter(filterName) {
  // keep panel open after reload
  setFiltersPanelOpen(true);
  const url = new URL(window.location.href);
  url.searchParams.delete(filterName);
  url.searchParams.set('page', '1');
  saveFilterState();
  window.location.href = url.toString();
}

// Update the number of results per page and reset to page 1
// Used in: home.html
function updatePerPage(value) {
  const url = new URL(window.location.href);
  url.searchParams.set('per_page', value);
  url.searchParams.set('page', '1');
  saveFilterState();
  window.location.href = url.toString();
}

// Ensure filters panel respects persisted open state across page reloads
// Used in: home.html
document.addEventListener('DOMContentLoaded', function() {
  // Restore filter state on page load (only on home page)
  const panel = document.getElementById('filters-panel');
  if (panel) {
    // Try to restore filter state first
    const redirected = restoreFilterState();
    if (redirected) {
      // If we redirected, don't continue with the rest of the initialization
      return;
    }
    
    // Save current filter state
    saveFilterState();
    
    const ssrOpen = panel.classList.contains('show');
    let openFlag = null;
    try { openFlag = localStorage.getItem('filtersPanelOpen'); } catch (e) {}
    if (openFlag === '1' || ssrOpen) {
      panel.classList.add('show');
    } else {
      panel.classList.remove('show');
    }

    const clearAll = document.getElementById('clear-all-filters');
    if (clearAll) {
      clearAll.addEventListener('click', function() { 
        clearFilterState();
        setFiltersPanelOpen(false); 
      });
    }
    
    // Save filter state when search form is submitted
    const searchForm = document.querySelector('.home-search-input-wrapper');
    if (searchForm) {
      searchForm.addEventListener('submit', function(e) {
        const formData = new FormData(searchForm);
        // Also get per_page from URL if it exists
        const url = new URL(window.location.href);
        const perPage = url.searchParams.get('per_page');
        if (perPage) {
          formData.set('per_page', perPage);
        }
        saveFilterState(formData);
      });
    }
    
    // Save filter state when filter form is submitted
    const filterForm = panel.querySelector('form');
    if (filterForm) {
      filterForm.addEventListener('submit', function(e) {
        const formData = new FormData(filterForm);
        // Also preserve search query and per_page from URL if they exist
        const url = new URL(window.location.href);
        const searchQuery = url.searchParams.get('q');
        const perPage = url.searchParams.get('per_page');
        if (searchQuery) {
          formData.set('q', searchQuery);
        }
        if (perPage) {
          formData.set('per_page', perPage);
        }
        saveFilterState(formData);
      });
    }
  }
});

// used in home.html
// getting updated slider values for similarity algorithm
const SIMILARITY_WEIGHT_KEYS = new Set(["academics", "professional", "background"]);

// showing algorithm spinner overlay (in spinner.js)
function showAlgorithmSpinner() {
  if (window.showAlgorithmSpinner) { window.showAlgorithmSpinner(); return; }
  const overlay = document.getElementById("algorithm-spinner");
  if (overlay) overlay.style.display = "flex";
}

async function applySimilarityPreferences() {
  // show spinner
  showAlgorithmSpinner();

  // Collect slider inputs by data-key from the algorithm page
  const inputs = document.querySelectorAll(
    ".home-similarity-sliders input[type='range'][data-key]"
  );

  const weights = {};
  inputs.forEach((inp) => {
    const key = inp.dataset.key;
    if (key && SIMILARITY_WEIGHT_KEYS.has(key)) {
      weights[key] = Number(inp.value);
    }
  });

  // Only proceed if we found at least one weight
  if (Object.keys(weights).length === 0) {
    return;
  }

  try {
    // Save the preferences and wait for the response
    const response = await fetch("/api/similarity-preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(weights),
    });
    
    if (!response.ok) {
      console.error("Failed to save similarity preferences");
      return;
    }
    
    // Re-run algorithm AFTER saving by reloading the algorithm page
    // This ensures the algorithm uses the newly saved weights
    window.location.href = "/algorithm?page=1";
  } catch (e) {
    console.error("Error saving similarity preferences:", e);
    // Hide spinner on error
    const overlay = document.getElementById("algorithm-spinner");
    if (overlay) overlay.style.display = "none";
  }
}

// Sliders no longer trigger algorithm automatically - only the button does
// Removed automatic slider change listener

// Initialize slider positions from saved preferences on page load
document.addEventListener("DOMContentLoaded", async function () {
  const inputs = document.querySelectorAll(
    ".home-similarity-sliders input[type='range'][data-key]"
  );
  if (!inputs.length) return;

  try {
    const res = await fetch("/api/similarity-preferences", { method: "GET" });
    if (!res.ok) return;
    const weights = await res.json();
    inputs.forEach((inp) => {
      const key = inp.dataset.key;
      if (key && SIMILARITY_WEIGHT_KEYS.has(key) && weights && typeof weights[key] !== "undefined") {
        inp.value = weights[key];
      }
    });
  } catch (e) {
    // If fetch fails, leave defaults; user can adjust sliders
  }
});



