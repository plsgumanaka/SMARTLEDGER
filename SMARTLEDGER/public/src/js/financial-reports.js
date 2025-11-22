// Financial Reports page logic moved from inline <script> in components/financial-reports.html
// This script is loaded by public/src/components/financial-reports.html

let chartInstances = {};

const SAMPLE_TRANSACTIONS = [
    { id: 1, date: '2025-11-01', type: 'income', description: 'Monthly Salary', category: 'Salary', amount: 5200 },
    { id: 2, date: '2025-11-03', type: 'expense', description: 'Whole Foods Market', category: 'Groceries', amount: 125.50 },
    { id: 3, date: '2025-11-05', type: 'expense', description: 'Restaurant Dinner', category: 'Dining', amount: 65.00 },
    { id: 4, date: '2025-11-07', type: 'expense', description: 'Gas Station', category: 'Transport', amount: 45.00 },
    { id: 5, date: '2025-11-08', type: 'expense', description: 'Netflix Subscription', category: 'Entertainment', amount: 15.99 },
    { id: 6, date: '2025-11-10', type: 'expense', description: 'Amazon Shopping', category: 'Shopping', amount: 89.99 },
    { id: 7, date: '2025-11-12', type: 'expense', description: 'Electric Bill', category: 'Utilities', amount: 120.00 },
    { id: 8, date: '2025-11-14', type: 'expense', description: 'Coffee Shop', category: 'Dining', amount: 12.50 },
    { id: 9, date: '2025-11-15', type: 'income', description: 'Freelance Project', category: 'Freelance', amount: 850.00 },
    { id: 10, date: '2025-11-16', type: 'expense', description: 'Gym Membership', category: 'Health', amount: 55.00 },
    { id: 11, date: '2025-11-18', type: 'expense', description: 'Grocery Store', category: 'Groceries', amount: 145.30 },
    { id: 12, date: '2025-11-20', type: 'expense', description: 'Uber Ride', category: 'Transport', amount: 28.50 },
    { id: 13, date: '2025-11-22', type: 'expense', description: 'Movie Tickets', category: 'Entertainment', amount: 32.00 },
    { id: 14, date: '2025-11-25', type: 'expense', description: 'Clothing Store', category: 'Shopping', amount: 156.00 },
    { id: 15, date: '2025-11-27', type: 'expense', description: 'Internet Bill', category: 'Utilities', amount: 89.99 },
    { id: 16, date: '2025-10-01', type: 'income', description: 'Monthly Salary', category: 'Salary', amount: 5200 },
    { id: 17, date: '2025-10-03', type: 'expense', description: 'Grocery Shopping', category: 'Groceries', amount: 135.00 },
    { id: 18, date: '2025-10-05', type: 'expense', description: 'Restaurant', category: 'Dining', amount: 78.50 },
    { id: 19, date: '2025-10-08', type: 'expense', description: 'Gas Station', category: 'Transport', amount: 52.00 },
    { id: 20, date: '2025-10-10', type: 'expense', description: 'Spotify Premium', category: 'Entertainment', amount: 10.99 },
    { id: 21, date: '2025-10-12', type: 'expense', description: 'Online Shopping', category: 'Shopping', amount: 210.00 },
    { id: 22, date: '2025-10-15', type: 'expense', description: 'Electric Bill', category: 'Utilities', amount: 115.00 },
    { id: 23, date: '2025-10-18', type: 'expense', description: 'Pharmacy', category: 'Health', amount: 42.00 },
    { id: 24, date: '2025-10-20', type: 'income', description: 'Freelance Work', category: 'Freelance', amount: 650.00 },
    { id: 25, date: '2025-10-22', type: 'expense', description: 'Grocery Store', category: 'Groceries', amount: 168.75 },
    { id: 26, date: '2025-09-01', type: 'income', description: 'Monthly Salary', category: 'Salary', amount: 5200 },
    { id: 27, date: '2025-09-05', type: 'expense', description: 'Grocery Shopping', category: 'Groceries', amount: 142.30 },
    { id: 28, date: '2025-09-08', type: 'expense', description: 'Restaurant Dinner', category: 'Dining', amount: 95.00 },
    { id: 29, date: '2025-09-10', type: 'expense', description: 'Gas Station', category: 'Transport', amount: 48.00 },
    { id: 30, date: '2025-09-12', type: 'expense', description: 'Concert Tickets', category: 'Entertainment', amount: 125.00 },
    { id: 31, date: '2025-09-15', type: 'expense', description: 'New Shoes', category: 'Shopping', amount: 189.99 },
    { id: 32, date: '2025-09-18', type: 'expense', description: 'Water Bill', category: 'Utilities', amount: 65.00 },
    { id: 33, date: '2025-09-20', type: 'income', description: 'Side Project', category: 'Business', amount: 1200.00 },
    { id: 34, date: '2025-09-25', type: 'expense', description: 'Grocery Store', category: 'Groceries', amount: 158.50 },
    { id: 35, date: '2025-08-01', type: 'income', description: 'Monthly Salary', category: 'Salary', amount: 5200 },
    { id: 36, date: '2025-08-03', type: 'expense', description: 'Grocery Shopping', category: 'Groceries', amount: 155.00 },
    { id: 37, date: '2025-08-06', type: 'expense', description: 'Restaurant', category: 'Dining', amount: 82.50 },
    { id: 38, date: '2025-08-10', type: 'expense', description: 'Gas Station', category: 'Transport', amount: 55.00 },
    { id: 39, date: '2025-08-12', type: 'expense', description: 'Streaming Services', category: 'Entertainment', amount: 35.97 },
    { id: 40, date: '2025-08-15', type: 'income', description: 'Bonus Payment', category: 'Salary', amount: 850.00 },
    { id: 41, date: '2025-08-18', type: 'expense', description: 'Electronics', category: 'Shopping', amount: 299.00 },
    { id: 42, date: '2025-08-20', type: 'expense', description: 'Electric Bill', category: 'Utilities', amount: 135.00 },
    { id: 43, date: '2025-07-01', type: 'income', description: 'Monthly Salary', category: 'Salary', amount: 5200 },
    { id: 44, date: '2025-07-05', type: 'expense', description: 'Grocery Shopping', category: 'Groceries', amount: 138.25 },
    { id: 45, date: '2025-07-08', type: 'expense', description: 'Restaurant', category: 'Dining', amount: 68.00 },
    { id: 46, date: '2025-07-12', type: 'expense', description: 'Gas Station', category: 'Transport', amount: 42.00 },
    { id: 47, date: '2025-07-15', type: 'expense', description: 'Movie Night', category: 'Entertainment', amount: 45.00 },
    { id: 48, date: '2025-07-18', type: 'expense', description: 'Clothing', category: 'Shopping', amount: 175.50 },
    { id: 49, date: '2025-07-22', type: 'expense', description: 'Utilities', category: 'Utilities', amount: 98.00 },
    { id: 50, date: '2025-07-25', type: 'expense', description: 'Grocery Store', category: 'Groceries', amount: 162.00 },
    { id: 51, date: '2025-06-01', type: 'income', description: 'Monthly Salary', category: 'Salary', amount: 5200 },
    { id: 52, date: '2025-06-04', type: 'expense', description: 'Grocery Shopping', category: 'Groceries', amount: 148.75 },
    { id: 53, date: '2025-06-07', type: 'expense', description: 'Restaurant', category: 'Dining', amount: 72.00 },
    { id: 54, date: '2025-06-10', type: 'expense', description: 'Gas Station', category: 'Transport', amount: 50.00 },
    { id: 55, date: '2025-06-14', type: 'expense', description: 'Entertainment', category: 'Entertainment', amount: 55.00 },
    { id: 56, date: '2025-06-18', type: 'expense', description: 'Shopping', category: 'Shopping', amount: 198.00 },
    { id: 57, date: '2025-06-22', type: 'expense', description: 'Bills', category: 'Utilities', amount: 105.00 },
    { id: 58, date: '2025-06-25', type: 'expense', description: 'Groceries', category: 'Groceries', amount: 171.50 },
];

const COLORS = ['#3C50E0', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

function getTransactions() {
    return SAMPLE_TRANSACTIONS;
}

function getMonthKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}

function initializeDropdowns() {
    const reportTypeMenu = document.getElementById('reportTypeMenu');
    reportTypeMenu.innerHTML = `
        <div class="dropdown-option selected" data-value="monthly">
            <span>Monthly Summary</span>
            <span class="dropdown-checkmark"><i class="fi fi-rr-check"></i></span>
        </div>
        <div class="dropdown-option" data-value="category">
            <span>Category Breakdown</span>
            <span class="dropdown-checkmark"><i class="fi fi-rr-check"></i></span>
        </div>
        <div class="dropdown-option" data-value="trend">
            <span>Trend Analysis</span>
            <span class="dropdown-checkmark"><i class="fi fi-rr-check"></i></span>
        </div>
    `;

    const transactions = getTransactions();
    const months = new Set();

    // Generate months for the last year to ensure enough data for charts/trends
    for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        months.add(getMonthKey(date));
    }

    const sortedMonths = Array.from(months).sort().reverse();
    const periodSelect = document.getElementById('periodSelect');
    const periodMenu = document.getElementById('periodMenu');

    periodSelect.innerHTML = sortedMonths.map(month => 
        `<option value="${month}">${new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</option>`
    ).join('');

    periodMenu.innerHTML = sortedMonths.map((month, idx) => 
        `<div class="dropdown-option${idx === 0 ? ' selected' : ''}" data-value="${month}">
            <span>${new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            <span class="dropdown-checkmark"><i class="fi fi-rr-check"></i></span>
        </div>`
    ).join('');

    setupDropdownListeners();
}

function setupDropdownListeners() {
    document.querySelectorAll('.custom-dropdown-trigger').forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.stopPropagation();
            const wrapper = this.closest('.custom-dropdown-wrapper');
            const menu = wrapper.querySelector('.custom-dropdown-menu');
            
            const isActive = this.classList.toggle('active');
            menu.classList.toggle('open', isActive);

            // Close other dropdowns if this one is opened
            document.querySelectorAll('.custom-dropdown-trigger').forEach(other => {
                if (other !== this && other.classList.contains('active')) {
                    other.classList.remove('active');
                    other.closest('.custom-dropdown-wrapper').querySelector('.custom-dropdown-menu').classList.remove('open');
                }
            });
        });
    });

    document.querySelectorAll('.dropdown-option').forEach(option => {
        option.addEventListener('click', function() {
            const wrapper = this.closest('.custom-dropdown-wrapper');
            const trigger = wrapper.querySelector('.custom-dropdown-trigger');
            const menu = wrapper.querySelector('.custom-dropdown-menu');
            const select = wrapper.querySelector('.filter-select');
            const value = this.dataset.value;

            select.value = value;
            wrapper.querySelectorAll('.dropdown-option').forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');

            trigger.querySelector('span:first-child').textContent = this.querySelector('span:not(.dropdown-checkmark)').textContent;
            trigger.classList.remove('active');
            menu.classList.remove('open');

            select.dispatchEvent(new Event('change', { bubbles: true }));
        });
    });

    document.addEventListener('click', e => {
        document.querySelectorAll('.custom-dropdown-trigger.active').forEach(trigger => {
            if (!trigger.closest('.custom-dropdown-wrapper').contains(e.target)) {
                trigger.classList.remove('active');
                trigger.closest('.custom-dropdown-wrapper').querySelector('.custom-dropdown-menu').classList.remove('open');
            }
        });
    });
}

function getCurrentPeriod() {
    return document.getElementById('periodSelect').value;
}

function getTransactionsByPeriod(period) {
    return getTransactions().filter(t => getMonthKey(new Date(t.date)) === period);
}

function getLast6Months() {
    const months = [];
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        months.push(getMonthKey(date));
    }
    return months;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(amount);
}

function handleReportTypeChange() {
    const type = document.getElementById('reportTypeSelect').value;
    switchReport(type);
}

function switchReport(type) {
    document.querySelectorAll('.report-content').forEach(el => el.classList.remove('active'));
    document.getElementById(type).classList.add('active');

    setTimeout(() => {
        if (type === 'monthly') renderMonthlyReport();
        else if (type === 'category') renderCategoryReport();
        else if (type === 'trend') renderTrendReport();
    }, 0);
}

function updateReport() {
    const type = document.getElementById('reportTypeSelect').value;
    if (type === 'monthly') renderMonthlyReport();
    else if (type === 'category') renderCategoryReport();
    else if (type === 'trend') renderTrendReport();
}

function renderMonthlyReport() {
    const period = getCurrentPeriod();
    const transactions = getTransactionsByPeriod(period);

    const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const savings = income - expenses;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;

    const dateObj = new Date(period + '-01');
    
    const summaryHTML = `
        <div class="summary-card" style="display: block;">
            <div class="summary-label"><i class="fi fi-rr-calendar"></i> Period</div>
            <div class="summary-value">${dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
            <div class="summary-detail">${new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0).getDate()} days</div>
        </div>
        <div class="summary-card" style="display: block;">
            <div class="summary-label"><i class="fi fi-rr-chart-histogram"></i> Total Income</div>
            <div class="summary-value income">${formatCurrency(income)}</div>
            <div class="summary-detail" id="incomeDetail"></div>
        </div>
        <div class="summary-card" style="display: block;">
            <div class="summary-label"><i class="fi fi-rr-chart-histogram"></i> Total Expenses</div>
            <div class="summary-value expense">${formatCurrency(expenses)}</div>
            <div class="summary-detail" id="expenseDetail"></div>
        </div>
        <div class="summary-card" style="display: block;">
            <div class="summary-label"><i class="fi fi-rr-money-bill-wave"></i> Savings Rate</div>
            <div class="summary-value savings">${savingsRate.toFixed(1)}%</div>
            <div class="summary-detail">${formatCurrency(savings)} saved</div>
        </div>
    `;
    
    document.getElementById('monthlySummaryContent').innerHTML = summaryHTML;

    const prevMonth = getMonthKey(new Date(dateObj.getFullYear(), dateObj.getMonth() - 1, 1));
    const prevTransactions = getTransactionsByPeriod(prevMonth);
    const prevIncome = prevTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const prevExpenses = prevTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    
    const incomeChange = prevIncome > 0 ? ((income - prevIncome) / prevIncome) * 100 : 0;
    const expenseChange = prevExpenses > 0 ? ((expenses - prevExpenses) / prevExpenses) * 100 : 0;
    
    document.getElementById('incomeDetail').textContent = `${incomeChange >= 0 ? '+' : ''}${incomeChange.toFixed(1)}% vs last month`;
    document.getElementById('incomeDetail').style.color = incomeChange >= 0 ? '#22c55e' : '#ef4444';
    
    document.getElementById('expenseDetail').textContent = `${expenseChange >= 0 ? '+' : ''}${expenseChange.toFixed(1)}% vs last month`;
    document.getElementById('expenseDetail').style.color = expenseChange >= 0 ? '#ef4444' : '#22c55e';

    renderMonthlyChart(period);
    renderTopExpenses(period);
    renderSavingsChart();
    renderIncomeTable(period);
    renderExpenseTable(period);
}

function renderMonthlyChart(period) {
    const months = getLast6Months();
    const data = months.map(m => {
        const trans = getTransactionsByPeriod(m);
        const inc = trans.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const exp = trans.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        return {
            income: inc,
            expenses: exp,
            savings: inc - exp,
        };
    });

    const ctx = document.getElementById('monthlyChart');
    if (chartInstances.monthly) chartInstances.monthly.destroy();

    chartInstances.monthly = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months.map(m => new Date(m + '-01').toLocaleDateString('en-US', { month: 'short' })),
            datasets: [
                { label: 'Income', data: data.map(d => d.income), backgroundColor: '#22c55e', borderRadius: 6 },
                { label: 'Expenses', data: data.map(d => d.expenses), backgroundColor: '#ef4444', borderRadius: 6 },
                { label: 'Savings', data: data.map(d => d.savings), backgroundColor: '#3C50E0', borderRadius: 6 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { labels: { color: '#9ca3af' } },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#374151',
                    bodyColor: '#374151',
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    padding: 12,
                    boxPadding: 8,
                    displayColors: true,
                    callbacks: {
                        title: function(context) {
                            return context[0].label;
                        },
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = formatCurrency(context.parsed.y);
                            return `${label}: ${value}`;
                        }
                    }
                }
            },
            scales: {
                y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(168, 85, 247, 0.1)' } },
                x: { ticks: { color: '#9ca3af' }, grid: { display: false } }
            }
        }
    });
}

function renderTopExpenses(period) {
    const trans = getTransactionsByPeriod(period);
    const categories = {};
    trans.filter(t => t.type === 'expense').forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
    });

    const top5 = Object.entries(categories).sort((a, b) => b[1] - a[1]).slice(0, 5);
    
    document.getElementById('topExpensesContainer').innerHTML = top5.map(([cat, amt], i) => `
        <div class="category-item">
            <div class="category-color" style="background: ${COLORS[i % COLORS.length]};"></div>
            <div class="category-info">
                <div class="category-name">${cat}</div>
            </div>
            <div class="category-amount">${formatCurrency(amt)}</div>
        </div>
    `).join('');
}

function renderSavingsChart() {
    const months = getLast6Months();
    const data = months.map(m => {
        const trans = getTransactionsByPeriod(m);
        const inc = trans.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const exp = trans.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        return inc - exp;
    });

    const ctx = document.getElementById('savingsChart');
    if (chartInstances.savings) chartInstances.savings.destroy();

    chartInstances.savings = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months.map(m => new Date(m + '-01').toLocaleDateString('en-US', { month: 'short' })),
            datasets: [{
                label: 'Savings',
                data: data,
                borderColor: '#a855f7',
                backgroundColor: 'rgba(168, 85, 247, 0.2)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#9ca3af' } } },
            scales: {
                y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(168, 85, 247, 0.1)' } },
                x: { ticks: { color: '#9ca3af' }, grid: { display: false } }
            }
        }
    });
}

function renderIncomeTable(period) {
    const trans = getTransactionsByPeriod(period);
    const sources = {};
    trans.filter(t => t.type === 'income').forEach(t => {
        sources[t.category] = (sources[t.category] || 0) + t.amount;
    });

    document.getElementById('incomeSourcesTable').innerHTML = Object.entries(sources)
        .sort((a, b) => b[1] - a[1])
        .map(([src, amt]) => `<tr><td>${src}</td><td>${formatCurrency(amt)}</td></tr>`)
        .join('');
}

function renderExpenseTable(period) {
    const trans = getTransactionsByPeriod(period);
    const cats = {};
    trans.filter(t => t.type === 'expense').forEach(t => {
        cats[t.category] = (cats[t.category] || 0) + t.amount;
    });

    document.getElementById('expenseBreakdownTable').innerHTML = Object.entries(cats)
        .sort((a, b) => b[1] - a[1])
        .map(([cat, amt]) => `<tr><td>${cat}</td><td>${formatCurrency(amt)}</td></tr>`)
        .join('');
}

function renderCategoryReport() {
    const period = getCurrentPeriod();
    const trans = getTransactionsByPeriod(period);

    const income = trans.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = trans.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const savings = income - expenses;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;

    const dateObj = new Date(period + '-01');
    
    const summaryHTML = `
        <div class="summary-card" style="display: block;">
            <div class="summary-label"><i class="fi fi-rr-calendar"></i> Period</div>
            <div class="summary-value">${dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
            <div class="summary-detail">${new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0).getDate()} days</div>
        </div>
        <div class="summary-card" style="display: block;">
            <div class="summary-label"><i class="fi fi-rr-chart-histogram"></i> Total Income</div>
            <div class="summary-value income">${formatCurrency(income)}</div>
            <div class="summary-detail" id="categoryIncomeDetail"></div>
        </div>
        <div class="summary-card" style="display: block;">
            <div class="summary-label"><i class="fi fi-rr-chart-histogram"></i> Total Expenses</div>
            <div class="summary-value expense">${formatCurrency(expenses)}</div>
            <div class="summary-detail" id="categoryExpenseDetail"></div>
        </div>
        <div class="summary-card" style="display: block;">
            <div class="summary-label"><i class="fi fi-rr-money-bill-wave"></i> Savings Rate</div>
            <div class="summary-value savings">${savingsRate.toFixed(1)}%</div>
            <div class="summary-detail">${formatCurrency(savings)} saved</div>
        </div>
    `;
    
    document.getElementById('categorySummaryContent').innerHTML = summaryHTML;

    const prevMonth = getMonthKey(new Date(dateObj.getFullYear(), dateObj.getMonth() - 1, 1));
    const prevTransactions = getTransactionsByPeriod(prevMonth);
    const prevIncome = prevTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const prevExpenses = prevTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    
    const incomeChange = prevIncome > 0 ? ((income - prevIncome) / prevIncome) * 100 : 0;
    const expenseChange = prevExpenses > 0 ? ((expenses - prevExpenses) / prevExpenses) * 100 : 0;
    
    document.getElementById('categoryIncomeDetail').textContent = `${incomeChange >= 0 ? '+' : ''}${incomeChange.toFixed(1)}% vs last month`;
    document.getElementById('categoryIncomeDetail').style.color = incomeChange >= 0 ? '#22c55e' : '#ef4444';
    
    document.getElementById('categoryExpenseDetail').textContent = `${expenseChange >= 0 ? '+' : ''}${expenseChange.toFixed(1)}% vs last month`;
    document.getElementById('categoryExpenseDetail').style.color = expenseChange >= 0 ? '#ef4444' : '#22c55e';

    const expCats = {};
    trans.filter(t => t.type === 'expense').forEach(t => {
        expCats[t.category] = (expCats[t.category] || 0) + t.amount;
    });

    renderCategoryChart(expCats);
    renderCategoryDetails(expCats);
    renderCategoryTable(expCats);
}

function renderCategoryChart(cats) {
    const ctx = document.getElementById('categoryChart');
    if (chartInstances.category) chartInstances.category.destroy();

    const labels = Object.keys(cats);
    const data = Object.values(cats);

    chartInstances.category = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: labels.map((_, i) => COLORS[i % COLORS.length])
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#9ca3af' } } }
        }
    });
}

function renderCategoryDetails(cats) {
    const total = Object.values(cats).reduce((a, b) => a + b, 0);
    
    const categoryOrder = ['Groceries', 'Dining', 'Transport', 'Entertainment', 'Shopping', 'Utilities', 'Health'];
    
    const displayCategories = [];
    let othersAmount = 0;
    
    categoryOrder.forEach((cat, idx) => {
        const amt = cats[cat] || 0;
        displayCategories.push([cat, amt, idx]);
    });
    
    Object.entries(cats).forEach(([cat, amt]) => {
        if (!categoryOrder.includes(cat)) {
            othersAmount += amt;
        }
    });
    
    if (othersAmount > 0) {
        displayCategories.push(['Others', othersAmount, 7]);
    }
    
    document.getElementById('categoryDetailsContainer').innerHTML = displayCategories
        .map(([cat, amt, colorIdx]) => `
            <div class="category-item">
                <div class="category-color" style="background: ${COLORS[colorIdx % COLORS.length]};"></div>
                <div class="category-info">
                    <div class="category-name">${cat}</div>
                    <div class="category-percentage">${total > 0 ? ((amt / total) * 100).toFixed(1) : '0.0'}% of total</div>
                </div>
                <div class="category-amount">${formatCurrency(amt)}</div>
            </div>
        `)
        .join('');
}

function renderCategoryTable(cats) {
    const total = Object.values(cats).reduce((a, b) => a + b, 0);
    document.getElementById('categoryTableContainer').innerHTML = Object.entries(cats)
        .sort((a, b) => b[1] - a[1])
        .map(([cat, amt]) => {
            const count = getTransactions().filter(t => t.type === 'expense' && t.category === cat && getMonthKey(new Date(t.date)) === getCurrentPeriod()).length;
            return `<tr><td>${cat}</td><td>${formatCurrency(amt)}</td><td>${total > 0 ? ((amt / total) * 100).toFixed(1) : '0.0'}%</td><td>${count}</td></tr>`;
        })
        .join('');
}

function renderTrendReport() {
    const period = getCurrentPeriod();
    const trans = getTransactionsByPeriod(period);

    const income = trans.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = trans.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const savings = income - expenses;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;

    const dateObj = new Date(period + '-01');
    
    const summaryHTML = `
        <div class="summary-card" style="display: block;">
            <div class="summary-label"><i class="fi fi-rr-calendar"></i> Period</div>
            <div class="summary-value">${dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
            <div class="summary-detail">${new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0).getDate()} days</div>
        </div>
        <div class="summary-card" style="display: block;">
            <div class="summary-label"><i class="fi fi-rr-chart-histogram"></i> Total Income</div>
            <div class="summary-value income">${formatCurrency(income)}</div>
            <div class="summary-detail" id="trendIncomeDetail"></div>
        </div>
        <div class="summary-card" style="display: block;">
            <div class="summary-label"><i class="fi fi-rr-chart-histogram"></i> Total Expenses</div>
            <div class="summary-value expense">${formatCurrency(expenses)}</div>
            <div class="summary-detail" id="trendExpenseDetail"></div>
        </div>
        <div class="summary-card" style="display: block;">
            <div class="summary-label"><i class="fi fi-rr-money-bill-wave"></i> Savings Rate</div>
            <div class="summary-value savings">${savingsRate.toFixed(1)}%</div>
            <div class="summary-detail">${formatCurrency(savings)} saved</div>
        </div>
    `;
    
    document.getElementById('trendSummaryContent').innerHTML = summaryHTML;

    const prevMonth = getMonthKey(new Date(dateObj.getFullYear(), dateObj.getMonth() - 1, 1));
    const prevTransactions = getTransactionsByPeriod(prevMonth);
    const prevIncome = prevTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const prevExpenses = prevTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    
    const incomeChange = prevIncome > 0 ? ((income - prevIncome) / prevIncome) * 100 : 0;
    const expenseChange = prevExpenses > 0 ? ((expenses - prevExpenses) / prevExpenses) * 100 : 0;
    
    document.getElementById('trendIncomeDetail').textContent = `${incomeChange >= 0 ? '+' : ''}${incomeChange.toFixed(1)}% vs last month`;
    document.getElementById('trendIncomeDetail').style.color = incomeChange >= 0 ? '#22c55e' : '#ef4444';
    
    document.getElementById('trendExpenseDetail').textContent = `${expenseChange >= 0 ? '+' : ''}${expenseChange.toFixed(1)}% vs last month`;
    document.getElementById('trendExpenseDetail').style.color = expenseChange >= 0 ? '#ef4444' : '#22c55e';

    const months = getLast6Months();
    const data = months.map(m => {
        const monthTrans = getTransactionsByPeriod(m);
        const inc = monthTrans.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const exp = monthTrans.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        return { inc, exp, savings: inc - exp };
    });

    renderTrendChart(months, data);
    renderTrendTable(months, data);
}

function renderTrendChart(months, data) {
    const ctx = document.getElementById('trendChart');
    if (chartInstances.trend) chartInstances.trend.destroy();

    chartInstances.trend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months.map(m => new Date(m + '-01').toLocaleDateString('en-US', { month: 'short' })),
            datasets: [
                { label: 'Income', data: data.map(d => d.inc), borderColor: '#22c55e', borderWidth: 2, tension: 0.4 },
                { label: 'Expenses', data: data.map(d => d.exp), borderColor: '#ef4444', borderWidth: 2, tension: 0.4 },
                { label: 'Savings', data: data.map(d => d.savings), borderColor: '#a855f7', borderWidth: 2, tension: 0.4 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#9ca3af' } } },
            scales: {
                y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(168, 85, 247, 0.1)' } },
                x: { ticks: { color: '#9ca3af' }, grid: { display: false } }
            }
        }
    });
}

function renderTrendTable(months, data) {
    document.getElementById('trendTableContainer').innerHTML = months.map((m, i) => {
        const d = data[i];
        const prev = i > 0 ? data[i - 1] : d;
        
        let change = 0;
        if (prev.savings !== 0) {
            change = ((d.savings - prev.savings) / Math.abs(prev.savings)) * 100;
        } else if (d.savings > 0) {
            change = Infinity; 
        } else if (d.savings < 0) {
            change = -Infinity;
        }

        let formattedChange;
        if (change === Infinity) {
            formattedChange = '+∞%';
        } else if (change === -Infinity) {
            formattedChange = '-∞%';
        } else {
            formattedChange = (change >= 0 ? '+' : '') + change.toFixed(1) + '%';
        }

        return `<tr>
            <td>${new Date(m + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}</td>
            <td>${formatCurrency(d.inc)}</td>
            <td>${formatCurrency(d.exp)}</td>
            <td>${formatCurrency(d.savings)}</td>
            <td style="color: ${change >= 0 ? '#22c55e' : '#ef4444'};">${formattedChange}</td>
        </tr>`;
    }).join('');
}

// CSV Export Function
function exportReport(type) {
    const trans = getTransactions();
    if (trans.length === 0) return;

    const headers = ['Date', 'Type', 'Category', 'Amount', 'Description'];
    const rows = trans.map(t => [
        new Date(t.date).toLocaleDateString(),
        t.type,
        t.category,
        t.amount,
        t.description || ''
    ]);

    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `financial-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
}

// PDF Export Function
function exportPDF() {
    const trans = getTransactions();
    if (trans.length === 0) return;

    const doc = new jspdf.jsPDF();
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 10;

    doc.setFontSize(16);
    doc.text('Financial Report', 10, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 10, yPos);
    yPos += 10;

    const income = trans.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = trans.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const savings = income - expenses;

    doc.setFontSize(12);
    doc.text(`Total Income: ${formatCurrency(income)}`, 10, yPos);
    yPos += 8;
    doc.text(`Total Expenses: ${formatCurrency(expenses)}`, 10, yPos);
    yPos += 8;
    doc.text(`Total Savings: ${formatCurrency(savings)}`, 10, yPos);
    yPos += 15;

    const headers = ['Date', 'Type', 'Category', 'Amount'];
    const rows = trans.map(t => [
        new Date(t.date).toLocaleDateString(),
        t.type,
        t.category,
        formatCurrency(t.amount)
    ]);

    doc.autoTable({
        head: [headers],
        body: rows,
        startY: yPos,
        theme: 'striped',
        styles: {
            textColor: [0, 0, 0],
            fontSize: 9,
            cellPadding: 3,
        },
        headStyles: {
            fillColor: [168, 85, 247],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center'
        },
        columnStyles: {
            3: {
                halign: 'right'
            }
        }
    });

    doc.save(`financial-report-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeDropdowns();
    switchReport(document.getElementById('reportTypeSelect').value);
});

