(function () {
  "use strict";

  var WA_NUMBER = "6285773009666";

  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function buildWaLink(message) {
    return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(message);
  }

  ready(function () {
    var page = document.querySelector(".laundry-banyumas-page");
    if (!page) return;

    var waLink = page.querySelector("#lb-wa-link");
    if (waLink) {
      waLink.setAttribute(
        "href",
        buildWaLink("Halo Laundry Banyumas, saya ingin bertanya tentang layanan laundry.")
      );
      waLink.setAttribute("target", "_blank");
      waLink.setAttribute("rel", "noopener");
    }

    var orderButtons = page.querySelectorAll(".lb-order");
    Array.prototype.forEach.call(orderButtons, function (btn) {
      btn.addEventListener("click", function () {
        var paket = btn.getAttribute("data-paket") || "Layanan Laundry";
        var msg =
          "Halo Laundry Banyumas, saya ingin memesan paket *" +
          paket +
          "*. Mohon informasi ketersediaan dan estimasi selesai.";
        window.open(buildWaLink(msg), "_blank", "noopener");
      });
    });

    var anchors = page.querySelectorAll('a[href^="#lb-"]');
    Array.prototype.forEach.call(anchors, function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        var target = id ? document.querySelector(id) : null;
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  });
})();
