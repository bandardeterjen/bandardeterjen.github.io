  document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('loginForm');
  const content = document.getElementById('content');
  const logoutBtn = document.getElementById('logoutBtn');
  const errorMessage = document.getElementById('error-message');
  const expiryDateElement = document.getElementById('expiryDate');

  // Define valid email-password pairs with validity periods (in days)
  const validUsers = [
    { email: 'bandarlaundry@gmail.com', password: 'password123', validityPeriod: 7 }, // 7 days
    { email: 'bandardeterjen@gmail.com', password: 'password456', validityPeriod: 14 }, // 14 days
    { email: 'bezimeni.id@gmail.com', password: 'mypassword', validityPeriod: 30 } // 30 days
  ];

  // Check if the user is already logged in
  const storedData = localStorage.getItem('loginData');
  if (storedData) {
    const { email, expiry } = JSON.parse(storedData);
    const now = new Date().getTime();

    if (now < expiry) {
      // User is still logged in
      showContent(email, expiry);
    } else {
      // Login expired
      localStorage.removeItem('loginData');
    }
  }

  // Handle login form submission
  loginForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    // Validate email and password against the validUsers array
    const user = validUsers.find(user => user.email === email && user.password === password);

    if (user) {
      errorMessage.style.display = 'none';

      // Calculate expiration date based on the user's validity period
      const now = new Date().getTime();
      const validityInMilliseconds = user.validityPeriod * 24 * 60 * 60 * 1000; // Convert days to milliseconds
      const expiry = now + validityInMilliseconds;

      // Store login data in localStorage
      const loginData = { email, expiry };
      localStorage.setItem('loginData', JSON.stringify(loginData));

      // Show content
      showContent(email, expiry);
    } else {
      errorMessage.textContent = 'Invalid email or password';
      errorMessage.style.display = 'block';
    }
  });

  // Handle logout button click
  logoutBtn.addEventListener('click', function () {
    localStorage.removeItem('loginData'); // Remove login data
    hideContent(); // Hide content and show login form
  });

  // Function to show content and set the expiry date
  function showContent(email, expiry) {
    loginForm.style.display = 'none';
    content.style.display = 'block';
    expiryDateElement.textContent = new Date(expiry).toLocaleString();
  }

  // Function to hide content and show login form
  function hideContent() {
    loginForm.reset();
    loginForm.style.display = 'block';
    content.style.display = 'none';
    errorMessage.style.display = 'none';
  }
});
