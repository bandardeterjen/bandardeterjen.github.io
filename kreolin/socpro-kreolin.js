// 1 liter botol https://images.tokopedia.net/img/cache/100-square/VqbcmM/2022/3/23/663ea769-d2d5-4d39-8701-463e5f77fa8c.jpg.webp?ect=4g
// 1 liter jerigen https://images.tokopedia.net/img/cache/100-square/VqbcmM/2022/3/23/a6d3ce8e-533f-41f1-ade4-279595bdc469.jpg.webp?ect=4g
// 500 ml botol https://images.tokopedia.net/img/cache/100-square/VqbcmM/2022/3/23/000ef776-141f-424a-a529-e203159836f0.jpg.webp?ect=4g
// 5 liter https://images.tokopedia.net/img/cache/100-square/VqbcmM/2022/3/23/bcb74036-e640-4645-af10-14c15e50e17e.jpg.webp?ect=4g
// Link Tokped
// 1 liter dan 500 ml https://www.tokopedia.com/lapaklaundry/kreolin-pembersih-lantai-toilet
// 5 liter https://www.tokopedia.com/lapaklaundry/kreolin-5-liter-pembersih-lantai
// Link Shopee
// 1 liter dan 500 ml https://shopee.co.id/product/96503208/23854886734/
// 5 liter https://shopee.co.id/product/96503208/23180375712/

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
