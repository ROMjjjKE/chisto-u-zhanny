/* ЧИСТО У ЖАННЫ: меню, аккордеоны, калькулятор-смета, форма */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var TEL = '375257013047';
  function money(n) { return Math.round(n).toLocaleString('ru-RU') + ' BYN'; }
  function num(v, d) { var x = parseFloat(String(v).replace(',', '.')); return isFinite(x) && x > 0 ? x : d; }

  /* меню */
  var drawer = $('drawer'), burger = $('burger'), closeBtn = $('drawerClose'), lastFocus = null;
  function openD() {
    lastFocus = document.activeElement;
    drawer.setAttribute('data-open', 'true');
    document.body.classList.add('is-locked');
    burger.setAttribute('aria-expanded', 'true');
    var f = drawer.querySelector('a,button'); if (f) f.focus();
  }
  function closeD() {
    if (!drawer) return;
    drawer.setAttribute('data-open', 'false');
    document.body.classList.remove('is-locked');
    if (burger) burger.setAttribute('aria-expanded', 'false');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  if (burger) burger.addEventListener('click', openD);
  if (closeBtn) closeBtn.addEventListener('click', closeD);
  if (drawer) {
    drawer.addEventListener('click', function (e) { if (e.target === drawer) closeD(); });
    document.addEventListener('keydown', function (e) {
      if (drawer.getAttribute('data-open') !== 'true') return;
      if (e.key === 'Escape') { closeD(); return; }
      if (e.key === 'Tab') {
        var f = drawer.querySelectorAll('a,button');
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1099 && drawer.getAttribute('data-open') === 'true') closeD();
    });
  }

  /* аккордеоны */
  document.querySelectorAll('.faq__q').forEach(function (b) {
    b.addEventListener('click', function () {
      var it = b.parentElement, open = it.getAttribute('data-open') === 'true';
      document.querySelectorAll('.faq__i').forEach(function (x) { x.setAttribute('data-open', 'false'); });
      it.setAttribute('data-open', open ? 'false' : 'true');
    });
  });
  document.querySelectorAll('.zone__q').forEach(function (b) {
    b.addEventListener('click', function () {
      var z = b.parentElement;
      z.setAttribute('data-open', z.getAttribute('data-open') === 'true' ? 'false' : 'true');
    });
  });

  /* калькулятор */
  var BASE = {
    pod: { 1: 253, 2: 334, 3: 414, 4: 483 },
    gen: { 1: 380, 2: 495, 3: 610, 4: 713 }
  };
  var TIME = {
    pod: { 1: '3–5 часов', 2: '4–6 часов', 3: '5–7 часов', 4: '6–8 часов' },
    gen: { 1: '5–8 часов', 2: '6–9 часов', 3: '7–10 часов', 4: '8–12 часов' }
  };
  var ADDONS = {
    win: ['Окна изнутри, створка', 40], balc: ['Окно на балконе, створка', 46], both: ['Окно с двух сторон, створка', 69],
    wc: ['Отдельный санузел', 75], wcc: ['Совмещённый санузел', 121], carpet: ['Химчистка ковра до 2 м²', 86],
    lamp: ['Мытьё люстры', 92]
  };
  var TYPES = { pod: 'Поддерживающая уборка', gen: 'Генеральная уборка', dom: 'Уборка дома или коттеджа', rem: 'Уборка после ремонта' };

  document.querySelectorAll('[data-calc]').forEach(function (root) {
    var out = root.querySelector('[data-out]');
    var state = { type: 'pod', rooms: '2', tools: 'own', sur: {} };

    function press(group, value) {
      state[group === 'rooms' ? 'rooms' : group] = value;
      root.querySelectorAll('[data-group="' + group + '"] button').forEach(function (b) {
        var v = b.getAttribute('data-' + group);
        b.setAttribute('aria-pressed', v === value ? 'true' : 'false');
      });
    }

    function sync() {
      var roomsBlock = root.querySelector('[data-when="rooms"]');
      var areaBlock = root.querySelector('[data-when="area"]');
      var needArea = state.type === 'dom' || state.type === 'rem';
      roomsBlock.hidden = needArea;
      areaBlock.hidden = !needArea;
      var areaLabel = areaBlock.querySelector('label');
      if (areaLabel) areaLabel.textContent = 'Площадь, м²' + (state.type === 'rem' ? ' (после ремонта)' : ' дома');
    }

    function compute() {
      var area = num(root.querySelector('[data-area]').value, 100);
      var base = 0, baseHi = 0, line = '', time = '';
      if (state.type === 'pod' || state.type === 'gen') {
        base = BASE[state.type][state.rooms];
        baseHi = base;
        line = TYPES[state.type] + ', ' + state.rooms + ' комн.';
        time = TIME[state.type][state.rooms];
      } else if (state.type === 'dom') {
        if (area <= 100) { base = 748; line = 'Дом до 100 м²'; time = '8–12 часов'; }
        else if (area <= 200) { base = 1093; line = 'Дом 101–200 м²'; time = '1–2 дня'; }
        else { var blocks = Math.max(1, Math.ceil(area / 50) - 4); base = 1380 * blocks; line = 'Дом ' + area + ' м² · ' + blocks + ' × 50 м²'; time = 'уточним по объёму'; }
        baseHi = base;
      } else {
        var perM = state.tools === 'my' ? 6.2 : 5.2;
        base = perM * area; baseHi = base;
        line = 'После ремонта, ' + area + ' м² × ' + perM + ' BYN';
        time = 'уточним по объёму';
      }
      if (state.tools === 'my' && state.type !== 'rem') { baseHi = base * 1.2; }

      var lines = [['<span>' + line + '</span>', money(base) + (baseHi > base ? ' – ' + money(baseHi) : '')]];
      var adds = 0;
      Object.keys(ADDONS).forEach(function (k) {
        var cb = root.querySelector('[data-add="' + k + '"]');
        if (cb && cb.checked) {
          var q = Math.max(1, Math.round(num(root.querySelector('[data-qty="' + k + '"]').value, 1)));
          var sum = ADDONS[k][1] * q;
          adds += sum;
          lines.push(['<span>' + ADDONS[k][0] + ' × ' + q + '</span>', money(sum)]);
        }
      });
      var subtotal = base + adds, subtotalHi = baseHi + adds;
      var disc = parseFloat(root.querySelector('[data-disc]').value) || 0;
      if (disc > 0) {
        lines.push(['<span class="minus">Скидка ' + disc + '%</span>', '−' + money((subtotal * disc) / 100)]);
      }
      var k = 1;
      if (root.querySelector('[data-sur="urgent"]').checked) k += 0.2;
      if (root.querySelector('[data-sur="dirty"]').checked) k += 0.3;
      if (k > 1) lines.push(['<span>Доплата ' + Math.round((k - 1) * 100) + '%</span>', '+' + money(subtotal * (k - 1))]);
      var total = subtotal * (1 - disc / 100) * k, totalHi = subtotalHi * (1 - disc / 100) * k;

      var toolsTxt = state.tools === 'my' && state.type !== 'rem' ? 'Мои инструменты и средства (+15–20%)' : 'Ваши инструменты и средства';
      var prepay = total * 0.45;

      out.innerHTML = '<h3>Смета на уборку</h3>' +
        '<div class="est"><b>от ' + Math.round(total).toLocaleString('ru-RU') + (totalHi - total > 1 ? ' до ' + Math.round(totalHi).toLocaleString('ru-RU') : '') + ' BYN</b>' +
        '<span>окончательно — после бесплатного осмотра</span></div>' +
        '<div class="lines">' + lines.map(function (r) { return '<div>' + r[0] + '<b>' + r[1] + '</b></div>'; }).join('') + '</div>' +
        '<div class="calc__meta"><span>Ориентировочное время: <b>' + time + '</b></span>' +
        '<span>Предоплата 45%: <b>' + money(prepay) + '</b></span>' +
        '<span>Инструменты и средства: <b>' + toolsTxt + '</b></span></div>' +
        '<a class="btn" href="https://wa.me/' + TEL + '?text=' + encodeURIComponent(
          'Здравствуйте, Жанна! Расчёт на сайте: ' + TYPES[state.type] +
          (state.type === 'pod' || state.type === 'gen' ? ', ' + state.rooms + ' комн.' : ', площадь ' + area + ' м²') +
          ' ' + toolsTxt + (disc > 0 ? '. Скидка ' + disc + '%' : '') + '. ' +
          (Object.keys(ADDONS).filter(function (x) { var c = root.querySelector('[data-add="' + x + '"]'); return c && c.checked; }).length
            ? ' Разовые услуги: ' + Object.keys(ADDONS).filter(function (x) { var c = root.querySelector('[data-add="' + x + '"]'); return c && c.checked; }).map(function (x) { return ADDONS[x][0]; }).join(', ') + '.'
            : '') +
          ' Ориентир: от ' + Math.round(total).toLocaleString('ru-RU') + ' BYN.'
        ) + '" target="_blank" rel="noopener">Уточнить в WhatsApp</a>' +
        '<small>Расчёт по прайсу: точную стоимость назову после осмотра. При отмене за 24 часа и более предоплата возвращается полностью.</small>';
    }

    root.querySelectorAll('[data-group="type"] button').forEach(function (b) {
      b.addEventListener('click', function () { press('type', b.getAttribute('data-type')); sync(); compute(); });
    });
    root.querySelectorAll('[data-group="rooms"] button').forEach(function (b) {
      b.addEventListener('click', function () { press('rooms', b.getAttribute('data-rooms')); compute(); });
    });
    root.querySelectorAll('[data-group="tools"] button').forEach(function (b) {
      b.addEventListener('click', function () { press('tools', b.getAttribute('data-tools')); compute(); });
    });
    root.querySelectorAll('[data-add]').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var q = root.querySelector('[data-qty="' + cb.getAttribute('data-add') + '"]');
        q.disabled = !cb.checked;
        compute();
      });
    });
    root.querySelectorAll('[data-qty]').forEach(function (i) { i.addEventListener('input', compute); });
    root.querySelector('[data-area]').addEventListener('input', compute);
    root.querySelector('[data-disc]').addEventListener('change', compute);
    root.querySelectorAll('[data-sur]').forEach(function (c) { c.addEventListener('change', compute); });
    sync(); compute();
  });

  /* форма */
  var form = $('reqForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var g = function (id) { var el = $(id); return el && el.value ? el.value.trim() : ''; };
      if (!g('fName')) { $('fName').focus(); return; }
      if (!g('fTel')) { $('fTel').focus(); return; }
      var text = 'Заявка с сайта «Чисто у Жанны»\nИмя: ' + g('fName') + '\nТелефон: ' + g('fTel') +
        '\nТип уборки: ' + g('fWhat') + (g('fMsg') ? '\nОбъект: ' + g('fMsg') : '');
      window.open('https://wa.me/' + TEL + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
    });
  }
})();
