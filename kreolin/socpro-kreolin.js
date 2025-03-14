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
    productName: "Kreolin 5 Liter di Tokopedia",
    productLink: "https://www.tokopedia.com/lapaklaundry/kreolin-5-liter-pembersih-lantai",
    productImage: "https://images.tokopedia.net/img/cache/100-square/VqbcmM/2022/3/23/bcb74036-e640-4645-af10-14c15e50e17e.jpg.webp?ect=4g"
  },
  {
    userName: "Supriatinu",
    productName: "Kreolin 500 ml botol di Shopee",
    productLink: "https://shopee.co.id/product/96503208/23854886734/",
    productImage: "https://images.tokopedia.net/img/cache/100-square/VqbcmM/2022/3/23/000ef776-141f-424a-a529-e203159836f0.jpg.webp?ect=4g"
  },
  {
    userName: "Enok",
    productName: "Kreolin 1 Liter jerigen di Tokopedia",
    productLink: "https://www.tokopedia.com/lapaklaundry/kreolin-pembersih-lantai-toilet",
    productImage: "https://images.tokopedia.net/img/cache/100-square/VqbcmM/2022/3/23/a6d3ce8e-533f-41f1-ade4-279595bdc469.jpg.webp?ect=4g"
  },
  {
    userName: "Agus",
    productName: "Kreolin 1 Liter botol di Shopee",
    productLink: "https://shopee.co.id/product/96503208/23854886734/",
    productImage: "https://images.tokopedia.net/img/cache/100-square/VqbcmM/2022/3/23/663ea769-d2d5-4d39-8701-463e5f77fa8c.jpg.webp?ect=4g"
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
