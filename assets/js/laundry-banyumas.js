(function () {
  "use strict";

  /* ============================================================
     GUARD — hanya jalan di halaman laundry-banyumas
     ============================================================ */
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var page = document.querySelector(".laundry-banyumas-page");
    if (!page) return;

    /* ============================================================
       1. KONFIGURASI ENDPOINT CSV EKSTERNAL
       ============================================================ */
    var CSV_PRODUCTS_URL =
      "https://bandardeterjen.github.io/product/belanja/daftarproduk.csv";
    var CSV_PHONE_URL =
      "https://bandardeterjen.github.io/product/belanja/daftartelpon.csv";
    var CSV_WILAYAH_URL =
      "https://bandardeterjen.github.io/product/belanja/daftarwilayah.csv";

    var DATA_PRODUK = [];
    var DATA_WILAYAH = [];
    var DATA_PHONE = { primary: "085773009666", formatted: "0857-7300-9666" };

    var CartState = [];
    try {
      CartState = JSON.parse(localStorage.getItem("indonesia_cart")) || [];
    } catch (e) {
      CartState = [];
    }

    var CurrentProductPage = 1;
    var ProductsPerPage = 6;
    var MAX_PAGES_LIMIT = 3;

    var PersistentLocation = { districtSlug: null, villageName: null };

    /* ============================================================
       2. HELPER FUNCTIONS
       ============================================================ */
    function slugify(text) {
      return (text || "")
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "")
        .replace(/\-\-+/g, "-");
    }

    function formatRupiah(num) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
      }).format(num || 0);
    }

    function parseCSV(text) {
      var lines = text.split("\n").filter(function (l) {
        return l.trim() !== "";
      });
      if (lines.length === 0) return [];

      var headers = lines[0].split(",").map(function (h) {
        return h.trim().replace(/^"|"$/g, "");
      });

      return lines.slice(1).map(function (line) {
        var values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        return headers.reduce(function (obj, header, i) {
          var val = values[i] ? values[i].trim() : "";
          if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
          obj[header] = val;
          return obj;
        }, {});
      });
    }

    function setDynamicSEO(title, desc, image) {
      document.title = title;
      var pt = document.getElementById("page-title");
      if (pt) pt.innerText = title;
      var pd = document.getElementById("page-desc");
      if (pd) pd.setAttribute("content", desc);
      var ot = document.getElementById("og-title");
      if (ot) ot.setAttribute("content", title);
      var od = document.getElementById("og-desc");
      if (od) od.setAttribute("content", desc);
      var ou = document.getElementById("og-url");
      if (ou) ou.setAttribute("content", window.location.href);
      var oi = document.getElementById("og-image");
      if (oi && image) oi.setAttribute("content", image);
      var tt = document.getElementById("tw-title");
      if (tt) tt.setAttribute("content", title);
      var td = document.getElementById("tw-desc");
      if (td) td.setAttribute("content", desc);
      var ti = document.getElementById("tw-image");
      if (ti && image) ti.setAttribute("content", image);
    }

    function navigate(hashPath) {
      window.location.hash = hashPath;
      renderApp();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function showBlgToast(msg, isSuccess) {
      if (typeof isSuccess === "undefined") isSuccess = true;
      var toast = page.querySelector("#blg-toast");
      if (!toast) return;
      toast.style.backgroundColor = isSuccess ? "#10b981" : "#f43f5e";
      toast.innerHTML = msg;
      toast.style.display = "block";
      setTimeout(function () {
        toast.style.display = "none";
      }, 3500);
    }

    /* ============================================================
       3. CART MANAGEMENT
       ============================================================ */
    function toggleCartDrawer(show) {
      var drawer = page.querySelector("#cart-drawer");
      var overlay = page.querySelector("#cart-overlay");
      if (!drawer || !overlay) return;
      if (show) {
        syncCartFormLocation();
        drawer.classList.add("open");
        overlay.classList.add("show");
      } else {
        drawer.classList.remove("open");
        overlay.classList.remove("show");
      }
    }

    function saveCart() {
      localStorage.setItem("indonesia_cart", JSON.stringify(CartState));
      renderCartUI();
    }

    function addToCart(productId, openDrawer) {
      if (typeof openDrawer === "undefined") openDrawer = true;
      var prod = DATA_PRODUK.find(function (p) {
        return p.id === productId;
      });
      if (!prod) return;

      var existing = CartState.find(function (item) {
        return item.id === productId;
      });
      if (existing) {
        existing.qty += 1;
      } else {
        CartState.push({
          id: prod.id,
          title: prod.title,
          price: prod.price,
          image: prod.image,
          qty: 1
        });
      }
      saveCart();
      showBlgToast("✓ " + prod.title + " ditambahkan ke keranjang");
      if (openDrawer) toggleCartDrawer(true);
    }

    function updateCartQty(productId, delta) {
      var item = CartState.find(function (i) {
        return i.id === productId;
      });
      if (!item) return;
      item.qty += delta;
      if (item.qty <= 0) {
        CartState = CartState.filter(function (i) {
          return i.id !== productId;
        });
      }
      saveCart();
    }

    function renderCartUI() {
      var container = page.querySelector("#cart-items-container");
      var badge = page.querySelector("#nav-cart-badge");
      var totalEl = page.querySelector("#cart-total-price");
      var countLabel = page.querySelector("#cart-item-count-label");
      var checkoutWrapper = page.querySelector("#cart-checkout-wrapper");

      var totalQty = CartState.reduce(function (sum, item) {
        return sum + item.qty;
      }, 0);
      var grandTotal = CartState.reduce(function (sum, item) {
        return sum + item.price * item.qty;
      }, 0);

      if (badge) badge.innerText = totalQty;
      if (countLabel) countLabel.innerText = totalQty + " item";
      if (totalEl) totalEl.innerText = formatRupiah(grandTotal);
      if (!container) return;

      if (CartState.length === 0) {
        container.innerHTML =
          '<div class="lb-cart-empty">' +
          '<i class="fa-solid fa-cart-arrow-down"></i>' +
          '<p>Keranjang belanja Anda masih kosong.</p>' +
          '<p>Silakan pilih produk dari katalog kami.</p>' +
          "</div>";
        if (checkoutWrapper) checkoutWrapper.style.opacity = "0.5";
        return;
      }

      if (checkoutWrapper) checkoutWrapper.style.opacity = "1";

      container.innerHTML = CartState.map(function (item) {
        return (
          '<div class="lb-cart-item">' +
          '<img src="' + item.image + '" alt="' + item.title + '" class="lb-cart-item__img">' +
          '<div class="lb-cart-item__info">' +
          '<h4 class="lb-cart-item__title">' + item.title + "</h4>" +
          '<div class="lb-cart-item__price">' + formatRupiah(item.price) + "</div>" +
          '<div class="lb-cart-item__subtotal">Subtotal: ' + formatRupiah(item.price * item.qty) + "</div>" +
          "</div>" +
          '<div class="lb-cart-item__qty">' +
          '<button type="button" data-lb-action="qty-minus" data-id="' + item.id + '">-</button>' +
          "<span>" + item.qty + "</span>" +
          '<button type="button" data-lb-action="qty-plus" data-id="' + item.id + '">+</button>' +
          "</div>" +
          "</div>"
        );
      }).join("");
    }

    function syncCartFormLocation() {
      var kecSelect = page.querySelector("#co-kecamatan");
      var desaSelect = page.querySelector("#co-desa");
      if (!kecSelect) return;

      kecSelect.innerHTML = '<option value="">Pilih Wilayah</option>' +
        DATA_WILAYAH.map(function (d) {
          return '<option value="' + d.nama + '"' +
            (PersistentLocation.districtSlug === d.slug ? " selected" : "") +
            ">" + d.nama + "</option>";
        }).join("");

      updateCartDesaOptions();

      kecSelect.onchange = function () {
        var selectedKec = DATA_WILAYAH.find(function (d) {
          return d.nama === kecSelect.value;
        });
        if (selectedKec) {
          PersistentLocation.districtSlug = selectedKec.slug;
          PersistentLocation.villageName = null;
        } else {
          PersistentLocation.districtSlug = null;
          PersistentLocation.villageName = null;
        }
        updateCartDesaOptions();
      };

      if (desaSelect) {
        desaSelect.onchange = function () {
          PersistentLocation.villageName = desaSelect.value || null;
        };
      }
    }

    function updateCartDesaOptions() {
      var kecSelect = page.querySelector("#co-kecamatan");
      var desaSelect = page.querySelector("#co-desa");
      if (!desaSelect || !kecSelect) return;

      var selectedKec = DATA_WILAYAH.find(function (d) {
        return d.nama === kecSelect.value;
      });

      if (selectedKec && selectedKec.desa) {
        desaSelect.innerHTML = '<option value="">Pilih Area/Kecamatan</option>' +
          selectedKec.desa.map(function (ds) {
            return '<option value="' + ds + '"' +
              (PersistentLocation.villageName === ds ? " selected" : "") +
              ">" + ds + "</option>";
          }).join("");
      } else {
        desaSelect.innerHTML = '<option value="">Pilih Area/Kecamatan</option>';
      }
    }

    /* ============================================================
       4. FETCH DATA CSV
       ============================================================ */
    function loadAllCSVData() {
      return Promise.allSettled([
        fetch(CSV_PRODUCTS_URL).then(function (r) { return r.text(); }),
        fetch(CSV_PHONE_URL).then(function (r) { return r.text(); }),
        fetch(CSV_WILAYAH_URL).then(function (r) { return r.text(); })
      ]).then(function (results) {
        var pRes = results[0];
        var tRes = results[1];
        var wRes = results[2];

        if (pRes.status === "fulfilled" && pRes.value.trim().length > 10) {
          var parsed = parseCSV(pRes.value);
          if (parsed && parsed.length > 0) {
            DATA_PRODUK = parsed.map(function (p, idx) {
              return {
                id: parseInt(p.id) || idx + 1,
                slug: p.slug || slugify(p.title || p.nama || "produk-" + (idx + 1)),
                title: p.title || p.nama || "Produk Laundry",
                price: parseInt(p.price || p.harga) || 0,
                image: p.image || p.thumbnail ||
                  "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=600&q=80",
                description: p.description || p.deskripsi ||
                  "Produk dan perlengkapan laundry berkualitas standar pabrik.",
                fitur: p.fitur
                  ? (Array.isArray(p.fitur)
                      ? p.fitur
                      : p.fitur.split("|").map(function (f) { return f.trim(); }))
                  : ["Kualitas Terjamin", "Siap Pakai", "Harga Bersahabat"]
              };
            });
          }
        }

        if (tRes.status === "fulfilled" && tRes.value.trim().length > 5) {
          var parsedPhone = parseCSV(tRes.value);
          if (parsedPhone && parsedPhone.length > 0) {
            var row = parsedPhone[0];
            DATA_PHONE.primary = row.nomorWA || row.primary || row.phone || "085773009666";
            DATA_PHONE.formatted = row.formatted || DATA_PHONE.primary;
          }
        }

        if (wRes.status === "fulfilled" && wRes.value.trim().length > 10) {
          var parsedWil = parseCSV(wRes.value);
          if (parsedWil && parsedWil.length > 0) {
            var grouped = {};
            parsedWil.forEach(function (row) {
              var kec = row.wilayah || row.kota || row.kabupaten || row.kecamatan || row.district;
              var desa = row.area || row.kelurahan || row.desa || row.village;
              if (!kec) return;
              var s = slugify(kec);
              if (!grouped[s]) {
                grouped[s] = {
                  slug: s,
                  nama: kec,
                  deskripsi: row.deskripsi ||
                    "Distribusi resmi sabun deterjen, parfum, dan perlengkapan laundry di area " + kec + " dan sekitarnya.",
                  desa: []
                };
              }
              if (desa && grouped[s].desa.indexOf(desa) === -1) {
                grouped[s].desa.push(desa);
              }
            });
            DATA_WILAYAH = Object.keys(grouped).map(function (k) { return grouped[k]; });
          }
        }
      }).catch(function (err) {
        console.error("Gagal memuat dataset CSV eksternal:", err);
      });
    }

    /* ============================================================
       5. ROUTER & VIEWS
       ============================================================ */
    function renderApp() {
      var hash = window.location.hash.replace(/^#\/?/, "");
      var parts = hash.split("/").filter(Boolean);

      if (parts[0] === "produk-detail" && parts[1]) {
        var prodSlug = parts[1];
        var distSlug = parts[2] || PersistentLocation.districtSlug || null;
        var villName = parts[3]
          ? decodeURIComponent(parts[3])
          : (parts[2] ? null : PersistentLocation.villageName);

        if (distSlug) PersistentLocation.districtSlug = distSlug;
        if (villName) PersistentLocation.villageName = villName;

        var product = DATA_PRODUK.find(function (p) { return p.slug === prodSlug; }) || DATA_PRODUK[0];
        var district = distSlug
          ? DATA_WILAYAH.find(function (d) { return d.slug === distSlug; })
          : null;

        if (product) {
          renderProductDetailView(product, district, villName);
          return;
        }
      }

      if (parts[0] === "wilayah" && parts[1]) {
        var dSlug = parts[1];
        var vName = parts[2] ? decodeURIComponent(parts[2]) : null;
        PersistentLocation.districtSlug = dSlug;
        PersistentLocation.villageName = vName;
        var d = DATA_WILAYAH.find(function (x) { return x.slug === dSlug; });
        if (d) {
          renderDistrictDetailView(d, vName);
          return;
        }
      }

      renderHomeView();
    }

    /* ---------------- VIEW 1: HOME ---------------- */
    function renderHomeView() {
      var phone = DATA_PHONE.primary;

      setDynamicSEO(
        phone + " Pusat Sabun, Parfum & Perlengkapan Laundry Indonesia",
        "Pusat distributor deterjen laundry, bibit parfum wangi tahan lama grade A, softener, plastik packing, hanger, dan perlengkapan laundry lengkap seluruh Indonesia.",
        "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=800&q=80"
      );

      var wilayahCards = DATA_WILAYAH.map(function (dist) {
        return (
          '<a href="#wilayah/' + dist.slug + '" data-lb-route="wilayah/' + dist.slug + '" class="lb-district-card">' +
          '<div class="lb-district-card__top">' +
          "<span>" + dist.nama + "</span>" +
          '<i class="fa-solid fa-chevron-right"></i>' +
          "</div>" +
          '<span class="lb-district-card__count">' + (dist.desa || []).length + " Area/Kec</span>" +
          '<span class="lb-district-card__status">Suplai Ready</span>' +
          "</a>"
        );
      }).join("");

      var html =
        '<section class="bg-royal-gradient lb-hero">' +
        '<div class="lb-hero__inner">' +
        '<div class="lb-hero__badge"><span class="lb-hero__badge-dot"></span>Formulasi Pabrik Kimia & Perlengkapan Laundry</div>' +
        '<h1 class="lb-hero__title">Pusat Sabun, Parfum & <span class="lb-hero__accent">Perlengkapan Laundry</span> di Indonesia</h1>' +
        '<p class="lb-hero__desc">Solusi lengkap deterjen cair matic konsentrat, pelembut serat kain, bibit parfum murni tahan 14 hari, plastik packing, dan peralatan usaha laundry kiloan maupun satuan se-Indonesia.</p>' +
        '<div class="lb-hero__actions">' +
        '<a href="#katalog-produk" class="lb-btn lb-btn--primary" data-lb-scroll="katalog-produk"><i class="fa-solid fa-cart-shopping"></i> Belanja Produk</a>' +
        '<a href="#wilayah" class="lb-btn lb-btn--ghost" data-lb-scroll="wilayah">Lihat Area Wilayah ↓</a>' +
        "</div>" +
        '<div class="lb-hero__stats">' +
        '<div><div class="lb-hero__stat-value">14 Hari</div><div class="lb-hero__stat-label">Wangi Tahan Lama</div></div>' +
        '<div><div class="lb-hero__stat-value">Nasional</div><div class="lb-hero__stat-label">Pengiriman Cepat</div></div>' +
        '<div><div class="lb-hero__stat-value">100%</div><div class="lb-hero__stat-label">Standar Pabrik</div></div>' +
        "</div>" +
        "</div>" +
        "</section>" +

        '<section class="lb-section lb-section--white">' +
        '<div class="lb-section__head">' +
        '<span class="lb-eyebrow">Keunggulan Layanan & Produk</span>' +
        '<h2 class="lb-h2">Mengapa Memilih Produk Kami?</h2>' +
        "</div>" +
        '<div class="lb-features">' +
        feature("fa-wand-magic-sparkles", "Bibit Parfum Grade A", "Aroma eksklusif mewah tahan hingga 14 hari di dalam lemari dan tidak meninggalkan noda pada pakaian.") +
        feature("fa-soap", "Deterjen Konsentrat", "Rendah busa (low foam), ramah lingkungan, hemat takaran, dan aman untuk mekanik mesin cuci matic.") +
        feature("fa-truck-ramp-box", "Suplai Seluruh Indonesia", "Bekerjasama dengan berbagai ekspedisi & kurir terpercaya untuk pengiriman cepat ke seluruh daerah.") +
        feature("fa-tags", "Harga Pabrik Langsung", "Harga bersahabat untuk usaha laundry kiloan, hotel, instansi, maupun pemakaian rumah tangga.") +
        "</div>" +
        "</section>" +

        '<section id="katalog-produk" class="lb-section lb-section--soft">' +
        '<div class="lb-section__head lb-section__head--split">' +
        "<div>" +
        '<span class="lb-eyebrow">Katalog Produk</span>' +
        '<h2 class="lb-h2">Daftar Produk & Perlengkapan Laundry</h2>' +
        '<p class="lb-section__desc">Pilih produk yang Anda butuhkan dan masukkan ke keranjang belanja untuk pemesanan multi-produk.</p>' +
        "</div>" +
        '<span class="lb-chip"><i class="fa-solid fa-circle-check"></i> Pengiriman Aman & Terpercaya</span>' +
        "</div>" +
        '<div id="home-products-grid" class="lb-products-grid"></div>' +
        '<div id="home-pagination-container" class="lb-pagination"></div>' +
        "</section>" +

        '<section id="wilayah" class="lb-section lb-section--white">' +
        '<div class="lb-section__head">' +
        '<span class="lb-eyebrow">Jangkauan Pengiriman</span>' +
        '<h2 class="lb-h2">Daftar Wilayah Distribusi Indonesia</h2>' +
        '<p class="lb-section__desc">Pilih wilayah Anda untuk melihat ketersediaan suplai produk laundry dan daftar area tercover.</p>' +
        "</div>" +
        '<div class="lb-districts">' + wilayahCards + "</div>" +
        "</section>" +

        '<section id="faq" class="lb-section lb-section--soft">' +
        '<div class="lb-section__head">' +
        '<span class="lb-eyebrow">Informasi Pelanggan</span>' +
        '<h2 class="lb-h2">Pertanyaan yang Sering Diajukan (FAQ)</h2>' +
        "</div>" +
        '<div class="lb-faq">' +
        faqItem("Bagaimana cara berbelanja beberapa barang sekaligus?",
          "Klik tombol <strong>+ Keranjang</strong> pada produk yang Anda inginkan. Buka keranjang belanja di pojok kanan atas, isi nama dan alamat lengkap Anda, lalu klik <strong>Checkout via WhatsApp</strong>.") +
        faqItem("Bagaimana penentuan biaya ongkos kirim?",
          "Ongkos kirim akan dihitung secara langsung oleh CS/seller kami setelah Anda mengirimkan daftar pesanan dan alamat lengkap via WhatsApp, disesuaikan dengan pilihan ekspedisi/kurir terjangkau ke lokasi Anda.") +
        "</div>" +
        "</section>";

      page.querySelector("#app-root").innerHTML = html;
      renderPaginatedProductList(CurrentProductPage);
    }

    function feature(icon, title, text) {
      return (
        '<div class="lb-feature">' +
        '<div class="lb-feature__icon"><i class="fa-solid ' + icon + '"></i></div>' +
        '<h3 class="lb-feature__title">' + title + "</h3>" +
        '<p class="lb-feature__text">' + text + "</p>" +
        "</div>"
      );
    }

    function faqItem(q, a) {
      return (
        '<div class="lb-faq__item">' +
        '<h4 class="lb-faq__q"><i class="fa-solid fa-circle-question"></i> ' + q + "</h4>" +
        '<p class="lb-faq__a">' + a + "</p>" +
        "</div>"
      );
    }

    /* ---------------- PAGINATED PRODUCT LIST ---------------- */
    function renderPaginatedProductList(pageNum) {
      CurrentProductPage = pageNum;
      var totalProducts = DATA_PRODUK.length;
      var totalPages = Math.ceil(totalProducts / ProductsPerPage);
      if (totalPages > MAX_PAGES_LIMIT) totalPages = MAX_PAGES_LIMIT;
      if (totalPages < 1) totalPages = 1;

      var startIndex = (pageNum - 1) * ProductsPerPage;
      var paginatedItems = DATA_PRODUK.slice(startIndex, startIndex + ProductsPerPage);

      var gridEl = page.querySelector("#home-products-grid");
      var pagEl = page.querySelector("#home-pagination-container");
      if (!gridEl) return;

      var locSuffix = PersistentLocation.districtSlug
        ? "/" + PersistentLocation.districtSlug +
          (PersistentLocation.villageName
            ? "/" + encodeURIComponent(PersistentLocation.villageName)
            : "")
        : "";

      if (paginatedItems.length === 0) {
        gridEl.innerHTML = '<div class="lb-products-empty">Memuat katalog produk...</div>';
      } else {
        gridEl.innerHTML = paginatedItems.map(function (item) {
          return (
            '<div class="lb-product-card">' +
            '<div class="lb-product-card__media">' +
            '<img src="' + item.image + '" alt="' + item.title + '">' +
            "</div>" +
            '<div class="lb-product-card__body">' +
            "<div>" +
            '<h3 class="lb-product-card__title">' +
            '<a href="#produk-detail/' + item.slug + locSuffix + '" data-lb-route="produk-detail/' + item.slug + locSuffix + '">' + item.title + "</a>" +
            "</h3>" +
            '<div class="lb-product-card__price">' + formatRupiah(item.price) + "</div>" +
            '<p class="lb-product-card__desc">' + item.description + "</p>" +
            "</div>" +
            '<div class="lb-product-card__actions">' +
            '<a href="#produk-detail/' + item.slug + locSuffix + '" data-lb-route="produk-detail/' + item.slug + locSuffix + '" class="lb-btn lb-btn--outline"><i class="fa-solid fa-circle-info"></i> Detail Produk</a>' +
            '<button type="button" class="lb-btn lb-btn--success" data-lb-action="add-to-cart" data-id="' + item.id + '"><i class="fa-solid fa-cart-plus"></i> + Keranjang</button>' +
            "</div>" +
            "</div>" +
            "</div>"
          );
        }).join("");
      }

      if (!pagEl) return;
      if (totalPages <= 1) {
        pagEl.innerHTML = "";
        return;
      }

      var pHTML = "";
      pHTML += pagBtn("first", "1", pageNum === 1, "fa-angles-left", "Halaman Pertama");
      pHTML += pagBtn("prev", String(pageNum - 1), pageNum === 1, "fa-angle-left", "Halaman Sebelumnya");

      for (var i = 1; i <= totalPages; i++) {
        pHTML += '<button type="button" class="lb-page-btn' + (i === pageNum ? " is-active" : "") + '" data-lb-page="' + i + '">' + i + "</button>";
      }

      pHTML += pagBtn("next", String(pageNum + 1), pageNum === totalPages, "fa-angle-right", "Halaman Selanjutnya");
      pHTML += pagBtn("last", String(totalPages), pageNum === totalPages, "fa-angles-right", "Halaman Terakhir");

      pagEl.innerHTML = pHTML;
    }

    function pagBtn(kind, target, disabled, icon, title) {
      return '<button type="button" class="lb-page-btn lb-page-btn--nav' + (disabled ? " is-disabled" : "") + '" data-lb-page="' + target + '"' + (disabled ? " disabled" : "") + ' title="' + title + '"><i class="fa-solid ' + icon + '"></i></button>';
    }

    /* ---------------- VIEW 2: PRODUCT DETAIL ---------------- */
    function renderProductDetailView(product, district, villageName) {
      var phone = DATA_PHONE.formatted || DATA_PHONE.primary;

      var pageTitle = "";
      var breadcrumbDistrict = "";
      var locationScopeText = "";
      var districtScopeName = "";

      if (villageName && district) {
        districtScopeName = villageName + ", " + district.nama;
        locationScopeText = "di " + villageName + ", " + district.nama;
        pageTitle = phone + " " + product.title + " " + districtScopeName;
        breadcrumbDistrict =
          '<li><span class="lb-crumb-sep">/</span></li>' +
          '<li><a href="#produk-detail/' + product.slug + '" data-lb-route="produk-detail/' + product.slug + '">' + product.title + "</a></li>" +
          '<li><span class="lb-crumb-sep">/</span></li>' +
          '<li><a href="#produk-detail/' + product.slug + "/" + district.slug + '" data-lb-route="produk-detail/' + product.slug + "/" + district.slug + '">' + district.nama + "</a></li>" +
          '<li><span class="lb-crumb-sep">/</span></li>' +
          '<li class="is-active">' + villageName + "</li>";
      } else if (district) {
        districtScopeName = district.nama;
        locationScopeText = "di wilayah " + district.nama;
        pageTitle = phone + " " + product.title + " " + districtScopeName;
        breadcrumbDistrict =
          '<li><span class="lb-crumb-sep">/</span></li>' +
          '<li><a href="#produk-detail/' + product.slug + '" data-lb-route="produk-detail/' + product.slug + '">' + product.title + "</a></li>" +
          '<li><span class="lb-crumb-sep">/</span></li>' +
          '<li class="is-active">' + district.nama + "</li>";
      } else {
        districtScopeName = "Indonesia";
        locationScopeText = "seluruh wilayah Indonesia";
        pageTitle = phone + " " + product.title + " " + districtScopeName;
        breadcrumbDistrict =
          '<li><span class="lb-crumb-sep">/</span></li>' +
          '<li class="is-active">' + product.title + "</li>";
      }

      var productDescription = product.description
        ? product.description + " - Melayani pengiriman ke " + districtScopeName + ". Harga " + formatRupiah(product.price) + "."
        : "Jual " + product.title + " " + locationScopeText + ". Harga " + formatRupiah(product.price) + ". Standar pabrik siap kirim ke lokasi Anda.";

      setDynamicSEO(pageTitle, productDescription, product.image);

      var fiturList = (product.fitur || []).map(function (f) {
        return '<li><i class="fa-solid fa-circle-check"></i> ' + f + "</li>";
      }).join("");

      var subWilayah = district
        ? '<div class="lb-block">' +
          '<h3 class="lb-h3">Daftar Sub-Wilayah / Area di ' + district.nama + ":</h3>" +
          '<p class="lb-block__desc">Klik nama area di bawah ini untuk melihat ketersediaan pengiriman langsung ke lokasi Anda:</p>' +
          '<div class="lb-chips">' +
          (district.desa || []).map(function (ds) {
            var route = "produk-detail/" + product.slug + "/" + district.slug + "/" + encodeURIComponent(ds);
            return '<a href="#' + route + '" data-lb-route="' + route + '" class="lb-chip-link' + (villageName === ds ? " is-active" : "") + '">' + ds + "</a>";
          }).join("") +
          "</div>" +
          "</div>"
        : '<div class="lb-block">' +
          '<h3 class="lb-h3">Pilih Wilayah Pengiriman di Indonesia:</h3>' +
          '<p class="lb-block__desc">Kami melayani pengiriman ' + product.title + " ke seluruh Indonesia. Pilih wilayah Anda di bawah ini:</p>" +
          '<div class="lb-district-links">' +
          DATA_WILAYAH.map(function (d) {
            var route = "produk-detail/" + product.slug + "/" + d.slug;
            return '<a href="#' + route + '" data-lb-route="' + route + '" class="lb-district-link"><span>' + d.nama + '</span><i class="fa-solid fa-arrow-right"></i></a>';
          }).join("") +
          "</div>" +
          "</div>";

      var otherLoc = district
        ? "/" + district.slug + (villageName ? "/" + encodeURIComponent(villageName) : "")
        : "";

      var otherProducts = DATA_PRODUK.filter(function (s) {
        return s.slug !== product.slug;
      }).slice(0, 5).map(function (other) {
        var route = "produk-detail/" + other.slug + otherLoc;
        return '<a href="#' + route + '" data-lb-route="' + route + '" class="lb-other-product">' +
          other.title + ' - <span>' + formatRupiah(other.price) + "</span></a>";
      }).join("");

      var html =
        '<div class="lb-breadcrumb-wrap"><div class="lb-breadcrumb-inner">' +
        '<ol class="lb-breadcrumb">' +
        '<li><a href="#" data-lb-route="">Beranda</a></li>' +
        breadcrumbDistrict +
        "</ol></div></div>" +

        '<div class="lb-detail-wrap">' +
        '<div class="lb-detail-grid">' +

        '<div class="lb-detail-main">' +
        "<div>" +
        '<h1 class="lb-detail-title">' + product.title + " " + locationScopeText + "</h1>" +
        '<p class="lb-detail-desc">' + product.description + "</p>" +
        "</div>" +
        '<div class="lb-detail-media"><img src="' + product.image + '" alt="' + product.title + '"></div>' +

        '<div class="lb-detail-content">' +
        '<h3 class="lb-h3">Spesifikasi & Keunggulan Produk</h3>' +
        "<p>Apakah Anda sedang membutuhkan <strong>" + product.title + "</strong> berkualitas " + locationScopeText + "? Kami hadir memberikan suplai terbaik dengan harga langsung dari distributor.</p>" +
        "<p>" + product.description + "</p>" +
        '<div class="lb-spec-box">' +
        '<h4 class="lb-h4">Spesifikasi Produk:</h4>' +
        '<ul class="lb-spec-list">' + fiturList +
        '<li><i class="fa-solid fa-circle-check"></i> Harga: ' + formatRupiah(product.price) + "</li>" +
        "</ul>" +
        "</div>" +
        subWilayah +
        "</div>" +
        "</div>" +

        '<aside class="lb-detail-side">' +
        '<div class="lb-side-card lb-side-card--sticky">' +
        '<div class="lb-side-card__head">' +
        '<span class="lb-side-card__label">Informasi Harga</span>' +
        '<div class="lb-side-card__price">' + formatRupiah(product.price) + "</div>" +
        '<div class="lb-side-card__status"><i class="fa-solid fa-boxes-stacked"></i> Status: Stok Siap Kirim</div>' +
        "</div>" +
        '<div class="lb-side-features">' +
        '<div><i class="fa-solid fa-check"></i> Pengiriman Langsung ke Lokasi</div>' +
        '<div><i class="fa-solid fa-check"></i> Ekspedisi Terjangkau</div>' +
        '<div><i class="fa-solid fa-check"></i> Jaminan Mutu Terpercaya</div>' +
        "</div>" +
        '<button type="button" class="lb-btn lb-btn--success lb-btn--block" data-lb-action="add-to-cart" data-id="' + product.id + '"><i class="fa-solid fa-cart-plus"></i> + Tambah ke Keranjang</button>' +
        '<div class="lb-side-hotline"><a href="tel:' + phone + '"><i class="fa-solid fa-phone"></i> Hotline CS: ' + phone + "</a></div>" +
        "</div>" +

        '<div class="lb-side-card">' +
        '<h4 class="lb-h4">Produk Lainnya</h4>' +
        '<div class="lb-other-products">' + otherProducts + "</div>" +
        "</div>" +
        "</aside>" +

        "</div></div>";

      page.querySelector("#app-root").innerHTML = html;
    }

    /* ---------------- VIEW 3: DISTRICT DETAIL ---------------- */
    function renderDistrictDetailView(district, villageName) {
      var phone = DATA_PHONE.primary;

      var pageTitle = "";
      var locationText = "";
      var breadcrumbHtml = "";

      if (villageName) {
        pageTitle = phone + " Sabun, Parfum & Perlengkapan Laundry Di " + villageName + " " + district.nama;
        locationText = "di Area " + villageName + ", " + district.nama;
        breadcrumbHtml =
          '<li><span class="lb-crumb-sep">/</span></li>' +
          '<li><a href="#wilayah/' + district.slug + '" data-lb-route="wilayah/' + district.slug + '">' + district.nama + "</a></li>" +
          '<li><span class="lb-crumb-sep">/</span></li>' +
          '<li class="is-active">' + villageName + "</li>";
      } else {
        pageTitle = phone + " Sabun, Parfum & Perlengkapan Laundry Di " + district.nama;
        locationText = "di Wilayah " + district.nama;
        breadcrumbHtml =
          '<li><span class="lb-crumb-sep">/</span></li>' +
          '<li class="is-active">' + district.nama + "</li>";
      }

      setDynamicSEO(
        pageTitle,
        "Pusat penjualan deterjen matic, softener, pelicin setrika, plastik, hanger, dan bibit parfum laundry " + locationText + ". Siap kirim langsung ke alamat Anda.",
        "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=800&q=80"
      );

      var lowestPrice = DATA_PRODUK.length > 0
        ? Math.min.apply(null, DATA_PRODUK.map(function (p) { return p.price; }))
        : 10000;

      var productList = DATA_PRODUK.map(function (p) {
        var route = "produk-detail/" + p.slug + "/" + district.slug +
          (villageName ? "/" + encodeURIComponent(villageName) : "");
        return '<div class="lb-mini-product">' +
          '<div class="lb-mini-product__info">' +
          '<a href="#' + route + '" data-lb-route="' + route + '" class="lb-mini-product__title">' + p.title + "</a>" +
          '<span class="lb-mini-product__price">' + formatRupiah(p.price) + "</span>" +
          "</div>" +
          '<button type="button" class="lb-btn lb-btn--success lb-btn--xs" data-lb-action="add-to-cart" data-id="' + p.id + '"><i class="fa-solid fa-cart-plus"></i> + Beli</button>' +
          "</div>";
      }).join("");

      var subArea = (district.desa || []).map(function (ds) {
        var route = "wilayah/" + district.slug + "/" + encodeURIComponent(ds);
        return '<a href="#' + route + '" data-lb-route="' + route + '" class="lb-chip-link' + (villageName === ds ? " is-active" : "") + '">' + ds + "</a>";
      }).join("");

      var otherWilayah = DATA_WILAYAH.filter(function (d) {
        return d.slug !== district.slug;
      }).slice(0, 10).map(function (other) {
        var route = "wilayah/" + other.slug;
        return '<a href="#' + route + '" data-lb-route="' + route + '" class="lb-other-wilayah">• ' + other.nama + "</a>";
      }).join("");

      var html =
        '<div class="lb-breadcrumb-wrap"><div class="lb-breadcrumb-inner">' +
        '<ol class="lb-breadcrumb">' +
        '<li><a href="#" data-lb-route="">Beranda</a></li>' +
        breadcrumbHtml +
        "</ol></div></div>" +

        '<div class="lb-detail-wrap">' +
        '<div class="lb-detail-grid">' +

        '<div class="lb-detail-main">' +
        "<div>" +
        '<span class="lb-pill">Area Distribusi Resmi</span>' +
        '<h1 class="lb-detail-title">Suplai Sabun, Parfum & Perlengkapan Laundry ' + locationText + "</h1>" +
        '<p class="lb-detail-desc">' + district.deskripsi + " Kami melayani pengiriman langsung deterjen cair matic, pelembut pakaian, plastik kemasan, hanger, dan parfum laundry ke " + district.nama + ".</p>" +
        "</div>" +
        '<div class="lb-detail-media"><img src="https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=800&q=80" alt="' + district.nama + '"></div>' +

        '<div class="lb-detail-content">' +
        '<h3 class="lb-h3">Katalog Produk Tersedia untuk Area ' + district.nama + "</h3>" +
        "<p>Pilih produk di bawah ini dan masukkan ke keranjang belanja Anda:</p>" +
        '<div class="lb-mini-products">' + productList + "</div>" +
        '<div class="lb-block">' +
        '<h3 class="lb-h3">Daftar Sub-Area / Kecamatan di ' + district.nama + ":</h3>" +
        '<div class="lb-chips">' + subArea + "</div>" +
        "</div>" +
        "</div>" +
        "</div>" +

        '<aside class="lb-detail-side">' +
        '<div class="lb-side-card lb-side-card--sticky">' +
        '<div class="lb-side-card__head">' +
        '<span class="lb-side-card__label">Layanan Pengiriman</span>' +
        '<h3 class="lb-h4">Area ' + district.nama + "</h3>" +
        '<div class="lb-side-card__price">Harga Mulai ' + formatRupiah(lowestPrice) + "</div>" +
        "</div>" +
        '<div class="lb-side-features">' +
        '<div><i class="fa-solid fa-check"></i> Pengiriman Langsung ke ' + district.nama + "</div>" +
        '<div><i class="fa-solid fa-check"></i> Stok Grosir & Eceran Ready</div>' +
        '<div><i class="fa-solid fa-check"></i> Ekspedisi Cepat & Aman</div>' +
        "</div>" +
        '<button type="button" class="lb-btn lb-btn--success lb-btn--block" data-lb-action="open-cart"><i class="fa-solid fa-cart-shopping"></i> Buka Keranjang & Checkout</button>' +
        "</div>" +

        '<div class="lb-side-card">' +
        '<h4 class="lb-h4">Wilayah Lainnya</h4>' +
        '<div class="lb-other-wilayah-list">' + otherWilayah + "</div>" +
        "</div>" +
        "</aside>" +

        "</div></div>";

      page.querySelector("#app-root").innerHTML = html;
    }

    /* ============================================================
       6. CHECKOUT HANDLER
       ============================================================ */
    function bindCheckoutForm() {
      var checkoutForm = page.querySelector("#cart-checkout-form");
      if (!checkoutForm) return;

      checkoutForm.addEventListener("submit", function (e) {
        e.preventDefault();
        if (CartState.length === 0) {
          alert("Keranjang belanja Anda masih kosong!");
          return;
        }

        var nama = page.querySelector("#co-nama").value.trim();
        var wa = page.querySelector("#co-wa").value.trim();
        var kec = page.querySelector("#co-kecamatan").value;
        var desa = page.querySelector("#co-desa").value;
        var alamat = page.querySelector("#co-alamat").value.trim();

        var grandTotal = CartState.reduce(function (sum, item) {
          return sum + item.price * item.qty;
        }, 0);

        var locTujuan = "Indonesia";
        if (desa && kec) locTujuan = desa + ", " + kec;
        else if (kec) locTujuan = kec;

        var msg = "Halo Admin Indonesia Laundry Listing, saya ingin memesan produk berikut:\n\n";
        msg += "*DAFTAR PESANAN:*\n";
        CartState.forEach(function (item, idx) {
          var subtotal = item.price * item.qty;
          msg += (idx + 1) + ". " + item.title + "\n Jumlah: " + item.qty + " x " +
            formatRupiah(item.price) + " = " + formatRupiah(subtotal) + "\n";
        });
        msg += "\n*TOTAL HARGA BARANG:* " + formatRupiah(grandTotal) + "\n\n";
        msg += "*DATA PEMESAN & TUJUAN:*\n";
        msg += "• Nama: " + nama + "\n";
        if (wa) msg += "• No. WA: " + wa + "\n";
        msg += "• Wilayah: " + locTujuan + "\n";
        msg += "• Alamat Lengkap: " + alamat + "\n\n";
        msg += "_*(Mohon bantu hitungkan ongkos kirim sesuai pilihan ekspedisi/kurir dan jarak tempuh ke alamat di atas).* Terima kasih!_";

        var phone = DATA_PHONE.primary || "085773009666";
        var waTarget = phone.charAt(0) === "0" ? "62" + phone.slice(1) : phone;
        var urlWA = "https://api.whatsapp.com/send?phone=" + waTarget +
          "&text=" + encodeURIComponent(msg);

        showBlgToast("Membuka WhatsApp...");
        setTimeout(function () {
          window.open(urlWA, "_blank");
        }, 300);
      });
    }

    /* ============================================================
       7. EVENT DELEGATION (menggantikan onclick inline)
       ============================================================ */
    function bindDelegatedEvents() {
      page.addEventListener("click", function (e) {
        var routeEl = e.target.closest("[data-lb-route]");
        if (routeEl) {
          e.preventDefault();
          navigate(routeEl.getAttribute("data-lb-route"));
          return;
        }

        var scrollEl = e.target.closest("[data-lb-scroll]");
        if (scrollEl) {
          e.preventDefault();
          var id = scrollEl.getAttribute("data-lb-scroll");
          var target = page.querySelector("#" + id);
          if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }

        var pageBtn = e.target.closest("[data-lb-page]");
        if (pageBtn && !pageBtn.disabled) {
          var p = parseInt(pageBtn.getAttribute("data-lb-page"), 10);
          if (!isNaN(p)) renderPaginatedProductList(p);
          return;
        }

        var actionEl = e.target.closest("[data-lb-action]");
        if (actionEl) {
          var action = actionEl.getAttribute("data-lb-action");
          var id = actionEl.getAttribute("data-id");

          if (action === "add-to-cart") {
            addToCart(parseInt(id, 10));
          } else if (action === "qty-plus") {
            updateCartQty(parseInt(id, 10), 1);
          } else if (action === "qty-minus") {
            updateCartQty(parseInt(id, 10), -1);
          } else if (action === "open-cart") {
            toggleCartDrawer(true);
          } else if (action === "close-cart") {
            toggleCartDrawer(false);
          }
          return;
        }
      });
    }

    /* ============================================================
       8. INIT
       ============================================================ */
    function initApp() {
      var yearEl = document.getElementById("auto-copyright-year");
      if (yearEl) yearEl.innerText = new Date().getFullYear();

      loadAllCSVData().then(function () {
        renderCartUI();
        renderApp();
        bindCheckoutForm();
        bindDelegatedEvents();
        window.addEventListener("hashchange", renderApp);
      });
    }

    initApp();
  });
})();
