/**
 * SỔ CHI TIÊU - ỨNG DỤNG QUẢN LÝ CHI TIÊU CÁ NHÂN (PWA CHO IPHONE)
 * Thiết kế tự nhiên, mượt mà, lưu trữ vĩnh viễn trên máy và biểu đồ cột trực quan theo tháng.
 */

// Danh mục chi tiêu với màu sắc mộc tự nhiên & icon emoji
const CATEGORIES = {
  food: { id: 'food', name: 'Ăn uống', icon: '🍲', color: '#E07A5F', bg: 'rgba(224, 122, 95, 0.14)' },
  cafe: { id: 'cafe', name: 'Cà phê & Trà', icon: '☕', color: '#C48858', bg: 'rgba(196, 136, 88, 0.14)' },
  shopping: { id: 'shopping', name: 'Mua sắm', icon: '🛍️', color: '#D27387', bg: 'rgba(210, 115, 135, 0.14)' },
  transport: { id: 'transport', name: 'Di chuyển', icon: '🛵', color: '#6C8A78', bg: 'rgba(108, 138, 120, 0.14)' },
  bills: { id: 'bills', name: 'Hóa đơn & Nhà', icon: '🏠', color: '#5B7F93', bg: 'rgba(91, 127, 147, 0.14)' },
  health: { id: 'health', name: 'Sức khỏe', icon: '💊', color: '#8E7A94', bg: 'rgba(142, 122, 148, 0.14)' },
  fun: { id: 'fun', name: 'Giải trí', icon: '🎬', color: '#CF9946', bg: 'rgba(207, 153, 70, 0.14)' },
  other: { id: 'other', name: 'Khác', icon: '✨', color: '#7D7873', bg: 'rgba(125, 120, 115, 0.14)' }
};

const STORAGE_KEY = 'so_chi_tieu_offline_db_v1';

// State của ứng dụng
const state = {
  activeYear: new Date().getFullYear(),
  activeMonth: new Date().getMonth(), // 0 - 11
  chartMode: 'category', // 'category' | 'daily'
  selectedCategory: 'food',
  transactions: []
};

// Dữ liệu khởi tạo mẫu thực tế (khi người dùng mở lần đầu tiên)
function getInitialSampleData() {
  const y = new Date().getFullYear();
  const m = String(new Date().getMonth() + 1).padStart(2, '0');
  return [
    { id: 'tx_1', amount: 45000, category: 'food', note: 'Phở bò tái lăn', date: `${y}-${m}-28`, createdAt: Date.now() - 1000 * 60 * 60 * 2 },
    { id: 'tx_2', amount: 35000, category: 'cafe', note: 'Cà phê muối sáng', date: `${y}-${m}-28`, createdAt: Date.now() - 1000 * 60 * 60 * 4 },
    { id: 'tx_3', amount: 72000, category: 'transport', note: 'Grab đi làm', date: `${y}-${m}-27`, createdAt: Date.now() - 1000 * 60 * 60 * 24 },
    { id: 'tx_4', amount: 240000, category: 'shopping', note: 'Mua áo thun cotton', date: `${y}-${m}-26`, createdAt: Date.now() - 1000 * 60 * 60 * 48 },
    { id: 'tx_5', amount: 125000, category: 'food', note: 'Cơm trưa văn phòng', date: `${y}-${m}-25`, createdAt: Date.now() - 1000 * 60 * 60 * 72 },
    { id: 'tx_6', amount: 65000, category: 'cafe', note: 'Highlands Coffee gặp bạn', date: `${y}-${m}-24`, createdAt: Date.now() - 1000 * 60 * 60 * 96 },
    { id: 'tx_7', amount: 350000, category: 'bills', note: 'Tiền mạng Internet tháng này', date: `${y}-${m}-20`, createdAt: Date.now() - 1000 * 60 * 60 * 180 },
    { id: 'tx_8', amount: 95000, category: 'health', note: 'Vitamin C & khẩu trang', date: `${y}-${m}-18`, createdAt: Date.now() - 1000 * 60 * 60 * 240 }
  ];
}

// Khởi tạo và nạp dữ liệu từ LocalStorage
function loadTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      state.transactions = JSON.parse(raw);
    } else {
      state.transactions = getInitialSampleData();
      saveTransactions();
    }
  } catch (err) {
    console.warn('Lỗi đọc LocalStorage:', err);
    state.transactions = getInitialSampleData();
  }
}

function saveTransactions() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.transactions));
  } catch (err) {
    console.error('Lỗi lưu LocalStorage:', err);
    showToast('⚠️ Bộ nhớ điện thoại bị đầy, không thể lưu!');
  }
}

// Format số tiền VNĐ mộc tự nhiên
function formatVND(num) {
  if (num == null || isNaN(num)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN').format(Math.round(num)) + ' ₫';
}

function formatRawAmount(num) {
  if (!num) return '0';
  return new Intl.NumberFormat('vi-VN').format(Math.round(num));
}

// Format ngày tháng tiếng Việt
function formatDisplayDate(dateStr) {
  const parts = dateStr.split('-');
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);

  const today = new Date();
  const todayY = today.getFullYear();
  const todayM = today.getMonth() + 1;
  const todayD = today.getDate();

  if (y === todayY && m === todayM && d === todayD) return 'Hôm nay';

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (y === yesterday.getFullYear() && m === (yesterday.getMonth() + 1) && d === yesterday.getDate()) {
    return 'Hôm qua';
  }

  const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const targetDate = new Date(y, m - 1, d);
  const dayName = daysOfWeek[targetDate.getDay()];
  return `${dayName}, ${d} Tháng ${m}`;
}

// Lấy danh sách giao dịch của tháng đang chọn
function getTransactionsForActiveMonth() {
  const prefix = `${state.activeYear}-${String(state.activeMonth + 1).padStart(2, '0')}`;
  return state.transactions.filter(t => t.date && t.date.startsWith(prefix));
}

// ==========================================================================
// RENDER GIAO DIỆN CHÍNH
// ==========================================================================

function updateMonthDisplay() {
  const monthText = `Tháng ${state.activeMonth + 1}, ${state.activeYear}`;
  document.getElementById('displayMonthText').textContent = monthText;
  document.getElementById('chartSubTitle').textContent = monthText;

  const now = new Date();
  const isThisMonth = state.activeYear === now.getFullYear() && state.activeMonth === now.getMonth();
  const statusEl = document.getElementById('displayMonthStatus');
  statusEl.textContent = isThisMonth ? 'Tháng này' : (state.activeMonth < now.getMonth() ? 'Đã qua' : 'Sắp tới');
}

function updateHeroSummary(monthTx) {
  const total = monthTx.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  document.getElementById('heroTotalAmount').textContent = formatRawAmount(total);
  document.getElementById('txCountBadge').textContent = `${monthTx.length} khoản chi`;

  const daysInMonth = new Date(state.activeYear, state.activeMonth + 1, 0).getDate();
  const now = new Date();
  const isThisMonth = state.activeYear === now.getFullYear() && state.activeMonth === now.getMonth();
  const elapsedDays = isThisMonth ? Math.max(1, now.getDate()) : daysInMonth;

  const dailyAvg = total / elapsedDays;
  document.getElementById('heroDailyAverage').textContent = `${formatVND(dailyAvg)} / ngày`;

  // Tìm ngày tiêu nhiều nhất
  const dayMap = {};
  monthTx.forEach(t => {
    dayMap[t.date] = (dayMap[t.date] || 0) + Number(t.amount);
  });
  let maxDayAmount = 0;
  for (const date in dayMap) {
    if (dayMap[date] > maxDayAmount) maxDayAmount = dayMap[date];
  }
  document.getElementById('heroPeakDay').textContent = formatVND(maxDayAmount);
}

// ==========================================================================
// BIỂU ĐỒ CỘT (BAR CHART MODULE)
// ==========================================================================

function renderChart(monthTx) {
  const container = document.getElementById('chartContainer');
  const highlightBox = document.getElementById('chartHighlightBox');
  highlightBox.style.display = 'none';

  if (monthTx.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="width: 100%; border: none; padding: 28px 10px;">
        <span class="empty-icon">📊</span>
        <div class="empty-text">Chưa có dữ liệu biểu đồ</div>
        <div class="empty-subtext">Nhấn nút "+" ở đáy màn hình để thêm chi tiêu đầu tiên</div>
      </div>
    `;
    return;
  }

  if (state.chartMode === 'category') {
    renderCategoryBarChart(container, monthTx);
  } else {
    renderDailyBarChart(container, monthTx);
  }
}

// Biểu đồ cột ngang theo từng danh mục
function renderCategoryBarChart(container, monthTx) {
  const total = monthTx.reduce((sum, t) => sum + Number(t.amount), 0) || 1;
  const catSums = {};

  monthTx.forEach(t => {
    catSums[t.category] = (catSums[t.category] || 0) + Number(t.amount);
  });

  const sortedCats = Object.keys(catSums).sort((a, b) => catSums[b] - catSums[a]);

  let html = `<div class="cat-bars-list">`;
  sortedCats.forEach(catId => {
    const cat = CATEGORIES[catId] || CATEGORIES.other;
    const amount = catSums[catId];
    const percent = Math.round((amount / total) * 100);

    html += `
      <div class="cat-bar-item" data-cat="${cat.name}" data-amount="${formatVND(amount)} (${percent}%)">
        <div class="cat-bar-info">
          <span class="cat-name-tag">
            <span class="cat-dot" style="background: ${cat.color};"></span>
            <span>${cat.icon} ${cat.name}</span>
          </span>
          <span class="cat-amount-tag">
            <span>${formatVND(amount)}</span>
            <span class="cat-percent">${percent}%</span>
          </span>
        </div>
        <div class="cat-track">
          <div class="cat-fill" style="width: ${percent}%; background: ${cat.color};"></div>
        </div>
      </div>
    `;
  });
  html += `</div>`;
  container.innerHTML = html;

  // Xử lý sự kiện chạm vào từng cột
  container.querySelectorAll('.cat-bar-item').forEach(item => {
    item.addEventListener('click', () => {
      const catName = item.getAttribute('data-cat');
      const catAmount = item.getAttribute('data-amount');
      showChartHighlight(`${catName}`, catAmount);
    });
  });
}

// Biểu đồ cột đứng theo các ngày trong tháng
function renderDailyBarChart(container, monthTx) {
  const daysInMonth = new Date(state.activeYear, state.activeMonth + 1, 0).getDate();
  const dailyTotals = new Array(daysInMonth + 1).fill(0);

  monthTx.forEach(t => {
    const day = parseInt(t.date.split('-')[2], 10);
    if (day >= 1 && day <= daysInMonth) {
      dailyTotals[day] += Number(t.amount);
    }
  });

  const maxDaily = Math.max(...dailyTotals, 10000);
  const now = new Date();
  const isThisMonth = state.activeYear === now.getFullYear() && state.activeMonth === now.getMonth();
  const currentDay = isThisMonth ? now.getDate() : -1;

  let html = `<div class="daily-chart-wrapper"><div class="daily-chart-track">`;
  for (let day = 1; day <= daysInMonth; day++) {
    const amount = dailyTotals[day];
    const heightPercent = amount > 0 ? Math.max(8, Math.round((amount / maxDaily) * 100)) : 3;
    const isToday = day === currentDay;
    const isHighest = amount === maxDaily && amount > 0;
    const hasExpense = amount > 0;

    html += `
      <div class="daily-col ${isToday ? 'today' : ''} ${isHighest ? 'highest' : ''} ${hasExpense ? 'has-expense' : ''}" 
           data-day="Ngày ${day} Tháng ${state.activeMonth + 1}" 
           data-amount="${formatVND(amount)}">
        <div class="daily-bar-fill" style="height: ${heightPercent}%;"></div>
        <span class="daily-col-label">${day}</span>
      </div>
    `;
  }
  html += `</div></div>`;
  container.innerHTML = html;

  // Tự động cuộn đến ngày hôm nay nếu đang xem tháng này
  if (isThisMonth) {
    const wrapper = container.querySelector('.daily-chart-wrapper');
    const todayCol = container.querySelector('.daily-col.today');
    if (wrapper && todayCol) {
      setTimeout(() => {
        wrapper.scrollLeft = todayCol.offsetLeft - wrapper.clientWidth / 2 + 15;
      }, 100);
    }
  }

  // Chạm vào cột ngày để xem số tiền
  container.querySelectorAll('.daily-col').forEach(col => {
    col.addEventListener('click', () => {
      container.querySelectorAll('.daily-col').forEach(c => c.classList.remove('active'));
      col.classList.add('active');
      const dayLabel = col.getAttribute('data-day');
      const dayAmount = col.getAttribute('data-amount');
      showChartHighlight(dayLabel, dayAmount);
    });
  });
}

function showChartHighlight(title, value) {
  const box = document.getElementById('chartHighlightBox');
  document.getElementById('highlightTitle').textContent = title;
  document.getElementById('highlightValue').textContent = value;
  box.style.display = 'flex';
}

// ==========================================================================
// DANH SÁCH GIAO DỊCH (TRANSACTIONS FEED)
// ==========================================================================

function renderTransactionsList(monthTx) {
  const container = document.getElementById('transactionsContainer');
  const summaryText = document.getElementById('listSummaryText');
  summaryText.textContent = `${monthTx.length} giao dịch`;

  if (monthTx.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">🍃</span>
        <div class="empty-text">Tháng này chưa có chi tiêu nào</div>
        <div class="empty-subtext">Hãy bấm nút "Ghi chép chi tiêu" bên dưới để bắt đầu</div>
      </div>
    `;
    return;
  }

  // Nhóm các giao dịch theo Ngày (giảm dần từ mới nhất đến cũ nhất)
  const grouped = {};
  monthTx.sort((a, b) => (b.date.localeCompare(a.date)) || (b.createdAt - a.createdAt));

  monthTx.forEach(t => {
    if (!grouped[t.date]) grouped[t.date] = [];
    grouped[t.date].push(t);
  });

  let html = '';
  for (const date in grouped) {
    const list = grouped[date];
    const dayTotal = list.reduce((sum, item) => sum + Number(item.amount), 0);

    html += `
      <div class="tx-day-group">
        <div class="tx-day-header">
          <span>${formatDisplayDate(date)}</span>
          <span class="tx-day-total">-${formatVND(dayTotal)}</span>
        </div>
    `;

    list.forEach(tx => {
      const cat = CATEGORIES[tx.category] || CATEGORIES.other;
      html += `
        <div class="tx-card" id="tx-${tx.id}">
          <div class="tx-left">
            <div class="tx-cat-icon" style="background: ${cat.bg}; color: ${cat.color};">
              ${cat.icon}
            </div>
            <div class="tx-info">
              <span class="tx-category-name">${cat.name}</span>
              ${tx.note ? `<span class="tx-note">${escapeHTML(tx.note)}</span>` : ''}
            </div>
          </div>
          <div class="tx-right">
            <span class="tx-amount">-${formatVND(tx.amount)}</span>
            <button type="button" class="tx-del-btn" data-id="${tx.id}" aria-label="Xóa" title="Xóa khoản chi">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      `;
    });

    html += `</div>`;
  }

  container.innerHTML = html;

  // Gán sự kiện xóa cho từng nút
  container.querySelectorAll('.tx-del-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      deleteTransaction(id);
    });
  });
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function deleteTransaction(id) {
  state.transactions = state.transactions.filter(t => t.id !== id);
  saveTransactions();
  renderApp();
  showToast('Đã xóa khoản chi');
}

// ==========================================================================
// RENDER TOÀN BỘ APP
// ==========================================================================

function renderApp() {
  updateMonthDisplay();
  const monthTx = getTransactionsForActiveMonth();
  updateHeroSummary(monthTx);
  renderChart(monthTx);
  renderTransactionsList(monthTx);
}

// ==========================================================================
// CATEGORY SELECTION IN BOTTOM SHEET
// ==========================================================================

function initCategoryGrid() {
  const grid = document.getElementById('categorySelectionGrid');
  let html = '';
  Object.values(CATEGORIES).forEach((cat, index) => {
    const isSelected = cat.id === state.selectedCategory;
    html += `
      <button type="button" class="cat-select-btn ${isSelected ? 'selected' : ''}" data-cat-id="${cat.id}">
        <span class="cat-btn-icon">${cat.icon}</span>
        <span class="cat-btn-name">${cat.name}</span>
      </button>
    `;
  });
  grid.innerHTML = html;

  grid.querySelectorAll('.cat-select-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      grid.querySelectorAll('.cat-select-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      state.selectedCategory = btn.getAttribute('data-cat-id');
    });
  });
}

// ==========================================================================
// MODAL & FORM INTERACTIONS
// ==========================================================================

function initModals() {
  const addModal = document.getElementById('addExpenseModal');
  const btnOpenAdd = document.getElementById('btnOpenAddModal');
  const btnCloseAdd = document.getElementById('btnCloseAddModal');

  const settingsModal = document.getElementById('settingsModal');
  const btnOpenSettings = document.getElementById('btnOpenSettings');
  const btnCloseSettings = document.getElementById('btnCloseSettingsModal');

  // Mở modal thêm chi tiêu
  btnOpenAdd.addEventListener('click', () => {
    openAddModal();
  });

  btnCloseAdd.addEventListener('click', () => {
    closeAddModal();
  });

  addModal.addEventListener('click', (e) => {
    if (e.target === addModal) closeAddModal();
  });

  // Mở modal cài đặt & sao lưu
  btnOpenSettings.addEventListener('click', () => {
    settingsModal.classList.add('active');
    settingsModal.setAttribute('aria-hidden', 'false');
  });

  btnCloseSettingsModal.addEventListener('click', () => {
    settingsModal.classList.remove('active');
    settingsModal.setAttribute('aria-hidden', 'true');
  });

  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
      settingsModal.classList.remove('active');
      settingsModal.setAttribute('aria-hidden', 'true');
    }
  });

  // Phím ESC đóng modal
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAddModal();
      settingsModal.classList.remove('active');
    }
  });
}

function openAddModal() {
  const modal = document.getElementById('addExpenseModal');
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');

  // Điền ngày mặc định là hôm nay
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  document.getElementById('inputDate').value = `${yyyy}-${mm}-${dd}`;

  // Reset ô tiền
  const inputAmount = document.getElementById('inputAmount');
  inputAmount.value = '';
  document.getElementById('inputNote').value = '';

  setTimeout(() => {
    inputAmount.focus();
  }, 250);
}

function closeAddModal() {
  const modal = document.getElementById('addExpenseModal');
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
}

// Xử lý ô nhập số tiền & các nút cộng nhanh
function initAmountInput() {
  const input = document.getElementById('inputAmount');

  // Format tự động khi gõ
  input.addEventListener('input', (e) => {
    const raw = input.value.replace(/\D/g, '');
    if (!raw) {
      input.value = '';
      return;
    }
    input.value = new Intl.NumberFormat('vi-VN').format(parseInt(raw, 10));
  });

  // Nút cộng tiền nhanh (+10k, +50k...)
  document.querySelectorAll('.quick-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const addValue = parseInt(btn.getAttribute('data-add'), 10);
      const current = parseInt(input.value.replace(/\D/g, ''), 10) || 0;
      const next = current + addValue;
      input.value = new Intl.NumberFormat('vi-VN').format(next);
      input.focus();
    });
  });

  // Submit form thêm khoản chi
  const form = document.getElementById('formAddExpense');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const rawVal = input.value.replace(/\D/g, '');
    const amount = parseInt(rawVal, 10);

    if (!amount || amount <= 0) {
      showToast('⚠️ Vui lòng nhập số tiền hợp lệ');
      input.focus();
      return;
    }

    const date = document.getElementById('inputDate').value;
    const note = document.getElementById('inputNote').value.trim();

    const newTx = {
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      amount: amount,
      category: state.selectedCategory || 'food',
      note: note,
      date: date,
      createdAt: Date.now()
    };

    state.transactions.push(newTx);
    saveTransactions();

    // Tự động chuyển góc nhìn về tháng của khoản chi vừa thêm
    const txYear = parseInt(date.split('-')[0], 10);
    const txMonth = parseInt(date.split('-')[1], 10) - 1;
    state.activeYear = txYear;
    state.activeMonth = txMonth;

    renderApp();
    closeAddModal();
    showToast(`Đã lưu ${formatVND(amount)} (${CATEGORIES[newTx.category].name})`);
  });
}

// ==========================================================================
// CÀI ĐẶT & SAO LƯU DỮ LIỆU (BACKUP / RESTORE)
// ==========================================================================

function initSettings() {
  // Xuất file JSON
  document.getElementById('btnExportData').addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.transactions, null, 2));
    const now = new Date();
    const fileName = `so-chi-tieu-backup-${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}.json`;
    
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast('📦 Đã tải file sao lưu về máy!');
  });

  // Nhập file JSON phục hồi
  const fileInput = document.getElementById('fileImportInput');
  document.getElementById('btnImportDataTrigger').addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          state.transactions = imported;
          saveTransactions();
          renderApp();
          document.getElementById('settingsModal').classList.remove('active');
          showToast(`✅ Đã phục hồi thành công ${imported.length} giao dịch!`);
        } else {
          showToast('⚠️ File dữ liệu không đúng định dạng!');
        }
      } catch (err) {
        showToast('⚠️ Không thể đọc file sao lưu này!');
      }
    };
    reader.readAsText(file);
    fileInput.value = '';
  });

  // Xóa trắng dữ liệu
  document.getElementById('btnResetData').addEventListener('click', () => {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử chi tiêu không? Hành động này không thể hoàn tác!')) {
      state.transactions = [];
      saveTransactions();
      renderApp();
      document.getElementById('settingsModal').classList.remove('active');
      showToast('Đã xóa toàn bộ dữ liệu');
    }
  });
}

// ==========================================================================
// ĐIỀU HƯỚNG THÁNG & CHUYỂN TAB BIỂU ĐỒ
// ==========================================================================

function initNavigation() {
  document.getElementById('btnPrevMonth').addEventListener('click', () => {
    if (state.activeMonth === 0) {
      state.activeMonth = 11;
      state.activeYear--;
    } else {
      state.activeMonth--;
    }
    renderApp();
  });

  document.getElementById('btnNextMonth').addEventListener('click', () => {
    if (state.activeMonth === 11) {
      state.activeMonth = 0;
      state.activeYear++;
    } else {
      state.activeMonth++;
    }
    renderApp();
  });

  document.getElementById('btnCurrentMonthReset').addEventListener('click', () => {
    const now = new Date();
    state.activeYear = now.getFullYear();
    state.activeMonth = now.getMonth();
    renderApp();
    showToast('Đã về tháng hiện tại');
  });

  // Chuyển chế độ Biểu đồ: "Danh mục" vs "Theo ngày"
  const tabCat = document.getElementById('tabCatChart');
  const tabDaily = document.getElementById('tabDailyChart');

  tabCat.addEventListener('click', () => {
    tabCat.classList.add('active');
    tabCat.setAttribute('aria-selected', 'true');
    tabDaily.classList.remove('active');
    tabDaily.setAttribute('aria-selected', 'false');
    state.chartMode = 'category';
    renderChart(getTransactionsForActiveMonth());
  });

  tabDaily.addEventListener('click', () => {
    tabDaily.classList.add('active');
    tabDaily.setAttribute('aria-selected', 'true');
    tabCat.classList.remove('active');
    tabCat.setAttribute('aria-selected', 'false');
    state.chartMode = 'daily';
    renderChart(getTransactionsForActiveMonth());
  });

  // Cập nhật subtitle ngày hôm nay ở Header
  const today = new Date();
  const dayNames = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const dayOfWeek = dayNames[today.getDay()];
  document.getElementById('currentDateSub').textContent = `${dayOfWeek}, ${today.getDate()} Th${today.getMonth() + 1}`;
}

// Thông báo Toast nhỏ ở góc trên màn hình
let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById('toastNotice');
  toast.textContent = msg;
  toast.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2400);
}

// ==========================================================================
// KHỞI ĐỘNG ỨNG DỤNG & ĐĂNG KÝ SERVICE WORKER (OFFLINE PWA)
// ==========================================================================

window.addEventListener('DOMContentLoaded', () => {
  loadTransactions();
  initCategoryGrid();
  initModals();
  initAmountInput();
  initSettings();
  initNavigation();
  renderApp();

  // Đăng ký Service Worker để lưu cache offline trên iPhone
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(() => console.log('Service Worker đã kích hoạt thành công.'))
      .catch(err => console.log('Service Worker registration skipped:', err));
  }
});
