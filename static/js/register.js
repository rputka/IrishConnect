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

// Initialize file upload handler on page load
// Used in: register.html
document.addEventListener('DOMContentLoaded', function() {
  const fileInput = document.getElementById('file-upload');
  if (fileInput) {
    fileInput.addEventListener('change', handleFileSelect);
  }
});

