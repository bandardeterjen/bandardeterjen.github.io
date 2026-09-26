(function() {
  'use strict';

  const CSV_PRODUCTS_URL = 'https://bandardeterjen.github.io/product/belanja/daftarproduk.csv';
  const CSV_PHONE_URL    = 'https://bandardeterjen.github.io/product/belanja/daftartelpon.csv';
  const CSV_WILAYAH_URL  = 'https://bandardeterjen.github.io/product/belanja/daftarwilayah.csv';

  let DATA_PRODUK = [];
  let DATA_WILAYAH = [];
  let DATA_PHONE = {
    primary: "085773009666",
    formatted: "0857-7300-9666"
  };

  let CartState = JSON.parse(localStorage.getItem('indonesia_cart')) || [];
  let CurrentProductPage = 1;
  const ProductsPerPage = 6;
  const MAX_PAGES_LIMIT = 3;

  let PersistentLocation = {
    districtSlug: null,
    villageName: null
  };

  function slugify(text) {
    return (text || '').toString().toLowerCase().trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  }

  function formatRupiah(num) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num || 0);
  }

  function parseCSV(text) {
    const lines = text.split('\n').filter(l => l.trim() !== '');
    if (lines.length === 0) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    return lines.slice(1).map(line => {
      const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      return headers.reduce((obj, header, i) => {
        let val = values[i] ? values[i].trim() : '';
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        obj[header] = val;
        return obj;
      }, {});
    });
  }

  function setDynamicSEO(title, desc, image) {
    document.title = title;
    const pt = document.getElementById('page-title'); if (pt) pt.innerText = title;
    const pd = document.getElementById('page-desc'); if (pd) pd.setAttribute("content", desc);
    
    const ot = document.getElementById('og-title'); if (ot) ot.setAttribute("content", title);
    const od = document.getElementById('og-desc'); if (od) od.setAttribute("content", desc);
    const ou = document.getElementById('og-url'); if (ou) ou.setAttribute("content", window.location.href);
    const oi = document.getElementById('og-image'); if (oi && image) oi.setAttribute("content", image);
    
    const tt = document.getElementById('tw-title'); if (tt) tt.setAttribute("content", title);
    const td = document.getElementById('tw-desc'); if (td) td.setAttribute("content", desc);
    const ti = document.getElementById('tw-image'); if (ti && image) ti.setAttribute("content", image);
  }

  window.navigate = function(hashPath) {
    window.location.hash = hashPath;
    renderApp();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.toggleMobileNav = function() {
    const el = document.getElementById('mobile-nav');
    if (el) el.classList.toggle('hidden');
  };

  function showBlgToast(msg, isSuccess = true) {
    const toast = document.getElementById('blg-toast');
    if (!toast) return;
    toast.style.backgroundColor = isSuccess ? '#10b981' : '#f43f5e';
    toast.innerHTML = msg;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 3500);
  }

  window.toggleCartDrawer = function(show) {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (show) {
      syncCartFormLocation();
      drawer.classList.add('open');
      overlay.classList.add('show');
    } else {
      drawer.classList.remove('open');
      overlay.classList.remove('show');
    }
  };

  function saveCart() {
    localStorage.setItem('indonesia_cart', JSON.stringify(CartState));
    renderCartUI();
  }

  window.addToCart = function(productId, openDrawer = true) {
    const prod = DATA_PRODUK.find(p => p.id === productId);
    if (!prod) return;
    const existing = CartState.find(item => item.id === productId);
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
    showBlgToast(`✓ ${prod.title} ditambahkan ke keranjang`);
    if (openDrawer) {
      toggleCartDrawer(true);
    }
  };

  window.updateCartQty = function(productId, delta) {
    const item = CartState.find(i => i.id === productId);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      CartState = CartState.filter(i => i.id !== productId);
    }
    saveCart();
  };

  function renderCartUI() {
    const container = document.getElementById('cart-items-container');
    const badge = document.getElementById('nav-cart-badge');
    const totalEl = document.getElementById('cart-total-price');
    const countLabel = document.getElementById('cart-item-count-label');
    const checkoutWrapper = document.getElementById('cart-checkout-wrapper');
    const totalQty = CartState.reduce((sum, item) => sum + item.qty, 0);
    const grandTotal = CartState.reduce((sum, item) => sum + (item.price * item.qty), 0);
    if (badge) badge.innerText = totalQty;
    if (countLabel) countLabel.innerText = `${totalQty} item`;
    if (totalEl) totalEl.innerText = formatRupiah(grandTotal);
    if (!container) return;
    if (CartState.length === 0) {
      container.innerHTML = `
        <div class="text-center py-10 text-slate-400 space-y-2 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <i class="fa-solid fa-cart-arrow-down text-4xl text-slate-300"></i>
          <p class="text-xs font-semibold">Keranjang belanja Anda masih kosong.</p>
          <p class="text-[11px] text-slate-400">Silakan pilih produk dari katalog kami.</p>
        </div>
      `;
      if (checkoutWrapper) checkoutWrapper.style.opacity = '0.5';
      return;
    }
    if (checkoutWrapper) checkoutWrapper.style.opacity = '1';
    container.innerHTML = CartState.map(item => `
      <div class="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
        <img src="${item.image}" alt="${item.title}" class="w-14 h-14 object-cover rounded-lg bg-slate-100 shrink-0">
        <div class="flex-1 min-w-0">
          <h4 class="font-bold text-xs text-slate-900 truncate">${item.title}</h4>
          <div class="text-orange font-extrabold text-xs mt-0.5">${formatRupiah(item.price)}</div>
          <div class="text-[10px] text-slate-400 font-semibold">Subtotal: ${formatRupiah(item.price * item.qty)}</div>
        </div>
        <div class="flex items-center gap-1.5 shrink-0 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button onclick="updateCartQty(${item.id}, -1)" class="w-6 h-6 rounded bg-white hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shadow-sm">-</button>
          <span class="text-xs font-bold px-1.5 text-slate-800">${item.qty}</span>
          <button onclick="updateCartQty(${item.id}, 1)" class="w-6 h-6 rounded bg-white hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shadow-sm">+</button>
        </div>
      </div>
    `).join('');
  }

  function syncCartFormLocation() {
    const kecSelect = document.getElementById('co-kecamatan');
    const desaSelect = document.getElementById('co-desa');
    if (!kecSelect) return;
    kecSelect.innerHTML = '<option value="">Pilih Wilayah</option>' + 
      DATA_WILAYAH.map(d => `<option value="${d.nama}" ${PersistentLocation.districtSlug === d.slug ? 'selected' : ''}>${d.nama}</option>`).join('');
    updateCartDesaOptions();
    kecSelect.onchange = function() {
      const selectedKec = DATA_WILAYAH.find(d => d.nama === kecSelect.value);
      if (selectedKec) {
        PersistentLocation.districtSlug = selectedKec.slug;
        PersistentLocation.villageName = null;
      } else {
        PersistentLocation.districtSlug = null;
        PersistentLocation.villageName = null;
      }
      updateCartDesaOptions();
    };
    desaSelect.onchange = function() {
      PersistentLocation.villageName = desaSelect.value || null;
    };
  }

  function updateCartDesaOptions() {
    const kecSelect = document.getElementById('co-kecamatan');
    const desaSelect = document.getElementById('co-desa');
    if (!desaSelect) return;
    const selectedKec = DATA_WILAYAH.find(d => d.nama === kecSelect.value);
    if (selectedKec && selectedKec.desa) {
      desaSelect.innerHTML = '<option value="">Pilih Area/Kecamatan</option>' + 
        selectedKec.desa.map(ds => `<option value="${ds}" ${PersistentLocation.villageName === ds ? 'selected' : ''}>${ds}</option>`).join('');
    } else {
      desaSelect.innerHTML = '<option value="">Pilih Area/Kecamatan</option>';
    }
  }

  async function loadAllCSVData() {
    try {
      const [pRes, tRes, wRes] = await Promise.allSettled([
        fetch(CSV_PRODUCTS_URL).then(r => r.text()),
        fetch(CSV_PHONE_URL).then(r => r.text()),
        fetch(CSV_WILAYAH_URL).then(r => r.text())
      ]);
      if (pRes.status === 'fulfilled' && pRes.value.trim().length > 10) {
        const parsed = parseCSV(pRes.value);
        if (parsed && parsed.length > 0) {
          DATA_PRODUK = parsed.map((p, idx) => ({
            id: parseInt(p.id) || (idx + 1),
            slug: p.slug || slugify(p.title || p.nama || `produk-${idx+1}`),
            title: p.title || p.nama || "Produk Laundry",
            price: parseInt(p.price || p.harga) || 0,
            image: p.image || p.thumbnail || "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=600&q=80",
            description: p.description || p.deskripsi || "Produk dan perlengkapan laundry berkualitas standar pabrik.",
            fitur: p.fitur ? (Array.isArray(p.fitur) ? p.fitur : p.fitur.split('|').map(f => f.trim())) : ["Kualitas Terjamin", "Siap Pakai", "Harga Bersahabat"]
          }));
        }
      }
      if (tRes.status === 'fulfilled' && tRes.value.trim().length > 5) {
        const parsedPhone = parseCSV(tRes.value);
        if (parsedPhone && parsedPhone.length > 0) {
          const row = parsedPhone[0];
          DATA_PHONE.primary = row.nomorWA || row.primary || row.phone || "085773009666";
          DATA_PHONE.formatted = row.formatted || DATA_PHONE.primary;
        }
      }
      if (wRes.status === 'fulfilled' && wRes.value.trim().length > 10) {
        const parsedWil = parseCSV(wRes.value);
        if (parsedWil && parsedWil.length > 0) {
          const grouped = {};
          parsedWil.forEach(row => {
            const kec = row.wilayah || row.kota || row.kabupaten || row.kecamatan || row.district;
            const desa = row.area || row.kelurahan || row.desa || row.village;
            if (!kec) return;
            const s = slugify(kec);
            if (!grouped[s]) {
              grouped[s] = {
                slug: s,
                nama: kec,
                deskripsi: row.deskripsi || `Distribusi resmi sabun deterjen, parfum, dan perlengkapan laundry di area ${kec} dan sekitarnya.`,
                desa: []
              };
            }
            if (desa && !grouped[s].desa.includes(desa)) {
              grouped[s].desa.push(desa);
            }
          });
          DATA_WILAYAH = Object.values(grouped);
        }
      }
    } catch (err) {
      console.error("Gagal memuat dataset CSV eksternal:", err);
    }
  }

  function renderApp() {
    const hash = window.location.hash.replace(/^#\/?/, '');
    const parts = hash.split('/').filter(Boolean);
    if (parts[0] === 'produk-detail' && parts[1]) {
      const prodSlug = parts[1];
      const distSlug = parts[2] || PersistentLocation.districtSlug || null;
      const villName = parts[3] ? decodeURIComponent(parts[3]) : (parts[2] ? null : PersistentLocation.villageName);
      if (distSlug) PersistentLocation.districtSlug = distSlug;
      if (villName) PersistentLocation.villageName = villName;
      const product = DATA_PRODUK.find(p => p.slug === prodSlug) || DATA_PRODUK[0];
      const district = distSlug ? DATA_WILAYAH.find(d => d.slug === distSlug) : null;
      if (product) {
        renderProductDetailView(product, district, villName);
        return;
      }
    }
    if (parts[0] === 'wilayah' && parts[1]) {
      const distSlug = parts[1];
      const villName = parts[2] ? decodeURIComponent(parts[2]) : null;
      PersistentLocation.districtSlug = distSlug;
      PersistentLocation.villageName = villName;
      const district = DATA_WILAYAH.find(d => d.slug === distSlug);
      if (district) {
        renderDistrictDetailView(district, villName);
        return;
      }
    }
    renderHomeView();
  }

  function renderHomeView() {
    const phone = DATA_PHONE.primary;
    setDynamicSEO(
      `${phone} Pusat Sabun, Parfum & Perlengkapan Laundry Indonesia`,
      "Pusat distributor deterjen laundry, bibit parfum wangi tahan lama grade A, softener, plastik packing, hanger, dan perlengkapan laundry lengkap seluruh Indonesia.",
      "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=800&q=80"
    );
    const html = `
      <section class="relative bg-royal-gradient text-white overflow-hidden py-16 md:py-24">
        <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div class="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold border border-white/20">
                <span class="w-2 h-2 rounded-full brand-orange"></span> Formulasi Pabrik Kimia & Perlengkapan Laundry
              </div>
              <h1 class="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                Pusat Sabun, Parfum & <span class="brand-orange">Perlengkapan Laundry</span> di Indonesia
              </h1>
              <p class="text-sm md:text-base text-blue-100 max-w-2xl leading-relaxed">
                Solusi lengkap deterjen cair matic konsentrat, pelembut serat kain, bibit parfum murni tahan 14 hari, plastik packing, dan peralatan usaha laundry kiloan maupun satuan se-Indonesia.
              </p>
              <div class="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <a href="#katalog-produk" class="font-bold text-sm px-7 py-3.5 rounded-xl shadow-xl transition flex items-center gap-2 text-white bg-orange hover:bg-orange/90">
                  <i class="fa-solid fa-cart-shopping"></i> Belanja Produk
                </a>
                <a href="#wilayah" class="bg-white/15 hover:bg-white/25 text-white font-bold text-sm px-6 py-3.5 rounded-xl backdrop-blur-sm border border-white/20 transition">
                  Lihat Area Wilayah ↓
                </a>
              </div>
              <div class="grid grid-cols-3 gap-3 pt-6 border-t border-white/15 text-left">
                <div>
                  <div class="text-xl md:text-2xl font-black text-amber-400">14 Hari</div>
                  <div class="text-[11px] text-blue-200">Wangi Tahan Lama</div>
                </div>
                <div>
                  <div class="text-xl md:text-2xl font-black text-amber-400">Nasional</div>
                  <div class="text-[11px] text-blue-200">Pengiriman Cepat</div>
                </div>
                <div>
                  <div class="text-xl md:text-2xl font-black text-amber-400">100%</div>
                  <div class="text-[11px] text-blue-200">Standar Pabrik</div>
                </div>
              </div>
            </div>
            <div class="lg:col-span-5">
              <div class="relative mx-auto max-w-md bg-white p-3 rounded-2xl shadow-2xl">
                <img src="https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=700&q=80" alt="Perlengkapan Laundry Indonesia" class="rounded-xl object-cover w-full h-72 sm:h-80">
                <div class="absolute -bottom-5 -left-5 bg-slate-900 text-white p-4 rounded-xl shadow-xl border border-slate-800 flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center text-white text-xl">
                    <i class="fa-solid fa-boxes-stacked"></i>
                  </div>
                  <div>
                    <div class="text-xs text-slate-400">Stok Lengkap & Ready</div>
                    <div class="font-bold text-sm text-amber-400">Grosir & Eceran</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section class="py-14 bg-white border-b border-slate-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-2xl mx-auto mb-12">
            <span class="text-xs font-bold uppercase tracking-wider brand-orange">Keunggulan Layanan & Produk</span>
            <h2 class="text-2xl md:text-3xl font-extrabold text-royal-900 mt-1">Mengapa Memilih Produk Kami?</h2>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition">
              <div class="w-12 h-12 rounded-xl bg-royal-100 text-royal-700 flex items-center justify-center text-xl mb-4 font-black">
                <i class="fa-solid fa-wand-magic-sparkles"></i>
              </div>
              <h3 class="font-bold text-base text-slate-900 mb-2">Bibit Parfum Grade A</h3>
              <p class="text-xs text-slate-600 leading-relaxed">Aroma eksklusif mewah tahan hingga 14 hari di dalam lemari dan tidak meninggalkan noda pada pakaian.</p>
            </div>
            <div class="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition">
              <div class="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl mb-4">
                <i class="fa-solid fa-soap"></i>
              </div>
              <h3 class="font-bold text-base text-slate-900 mb-2">Deterjen Konsentrat</h3>
              <p class="text-xs text-slate-600 leading-relaxed">Rendah busa (low foam), ramah lingkungan, hemat takaran, dan aman untuk mekanik mesin cuci matic.</p>
            </div>
            <div class="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition">
              <div class="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl mb-4">
                <i class="fa-solid fa-truck-ramp-box"></i>
              </div>
              <h3 class="font-bold text-base text-slate-900 mb-2">Suplai Seluruh Indonesia</h3>
              <p class="text-xs text-slate-600 leading-relaxed">Bekerjasama dengan berbagai ekspedisi & kurir terpercaya untuk pengiriman cepat ke seluruh daerah.</p>
            </div>
            <div class="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition">
              <div class="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-xl mb-4">
                <i class="fa-solid fa-tags"></i>
              </div>
              <h3 class="font-bold text-base text-slate-900 mb-2">Harga Pabrik Langsung</h3>
              <p class="text-xs text-slate-600 leading-relaxed">Harga bersahabat untuk usaha laundry kiloan, hotel, instansi, maupun pemakaian rumah tangga.</p>
            </div>
          </div>
        </div>
      </section>
      <section id="katalog-produk" class="py-16 bg-slate-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
            <div>
              <span class="text-xs font-bold uppercase tracking-wider brand-orange">Katalog Produk</span>
              <h2 class="text-2xl md:text-3xl font-extrabold text-royal-900 mt-1">Daftar Produk & Perlengkapan Laundry</h2>
              <p class="text-xs md:text-sm text-slate-600 mt-1">Pilih produk yang Anda butuhkan dan masukkan ke keranjang belanja untuk pemesanan multi-produk.</p>
            </div>
            <div class="mt-4 md:mt-0">
              <span class="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-lg">
                <i class="fa-solid fa-circle-check"></i> Pengiriman Aman & Terpercaya
              </span>
            </div>
          </div>
          <div id="home-products-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"></div>
          <div id="home-pagination-container" class="mt-10 flex justify-center items-center gap-1.5 flex-wrap"></div>
        </div>
      </section>
      <section id="wilayah" class="py-16 bg-white border-t border-slate-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-3xl mx-auto mb-12">
            <span class="text-xs font-bold uppercase tracking-wider brand-orange">Jangkauan Pengiriman</span>
            <h2 class="text-2xl md:text-3xl font-extrabold text-royal-900 mt-1">Daftar Wilayah Distribusi Indonesia</h2>
            <p class="text-xs md:text-sm text-slate-600 mt-2">
              Pilih wilayah Anda untuk melihat ketersediaan suplai produk laundry dan daftar area tercover.
            </p>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            ${DATA_WILAYAH.map(dist => `
              <a href="#wilayah/${dist.slug}" onclick="navigate('wilayah/${dist.slug}'); return false;" class="p-3.5 rounded-xl border border-slate-200 hover:border-royal-500 bg-slate-50/70 hover:bg-royal-50 hover:shadow-md transition text-left group flex flex-col justify-between">
                <div>
                  <div class="text-xs font-extrabold text-slate-900 group-hover:text-royal-700 flex items-center justify-between">
                    <span>${dist.nama}</span>
                    <i class="fa-solid fa-chevron-right text-[10px] text-slate-400 group-hover:text-royal-600 transition"></i>
                  </div>
                  <span class="text-[10px] text-slate-500 mt-1 block">${(dist.desa || []).length} Area/Kec</span>
                </div>
                <span class="text-[9px] font-semibold text-emerald-600 mt-2">Suplai Ready</span>
              </a>
            `).join('')}
          </div>
        </div>
      </section>
      <section id="faq" class="py-16 bg-slate-50 border-t border-slate-200">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-10">
            <span class="text-xs font-bold uppercase tracking-wider brand-orange">Informasi Pelanggan</span>
            <h2 class="text-2xl md:text-3xl font-extrabold text-royal-900 mt-1">Pertanyaan yang Sering Diajukan (FAQ)</h2>
          </div>
          <div class="space-y-4">
            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h4 class="font-bold text-sm text-slate-900 mb-2 flex items-center gap-2">
                <i class="fa-solid fa-circle-question text-royal-600"></i> Bagaimana cara berbelanja beberapa barang sekaligus?
              </h4>
              <p class="text-xs text-slate-600 leading-relaxed pl-6">
                Klik tombol <strong>+ Keranjang</strong> pada produk yang Anda inginkan. Buka keranjang belanja di pojok kanan atas, isi nama dan alamat lengkap Anda, lalu klik <strong>Checkout via WhatsApp</strong>.
              </p>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h4 class="font-bold text-sm text-slate-900 mb-2 flex items-center gap-2">
                <i class="fa-solid fa-circle-question text-royal-600"></i> Bagaimana penentuan biaya ongkos kirim?
              </h4>
              <p class="text-xs text-slate-600 leading-relaxed pl-6">
                Ongkos kirim akan dihitung secara langsung oleh CS/seller kami setelah Anda mengirimkan daftar pesanan dan alamat lengkap via WhatsApp, disesuaikan dengan pilihan ekspedisi/kurir terjangkau ke lokasi Anda.
              </p>
            </div>
          </div>
        </div>
      </section>
    `;
    document.getElementById('app-root').innerHTML = html;
    renderPaginatedProductList(CurrentProductPage);
  }

  function renderPaginatedProductList(page) {
    CurrentProductPage = page;
    const totalProducts = DATA_PRODUK.length;
    let totalPages = Math.ceil(totalProducts / ProductsPerPage);
    if (totalPages > MAX_PAGES_LIMIT) totalPages = MAX_PAGES_LIMIT;
    if (totalPages < 1) totalPages = 1;
    const startIndex = (page - 1) * ProductsPerPage;
    const paginatedItems = DATA_PRODUK.slice(startIndex, startIndex + ProductsPerPage);
    const gridEl = document.getElementById('home-products-grid');
    const pagEl = document.getElementById('home-pagination-container');
    if (!gridEl) return;
    const locSuffix = PersistentLocation.districtSlug 
      ? `/${PersistentLocation.districtSlug}${PersistentLocation.villageName ? '/' + encodeURIComponent(PersistentLocation.villageName) : ''}`
      : '';
    if (paginatedItems.length === 0) {
      gridEl.innerHTML = `<div class="col-span-full text-center py-12 text-slate-400">Memuat katalog produk...</div>`;
    } else {
      gridEl.innerHTML = paginatedItems.map(item => `
        <div class="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl transition flex flex-col group">
          <div class="relative h-48 overflow-hidden bg-slate-100">
            <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
          </div>
          <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
            <div>
              <h3 class="font-bold text-base text-slate-900 hover:text-royal-600 transition">
                <a href="#produk-detail/${item.slug}${locSuffix}" onclick="navigate('produk-detail/${item.slug}${locSuffix}'); return false;">
                  ${item.title}
                </a>
              </h3>
              <div class="mt-2 text-xl font-black brand-orange">
                ${formatRupiah(item.price)}
              </div>
              <p class="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                ${item.description}
              </p>
            </div>
            <div class="space-y-2 pt-3 border-t border-slate-100">
              <a href="#produk-detail/${item.slug}${locSuffix}" onclick="navigate('produk-detail/${item.slug}${locSuffix}'); return false;" class="w-full block text-center bg-royal-50 hover:bg-royal-100 text-royal-700 font-bold text-xs py-2 rounded-xl transition">
                <i class="fa-solid fa-circle-info mr-1"></i> Detail Produk
              </a>
              <button onclick="addToCart(${item.id})" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow flex items-center justify-center gap-1.5">
                <i class="fa-solid fa-cart-plus text-sm"></i> + Keranjang
              </button>
            </div>
          </div>
        </div>
      `).join('');
    }
    if (pagEl) {
      if (totalPages <= 1) {
        pagEl.innerHTML = '';
        return;
      }
      let pHTML = '';
      pHTML += `
        <button onclick="renderPaginatedProductList(1)" ${page === 1 ? 'disabled class="opacity-40 cursor-not-allowed px-3 py-1.5 rounded-lg border bg-white text-slate-400 text-xs font-bold"' : 'class="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-royal-50 text-slate-700 hover:text-royal-600 text-xs font-bold transition"'} title="Halaman Pertama">
          <i class="fa-solid fa-angles-left"></i>
        </button>
      `;
      pHTML += `
        <button onclick="renderPaginatedProductList(${page - 1})" ${page === 1 ? 'disabled class="opacity-40 cursor-not-allowed px-3 py-1.5 rounded-lg border bg-white text-slate-400 text-xs font-bold"' : 'class="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-royal-50 text-slate-700 hover:text-royal-600 text-xs font-bold transition"'} title="Halaman Sebelumnya">
          <i class="fa-solid fa-angle-left"></i>
        </button>
      `;
      for (let i = 1; i <= totalPages; i++) {
        pHTML += `
          <button onclick="renderPaginatedProductList(${i})" class="px-3.5 py-1.5 rounded-lg border text-xs font-bold transition ${i === page ? 'bg-royal-600 text-white border-royal-600 shadow' : 'bg-white hover:bg-royal-50 text-slate-700 border-slate-200'}">
            ${i}
          </button>
        `;
      }
      pHTML += `
        <button onclick="renderPaginatedProductList(${page + 1})" ${page === totalPages ? 'disabled class="opacity-40 cursor-not-allowed px-3 py-1.5 rounded-lg border bg-white text-slate-400 text-xs font-bold"' : 'class="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-royal-50 text-slate-700 hover:text-royal-600 text-xs font-bold transition"'} title="Halaman Selanjutnya">
          <i class="fa-solid fa-angle-right"></i>
        </button>
      `;
      pHTML += `
        <button onclick="renderPaginatedProductList(${totalPages})" ${page === totalPages ? 'disabled class="opacity-40 cursor-not-allowed px-3 py-1.5 rounded-lg border bg-white text-slate-400 text-xs font-bold"' : 'class="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-royal-50 text-slate-700 hover:text-royal-600 text-xs font-bold transition"'} title="Halaman Terakhir">
          <i class="fa-solid fa-angles-right"></i>
        </button>
      `;
      pagEl.innerHTML = pHTML;
    }
  }

  function renderProductDetailView(product, district, villageName) {
    const phone = DATA_PHONE.formatted || DATA_PHONE.primary;
    let pageTitle = "";
    let breadcrumbDistrict = "";
    let locationScopeText = "";
    let districtScopeName = "";
    if (villageName && district) {
      districtScopeName = `${villageName}, ${district.nama}`;
      locationScopeText = `di ${villageName}, ${district.nama}`;
      pageTitle = `${phone} ${product.title} ${districtScopeName}`;
      breadcrumbDistrict = `
        <li><span class="mx-2 text-slate-400">/</span></li>
        <li><a href="#produk-detail/${product.slug}" onclick="navigate('produk-detail/${product.slug}'); return false;" class="hover:text-royal-600">${product.title}</a></li>
        <li><span class="mx-2 text-slate-400">/</span></li>
        <li><a href="#produk-detail/${product.slug}/${district.slug}" onclick="navigate('produk-detail/${product.slug}/${district.slug}'); return false;" class="hover:text-royal-600">${district.nama}</a></li>
        <li><span class="mx-2 text-slate-400">/</span></li>
        <li class="text-royal-700 font-bold">${villageName}</li>
      `;
    } else if (district) {
      districtScopeName = `${district.nama}`;
      locationScopeText = `di wilayah ${district.nama}`;
      pageTitle = `${phone} ${product.title} ${districtScopeName}`;
      breadcrumbDistrict = `
        <li><span class="mx-2 text-slate-400">/</span></li>
        <li><a href="#produk-detail/${product.slug}" onclick="navigate('produk-detail/${product.slug}'); return false;" class="hover:text-royal-600">${product.title}</a></li>
        <li><span class="mx-2 text-slate-400">/</span></li>
        <li class="text-royal-700 font-bold">${district.nama}</li>
      `;
    } else {
      districtScopeName = `Indonesia`;
      locationScopeText = `seluruh wilayah Indonesia`;
      pageTitle = `${phone} ${product.title} ${districtScopeName}`;
      breadcrumbDistrict = `
        <li><span class="mx-2 text-slate-400">/</span></li>
        <li class="text-royal-700 font-bold">${product.title}</li>
      `;
    }
    const productDescription = product.description 
      ? `${product.description} - Melayani pengiriman ke ${districtScopeName}. Harga ${formatRupiah(product.price)}.`
      : `Jual ${product.title} ${locationScopeText}. Harga ${formatRupiah(product.price)}. Standar pabrik siap kirim ke lokasi Anda.`;
    setDynamicSEO(pageTitle, productDescription, product.image);
    const html = `
      <div class="bg-white border-b border-slate-200 py-4">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ol class="flex flex-wrap items-center text-xs text-slate-600">
            <li><a href="#" onclick="navigate(''); return false;" class="hover:text-royal-600">Beranda</a></li>
            ${breadcrumbDistrict}
          </ol>
        </div>
      </div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div class="lg:col-span-8 space-y-8">
            <div>
              <h1 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-royal-900 leading-tight">
                ${product.title} ${locationScopeText}
              </h1>
              <p class="text-sm text-slate-600 mt-3 leading-relaxed">
                ${product.description}
              </p>
            </div>
            <div class="rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-100">
              <img src="${product.image}" alt="${product.title}" class="w-full h-80 sm:h-96 object-cover">
            </div>
            <div class="prose max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-4">
              <h3 class="text-xl font-bold text-royal-900">Spesifikasi & Keunggulan Produk</h3>
              <p>
                Apakah Anda sedang membutuhkan <strong>${product.title}</strong> berkualitas ${locationScopeText}? Kami hadir memberikan suplai terbaik dengan harga langsung dari distributor.
              </p>
              <p>
                ${product.description}
              </p>
              <div class="bg-royal-50 p-6 rounded-2xl border border-royal-100 my-6">
                <h4 class="font-bold text-royal-900 mb-3 text-base">Spesifikasi Produk:</h4>
                <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-royal-950">
                  ${(product.fitur || []).map(f => `<li class="flex items-center gap-2"><i class="fa-solid fa-circle-check text-emerald-500"></i> ${f}</li>`).join('')}
                  <li class="flex items-center gap-2"><i class="fa-solid fa-circle-check text-emerald-500"></i> Harga: ${formatRupiah(product.price)}</li>
                </ul>
              </div>
              ${district ? `
                <div class="mt-8 pt-6 border-t border-slate-200">
                  <h3 class="text-xl font-bold text-royal-900 mb-3">
                    Daftar Sub-Wilayah / Area di ${district.nama}:
                  </h3>
                  <p class="text-xs sm:text-sm text-slate-600 mb-4">
                    Klik nama area di bawah ini untuk melihat ketersediaan pengiriman langsung ke lokasi Anda:
                  </p>
                  <div class="flex flex-wrap gap-2">
                    ${(district.desa || []).map(ds => `
                      <a href="#produk-detail/${product.slug}/${district.slug}/${encodeURIComponent(ds)}"
                         onclick="navigate('produk-detail/${product.slug}/${district.slug}/${encodeURIComponent(ds)}'); return false;"
                         class="text-xs font-semibold px-3 py-2 rounded-lg border ${villageName === ds ? 'bg-royal-600 text-white border-royal-600 shadow' : 'bg-slate-100 hover:bg-royal-50 text-slate-800 border-slate-200'} transition">
                        ${ds}
                      </a>
                    `).join('')}
                  </div>
                </div>
              ` : `
                <div class="mt-8 pt-6 border-t border-slate-200">
                  <h3 class="text-xl font-bold text-royal-900 mb-3">
                    Pilih Wilayah Pengiriman di Indonesia:
                  </h3>
                  <p class="text-xs sm:text-sm text-slate-600 mb-4">
                    Kami melayani pengiriman ${product.title} ke seluruh Indonesia. Pilih wilayah Anda di bawah ini:
                  </p>
                  <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    ${DATA_WILAYAH.map(d => `
                      <a href="#produk-detail/${product.slug}/${d.slug}" 
                         onclick="navigate('produk-detail/${product.slug}/${d.slug}'); return false;"
                         class="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-royal-50 hover:border-royal-500 text-xs font-bold text-slate-800 hover:text-royal-700 transition flex items-center justify-between">
                        <span>${d.nama}</span>
                        <i class="fa-solid fa-arrow-right text-[10px] text-slate-400"></i>
                      </a>
                    `).join('')}
                  </div>
                </div>
              `}
            </div>
          </div>
          <div class="lg:col-span-4 space-y-6">
            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl sticky top-28 space-y-5">
              <div class="border-b pb-4">
                <span class="text-xs text-slate-500 font-semibold uppercase">Informasi Harga</span>
                <div class="text-3xl font-black brand-orange mt-1">
                  ${formatRupiah(product.price)}
                </div>
                <div class="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1">
                  <i class="fa-solid fa-boxes-stacked"></i> Status: Stok Siap Kirim
                </div>
              </div>
              <div class="space-y-3 text-xs text-slate-600">
                <div class="flex items-center gap-2"><i class="fa-solid fa-check text-emerald-500"></i> Pengiriman Langsung ke Lokasi</div>
                <div class="flex items-center gap-2"><i class="fa-solid fa-check text-emerald-500"></i> Ekspedisi Terjangkau</div>
                <div class="flex items-center gap-2"><i class="fa-solid fa-check text-emerald-500"></i> Jaminan Mutu Terpercaya</div>
              </div>
              <button onclick="addToCart(${product.id})" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm">
                <i class="fa-solid fa-cart-plus text-lg"></i>
                + Tambah ke Keranjang
              </button>
              <div class="text-center pt-2">
                <a href="tel:${phone}" class="text-xs text-slate-500 hover:text-royal-600 font-semibold">
                  <i class="fa-solid fa-phone mr-1"></i> Hotline CS: ${phone}
                </a>
              </div>
            </div>
            <div class="bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <h4 class="font-bold text-sm text-slate-900 mb-3">Produk Lainnya</h4>
              <div class="space-y-2">
                ${DATA_PRODUK.filter(s => s.slug !== product.slug).slice(0, 5).map(other => {
                  const otherLoc = district ? `/${district.slug}${villageName ? '/' + encodeURIComponent(villageName) : ''}` : '';
                  return `
                    <a href="#produk-detail/${other.slug}${otherLoc}" onclick="navigate('produk-detail/${other.slug}${otherLoc}'); return false;" class="block p-2 rounded-lg hover:bg-white text-xs text-slate-700 hover:text-royal-600 font-semibold transition border border-transparent hover:border-slate-200">
                      ${other.title} - <span class="brand-orange">${formatRupiah(other.price)}</span>
                    </a>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    document.getElementById('app-root').innerHTML = html;
  }

  function renderDistrictDetailView(district, villageName) {
    const phone = DATA_PHONE.primary;
    let pageTitle = "";
    let locationText = "";
    let breadcrumbHtml = "";
    if (villageName) {
      pageTitle = `${phone} Sabun, Parfum & Perlengkapan Laundry Di ${villageName} ${district.nama}`;
      locationText = `di Area ${villageName}, ${district.nama}`;
      breadcrumbHtml = `
        <li><span class="mx-2 text-slate-400">/</span></li>
        <li><a href="#wilayah/${district.slug}" onclick="navigate('wilayah/${district.slug}'); return false;" class="hover:text-royal-600">${district.nama}</a></li>
        <li><span class="mx-2 text-slate-400">/</span></li>
        <li class="text-royal-700 font-bold">${villageName}</li>
      `;
    } else {
      pageTitle = `${phone} Sabun, Parfum & Perlengkapan Laundry Di ${district.nama}`;
      locationText = `di Wilayah ${district.nama}`;
      breadcrumbHtml = `
        <li><span class="mx-2 text-slate-400">/</span></li>
        <li class="text-royal-700 font-bold">${district.nama}</li>
      `;
    }
    setDynamicSEO(
      pageTitle,
      `Pusat penjualan deterjen matic, softener, pelicin setrika, plastik, hanger, dan bibit parfum laundry ${locationText}. Siap kirim langsung ke alamat Anda.`,
      "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=800&q=80"
    );
    const lowestPrice = DATA_PRODUK.length > 0 ? Math.min(...DATA_PRODUK.map(p => p.price)) : 10000;
    const html = `
      <div class="bg-white border-b border-slate-200 py-4">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ol class="flex flex-wrap items-center text-xs text-slate-600">
            <li><a href="#" onclick="navigate(''); return false;" class="hover:text-royal-600">Beranda</a></li>
            ${breadcrumbHtml}
          </ol>
        </div>
      </div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div class="lg:col-span-8 space-y-8">
            <div>
              <span class="inline-block bg-royal-100 text-royal-800 text-xs font-extrabold px-3 py-1 rounded-md uppercase tracking-wider mb-2">
                Area Distribusi Resmi
              </span>
              <h1 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-royal-900 leading-tight">
                Suplai Sabun, Parfum & Perlengkapan Laundry ${locationText}
              </h1>
              <p class="text-sm text-slate-600 mt-3 leading-relaxed">
                ${district.deskripsi} Kami melayani pengiriman langsung deterjen cair matic, pelembut pakaian, plastik kemasan, hanger, dan parfum laundry ke ${district.nama}.
              </p>
            </div>
            <div class="rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-100">
              <img src="https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=800&q=80" alt="${district.nama}" class="w-full h-72 sm:h-80 object-cover">
            </div>
            <div class="prose max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-4">
              <h3 class="text-xl font-bold text-royal-900">Katalog Produk Tersedia untuk Area ${district.nama}</h3>
              <p>
                Pilih produk di bawah ini dan masukkan ke keranjang belanja Anda:
              </p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
                ${DATA_PRODUK.map(p => `
                  <div class="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-royal-50 hover:border-royal-500 transition flex items-center justify-between gap-3">
                    <div class="min-w-0">
                      <a href="#produk-detail/${p.slug}/${district.slug}${villageName ? '/' + encodeURIComponent(villageName) : ''}" 
                         onclick="navigate('produk-detail/${p.slug}/${district.slug}${villageName ? '/' + encodeURIComponent(villageName) : ''}'); return false;"
                         class="font-bold text-xs text-slate-900 hover:text-royal-700 block truncate">
                        ${p.title}
                      </a>
                      <span class="brand-orange font-extrabold text-xs mt-0.5 block">${formatRupiah(p.price)}</span>
                    </div>
                    <button onclick="addToCart(${p.id})" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shrink-0 transition flex items-center gap-1">
                      <i class="fa-solid fa-cart-plus"></i> + Beli
                    </button>
                  </div>
                `).join('')}
              </div>
              <div class="pt-6 border-t border-slate-200">
                <h3 class="text-xl font-bold text-royal-900 mb-3">
                  Daftar Sub-Area / Kecamatan di ${district.nama}:
                </h3>
                <div class="flex flex-wrap gap-2">
                  ${(district.desa || []).map(ds => `
                    <a href="#wilayah/${district.slug}/${encodeURIComponent(ds)}" 
                       onclick="navigate('wilayah/${district.slug}/${encodeURIComponent(ds)}'); return false;"
                       class="text-xs font-semibold px-3 py-2 rounded-lg border ${villageName === ds ? 'bg-royal-600 text-white border-royal-600 shadow' : 'bg-slate-100 hover:bg-royal-50 text-slate-800 border-slate-200'} transition">
                      ${ds}
                    </a>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
          <div class="lg:col-span-4 space-y-6">
            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl sticky top-28 space-y-5">
              <div class="border-b pb-4">
                <span class="text-xs text-slate-500 font-semibold uppercase">Layanan Pengiriman</span>
                <h3 class="text-lg font-bold text-royal-900 mt-1">Area ${district.nama}</h3>
                <div class="text-2xl font-black brand-orange mt-2">
                  Harga Mulai ${formatRupiah(lowestPrice)}
                </div>
              </div>
              <div class="space-y-3 text-xs text-slate-600">
                <div class="flex items-center gap-2"><i class="fa-solid fa-check text-emerald-500"></i> Pengiriman Langsung ke ${district.nama}</div>
                <div class="flex items-center gap-2"><i class="fa-solid fa-check text-emerald-500"></i> Stok Grosir & Eceran Ready</div>
                <div class="flex items-center gap-2"><i class="fa-solid fa-check text-emerald-500"></i> Ekspedisi Cepat & Aman</div>
              </div>
              <button onclick="toggleCartDrawer(true)" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm">
                <i class="fa-solid fa-cart-shopping text-lg"></i> Buka Keranjang & Checkout
              </button>
            </div>
            <div class="bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <h4 class="font-bold text-sm text-slate-900 mb-3">Wilayah Lainnya</h4>
              <div class="grid grid-cols-2 gap-2">
                ${DATA_WILAYAH.filter(d => d.slug !== district.slug).slice(0, 10).map(other => `
                  <a href="#wilayah/${other.slug}" onclick="navigate('wilayah/${other.slug}'); return false;" class="text-xs text-slate-600 hover:text-royal-700 py-1 font-medium truncate">
                    • ${other.nama}
                  </a>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    document.getElementById('app-root').innerHTML = html;
  }

  function syncComponentsAndFooter() {
    const phone = DATA_PHONE.primary;
    const formatted = DATA_PHONE.formatted || phone;
    const topPhoneVal = document.getElementById('top-phone-val');
    if (topPhoneVal) topPhoneVal.innerText = formatted;
    const topPhoneLink = document.getElementById('top-phone-link');
    if (topPhoneLink) topPhoneLink.href = `https://wa.me/${phone.replace(/^0/, '62')}`;
    const footerPhoneLink = document.getElementById('footer-phone-link');
    if (footerPhoneLink) {
      footerPhoneLink.innerText = formatted;
      footerPhoneLink.href = `https://wa.me/${phone.replace(/^0/, '62')}`;
    }
    const footerServiceEl = document.getElementById('footer-service-links');
    if (footerServiceEl) {
      footerServiceEl.innerHTML = DATA_PRODUK.slice(0, 6).map(s => `
        <li>
          <a href="#produk-detail/${s.slug}" onclick="navigate('produk-detail/${s.slug}'); return false;" class="hover:text-amber-400 transition flex items-center gap-1.5">
            <i class="fa-solid fa-chevron-right text-[9px] brand-orange"></i> ${s.title}
          </a>
        </li>
      `).join('');
    }
    const footerDistCloud = document.getElementById('footer-districts-cloud');
    if (footerDistCloud) {
      footerDistCloud.innerHTML = DATA_WILAYAH.map(d => `
        <a href="#wilayah/${d.slug}" onclick="navigate('wilayah/${d.slug}'); return false;" class="hover:text-amber-400 hover:underline transition">
          ${d.nama} •
        </a>
      `).join(' ');
    }
  }

  async function initApp() {
    const yearEl = document.getElementById('auto-copyright-year');
    if (yearEl) yearEl.innerText = new Date().getFullYear();
    
    await loadAllCSVData();
    
    syncComponentsAndFooter();
    renderCartUI();
    renderApp();
    window.addEventListener('hashchange', renderApp);

    const checkoutForm = document.getElementById('cart-checkout-form');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (CartState.length === 0) {
          alert('Keranjang belanja Anda masih kosong!');
          return;
        }
        const nama = document.getElementById('co-nama').value.trim();
        const wa = document.getElementById('co-wa').value.trim();
        const kec = document.getElementById('co-kecamatan').value;
        const desa = document.getElementById('co-desa').value;
        const alamat = document.getElementById('co-alamat').value.trim();
        const grandTotal = CartState.reduce((sum, item) => sum + (item.price * item.qty), 0);
        let locTujuan = '';
        if (desa && kec) {
          locTujuan = `${desa}, ${kec}`;
        } else if (kec) {
          locTujuan = `${kec}`;
        } else {
          locTujuan = `Indonesia`;
        }
        let msg = `Halo Admin Indonesia Laundry Listing, saya ingin memesan produk berikut:\n\n`;
        msg += `*DAFTAR PESANAN:*\n`;
        CartState.forEach((item, idx) => {
          const subtotal = item.price * item.qty;
          msg += `${idx + 1}. ${item.title}\n   Jumlah: ${item.qty} x ${formatRupiah(item.price)} = ${formatRupiah(subtotal)}\n`;
        });
        msg += `\n*TOTAL HARGA BARANG:* ${formatRupiah(grandTotal)}\n\n`;
        msg += `*DATA PEMESAN & TUJUAN:*\n`;
        msg += `• Nama: ${nama}\n`;
        if (wa) msg += `• No. WA: ${wa}\n`;
        msg += `• Wilayah: ${locTujuan}\n`;
        msg += `• Alamat Lengkap: ${alamat}\n\n`;
        msg += `_*(Mohon bantu hitungkan ongkos kirim sesuai pilihan ekspedisi/kurir dan jarak tempuh ke alamat di atas).* Terima kasih!_`;
        const phone = DATA_PHONE.primary || "085773009666";
        const waTarget = phone.startsWith('0') ? '62' + phone.slice(1) : phone;
        const urlWA = `https://api.whatsapp.com/send?phone=${waTarget}&text=${encodeURIComponent(msg)}`;
        showBlgToast("Membuka WhatsApp...");
        setTimeout(() => {
          window.open(urlWA, '_blank');
        }, 300);
      });
    }
  }

  window.addEventListener('DOMContentLoaded', initApp);
})();
