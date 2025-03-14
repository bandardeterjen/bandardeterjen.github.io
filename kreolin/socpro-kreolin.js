// script.js

// Array of social proof data
const socialProofData = [
  {
    userName: "Azmi",
    productName: "Kreolin 5 Liter",
    productLink: "https://ratakan.com/cart/direct/202402261156470A0FC508C1060A360216?aff=bezimeni.id@gmail.com",
    productImage: "https://ratakan.com/uploads/prd-49ece041a6.jpg"
  },
  {
    userName: "Supriatinu",
    productName: "Kreolin 1 Liter",
    productLink: "https://ratakan.com/cart/direct/20250130182559C4593FD3D03F0ADEAF52?aff=bezimeni.id@gmail.com",
    productImage: "https://ratakan.com/uploads/prd-6eeaa60c6d.png"
  },
  {
    userName: "Enok",
    productName: "Kreolin 5 Liter",
    productLink: "https://ratakan.com/cart/direct/202404091749138437B92A72B9620F449B?aff=bezimeni.id@gmail.com",
    productImage: "https://ratakan.com/uploads/prd-8d7f39d27f.jpg"
  },
  {
    userName: "Agus",
    productName: "Kreolin 1 Liter",
    productLink: "https://ratakan.com/cart/direct/20240311132703B5F989D27C3843E729A3?aff=bezimeni.id@gmail.com",
    productImage: "https://ratakan.com/uploads/prd-e4c6a0fdb3.jpg"
  }
];

// DOM Elements
const notificationContainer = document.getElementById("social-proof-notification");
const productImage = document.getElementById("product-image");
const userName = document.getElementById("user-name");
const productLink = document.getElementById("product-link");

let currentIndex = 0;

// Function to update the notification content
function updateNotification() {
  const currentData = socialProofData[currentIndex];
  productImage.src = currentData.productImage;
  userName.textContent = currentData.userName;
  productLink.textContent = currentData.productName;
  productLink.href = currentData.productLink;

  // Show the notification
  notificationContainer.classList.remove("hidden");

  // Hide the notification after 5 seconds
  setTimeout(() => {
    notificationContainer.classList.add("hidden");
  }, 5000);

  // Move to the next notification
  currentIndex = (currentIndex + 1) % socialProofData.length;
}

// Start the notification cycle
setInterval(updateNotification, 6000); // Change every 6 seconds
