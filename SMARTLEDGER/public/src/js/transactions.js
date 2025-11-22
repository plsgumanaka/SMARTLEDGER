// Transactions page logic moved from inline <script> in components/transactions.html
// This script is loaded by public/src/components/transactions.html

function showToast(message, type = 'success') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

const addTransactionModal = document.getElementById('addTransactionModal');
const editTransactionModal = document.getElementById('editTransactionModal');
const deleteTransactionModal = document.getElementById('deleteTransactionModal');
const transactionsTable = document.getElementById('transactionsTable');
const transactionsTableBody = document.querySelector('#transactionsTable tbody');
const tableContainer = document.getElementById('tableContainer');
const emptyState = document.getElementById('emptyState');
const dateInput = document.getElementById('dateInput');
const calendarPicker = document.getElementById('calendarPicker');
const calendarDaysContainer = document.getElementById('calendarDays');
const currentMonthLabel = document.getElementById('currentMonth');
const currentYearLabel = document.getElementById('currentYear');
let currentCalendarDate = new Date();

const createId = () => `trx-${Math.random().toString(36).slice(2, 11)}`;

let transactions = [];
let filteredTransactions = [];
let editingTransactionId = null;
let deleteTargetId = null;
let currentSort = { key: 'date', direction: 'desc' };

const CATEGORY_VALUES = [
    'Groceries',
    'Dining',
    'Transport',
    'Entertainment',
    'Shopping',
    'Utilities',
    'Health',
    'Salary',
    'Freelance',
    'Other'
];

const TYPE_FILTER_OPTIONS = ['All Types', 'Income', 'Expense'];
const FILTER_CATEGORY_OPTIONS = ['All Categories', ...CATEGORY_VALUES];
const MODAL_CATEGORY_OPTIONS = ['Select category', ...CATEGORY_VALUES];

const dropdownRegistry = [];

function parseAmountFromText(value) {
    if (!value) return 0;
    const numeric = parseFloat(value.replace(/[^\d.-]/g, ''));
    return Number.isFinite(numeric) ? numeric : 0;
}

function seedTransactions() {
    return [
        {
            id: createId(),
            date: '2025-11-04',
            type: 'expense',
            category: 'Groceries',
            description: 'Weekly groceries',
            amount: 461.48
        },
        {
            id: createId(),
            date: '2025-11-03',
            type: 'income',
            category: 'Salary',
            description: 'Monthly salary',
            amount: 5200
        },
        {
            id: createId(),
            date: '2025-11-02',
            type: 'expense',
            category: 'Dining',
            description: 'Lunch with friends',
            amount: 125.5
        }
    ];
}

function bootstrapTransactions() {
    if (!transactionsTableBody) return;

    const existingRows = Array.from(transactionsTableBody.querySelectorAll('tr'));
    transactions = existingRows.map(row => {
        const cells = row.querySelectorAll('td');
        if (!cells.length) return null;
        const date = (cells[0]?.textContent || '').trim();
        const typeText = cells[1]?.querySelector('.type-badge')?.textContent.trim().toLowerCase();
        const category = (cells[2]?.textContent || '').trim();
        const description = (cells[3]?.textContent || '').trim();
        const amount = parseAmountFromText(cells[4]?.textContent || '');

        if (!date || !typeText || !category) {
            return null;
        }

        return {
            id: createId(),
            date,
            type: typeText === 'income' ? 'income' : 'expense',
            category,
            description,
            amount
        };
    }).filter(Boolean);

    if (!transactions.length) {
        transactions = seedTransactions();
    }

    filteredTransactions = [...transactions];
    transactionsTableBody.innerHTML = '';
    updateSortIndicators();
    applyFilters();
}

function renderTransactions(data = []) {
    if (!transactionsTableBody || !transactionsTable) return;

    transactionsTableBody.innerHTML = '';

    data.forEach(transaction => {
        const row = document.createElement('tr');
        row.dataset.transactionId = transaction.id;
        const isIncome = transaction.type === 'income';
        const amountClass = isIncome ? 'amount-positive' : 'amount-negative';
        const typeClass = isIncome ? 'type-income' : 'type-expense';
        row.innerHTML = `
            <td>${transaction.date}</td>
            <td><span class="type-badge ${typeClass}">${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</span></td>
            <td><span class="category-badge">${transaction.category}</span></td>
            <td>${transaction.description || ''}</td>
            <td class="${amountClass}">${formatCurrency(transaction.amount)}</td>
            <td class="actions">
                <button type="button" class="icon-button edit-transaction">✎</button>
                <button type="button" class="icon-button delete-transaction">🗑</button>
            </td>
        `;
        transactionsTableBody.appendChild(row);
    });

    const hasData = data.length > 0;
    if (transactionsTable) {
        transactionsTable.style.display = hasData ? 'table' : 'none';
    }
    if (emptyState) {
        emptyState.style.display = hasData ? 'none' : 'block';
    }
}

function sortTransactions(data) {
    if (!currentSort.key) {
        return [...data];
    }

    return [...data].sort((a, b) => {
        let valueA = a[currentSort.key];
        let valueB = b[currentSort.key];

        if (currentSort.key === 'date') {
            valueA = new Date(valueA);
            valueB = new Date(valueB);
        }

        if (currentSort.key === 'amount') {
            valueA = a.amount;
            valueB = b.amount;
        }

        if (valueA < valueB) return currentSort.direction === 'asc' ? -1 : 1;
        if (valueA > valueB) return currentSort.direction === 'asc' ? 1 : -1;
        return 0;
    });
}

function updateSortIndicators() {
    const dateIndicator = document.getElementById('dateSort');
    const amountIndicator = document.getElementById('amountSort');
    const dateHeader = document.querySelector('th[onclick*="date"]');
    const amountHeader = document.querySelector('th[onclick*="amount"]');

    const indicators = [
        { key: 'date', indicator: dateIndicator, header: dateHeader },
        { key: 'amount', indicator: amountIndicator, header: amountHeader }
    ];

    indicators.forEach(({ key, indicator, header }) => {
        if (!indicator || !header) return;
        const isActive = currentSort.key === key;
        header.classList.remove('sort-asc', 'sort-desc');
        indicator.style.opacity = isActive ? 1 : 0;
        if (isActive) {
            header.classList.add(currentSort.direction === 'asc' ? 'sort-asc' : 'sort-desc');
            indicator.textContent = currentSort.direction === 'asc' ? '▲' : '▼';
        }
    });
}

function closeAllDropdowns() {
    dropdownRegistry.forEach(({ trigger, menu }) => {
        trigger.classList.remove('active');
        menu.classList.remove('open');
    });
}

function setupDropdown({ triggerId, menuId, selectId, options, defaultValue, onChange }) {
    const trigger = document.getElementById(triggerId);
    const menu = document.getElementById(menuId);
    const select = document.getElementById(selectId);

    if (!trigger || !menu || !select) {
        return null;
    }

    const labelElement = trigger.querySelector('.dropdown-label') || trigger.querySelector('span');

    select.innerHTML = '';
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        select.appendChild(opt);
    });

    menu.innerHTML = '';
    const optionElements = options.map(option => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'dropdown-option';
        optionDiv.dataset.value = option;
        optionDiv.innerHTML = `<span>${option}</span><span class="dropdown-checkmark">✓</span>`;
        optionDiv.addEventListener('click', () => {
            setValue(option);
            menu.classList.remove('open');
            trigger.classList.remove('active');
            if (typeof onChange === 'function') {
                onChange(option);
            }
        });
        menu.appendChild(optionDiv);
        return optionDiv;
    });

    trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        const isOpen = menu.classList.contains('open');
        closeAllDropdowns();
        if (!isOpen) {
            menu.classList.add('open');
            trigger.classList.add('active');
        }
    });

    dropdownRegistry.push({ trigger, menu });

    function setValue(value, { silent = false } = {}) {
        const normalizedValue = options.includes(value) ? value : defaultValue;
        select.value = normalizedValue;
        optionElements.forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.value === normalizedValue);
        });
        if (labelElement) {
            labelElement.textContent = normalizedValue;
        }
        if (!silent && typeof onChange === 'function') {
            onChange(normalizedValue);
        }
    }

    setValue(defaultValue, { silent: true });

    return { setValue };
}

const typeFilterDropdown = setupDropdown({
    triggerId: 'typeFilterTrigger',
    menuId: 'typeFilterMenu',
    selectId: 'typeFilter',
    options: TYPE_FILTER_OPTIONS,
    defaultValue: 'All Types',
    onChange: () => applyFilters()
});

const categoryFilterDropdown = setupDropdown({
    triggerId: 'categoryFilterTrigger',
    menuId: 'categoryFilterMenu',
    selectId: 'categoryFilter',
    options: FILTER_CATEGORY_OPTIONS,
    defaultValue: 'All Categories',
    onChange: () => applyFilters()
});

const modalCategoryDropdown = setupDropdown({
    triggerId: 'modalCategoryTrigger',
    menuId: 'modalCategoryMenu',
    selectId: 'modalCategorySelect',
    options: MODAL_CATEGORY_OPTIONS,
    defaultValue: 'Select category'
});

const editModalCategoryDropdown = setupDropdown({
    triggerId: 'editModalCategoryTrigger',
    menuId: 'editModalCategoryMenu',
    selectId: 'editModalCategorySelect',
    options: MODAL_CATEGORY_OPTIONS,
    defaultValue: 'Select category'
});

document.addEventListener('click', function (e) {
    if (!e.target.closest('.custom-dropdown-wrapper')) {
        closeAllDropdowns();
    }
});

if (transactionsTableBody) {
    transactionsTableBody.addEventListener('click', function (event) {
        const editButton = event.target.closest('.edit-transaction');
        if (editButton) {
            event.preventDefault();
            const row = editButton.closest('tr');
            if (row) {
                openEditModal(row.dataset.transactionId);
            }
            return;
        }

        const deleteButton = event.target.closest('.delete-transaction');
        if (deleteButton) {
            event.preventDefault();
            const row = deleteButton.closest('tr');
            if (row) {
                openDeleteModal(row.dataset.transactionId);
            }
        }
    });
}

if (dateInput) {
    dateInput.addEventListener('click', function (e) {
        e.stopPropagation();
        if (calendarPicker) {
            calendarPicker.style.display = calendarPicker.style.display === 'block' ? 'none' : 'block';
            if (calendarPicker.style.display === 'block') {
                renderCalendar();
            }
        }
    });
}

function renderCalendar() {
    if (!calendarDaysContainer || !currentMonthLabel || !currentYearLabel) return;

    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    currentMonthLabel.textContent = new Date(year, month).toLocaleDateString('en-US', { month: 'long' });
    currentYearLabel.textContent = year;

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    calendarDaysContainer.innerHTML = '';

    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        const day = document.createElement('div');
        day.className = 'calendar-day other-month';
        day.textContent = daysInPrevMonth - i;
        calendarDaysContainer.appendChild(day);
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const day = document.createElement('div');
        day.className = 'calendar-day';
        day.textContent = i;

        const dayDate = new Date(year, month, i);
        const today = new Date();

        if (dayDate.toDateString() === today.toDateString()) {
            day.classList.add('today');
        }

        if (dateInput && dateInput.value) {
            const inputDate = new Date(dateInput.value + 'T00:00:00');
            if (dayDate.toDateString() === inputDate.toDateString()) {
                day.classList.add('selected');
            }
        }

        day.addEventListener('click', function () {
            calendarDaysContainer.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));

            const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            if (dateInput) {
                dateInput.value = formattedDate;
            }
            this.classList.add('selected');

            currentCalendarDate = new Date(year, month, i);
            if (calendarPicker) {
                calendarPicker.style.display = 'none';
            }
        });

        calendarDaysContainer.appendChild(day);
    }

    const daysRendered = firstDayOfMonth + daysInMonth;
    const remainingDays = 42 - daysRendered;
    for (let i = 1; i <= remainingDays; i++) {
        const day = document.createElement('div');
        day.className = 'calendar-day other-month';
        day.textContent = i;
        calendarDaysContainer.appendChild(day);
    }
}

function previousMonth() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    renderCalendar();
}

function clearDate() {
    if (dateInput) {
        dateInput.value = '';
    }
    currentCalendarDate = new Date();
    renderCalendar();
}

function setToday() {
    const today = new Date();
    if (dateInput) {
        dateInput.value = today.toISOString().split('T')[0];
    }
    currentCalendarDate = today;
    renderCalendar();
    if (calendarPicker) {
        calendarPicker.style.display = 'none';
    }
}

function openAddModal() {
    addTransactionModal.classList.add('open');
    document.getElementById('amountInput').value = '';
    document.getElementById('descriptionInput').value = '';
    if (modalCategoryDropdown) {
        modalCategoryDropdown.setValue('Select category', { silent: true });
    }
}

function closeAddModal() {
    addTransactionModal.classList.remove('open');
}

function openEditModal(transactionId) {
    const transaction = transactions.find(tx => tx.id === transactionId);
    if (!transaction) return;

    editingTransactionId = transactionId;

    const editDateInputElement = document.getElementById('editDateInput');
    const editDescriptionInputElement = document.getElementById('editDescriptionInput');
    const editAmountInputElement = document.getElementById('editAmountInput');
    const editModalCategorySelect = document.getElementById('editModalCategorySelect');

    if (editDateInputElement) {
        editDateInputElement.value = transaction.date;
    }
    if (editDescriptionInputElement) {
        editDescriptionInputElement.value = transaction.description || '';
    }
    if (editAmountInputElement) {
        editAmountInputElement.value = transaction.amount.toFixed(2);
    }

    const typeButtons = document.querySelectorAll('#editTransactionModal .type-btn');
    typeButtons.forEach(btn => {
        btn.classList.toggle('active', btn.textContent.toLowerCase() === transaction.type);
    });

    if (editModalCategorySelect) {
        editModalCategorySelect.value = transaction.category;
    }
    if (editModalCategoryDropdown) {
        editModalCategoryDropdown.setValue(transaction.category, { silent: true });
    } else {
        const editTrigger = document.querySelector('#editTransactionModal .custom-dropdown-trigger .dropdown-label');
        if (editTrigger) {
            editTrigger.textContent = transaction.category;
        }
    }

    editCurrentDate = new Date(transaction.date);
    renderEditCalendar();

    editTransactionModal.classList.add('open');
}

function closeEditModal() {
    editTransactionModal.classList.remove('open');
    editingTransactionId = null;
}

function openDeleteModal(transactionId) {
    deleteTargetId = transactionId;
    deleteTransactionModal.classList.add('open');
}

function closeDeleteModal() {
    deleteTransactionModal.classList.remove('open');
    deleteTargetId = null;
}

function confirmDelete() {
    if (!deleteTargetId) return;

    transactions = transactions.filter(transaction => transaction.id !== deleteTargetId);
    deleteTargetId = null;
    closeDeleteModal();
    showToast('Transaction deleted successfully', 'success');
    applyFilters();
}

document.getElementById('addTransactionBtn').addEventListener('click', function () {
    openAddModal();
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dateInput').value = today;
});

document.getElementById('exportBtn').addEventListener('click', openExportModal);

document.getElementById('saveTransactionBtn').addEventListener('click', saveTransaction);
document.getElementById('cancelAdd').addEventListener('click', closeAddModal);
document.getElementById('cancelEdit').addEventListener('click', closeEditModal);
document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);
document.getElementById('cancelDeleteBtn').addEventListener('click', closeDeleteModal);

document.getElementById('closeAddModal').addEventListener('click', closeAddModal);
document.getElementById('closeEditModal').addEventListener('click', closeEditModal);
document.getElementById('closeDeleteModal').addEventListener('click', closeDeleteModal);

document.getElementById('addTransactionModal').addEventListener('click', function (e) {
    if (e.target === this) {
        closeAddModal();
    }
});

document.getElementById('editTransactionModal').addEventListener('click', function (e) {
    if (e.target === this) {
        closeEditModal();
    }
});

document.getElementById('deleteTransactionModal').addEventListener('click', function (e) {
    if (e.target === this) {
        closeDeleteModal();
    }
});

document.querySelectorAll('.type-btn').forEach(button => {
    button.addEventListener('click', function () {
        const container = this.closest('.type-selector');
        container.querySelectorAll('.type-btn').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
    });
});

function saveTransaction() {
    const activeTypeButton = document.querySelector('#addTransactionModal .type-btn.active');
    const type = activeTypeButton ? activeTypeButton.textContent.toLowerCase() : 'expense';
    const amountValue = parseFloat(document.getElementById('amountInput').value);
    const category = document.getElementById('modalCategorySelect').value;
    const date = document.getElementById('dateInput').value || new Date().toISOString().split('T')[0];
    const description = document.getElementById('descriptionInput').value.trim();

    if (!amountValue || category === 'Select category') {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    const newTransaction = {
        id: createId(),
        date,
        type,
        category,
        description,
        amount: parseFloat(amountValue.toFixed(2))
    };

    transactions.push(newTransaction);

    closeAddModal();
    showToast('Transaction added successfully!');
    applyFilters();
}

function incrementAmount() {
    const input = document.getElementById('amountInput');
    let currentValue = parseFloat(input.value) || 0;
    input.value = (currentValue + 1).toFixed(2);
}

function decrementAmount() {
    const input = document.getElementById('amountInput');
    let currentValue = parseFloat(input.value) || 0;
    if (currentValue > 0) {
        input.value = (currentValue - 1).toFixed(2);
    }
}

function incrementEditAmount() {
    const input = document.getElementById('editAmountInput');
    let currentValue = parseFloat(input.value) || 0;
    input.value = (currentValue + 1).toFixed(2);
}

function decrementEditAmount() {
    const input = document.getElementById('editAmountInput');
    let currentValue = parseFloat(input.value) || 0;
    if (currentValue > 0) {
        input.value = (currentValue - 1).toFixed(2);
    }
}

document.getElementById('incrementAmountBtn').addEventListener('click', incrementAmount);
document.getElementById('decrementAmountBtn').addEventListener('click', decrementAmount);

document.getElementById('incrementEditAmountBtn').addEventListener('click', incrementEditAmount);
document.getElementById('decrementEditAmountBtn').addEventListener('click', decrementEditAmount);

document.getElementById('updateTransactionBtn').addEventListener('click', saveEditedTransaction);

function saveEditedTransaction() {
    if (!editingTransactionId) {
        showToast('No transaction selected for editing', 'error');
        return;
    }

    const transaction = transactions.find(tx => tx.id === editingTransactionId);
    if (!transaction) {
        showToast('Transaction not found', 'error');
        return;
    }

    const activeTypeButton = document.querySelector('#editTransactionModal .type-btn.active');
    const type = activeTypeButton ? activeTypeButton.textContent.toLowerCase() : transaction.type;
    const amountValue = parseFloat(document.getElementById('editAmountInput').value);
    const category = document.getElementById('editModalCategorySelect').value;
    const date = document.getElementById('editDateInput').value || transaction.date;
    const description = document.getElementById('editDescriptionInput').value.trim();

    if (!amountValue || category === 'Select category') {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    transaction.type = type;
    transaction.amount = parseFloat(amountValue.toFixed(2));
    transaction.category = category;
    transaction.date = date;
    transaction.description = description;

    closeEditModal();
    showToast('Transaction updated successfully!', 'success');
    applyFilters();
}

const editDateInput = document.getElementById('editDateInput');
const editCalendarPicker = document.getElementById('editCalendarPicker');
let editCurrentDate = new Date();

editDateInput.addEventListener('click', function (e) {
    e.stopPropagation();
    editCalendarPicker.style.display = editCalendarPicker.style.display === 'none' ? 'block' : 'none';
    if (editCalendarPicker.style.display === 'block') {
        renderEditCalendar();
    }
});

document.addEventListener('click', function (e) {
    if (!e.target.closest('.date-picker-wrapper')) {
        if (calendarPicker) {
            calendarPicker.style.display = 'none';
        }
        editCalendarPicker.style.display = 'none';
    }
});

function renderEditCalendar() {
    const year = editCurrentDate.getFullYear();
    const month = editCurrentDate.getMonth();

    document.getElementById('editCurrentMonth').textContent = new Date(year, month).toLocaleDateString('en-US', { month: 'long' });
    document.getElementById('editCurrentYear').textContent = year;

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const calendarDays = document.getElementById('editCalendarDays');
    calendarDays.innerHTML = '';

    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        const day = document.createElement('div');
        day.className = 'calendar-day other-month';
        day.textContent = daysInPrevMonth - i;
        calendarDays.appendChild(day);
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const day = document.createElement('div');
        day.className = 'calendar-day';
        day.textContent = i;

        const dayDate = new Date(year, month, i);
        const today = new Date();

        if (dayDate.toDateString() === today.toDateString()) {
            day.classList.add('today');
        }

        if (editDateInput.value) {
            const inputDateParts = editDateInput.value.split('-');
            const inputDate = new Date(parseInt(inputDateParts[0]), parseInt(inputDateParts[1]) - 1, parseInt(inputDateParts[2]));
            if (dayDate.toDateString() === inputDate.toDateString()) {
                day.classList.add('selected');
            }
        }

        day.addEventListener('click', function () {
            document.querySelectorAll('#editCalendarDays .calendar-day').forEach(d => d.classList.remove('selected'));

            const year = dayDate.getFullYear();
            const month = String(dayDate.getMonth() + 1).padStart(2, '0');
            const date = String(dayDate.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${date}`;

            editDateInput.value = formattedDate;
            this.classList.add('selected');

            editCurrentDate = new Date(year, dayDate.getMonth(), dayDate.getDate());
            editCalendarPicker.style.display = 'none';
        });

        calendarDays.appendChild(day);
    }

    const daysRendered = firstDayOfMonth + daysInMonth;
    const remainingDays = 42 - daysRendered;
    for (let i = 1; i <= remainingDays; i++) {
        const day = document.createElement('div');
        day.className = 'calendar-day other-month';
        day.textContent = i;
        calendarDays.appendChild(day);
    }
}

function editPreviousMonth() {
    editCurrentDate.setMonth(editCurrentDate.getMonth() - 1);
    renderEditCalendar();
}

function editNextMonth() {
    editCurrentDate.setMonth(editCurrentDate.getMonth() + 1);
    renderEditCalendar();
}

function editClearDate() {
    editDateInput.value = '';
    editCurrentDate = new Date();
    renderEditCalendar();
}

function editSetToday() {
    const today = new Date();
    editDateInput.value = today.toISOString().split('T')[0];
    editCurrentDate = today;
    renderEditCalendar();
    editCalendarPicker.style.display = 'none';
}

let fromCurrentDate = new Date();
let toCurrentDate = new Date();
const fromDateFilter = document.getElementById('fromDateFilter');
const toDateFilter = document.getElementById('toDateFilter');

fromDateFilter.addEventListener('click', function () {
    document.getElementById('fromCalendarPicker').style.display =
        document.getElementById('fromCalendarPicker').style.display === 'none' ? 'block' : 'none';
    document.getElementById('toCalendarPicker').style.display = 'none';
});

toDateFilter.addEventListener('click', function () {
    document.getElementById('toCalendarPicker').style.display =
        document.getElementById('toCalendarPicker').style.display === 'none' ? 'block' : 'none';
    document.getElementById('fromCalendarPicker').style.display = 'none';
});

document.addEventListener('click', function (e) {
    if (!e.target.closest('.filter-group')) {
        document.getElementById('fromCalendarPicker').style.display = 'none';
        document.getElementById('toCalendarPicker').style.display = 'none';
    }
});

function renderFromCalendar() {
    const year = fromCurrentDate.getFullYear();
    const month = fromCurrentDate.getMonth();

    document.getElementById('fromCurrentMonth').textContent = new Date(year, month).toLocaleDateString('en-US', { month: 'long' });
    document.getElementById('fromCurrentYear').textContent = year;

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const calendarDays = document.getElementById('fromCalendarDays');
    calendarDays.innerHTML = '';

    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        const day = document.createElement('div');
        day.className = 'calendar-day other-month';
        day.textContent = daysInPrevMonth - i;
        calendarDays.appendChild(day);
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const day = document.createElement('div');
        day.className = 'calendar-day';
        day.textContent = i;

        const dayDate = new Date(year, month, i);
        const today = new Date();

        if (dayDate.toDateString() === today.toDateString()) {
            day.classList.add('today');
        }

        if (fromDateFilter.value) {
            const inputDate = new Date(fromDateFilter.value + 'T00:00:00');
            if (dayDate.toDateString() === inputDate.toDateString()) {
                day.classList.add('selected');
            }
        }

        day.addEventListener('click', function () {
            document.querySelectorAll('#fromCalendarDays .calendar-day').forEach(d => d.classList.remove('selected'));

            const year = dayDate.getFullYear();
            const month = String(dayDate.getMonth() + 1).padStart(2, '0');
            const date = String(dayDate.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${date}`;

            fromDateFilter.value = formattedDate;
            this.classList.add('selected');

            fromCurrentDate = new Date(year, dayDate.getMonth(), dayDate.getDate());
            document.getElementById('fromCalendarPicker').style.display = 'none';
            applyFilters();
        });

        calendarDays.appendChild(day);
    }

    const daysRendered = firstDayOfMonth + daysInMonth;
    const remainingDays = 42 - daysRendered;
    for (let i = 1; i <= remainingDays; i++) {
        const day = document.createElement('div');
        day.className = 'calendar-day other-month';
        day.textContent = i;
        calendarDays.appendChild(day);
    }
}

function renderToCalendar() {
    const year = toCurrentDate.getFullYear();
    const month = toCurrentDate.getMonth();

    document.getElementById('toCurrentMonth').textContent = new Date(year, month).toLocaleDateString('en-US', { month: 'long' });
    document.getElementById('toCurrentYear').textContent = year;

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const calendarDays = document.getElementById('toCalendarDays');
    calendarDays.innerHTML = '';

    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        const day = document.createElement('div');
        day.className = 'calendar-day other-month';
        day.textContent = daysInPrevMonth - i;
        calendarDays.appendChild(day);
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const day = document.createElement('div');
        day.className = 'calendar-day';
        day.textContent = i;

        const dayDate = new Date(year, month, i);
        const today = new Date();

        if (dayDate.toDateString() === today.toDateString()) {
            day.classList.add('today');
        }

        if (toDateFilter.value) {
            const inputDate = new Date(toDateFilter.value + 'T00:00:00');
            if (dayDate.toDateString() === inputDate.toDateString()) {
                day.classList.add('selected');
            }
        }

        day.addEventListener('click', function () {
            document.querySelectorAll('#toCalendarDays .calendar-day').forEach(d => d.classList.remove('selected'));

            const year = dayDate.getFullYear();
            const month = String(dayDate.getMonth() + 1).padStart(2, '0');
            const date = String(dayDate.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${date}`;

            toDateFilter.value = formattedDate;
            this.classList.add('selected');

            toCurrentDate = new Date(year, dayDate.getMonth(), dayDate.getDate());
            document.getElementById('toCalendarPicker').style.display = 'none';
            applyFilters();
        });

        calendarDays.appendChild(day);
    }

    const daysRendered = firstDayOfMonth + daysInMonth;
    const remainingDays = 42 - daysRendered;
    for (let i = 1; i <= remainingDays; i++) {
        const day = document.createElement('div');
        day.className = 'calendar-day other-month';
        day.textContent = i;
        calendarDays.appendChild(day);
    }
}

function fromPreviousMonth() {
    fromCurrentDate.setMonth(fromCurrentDate.getMonth() - 1);
    renderFromCalendar();
}

function fromNextMonth() {
    fromCurrentDate.setMonth(fromCurrentDate.getMonth() + 1);
    renderFromCalendar();
}

function fromClearDate() {
    fromDateFilter.value = '';
    fromCurrentDate = new Date();
    renderFromCalendar();
    applyFilters();
}

function fromSetToday() {
    const today = new Date();
    fromDateFilter.value = today.toISOString().split('T')[0];
    fromCurrentDate = today;
    renderFromCalendar();
    document.getElementById('fromCalendarPicker').style.display = 'none';
    applyFilters();
}

function toPreviousMonth() {
    toCurrentDate.setMonth(toCurrentDate.getMonth() - 1);
    renderToCalendar();
}

function toNextMonth() {
    toCurrentDate.setMonth(toCurrentDate.getMonth() + 1);
    renderToCalendar();
}

function toClearDate() {
    toDateFilter.value = '';
    toCurrentDate = new Date();
    renderToCalendar();
    applyFilters();
}

function toSetToday() {
    const today = new Date();
    toDateFilter.value = today.toISOString().split('T')[0];
    toCurrentDate = today;
    renderToCalendar();
    document.getElementById('toCalendarPicker').style.display = 'none';
    applyFilters();
}

renderFromCalendar();
renderToCalendar();

fromDateFilter.addEventListener('change', applyFilters);
toDateFilter.addEventListener('change', applyFilters);

document.getElementById('clearFiltersBtn').addEventListener('click', function () {
    document.getElementById('searchInput').value = '';
    if (typeFilterDropdown) {
        typeFilterDropdown.setValue('All Types', { silent: true });
    } else {
        document.getElementById('typeFilter').value = 'All Types';
    }
    if (categoryFilterDropdown) {
        categoryFilterDropdown.setValue('All Categories', { silent: true });
    } else {
        document.getElementById('categoryFilter').value = 'All Categories';
    }

    fromDateFilter.value = '';
    toDateFilter.value = '';
    fromCurrentDate = new Date();
    toCurrentDate = new Date();
    renderFromCalendar();
    renderToCalendar();
    closeAllDropdowns();

    applyFilters();
});

function applyFilters() {
    const searchTerm = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const typeFilterValue = document.getElementById('typeFilter')?.value || 'All Types';
    const categoryFilterValue = document.getElementById('categoryFilter')?.value || 'All Categories';
    const fromDateValue = fromDateFilter.value;
    const toDateValue = toDateFilter.value;

    const fromDate = fromDateValue ? new Date(fromDateValue) : null;
    const toDate = toDateValue ? new Date(toDateValue) : null;
    if (toDate) {
        toDate.setHours(23, 59, 59, 999);
    }

    const results = transactions.filter(transaction => {
        const normalizedCategory = (transaction.category || '').toLowerCase();
        const formattedAmount = formatCurrency(transaction.amount).toLowerCase();
        const rawAmount = transaction.amount.toString();
        const fixedAmount = transaction.amount.toFixed(2);
        const transactionDate = new Date(transaction.date);

        const matchesSearch =
            !searchTerm ||
            transaction.date.toLowerCase().includes(searchTerm) ||
            transaction.type.toLowerCase().includes(searchTerm) ||
            normalizedCategory.includes(searchTerm) ||
            (transaction.description || '').toLowerCase().includes(searchTerm) ||
            formattedAmount.includes(searchTerm) ||
            rawAmount.includes(searchTerm) ||
            fixedAmount.includes(searchTerm);

        const matchesType =
            typeFilterValue === 'All Types' ||
            transaction.type === typeFilterValue.toLowerCase();

        const matchesCategory =
            categoryFilterValue === 'All Categories' ||
            normalizedCategory === categoryFilterValue.toLowerCase();

        const matchesFromDate = !fromDate || transactionDate >= fromDate;
        const matchesToDate = !toDate || transactionDate <= toDate;

        return matchesSearch && matchesType && matchesCategory && matchesFromDate && matchesToDate;
    });

    filteredTransactions = sortTransactions(results);
    renderTransactions(filteredTransactions);
    updateSummaryTotals(filteredTransactions);
}

document.getElementById('typeFilter').addEventListener('change', applyFilters);
document.getElementById('categoryFilter').addEventListener('change', applyFilters);

const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', applyFilters);

bootstrapTransactions();

function openExportModal() {
    document.getElementById('exportModal').style.display = 'flex';
}

function closeExportModal() {
    document.getElementById('exportModal').style.display = 'none';
}

document.getElementById('exportModal').addEventListener('click', function (e) {
    if (e.target === this) {
        closeExportModal();
    }
});

function getFilteredTransactions() {
    return filteredTransactions.map(transaction => ({
        date: transaction.date,
        type: transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1),
        category: transaction.category,
        description: transaction.description || '',
        amount: formatCurrency(transaction.amount)
    }));
}

function exportAsCSV() {
    const filteredTransactions = getFilteredTransactions();
    if (filteredTransactions.length === 0) {
        showToast('No transactions to export.', 'info');
        return;
    }

    let csv = 'Date,Type,Category,Description,Amount\n';

    filteredTransactions.forEach(transaction => {
        const escapedDescription = transaction.description.includes(',') ? `"${transaction.description.replace(/"/g, '""')}"` : transaction.description;
        const row = [
            transaction.date,
            transaction.type,
            transaction.category,
            escapedDescription,
            transaction.amount
        ].join(',');
        csv += row + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    closeExportModal();
}

function exportAsJSON() {
    const filteredTransactions = getFilteredTransactions();
    if (filteredTransactions.length === 0) {
        showToast('No transactions to export.', 'info');
        return;
    }

    const json = JSON.stringify(filteredTransactions, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions-${new Date().toISOString().split('T')[0]}.json`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    closeExportModal();
}

function exportAsPDF() {
    const filteredTransactions = getFilteredTransactions();
    if (filteredTransactions.length === 0) {
        showToast('No transactions to export.', 'info');
        return;
    }

    let html = `
        <html>
        <head>
            <title>Transaction Report</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 30px; background-color: #f4f4f4; color: #333; }
                h1 { color: #a855f7; text-align: center; margin-bottom: 20px; }
                p { text-align: center; color: #6b7280; margin-bottom: 30px; }
                table { width: 100%; border-collapse: collapse; box-shadow: 0 2px 5px rgba(0,0,0,0.1); background-color: #fff; }
                th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee; }
                th { background-color: #a855f7; color: white; font-weight: 600; text-transform: uppercase; font-size: 12px; }
                td { font-size: 13px; }
                tr:nth-child(even) { background-color: #f9f9f9; }
                tr:hover { background-color: #f1f1f1; }
                .amount-positive { color: #22c55e; font-weight: 600; }
                .amount-negative { color: #ef4444; font-weight: 600; }
                .footer { margin-top: 30px; text-align: center; color: #9ca3af; font-size: 11px; }
            </style>
        </head>
        <body>
            <h1>Transaction Report</h1>
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
    `;

    filteredTransactions.forEach(transaction => {
        const amountClass = transaction.type.toLowerCase() === 'income' ? 'amount-positive' : 'amount-negative';
        html += `<tr>
            <td>${transaction.date}</td>
            <td>${transaction.type}</td>
            <td>${transaction.category}</td>
            <td>${transaction.description}</td>
            <td class="${amountClass}">${transaction.amount}</td>
        </tr>`;
    });

    html += `
                </tbody>
            </table>
            <div class="footer">
                <p>SmartLedger Financial Dashboard | Powered by Your App</p>
            </div>
        </body>
        </html>
    `;

    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
    closeExportModal();
}

function formatCurrency(value) {
    const numericValue = Number(value) || 0;
    return `₱${numericValue.toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}

function sortTable(key) {
    if (currentSort.key === key) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.key = key;
        currentSort.direction = 'desc';
    }

    updateSortIndicators();
    applyFilters();
}

window.sortTable = sortTable;

function updateSummaryTotals(data = filteredTransactions) {
    let totalIncome = 0;
    let totalExpense = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    data.forEach(transaction => {
        if (transaction.type === 'income') {
            totalIncome += transaction.amount;
            incomeCount++;
        } else {
            totalExpense += transaction.amount;
            expenseCount++;
        }
    });

    const netAmount = totalIncome - totalExpense;

    document.getElementById('totalIncome').textContent = formatCurrency(totalIncome);
    document.getElementById('totalExpense').textContent = formatCurrency(totalExpense);

    const netAmountElement = document.getElementById('netAmount');
    netAmountElement.textContent = formatCurrency(netAmount);
    netAmountElement.style.color = netAmount >= 0 ? '#22c55e' : '#ef4444';

    document.getElementById('incomeCount').textContent =
        incomeCount + (incomeCount === 1 ? ' transaction' : ' transactions');
    document.getElementById('expenseCount').textContent =
        expenseCount + (expenseCount === 1 ? ' transaction' : ' transactions');

    const totalTransactions = data.length;
    document.getElementById('allCount').textContent =
        totalTransactions + (totalTransactions === 1 ? ' total' : ' total');
}

