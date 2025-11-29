// Test the backend endpoint
fetch('/backend/test_manage_package.php', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  }
})
.then(response => response.text())
.then(data => {
  console.log('Backend test response:', data);
})
.catch(error => {
  console.error('Backend test error:', error);
});