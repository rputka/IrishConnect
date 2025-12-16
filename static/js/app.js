// Toggle the profile dropdown menu visibility
// Used in: home.html, profile.html, chat.html, edit.html
function toggleProfileDropdown() {
  const dropdown = document.getElementById('profile-dropdown');
  dropdown.classList.toggle('show');
}

// Close profile dropdown when clicking outside of it
// Used in: home.html, profile.html, chat.html, edit.html
function closeDropdownOnClickOutside(event) {
  const dropdown = document.getElementById('profile-dropdown');
  if (!dropdown) return;
  
  // Try different selectors for different pages
  const btn = document.querySelector('.home-profile-icon-btn') || 
              document.querySelector('.profile-header-icon-btn') || 
              document.querySelector('.chat-profile-icon-btn') ||
              document.querySelector('.edit-profile-icon-btn');
  
  if (btn && !dropdown.contains(event.target) && !btn.contains(event.target)) {
    dropdown.classList.remove('show');
  }
}

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

// Show the classes modal displaying current and past courses
// Used in: profile.html
function showClassesModal() {
  const modal = document.getElementById('classes-modal');
  if (modal) {
    modal.classList.remove('hidden');
  }
}

// Hide the classes modal
// Used in: profile.html
function hideClassesModal() {
  const modal = document.getElementById('classes-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

// Show the delete profile confirmation modal
// Used in: profile.html
function showDeleteModal() {
  const modal = document.getElementById('delete-modal');
  if (modal) {
    modal.classList.remove('hidden');
  }
}

// Hide the delete profile confirmation modal
// Used in: profile.html
function hideDeleteModal() {
  const modal = document.getElementById('delete-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

// Global click handler for closing dropdowns
// Used in: home.html, profile.html, chat.html, edit.html
window.onclick = function(event) {
  closeDropdownOnClickOutside(event);
};

// Add a new major input field to the registration form
// Used in: register.html, edit.html
function addMajor() {
  const container = document.getElementById('major-container');
  const isEditPage = container.closest('.edit-form') !== null;
  const prefix = isEditPage ? 'edit' : 'register';
  
  const div = document.createElement('div');
  div.className = `${prefix}-dynamic-item`;
  
  const input = document.createElement('input');
  input.type = 'text';
  input.name = 'major';
  input.placeholder = 'eg. Computer Science';
  input.maxLength = '60';
  input.className = `${prefix}-input ${prefix}-dynamic-item-input`;
  
  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.textContent = 'Remove';
  removeBtn.className = `${prefix}-remove-btn`;
  removeBtn.onclick = function() { div.remove(); };
  
  div.appendChild(input);
  div.appendChild(removeBtn);
  container.appendChild(div);
}

// Add a new minor input field to the registration form
// Used in: register.html, edit.html
function addMinor() {
  const container = document.getElementById('minor-container');
  const isEditPage = container.closest('.edit-form') !== null;
  const prefix = isEditPage ? 'edit' : 'register';
  
  const div = document.createElement('div');
  div.className = `${prefix}-dynamic-item`;
  
  const input = document.createElement('input');
  input.type = 'text';
  input.name = 'minor';
  input.placeholder = 'eg. Engineering Corporate Practice';
  input.maxLength = '60';
  input.className = `${prefix}-input ${prefix}-dynamic-item-input`;
  
  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.textContent = 'Remove';
  removeBtn.className = `${prefix}-remove-btn`;
  removeBtn.onclick = function() { div.remove(); };
  
  div.appendChild(input);
  div.appendChild(removeBtn);
  container.appendChild(div);
}

// Add a new course input group (name, CRN, professor) to the registration form
// Used in: register.html, edit.html
function addCourse() {
  const container = document.getElementById('course-container');
  const isEditPage = container.closest('.edit-form') !== null;
  const prefix = isEditPage ? 'edit' : 'register';
  
  const div = document.createElement('div');
  div.className = `${prefix}-dynamic-grid ${prefix}-dynamic-grid-7`;
  
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.name = 'course_name';
  nameInput.placeholder = 'eg. Introduction to Linear Algebra and Differential Equations';
  nameInput.maxLength = '50';
  nameInput.className = `${prefix}-input ${prefix}-dynamic-grid-item-3`;
  
  const crnInput = document.createElement('input');
  crnInput.type = 'text';
  crnInput.name = 'course_crn';
  crnInput.placeholder = 'eg. 11826';
  crnInput.maxLength = '5';
  crnInput.className = `${prefix}-input ${prefix}-dynamic-grid-item-1`;
  
  const profInput = document.createElement('input');
  profInput.type = 'text';
  profInput.name = 'course_prof';
  profInput.placeholder = 'eg. Tim Weninger';
  profInput.maxLength = '100';
  profInput.className = `${prefix}-input ${prefix}-dynamic-grid-item-2`;
  
  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.textContent = 'Remove';
  removeBtn.className = `${prefix}-remove-btn ${prefix}-dynamic-grid-item-1`;
  removeBtn.onclick = function() { div.remove(); };
  
  div.appendChild(nameInput);
  div.appendChild(crnInput);
  div.appendChild(profInput);
  div.appendChild(removeBtn);
  container.appendChild(div);
}

// Add a new internship input group (company, role) to the registration form
// Used in: register.html, edit.html
function addInternship() {
  const container = document.getElementById('internship-container');
  const isEditPage = container.closest('.edit-form') !== null;
  const prefix = isEditPage ? 'edit' : 'register';
  
  const div = document.createElement('div');
  div.className = `${prefix}-dynamic-grid ${prefix}-dynamic-grid-5`;
  
  const companyInput = document.createElement('input');
  companyInput.type = 'text';
  companyInput.name = 'internship_company';
  companyInput.placeholder = 'eg. Google';
  companyInput.maxLength = '50';
  companyInput.className = `${prefix}-input ${prefix}-dynamic-grid-item-2`;
  
  const roleInput = document.createElement('input');
  roleInput.type = 'text';
  roleInput.name = 'internship_role';
  roleInput.placeholder = 'eg. Software Engineer Intern';
  roleInput.maxLength = '60';
  roleInput.className = `${prefix}-input ${prefix}-dynamic-grid-item-2`;
  
  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.textContent = 'Remove';
  removeBtn.className = `${prefix}-remove-btn ${prefix}-dynamic-grid-item-1`;
  removeBtn.onclick = function() { div.remove(); };
  
  div.appendChild(companyInput);
  div.appendChild(roleInput);
  div.appendChild(removeBtn);
  container.appendChild(div);
}

// Clear course fields to start a new semester (keeps courses in database)
// Used in: edit.html
function startNewSemester() {
  const courseContainer = document.getElementById('course-container');
  const semesterInput = document.getElementById('course_semester');
  
  if (courseContainer) {
    // Clear all course input fields
    courseContainer.innerHTML = '';
    
    // Add one empty course row
    const div = document.createElement('div');
    div.className = 'edit-dynamic-grid edit-dynamic-grid-7';
    
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.name = 'course_name';
    nameInput.placeholder = 'eg. Introduction to Linear Algebra and Differential Equations';
    nameInput.maxLength = '50';
    nameInput.className = 'edit-input edit-dynamic-grid-item-3';
    
    const crnInput = document.createElement('input');
    crnInput.type = 'text';
    crnInput.name = 'course_crn';
    crnInput.placeholder = 'eg. 11826';
    crnInput.maxLength = '5';
    crnInput.className = 'edit-input edit-dynamic-grid-item-1';
    
    const profInput = document.createElement('input');
    profInput.type = 'text';
    profInput.name = 'course_prof';
    profInput.placeholder = 'eg. Tim Weninger';
    profInput.maxLength = '100';
    profInput.className = 'edit-input edit-dynamic-grid-item-2';
    
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = 'Remove';
    removeBtn.className = 'edit-remove-btn edit-dynamic-grid-item-1';
    removeBtn.onclick = function() { div.remove(); };
    
    div.appendChild(nameInput);
    div.appendChild(crnInput);
    div.appendChild(profInput);
    div.appendChild(removeBtn);
    
    courseContainer.appendChild(div);
  }
  
  // Clear semester input and focus on it
  if (semesterInput) {
    semesterInput.value = '';
    semesterInput.focus();
  }
}

// Add a new club input field to the registration form
// Used in: register.html, edit.html
function addClub() {
  const container = document.getElementById('club-container');
  const isEditPage = container.closest('.edit-form') !== null;
  const prefix = isEditPage ? 'edit' : 'register';
  
  const div = document.createElement('div');
  div.className = `${prefix}-dynamic-item`;
  
  const input = document.createElement('input');
  input.type = 'text';
  input.name = 'club';
  input.placeholder = 'eg. Student International Business Council';
  input.maxLength = '50';
  input.className = `${prefix}-input ${prefix}-dynamic-item-input`;
  
  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.textContent = 'Remove';
  removeBtn.className = `${prefix}-remove-btn`;
  removeBtn.onclick = function() { div.remove(); };
  
  div.appendChild(input);
  div.appendChild(removeBtn);
  container.appendChild(div);
}

// Handle file selection and update the file display UI
// Used in: register.html
function handleFileSelect(event) {
  const file = event.target.files[0];
  const fileName = document.getElementById('file-name');
  const fileInfo = document.getElementById('file-info');
  const fileNone = document.getElementById('file-none');
  
  if (file) {
    fileName.textContent = file.name;
    fileInfo.style.display = 'flex';
    fileNone.style.display = 'none';
  } else {
    fileInfo.style.display = 'none';
    fileNone.style.display = 'block';
  }
}

// Remove the selected file and reset the file input
// Used in: register.html
function removeFile() {
  const fileInput = document.getElementById('file-upload');
  const fileName = document.getElementById('file-name');
  const fileInfo = document.getElementById('file-info');
  const fileNone = document.getElementById('file-none');
  
  fileInput.value = '';
  fileInfo.style.display = 'none';
  fileNone.style.display = 'block';
}

// Toggle password visibility between text and password types
// Used in: register.html, edit.html
function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(inputId + '-eye-icon');
  
  if (input.type === 'password') {
    input.type = 'text';
    // Eye with slash icon (hidden)
    icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
  } else {
    input.type = 'password';
    // Regular eye icon (visible)
    icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
  }
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
  
  // Close modals on ESC key press
  // Used in: profile.html
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      hideClassesModal();
      hideDeleteModal();
    }
  });
  
  // Initialize file upload handler on page load
  // Used in: register.html
  const fileInput = document.getElementById('file-upload');
  if (fileInput) {
    fileInput.addEventListener('change', handleFileSelect);
  }
});

// used in home.html
// getting updated slider values for similarity algorithm
const SIMILARITY_WEIGHT_KEYS = new Set(["academics", "professional", "background"]);

// showing algorithm spinner overlay (in spinner.js)
function showAlgorithmSpinner() {
  if (window.showAlgorithmSpinner) { window.showAlgorithmSpinner(); return; }
  const overlay = document.getElementbyId("algorithm-spinner");
  if (overlay) overlay.style.display = "flex";
}

// Make function globally accessible for onclick handler
window.applySimilarityPreferences = async function applySimilarityPreferences() {
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
    await fetch("/api/similarity-preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(weights),
    });
  } catch (e) {
    // swallow network errors to avoid breaking UX; user can retry
  }

  // Re-run algorithm AFTER saving by reloading the algorithm page
  if (window.location.pathname !== "/algorithm") {
    window.location.href = "/algorithm";
  } else {
    window.location.reload();
  }
};

// Sliders no longer trigger algorithm automatically - only the button does

// Initialize slider positions from saved preferences on page load
document.addEventListener("DOMContentLoaded", async function () {
  const inputs = document.querySelectorAll(
    ".home-similarity-sliders input[type='range'][data-key]"
  );
  if (!inputs.length) return;

  try {
    const res = await fetch("/api/similarity-preferences", { method: "GET", credentials: "same-origin" });
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

  // Need to trigger algorithm reload on slider change (show spinner)
  const onUpdate = () => window.applySimilarityPreferences();
  inputs.forEach((inp) => {
    inp.addEventListener("change", onUpdate);
  })
});

