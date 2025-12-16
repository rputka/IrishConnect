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

// Close modals on ESC key press
// Used in: profile.html
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    hideClassesModal();
    hideDeleteModal();
  }
});

