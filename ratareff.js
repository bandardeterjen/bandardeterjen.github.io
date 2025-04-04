document.addEventListener('DOMContentLoaded', () => {
  const userEmailInput = document.getElementById('user-email');
  const generateLinksButton = document.getElementById('generate-links');
  const articleContainer = document.getElementById('article-container');
  const prevPageButton = document.getElementById('prev-page');
  const nextPageButton = document.getElementById('next-page');
  const pageInfo = document.getElementById('page-info');

   // Sample articles data
  const articles = [
	 { title: 'Resep Sabun', 
     description: 'Tingkatkan keahlian Anda dalam membuat sabun dengan kumpulan resep sabun teruji yang kami tawarkan. Pelajari cara membuat berbagai jenis sabun, dari sabun laundry ekonomis hingga sabun pembersih kamar mandi premium.', 
     productUrl: 'https://ratakan.com/product/resep-sabun-lengkap-955' },
	 { title: 'Resep Otomotif', 
     description: 'Dapatkan Resep Otomotif Lengkap untuk membuat berbagai produk perawatan mobil dan motor Anda sendiri! Dengan resep teruji dan sudah dipraktekkan,', 
     productUrl: 'https://ratakan.com/product/resep-lengkap-otomotif--710' },
	 { title: 'Resep Parfum', 
     description: 'Tingkatkan keahlian Anda dalam membuat parfum dengan kumpulan resep parfum teruji yang kami tawarkan! Pelajari cara membuat berbagai jenis parfum, dari deodoran alami hingga parfum mobil', 
     productUrl: 'https://ratakan.com/product/resep-parfum-lengkap-2C8' },
	 { title: 'Resep Laundry Sepatu', 
     description: 'Dapatkan Resep Kimia Laundry Sepatu, Helm, dan Tas untuk menjaga penampilan dan memperpanjang usia barang-barang kesayangan Anda! Dengan resep teruji dan sudah dipraktekkan.', 
     productUrl: 'https://ratakan.com/product/resep-lengkap-kimia-laundry-sepatu-A61' },
	 { title: 'Resep Kimia Laundry', 
     description: 'Tingkatkan kualitas laundry dan perawatan sepatu Anda dengan Resep Kimia Laundry Lengkap. Dapatkan resep teruji dan sudah dipraktekkan untuk berbagai kebutuhan.', 
     productUrl: 'https://ratakan.com/product/resep-kimia-laundry-A0B' },
	 { title: 'Resep Homecare', 
     description: 'Dapatkan Resep Homecare Lengkap untuk membuat berbagai produk pembersih rumah tangga sendiri! Dengan resep teruji dan sudah dipraktekkan, Anda bisa membuat produk Homecare', 
     productUrl: 'https://ratakan.com/product/resep-lengkap-homecare--6B1' },
	 { title: 'Pelatihan Online Cara Membuat Shampoo Mobil Touchless', 
     description: 'Di era digital saat ini, semakin banyak orang yang memilih untuk melakukan pelatihan atau belajar secara online. Salah satu topik yang menarik adalah pelatihan membuat shampoo mobil touchless atau tanpa sentuh. Metode ini semakin populer karena menawarkan kemudahan, efisiensi, dan hasil yang maksimal dalam mencuci mobil. Melalui pelatihan online, Anda dapat belajar cara membuat shampoo mobil touchless kapan saja dan di mana saja.', 
     productUrl: 'https://ratakan.com/product/pelatihan-online-cara-membuat-shampoo-mobil-touchless-sampo-tanpa-sentuh--1AB' },
	 { title: 'Pelatihan Online Softener Pelembut Pakaian Laundry', 
     description: 'Apakah Anda ingin menghasilkan pelembut pakaian berkualitas yang dapat memberikan keharuman segar sekaligus menjaga kelembutan serat kain? Kini, Anda dapat mempelajari cara membuat softener laundry sendiri melalui Pelatihan Online Softener Laundry . Pelatihan ini dirancang khusus untuk membantu Anda menciptakan produk pelembut pakaian yang wangi, hemat, dan berkualitas tinggi, baik untuk keperluan pribadi maupun bisnis.', 
     productUrl: 'https://ratakan.com/product/kursus-softener-61C' },
	 { title: 'Pelatihan Online Semir Ban', 
     description: 'Apakah Anda memiliki usaha salon mobil, pencucian motor/mobil (doorsmeer), atau ingin memperluas peluang bisnis dengan menjual produk sendiri? Pelatihan Online Semir Ban adalah langkah tepat untuk membantu Anda menciptakan semir ban buatan sendiri yang berkualitas tinggi. Pelatihan ini dirancang khusus untuk memberikan keterampilan praktis dalam membuat semir ban yang efektif dan bernilai jual tinggi, baik untuk keperluan pribadi maupun bisnis.', 
     productUrl: 'https://ratakan.com/product/pelatihan-online-semir-ban-96B' },
	 { title: 'Pelatihan Online Shampoo Karpet', 
     description: 'Apakah Anda memiliki usaha cuci karpet atau tertarik untuk memulai bisnis serupa? Atau mungkin Anda ingin belajar membuat shampoo karpet sendiri untuk kebutuhan pribadi? Pelatihan Online Shampoo Karpet adalah langkah tepat untuk Anda! Dalam pelatihan ini, Anda akan mempelajari cara membuat sabun cuci karpet yang ampuh, hemat, dan bisa disesuaikan dengan kebutuhan Anda.', 
     productUrl: 'https://ratakan.com/product/pelatihan-online-sampo-karpet-862' },
	 { title: 'Pelatihan Online Sabun Pembersih Kaca', 
     description: 'Apakah Anda ingin belajar membuat sabun pembersih kaca yang ampuh dan hemat biaya? Pelatihan Online Sabun Pembersih Kaca adalah solusi sempurna bagi Anda yang ingin menciptakan pembersih kaca untuk rumah tinggal, perkantoran, atau bahkan mobil. Pelatihan ini dirancang khusus agar mudah diikuti, membantu Anda menghasilkan produk berkualitas tinggi yang praktis untuk digunakan.', 
     productUrl: 'https://ratakan.com/product/pelatihan-online-sabun-pembersih-kaca-3D9' },
	 { title: 'Pelatihan Online Sabun Pel Lantai', 
     description: 'Mengepel lantai adalah bagian dari aktivitas kebersihan yang rutin dilakukan, baik di rumah, kantor, maupun tempat usaha. Namun, pernahkah Anda berpikir untuk membuat sabun pel lantai sendiri yang berkualitas dan hemat biaya? Dengan mengikuti Pelatihan Online Sabun Pel Lantai , Anda akan mempelajari cara membuat sabun pel lantai yang efektif untuk membersihkan sekaligus menjaga kebersihan permukaan lantai. Cocok untuk keperluan pribadi, usaha kebersihan, atau bahkan dijadikan peluang bisnis!', 
     productUrl: 'https://ratakan.com/product/pelatihan-online-sabun-pel-lantai-801' },
	  { title: 'Pelatihan Online Sabun Mandi Cair', 
     description: 'Pernahkah Anda berpikir untuk memiliki sabun mandi cair buatan sendiri yang sesuai dengan kebutuhan dan preferensi pribadi? Pelatihan Online Sabun Mandi Cair adalah kesempatan emas bagi Anda untuk belajar membuat sabun cair yang unik, berkualitas, dan penuh kreasi. Pelatihan ini tidak hanya membantu Anda menciptakan produk untuk digunakan sendiri, tetapi juga membuka peluang untuk menghasilkan sabun dengan nilai jual tinggi!', 
     productUrl: 'https://ratakan.com/product/pelatihan-online-sabun-mandi-cair-E5E' },
	 { title: 'Pelatihan Online Sabun Mandi Batang', 
     description: 'Apakah Anda pernah membayangkan memiliki sabun mandi batang dengan kreasi unik sesuai selera? Pelatihan Online Sabun Mandi Batang adalah solusi sempurna untuk Anda yang ingin belajar membuat sabun mandi sendiri dengan bahan dan desain yang Anda pilih. Tak hanya untuk penggunaan pribadi, pelatihan ini juga membuka peluang besar bagi Anda untuk memulai bisnis sabun mandi custom yang menjanjikan.', 
     productUrl: 'https://ratakan.com/product/pelatihan-online-sabun-mandi-batang-042' },
	 { title: 'Pelatihan Membuat Sabun Mandi Batang Transparan', 
     description: 'Sabun mandi transparan merupakan salah satu jenis sabun yang semakin populer di kalangan masyarakat. Selain memiliki tampilan yang menarik, sabun transparan juga memiliki berbagai manfaat bagi kulit. Dalam proses pembuatannya, sabun transparan biasanya dibuat dengan metode hot process. Metode ini menghasilkan biang sabun yang transparan dan dapat diolah lebih lanjut dengan penambahan pewarna serta pewangi.', 
     productUrl: 'https://ratakan.com/product/pelatihan-membuat-sabun-mandi-batang-transparan-DA0' },
	 { title: 'Pelatihan Online Sabun Cuci Piring', 
     description: 'Apakah Anda ingin membuat sabun cuci piring cair yang ampuh dan hemat untuk membersihkan perabotan rumah tangga? Pelatihan Online Sabun Cuci Piring adalah pilihan yang tepat! Pelatihan ini dirancang khusus untuk memberikan panduan praktis dalam menciptakan produk pembersih berkualitas tinggi dengan hasil maksimal.', 
     productUrl: 'https://ratakan.com/product/ecourse-cupir-C55' },
	 { title: 'Pelatihan Online Sabun Colek', 
     description: 'Apakah Anda ingin mempelajari cara membuat sabun colek sendiri yang serbaguna, hemat, dan berkualitas? Pelatihan Online Sabun Colek adalah langkah tepat untuk Anda! Dengan pelatihan ini, Anda akan diajarkan cara menciptakan sabun colek dalam bentuk krim atau jelly yang dapat digunakan untuk berbagai kebutuhan, seperti mencuci perabotan rumah tangga, pakaian, kain, hingga perlengkapan lainnya. Tidak hanya untuk keperluan pribadi, pelatihan ini juga membuka peluang bisnis yang menjanjikan', 
     productUrl: 'https://ratakan.com/product/pelatihan-online-sabun-colek-201' },
	 { title: 'Pelatihan Online Pewangi Setrika', 
     description: 'Bayangkan pakaian yang Anda setrika tidak hanya menjadi rapi, tetapi juga harum semerbak dengan aroma yang menyegarkan. Kini, Anda dapat mempelajari cara membuat pewangi setrika sendiri melalui Pelatihan Online Pewangi Setrika . Pelatihan ini dirancang khusus untuk Anda yang ingin menciptakan pewangi berkualitas tinggi, baik untuk kebutuhan pribadi maupun untuk membuka peluang bisnis menjual pewangi ke usaha laundry dan rumah tangga.', 
     productUrl: 'https://ratakan.com/product/pelatihan-online-pewangi-setrika-4BA' },
	 { title: 'Pelatihan Online Pemutih Pakaian', 
     description: 'Apakah Anda memiliki bisnis laundry dan sering membutuhkan pemutih pakaian untuk menghilangkan noda membandel? Atau mungkin Anda ingin belajar membuat produk pemutih sendiri untuk kebutuhan rumah tangga? Pelatihan Online Pemutih Pakaian adalah solusi terbaik untuk Anda! Dengan mengikuti pelatihan ini, Anda akan mempelajari cara membuat pemutih pakaian yang efektif, hemat biaya, dan sesuai kebutuhan.', 
     productUrl: 'https://ratakan.com/product/pelatihan-online-pemutih-pakaian-92A' },
	 { title: 'Pelatihan Online Cara Membuat Pembusa Sabun', 
     description: 'Membeli pembusa sabun di pasaran memang praktis, tetapi harganya yang cukup mahal dapat memberatkan anggaran rumah tangga Anda. Namun, Anda tidak perlu khawatir. Dengan sedikit peralatan dan bahan-bahan sederhana, Anda dapat membuat pembusa sabun sendiri di rumah. Selain lebih hemat, Anda juga dapat menyesuaikan formula sesuai dengan kebutuhan Anda', 
     productUrl: 'https://ratakan.com/product/pelatihan-online-cara-membuat-pembusa-sabun--9F4' },
	 { title: 'Pelatihan Online Parfum Sepatu', 
     description: 'Apakah Anda pernah merasa kesal dengan bau tidak sedap yang muncul dari sepatu, baik setelah seharian dipakai atau disimpan dalam waktu lama? Kini, Anda bisa mengatasi masalah ini dengan Pelatihan Online Parfum Sepatu , yang akan mengajarkan Anda cara membuat parfum sepatu buatan sendiri. Tidak hanya untuk kebutuhan pribadi, keterampilan ini juga dapat membuka peluang bisnis baru dengan menjual parfum sepatu berkualitas.', 
     productUrl: 'https://ratakan.com/product/pelatihan-online-parfum-sepatu-BD8' },
	 { title: 'Pelatihan Online Parfum Mobil', 
     description: 'Apakah Anda ingin menciptakan parfum gantung mobil sendiri yang segar, tahan lama, dan sesuai dengan gaya Anda? Pelatihan Online Parfum Mobil adalah solusi praktis bagi Anda yang ingin belajar membuat pewangi kendaraan yang berkualitas tinggi. Tidak hanya untuk kebutuhan pribadi, pelatihan ini juga membuka peluang besar bagi Anda untuk memulai bisnis parfum gantung mobil dengan desain dan aroma yang menarik.', 
     productUrl: 'https://ratakan.com/product/pelatihan-online-parfum-mobil-F7A' },
	 { title: 'Pelatihan Online Parfum Laundry', 
     description: 'Dalam industri laundry, memberikan sentuhan akhir berupa pewangi pakaian yang segar dan tahan lama adalah hal yang sangat penting. Kini, Anda dapat mempelajari cara membuat pewangi laundry sendiri melalui Pelatihan Online Parfum Laundry . Dengan pelatihan ini, Anda akan mendapatkan pengetahuan dan keterampilan untuk menciptakan pewangi berkualitas, yang tidak hanya hemat tetapi juga sesuai dengan kebutuhan Anda.', 
     productUrl: 'https://ratakan.com/product/pelatihan-online-parfum-laundry-135' },
    { title: 'Pelatihan Online Parfum Karpet', 
     description: 'Apakah Anda ingin menghilangkan bau tak sedap dari karpet dan menggantinya dengan aroma segar yang tahan lama? Kini, Anda bisa membuat parfum karpet sendiri melalui Pelatihan Online Parfum Karpet . Pelatihan ini akan mengajarkan Anda cara menciptakan parfum karpet berkualitas tinggi, baik berbasis non alkohol maupun solventbase . Cocok untuk penggunaan di rumah, kantor, hingga karpet masjid yang memerlukan perhatian khusus.', 
     productUrl: 'https://ratakan.com/product/pelatihan-online-parfum-karpet-7E1' },
    { title: 'Pelatihan Online Cara Membuat Laundry Bar Soap', 
     description: 'Mencuci pakaian yang kotor dan bernoda memang menjadi tantangan tersendiri bagi sebagian orang. Apalagi jika noda yang menempel sulit hilang, seperti noda darah atau kotoran lainnya. Untuk mengatasi hal ini, Anda bisa membuat sendiri laundry bar soap atau sabun batang padat khusus untuk mencuci pakaian. Selain efektif membersihkan, sabun ini juga bisa digunakan untuk membersihkan sepatu.', 
     productUrl: 'https://ratakan.com/product/pelatihan-online-cara-membuat-laundry-bar-soap-77B' },
    { title: 'Pelatihan Online Klinsol Karbol Hitam', 
     description: 'Apakah Anda ingin membuat disinfektan yang ampuh, hemat, dan ramah lingkungan dengan kreasi Anda sendiri? Pelatihan Online Klinsol Karbol Hitam adalah langkah mudah untuk mempelajari cara membuat karbol hitam berkualitas tinggi, yang cocok untuk berbagai kebutuhan kebersihan. Karbol ini terbuat dari bahan alami menggunakan metode hot process dan dapat disesuaikan dengan aroma segar seperti pine atau sereh. Pelatihan ini tidak hanya membantu Anda menciptakan produk untuk penggunaan pribadi, tetapi juga membuka peluang bisnis untuk produk yang banyak dibutuhkan di pasar!', 
     productUrl: 'https://ratakan.com/product/pelatihan-online-klinsol-karbol-hitam-352' },
    { title: 'Pelatihan Online Handsoap', 
     description: 'Apakah Anda ingin belajar membuat sabun cuci tangan berkualitas yang hemat dan aman? Pelatihan Online Handsoap adalah pilihan tepat untuk Anda yang ingin menciptakan produk handsoap sendiri, baik untuk kebutuhan sehari-hari maupun untuk memulai bisnis. Pelatihan ini dirancang agar mudah diikuti, bahkan bagi pemula yang belum pernah membuat produk sabun sebelumnya.', 
     productUrl: 'https://ratakan.com/product/pelatihan-online-sabun-handsoap-sabun-cuci-tangan-F26' },
    { title: 'Pelatihan Online Deterjen Laundry', 
     description: 'Dalam era modern seperti sekarang, kebutuhan akan deterjen laundry yang berkualitas dan hemat terus meningkat, baik untuk kebutuhan rumah tangga maupun usaha. Namun, tahukah Anda bahwa Anda bisa membuat sabun cuci pakaian sendiri dengan mudah? Melalui Pelatihan Online Deterjen Laundry , Anda tidak hanya belajar membuat sabun cair berkualitas, tetapi juga mendapatkan banyak manfaat tambahan.', 
     productUrl: 'https://ratakan.com/product/pelatihan-online-deterjen-laundry-CF9' },
    { title: 'Pelatihan Online Deterjen Bubuk: Langkah Mudah Membuat Produk Sendiri', 
     description: 'Pernahkah Anda berpikir untuk membuat deterjen bubuk berkualitas dengan tangan Anda sendiri? Pelatihan Online Deterjen Bubuk adalah solusi tepat untuk Anda yang ingin belajar membuat produk rumah tangga dengan mudah. Lewat pelatihan ini, Anda tidak hanya mempelajari cara membuat deterjen bubuk untuk kebutuhan pribadi, tetapi juga membuka peluang besar untuk memulai usaha dan menjual produk Anda sendiri', 
     productUrl: 'https://ratakan.com/product/pelatihan-online-deterjen-bubuk-678' },
  ];
  const itemsPerPage = 5;
  let currentPage = 1;
  let isValidEmail = false;

  // Function to render articles for the current page
  function renderArticles() {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const currentArticles = articles.slice(start, end);

    // Clear previous articles
    articleContainer.innerHTML = '';

    // Render current articles
    currentArticles.forEach(article => {
      const articleElement = document.createElement('article');
      articleElement.innerHTML = `
        <h3>${article.title}</h3>
        <p>${article.description}</p>
        <a href="#" class="product-link" data-product-url="${article.productUrl}">${isValidEmail ? 'Klik Produk' : 'Dapatkan Produk'}</a>
        <div class="share-buttons">
          <button class="share-whatsapp" data-product-url="${article.productUrl}">Share ke WhatsApp</button>
          <button class="share-facebook facebook" data-product-url="${article.productUrl}">Share ke Facebook</button>
        </div>
      `;
      articleContainer.appendChild(articleElement);
    });

    // Update page info
    pageInfo.textContent = `Page ${currentPage} of ${Math.ceil(articles.length / itemsPerPage)}`;

    // Enable/disable buttons based on current page
    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage === Math.ceil(articles.length / itemsPerPage);

    // Reattach referral link functionality
    attachReferralLinkHandlers();
    attachShareLinkHandlers();

    // Show or hide share buttons based on email validation
    toggleShareButtons();
  }

  // Attach referral link handlers to dynamically generated links
  function attachReferralLinkHandlers() {
    const productLinks = document.querySelectorAll('.product-link');
    productLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const userEmail = userEmailInput.value.trim();
        if (!userEmail) {
          alert('Please enter your email address.');
          return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userEmail)) {
          alert('Please enter a valid email address.');
          return;
        }
        const productUrl = link.getAttribute('data-product-url');
        const referralUrl = `${productUrl}?aff=${encodeURIComponent(userEmail)}`;
        window.open(referralUrl, '_blank');
      });
    });
  }

  // Attach share link handlers to dynamically generated buttons
  function attachShareLinkHandlers() {
    const whatsappButtons = document.querySelectorAll('.share-whatsapp');
    const facebookButtons = document.querySelectorAll('.share-facebook');

    whatsappButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const productUrl = button.getAttribute('data-product-url');
        const userEmail = userEmailInput.value.trim();
        if (!userEmail) {
          alert('Please enter your email address.');
          return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userEmail)) {
          alert('Please enter a valid email address.');
          return;
        }
        const referralUrl = `${productUrl}?aff=${encodeURIComponent(userEmail)}`;
        const whatsappUrl = `https://wa.me/?text=Check out prdouk ini: ${encodeURIComponent(referralUrl)}`;
        window.open(whatsappUrl, '_blank');
      });
    });

    facebookButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const productUrl = button.getAttribute('data-product-url');
        const userEmail = userEmailInput.value.trim();
        if (!userEmail) {
          alert('Please enter your email address.');
          return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userEmail)) {
          alert('Please enter a valid email address.');
          return;
        }
        const referralUrl = `${productUrl}?aff=${encodeURIComponent(userEmail)}`;
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`;
        window.open(facebookUrl, '_blank');
      });
    });
  }

  // Toggle visibility of share buttons based on email validation
  function toggleShareButtons() {
    const shareButtons = document.querySelectorAll('.share-buttons');
    shareButtons.forEach(buttonGroup => {
      buttonGroup.style.display = isValidEmail ? 'block' : 'none';
    });
  }

  // Pagination event listeners
  prevPageButton.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderArticles();
    }
  });

  nextPageButton.addEventListener('click', () => {
    if (currentPage < Math.ceil(articles.length / itemsPerPage)) {
      currentPage++;
      renderArticles();
    }
  });

  // Generate referral links button
  generateLinksButton.addEventListener('click', () => {
    const userEmail = userEmailInput.value.trim();
    if (!userEmail) {
      alert('Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      alert('Please enter a valid email address.');
      return;
    }
    isValidEmail = true;
    renderArticles(); // Re-render articles to update button text and show share buttons
    alert('Your referral links have been updated!');
  });

  // Initial render
  renderArticles();
});
