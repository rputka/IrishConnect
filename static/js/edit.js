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


