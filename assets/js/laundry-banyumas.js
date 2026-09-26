(function () {
  "use strict";

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
    var CSV_PRODUCTS_URL = "https://bandardeterjen.github.io/product/belanja/daftarproduk.csv";
    var CSV_PHONE_URL    = "https://bandardeterjen.github.io/product/belanja/daftartelpon.csv";
    var CSV_WILAYAH_URL  = "https://bandardeterjen.github.io/product/belanja/daftarwilayah.csv";

    var DATA_PRODUK = [];
    var DATA_WILAYAH = [];
    var DATA_PHONE = { primary: "085773009666", formatted: "0857-7300-9666" };

    var CartState = [];
    try { CartState = JSON.parse(localStorage.getItem("indonesia_cart")) || []; }
    catch (e) { CartState = []; }

    var CurrentProductPage = 1;
    var ProductsPerPage = 6;
    var MAX_PAGES_LIMIT = 3;

    var PersistentLocation = { districtSlug: null, villageName: null };

    /* ============================================================
       2. HELPER FUNCTIONS
       ============================================================ */
    function slugify(text) {
      return (text || "").toString().toLowerCase().trim()
        .replace(/\s+/g, "-").replace(/[^\w\-]+/g, "").replace(/\-\-+/g, "-");
    }

    function formatRupiah(num) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency", currency: "IDR", maximumFractionDigits: 0
      }).format(num || 0);
    }

    function parseCSV(text) {
      var lines = text.split("\n").filter(function (l) { return l.trim() !== ""; });
      if (lines.length === 0) return [];
      var headers = lines[0].split(",").map(function (h) { return h.trim().replace(/^"|"$/g, ""); });
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
      var pt = document.getElementById("page-title"); if (pt) pt.innerText = title;
      var pd = document.getElementById("page-desc"); if (pd) pd.setAttribute("content", desc);
      var ot = document.getElementById("og-title"); if (ot) ot.setAttribute("content", title);
      var od = document.getElementById("og-desc"); if (od) od.setAttribute("content", desc);
      var ou = document.getElementById("og-url"); if (ou) ou.setAttribute("content", window.location.href);
      var oi = document.getElementById("og-image"); if (oi && image) oi.setAttribute("content", image);
      var tt = document.getElementById("tw-title"); if (tt) tt.setAttribute("content", title);
      var td = document.getElementById("tw-desc"); if (td) td.setAttribute("content", desc);
      var ti = document.getElementById("tw-image"); if (ti && image) ti.setAttribute("content", image);
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
      setTimeout(function () { toast.style.display = "none"; }, 3500);
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
      var prod = DATA_PRODUK.find(function (p) { return p.id === productId; });
      if (!prod) return;
      var existing = CartState.find(function (item) { return item.id === productId; });
      if (existing) existing.qty += 1;
      else CartState.push({ id: prod.id, title: prod.title, price: prod.price, image: prod.image, qty: 1 });
      saveCart();
      showBlgToast("✓ " + prod.title + " ditambahkan ke keranjang");
      if (openDrawer) toggleCartDrawer(true);
    }

    function updateCartQty(productId, delta) {
      var item = CartState.find(function (i) { return i.id === productId; });
      if (!item) return;
      item.qty += delta;
      if (item.qty <= 0) CartState = CartState.filter(function (i) { return i.id !== productId; });
      saveCart();
    }

    function renderCartUI() {
      var container = page.querySelector("#cart-items-container");
      var badge = page.querySelector("#nav-cart-badge");
      var totalEl = page.querySelector("#cart-total-price");
      var countLabel = page.querySelector("#cart-item-count-label");
      var checkoutWrapper = page.querySelector("#cart-checkout-wrapper");

      var totalQty = CartState.reduce(function (s, i) { return s + i.qty; }, 0);
      var grandTotal = CartState.reduce(function (s, i) { return s + i.price * i.qty; }, 0);

      if (badge) badge.innerText = totalQty;
      if (countLabel) countLabel.innerText = totalQty + " item";
      if (totalEl) totalEl.innerText = formatRupiah(grandTotal);
      if (!container) return;

      if (CartState.length === 0) {
        container.innerHTML =
          '<div class="text-center py-10 text-slate-400 space-y-2 bg-slate-50 rounded-2xl border border-dashed border-slate-200">' +
          '<i class="fa-solid fa-cart-arrow-down text-4xl text-slate-300"></i>' +
          '<p class="text-xs font-semibold">Keranjang belanja Anda masih kosong.</p>' +
          '<p class="text-[11px] text-slate-400">Silakan pilih produk dari katalog kami.</p>' +
          "</div>";
        if (checkoutWrapper) checkoutWrapper.style.opacity = "0.5";
        return;
      }

      if (checkoutWrapper) checkoutWrapper.style.opacity = "1";

      container.innerHTML = CartState.map(function (item) {
        return (
          '<div class="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">' +
          '<img src="' + item.image + '" alt="' + item.title + '" class="w-14 h-14 object-cover rounded-lg bg-slate-100 shrink-0">' +
          '<div class="flex-1 min-w-0">' +
          '<h4 class="font-bold text-xs text-slate-900 truncate">' + item.title + "</h4>" +
          '<div class="text-brandOrange-600 font-extrabold text-xs mt-0.5">' + formatRupiah(item.price) + "</div>" +
          '<div class="text-[10px] text-slate-400 font-semibold">Subtotal: ' + formatRupiah(item.price * item.qty) + "</div>" +
          "</div>" +
          '<div class="flex items-center gap-1.5 shrink-0 bg-slate-100 p-1 rounded-lg border border-slate-200">' +
          '<button type="button" data-lb-action="qty-minus" data-id="' + item.id + '" class="w-6 h-6 rounded bg-white hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shadow-sm">-</button>' +
          '<span class="text-xs font-bold px-1.5 text-slate-800">' + item.qty + "</span>" +
          '<button type="button" data-lb-action="qty-plus" data-id="' + item.id + '" class="w-6 h-6 rounded bg-white hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shadow-sm">+</button>' +
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
        var selectedKec = DATA_WILAYAH.find(function (d) { return d.nama === kecSelect.value; });
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
        desaSelect.onchange = function () { PersistentLocation.villageName = desaSelect.value || null; };
      }
    }

    function updateCartDesaOptions() {
      var kecSelect = page.querySelector("#co-kecamatan");
      var desaSelect = page.querySelector("#co-desa");
      if (!desaSelect || !kecSelect) return;
      var selectedKec = DATA_WILAYAH.find(function (d) { return d.nama === kecSelect.value; });
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
        var pRes = results[0], tRes = results[1], wRes = results[2];

        if (pRes.status === "fulfilled" && pRes.value.trim().length > 10) {
          var parsed = parseCSV(pRes.value);
          if (parsed && parsed.length > 0) {
            DATA_PRODUK = parsed.map(function (p, idx) {
              return {
                id: parseInt(p.id) || idx + 1,
                slug: p.slug || slugify(p.title || p.nama || "produk-" + (idx + 1)),
                title: p.title || p.nama || "Produk Laundry",
                price: parseInt(p.price || p.harga) || 0,
                image: p.image || p.thumbnail || "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=600&q=80",
                description: p.description || p.deskripsi || "Produk dan perlengkapan laundry berkualitas standar pabrik.",
                fitur: p.fitur ? (Array.isArray(p.fitur) ? p.fitur : p.fitur.split("|").map(function (f) { return f.trim(); })) : ["Kualitas Terjamin", "Siap Pakai", "Harga Bersahabat"]
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
                  slug: s, nama: kec,
                  deskripsi: row.deskripsi || "Distribusi resmi sabun deterjen, parfum, dan perlengkapan laundry di area " + kec + " dan sekitarnya.",
                  desa: []
                };
              }
              if (desa && grouped[s].desa.indexOf(desa) === -1) grouped[s].desa.push(desa);
            });
            DATA_WILAYAH = Object.keys(grouped).map(function (k) { return grouped[k]; });
          }
        }
      }).catch(function (err) { console.error("Gagal memuat dataset CSV eksternal:", err); });
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
        var villName = parts[3] ? decodeURIComponent(parts[3]) : (parts[2] ? null : PersistentLocation.villageName);
        if (distSlug) PersistentLocation.districtSlug = distSlug;
        if (villName) PersistentLocation.villageName = villName;
        var product = DATA_PRODUK.find(function (p) { return p.slug === prodSlug; }) || DATA_PRODUK[0];
        var district = distSlug ? DATA_WILAYAH.find(function (d) { return d.slug === distSlug; }) : null;
        if (product) { renderProductDetailView(product, district, villName); return; }
      }

      if (parts[0] === "wilayah" && parts[1]) {
        var dSlug = parts[1];
        var vName = parts[2] ? decodeURIComponent(parts[2]) : null;
        PersistentLocation.districtSlug = dSlug;
        PersistentLocation.villageName = vName;
        var d = DATA_WILAYAH.find(function (x) { return x.slug === dSlug; });
        if (d) { renderDistrictDetailView(d, vName); return; }
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

      var html =
        '<section class="relative bg-royal-gradient text-white overflow-hidden py-16 md:py-24">' +
        '<div class="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>' +
        '<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">' +
        '<div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">' +

        '<div class="lg:col-span-7 space-y-6 text-center lg:text-left">' +
        '<div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold border border-white/20">' +
        '<span class="w-2 h-2 rounded-full bg-brandOrange-500"></span> Formulasi Pabrik Kimia & Perlengkapan Laundry</div>' +
        '<h1 class="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight leading-tight">Pusat Sabun, Parfum & <span class="text-brandOrange-400">Perlengkapan Laundry</span> di Indonesia</h1>' +
        '<p class="text-sm md:text-base text-blue-100 max-w-2xl leading-relaxed">Solusi lengkap deterjen cair matic konsentrat, pelembut serat kain, bibit parfum murni tahan 14 hari, plastik packing, dan peralatan usaha laundry kiloan maupun satuan se-Indonesia.</p>' +
        '<div class="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">' +
        '<a href="#katalog-produk" data-lb-scroll="katalog-produk" class="bg-brandOrange-500 hover:bg-brandOrange-600 text-white font-bold text-sm px-7 py-3.5 rounded-xl shadow-xl hover:shadow-orange-500/40 transition flex items-center gap-2"><i class="fa-solid fa-cart-shopping"></i> Belanja Produk</a>' +
        '<a href="#wilayah" data-lb-scroll="wilayah" class="bg-white/15 hover:bg-white/25 text-white font-bold text-sm px-6 py-3.5 rounded-xl backdrop-blur-sm border border-white/20 transition">Lihat Area Wilayah ↓</a>' +
        "</div>" +
        '<div class="grid grid-cols-3 gap-3 pt-6 border-t border-white/15 text-left">' +
        '<div><div class="text-xl md:text-2xl font-black text-amber-400">14 Hari</div><div class="text-[11px] text-blue-200">Wangi Tahan Lama</div></div>' +
        '<div><div class="text-xl md:text-2xl font-black text-amber-400">Nasional</div><div class="text-[11px] text-blue-200">Pengiriman Cepat</div></div>' +
        '<div><div class="text-xl md:text-2xl font-black text-amber-400">100%</div><div class="text-[11px] text-blue-200">Standar Pabrik</div></div>' +
        "</div>" +
        "</div>" +

        '<div class="lg:col-span-5">' +
        '<div class="relative mx-auto max-w-md bg-white p-3 rounded-2xl shadow-2xl">' +
        '<img src="https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=700&q=80" alt="Perlengkapan Laundry Indonesia" class="rounded-xl object-cover w-full h-72 sm:h-80">' +
        '<div class="absolute -bottom-5 -left-5 bg-slate-900 text-white p-4 rounded-xl shadow-xl border border-slate-800 flex items-center gap-3">' +
        '<div class="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center text-white text-xl"><i class="fa-solid fa-boxes-stacked"></i></div>' +
        '<div><div class="text-xs text-slate-400">Stok Lengkap & Ready</div><div class="font-bold text-sm text-amber-400">Grosir & Eceran</div></div>' +
        "</div>" +
        "</div>" +
        "</div>" +

        "</div></div></section>" +

        '<section class="py-14 bg-white border-b border-slate-100">' +
        '<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">' +
        '<div class="text-center max-w-2xl mx-auto mb-12">' +
        '<span class="text-xs font-bold uppercase tracking-wider text-brandOrange-500">Keunggulan Layanan & Produk</span>' +
        '<h2 class="text-2xl md:text-3xl font-extrabold text-royal-900 mt-1">Mengapa Memilih Produk Kami?</h2>' +
        "</div>" +
        '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">' +
        featureCard("fa-wand-magic-sparkles", "bg-royal-100 text-royal-700", "Bibit Parfum Grade A", "Aroma eksklusif mewah tahan hingga 14 hari di dalam lemari dan tidak meninggalkan noda pada pakaian.") +
        featureCard("fa-soap", "bg-amber-100 text-amber-600", "Deterjen Konsentrat", "Rendah busa (low foam), ramah lingkungan, hemat takaran, dan aman untuk mekanik mesin cuci matic.") +
        featureCard("fa-truck-ramp-box", "bg-emerald-100 text-emerald-600", "Suplai Seluruh Indonesia", "Bekerjasama dengan berbagai ekspedisi & kurir terpercaya untuk pengiriman cepat ke seluruh daerah.") +
        featureCard("fa-tags", "bg-purple-100 text-purple-600", "Harga Pabrik Langsung", "Harga bersahabat untuk usaha laundry kiloan, hotel, instansi, maupun pemakaian rumah tangga.") +
        "</div></div></section>" +

        '<section id="katalog-produk" class
