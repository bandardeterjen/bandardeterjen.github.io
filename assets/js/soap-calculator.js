/* ============================================
   SOAP CALCULATOR — Scoped Script
   IIFE untuk menghindari bentrok global
   ============================================ */
(function () {
  'use strict';

  // Guard: pastikan hanya init sekali
  if (window.__soapCalcInitialized) return;
  window.__soapCalcInitialized = true;

  function el(id) { return document.getElementById(id); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  // ---------- Oil Block Builder ----------
  function createOilBlock(showRemove) {
    var block = document.createElement('div');
    block.className = 'soap-entry-block';

    var html = '';
    if (showRemove) {
      html += '<button type="button" class="soap-remove" aria-label="Hapus oil" title="Hapus oil">&times;</button>';
    }
    html += '<label class="soap-label">Oil Type</label>';
    html += '<select class="soap-oil soap-select"></select>';
    html += '<label class="soap-label">Weight (grams)</label>';
    html += '<input type="number" class="soap-oil-weight soap-input" placeholder="e.g. 200" min="0" step="0.1">';

    block.innerHTML = html;

    // Salin options dari template (block pertama)
    var templateSelect = document.querySelector('#soap-oil-inputs .soap-oil');
    var newSelect = block.querySelector('.soap-oil');
    if (templateSelect && newSelect) {
      newSelect.innerHTML = templateSelect.innerHTML;
    }

    // Bind remove
    if (showRemove) {
      var removeBtn = block.querySelector('.soap-remove');
      if (removeBtn) {
        removeBtn.addEventListener('click', function () {
          block.remove();
        });
      }
    }

    return block;
  }

  // ---------- Add Oil ----------
  function addOil() {
    var container = el('soap-oil-inputs');
    if (!container) return;
    container.appendChild(createOilBlock(true));
  }

  // ---------- Calculate ----------
  function calculate() {
    var resultEl = el('soap-result');
    if (!resultEl) return;

    var useCustomFragrance = el('soap-custom-fragrance').checked;
    var fragranceInput = parseFloat(el('soap-fragrance-input').value);
    var soapType = el('soap-type').value;

    var oils = qsa('.soap-oil');
    var weights = qsa('.soap-oil-weight');

    var totalLye = 0;
    var totalKOH = 0;
    var totalOil = 0;
    var validOils = 0;

    for (var i = 0; i < oils.length; i++) {
      var sapNaOH = parseFloat(oils[i].value);
      var weight = parseFloat(weights[i].value);
      if (!isNaN(weight) && weight > 0) {
        totalLye += sapNaOH * weight;
        totalKOH += (sapNaOH * weight) * 1.403;
        totalOil += weight;
        validOils++;
      }
    }

    if (validOils === 0) {
      resultEl.innerHTML =
        '<div class="soap-error">' +
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' +
        'Masukkan minimal 1 oil dengan berat > 0.' +
        '</div>';
      return;
    }

    var fragrancePercent;
    if (useCustomFragrance && !isNaN(fragranceInput)) {
      fragrancePercent = fragranceInput / 100;
    } else {
      fragrancePercent = (soapType === 'bar') ? 0.03 : 0.015;
    }

    var fragrance = totalOil * fragrancePercent;
    var lyeLabel, lyeAmount, water;

    if (soapType === 'bar') {
      lyeLabel = 'NaOH (Sodium Hydroxide)';
      lyeAmount = totalLye;
      water = totalLye * 2.5;
    } else {
      lyeLabel = 'KOH (Potassium Hydroxide)';
      lyeAmount = totalKOH;
      water = totalKOH * 2.0;
    }

    resultEl.innerHTML =
      '<div class="soap-result-title">' +
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' +
      'Hasil Perhitungan' +
      '</div>' +
      '<div class="soap-result-row"><span class="soap-result-label">Total Oil</span><span class="soap-result-value highlight">' + totalOil.toFixed(2) + ' g</span></div>' +
      '<div class="soap-result-row"><span class="soap-result-label">' + lyeLabel + '</span><span class="soap-result-value">' + lyeAmount.toFixed(2) + ' g</span></div>' +
      '<div class="soap-result-row"><span class="soap-result-label">Required Water</span><span class="soap-result-value">' + water.toFixed(2) + ' g</span></div>' +
      '<div class="soap-result-row"><span class="soap-result-label">Required Fragrance</span><span class="soap-result-value">' + fragrance.toFixed(2) + ' g</span></div>';
  }

  // ---------- Toggle Fragrance Input ----------
  function toggleFragranceInput() {
    var checkbox = el('soap-custom-fragrance');
    var input = el('soap-fragrance-input');
    if (!checkbox || !input) return;
    input.style.display = checkbox.checked ? 'block' : 'none';
    if (checkbox.checked) input.focus();
  }

  // ---------- Bind ----------
  function bind() {
    var addBtn = el('soap-add-oil');
    var calcBtn = el('soap-calculate');
    var fragranceCheckbox = el('soap-custom-fragrance');

    if (addBtn && !addBtn.dataset.soapBound) {
      addBtn.dataset.soapBound = 'true';
      addBtn.addEventListener('click', addOil);
    }
    if (calcBtn && !calcBtn.dataset.soapBound) {
      calcBtn.dataset.soapBound = 'true';
      calcBtn.addEventListener('click', calculate);
    }
    if (fragranceCheckbox && !fragranceCheckbox.dataset.soapBound) {
      fragranceCheckbox.dataset.soapBound = 'true';
      fragranceCheckbox.addEventListener('change', toggleFragranceInput);
    }
  }

  // ---------- Init ----------
  function init() {
    var container = el('soap-oil-inputs');
    if (!container) return; // bukan halaman soap calculator, skip

    if (container.querySelectorAll('.soap-entry-block').length === 0) {
      container.appendChild(createOilBlock(false));
    }
    bind();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
