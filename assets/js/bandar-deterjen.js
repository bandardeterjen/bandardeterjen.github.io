(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    const pageContainer = document.querySelector('.bandar-deterjen-page');
    if (!pageContainer) return;

    const sendWaBtn = document.getElementById('sendWaBtn');
    if (!sendWaBtn) return;

    sendWaBtn.addEventListener('click', function() {
      const viaUrl = location.href;
      const browserInfo = navigator.userAgent;
      const timeNow = new Date();
      
      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      const cityInput = document.getElementById('text-city');
      const prodSelect = document.getElementById('text-prod');
      const hdnMsgProd = document.getElementById('hdnmsgprod');
      const hdnMsg = document.getElementById('hdnmsg');
      const mobileNumber = '6285773009666';

      if (nameInput.value.trim() === "") {
        nameInput.style.background = "lightpink";
        nameInput.style.border = "2px solid red";
        alert('Mohon tuliskan nama Anda terlebih dahulu.');
        nameInput.focus();
        return false;
      }

      nameInput.style.background = "";
      nameInput.style.border = "";

      let waMessage = `Nama: ${nameInput.value}%0a` + 
                      `Email: ${emailInput.value}%0a` + 
                      `Kota: ${cityInput.value}%0a` + 
                      `${hdnMsgProd.value} ${prodSelect.value}%0a%0a` + 
                      `${hdnMsg.value}%0a%0a` + 
                      `Dari: ${viaUrl}%0a` + 
                      `Browser: ${browserInfo}%0a` + 
                      `Pada: ${timeNow}`;

      let waUrl = `https://wa.me/${mobileNumber}?text=` + encodeURIComponent(waMessage);
      window.open(waUrl, '_blank').focus();
    });
  });
})();
