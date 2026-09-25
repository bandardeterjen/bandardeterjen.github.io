(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    const pageContainer = document.querySelector('.bandar-deterjen-page');
    if (!pageContainer) return;

    const sendWaBtn = document.getElementById('sendWaBtn');
    if (!sendWaBtn) return;

    sendWaBtn.addEventListener('click', function() {
      const via_url = location.href;
      const browser = navigator.userAgent;
      const d = new Date();
      
      const name = document.getElementById('name');
      const email = document.getElementById('email');
      const textCity = document.getElementById('text-city');
      const textProd = document.getElementById('text-prod');
      const hdnmsgprod = document.getElementById('hdnmsgprod');
      const hdnmsg = document.getElementById('hdnmsg');
      const mobileNumber = '6285773009666';

      if (name.value.trim() === "") {
        name.style.background = "lightpink";
        name.style.border = "4px solid red";
        alert('Tulis nama terlebih dahulu');
        name.focus();
        return false;
      }

      // Reset styling if valid
      name.style.background = "";
      name.style.border = "";

      let url = `https://wa.me/${mobileNumber}?text=` + 
                "Nama: " + encodeURIComponent(name.value) + "%0a" + 
                "Email: " + encodeURIComponent(email.value) + "%0a" + 
                "Kota: " + encodeURIComponent(textCity.value) + "%0a" + 
                encodeURIComponent(hdnmsgprod.value) + "%20" + encodeURIComponent(textProd.value) + "%0a%0a" + 
                encodeURIComponent(hdnmsg.value) + "%0a%0a%0aDari: " + encodeURIComponent(via_url) + 
                ' %0a%0aBrowser: ' + encodeURIComponent(browser) + 
                '%0A%0APada: ' + encodeURIComponent(d);

      window.open(url, '_blank').focus();
    });
  });
})();
