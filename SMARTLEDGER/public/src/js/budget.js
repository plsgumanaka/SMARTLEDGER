// Budget page logic moved from inline <script> in components/budget.html
// This script is loaded by public/src/components/budget.html

let budgets = [];
let editingId = null;
let deletingId = null;

function init() {
    loadBudgets();
    renderBudgets();
    window.addEventListener('storage', () => {
        renderBudgets();
    });
}

function loadBudgets() {
    const saved = localStorage.getItem('budgets');
    budgets = saved ? JSON.parse(saved) : [];
}

function saveBudgetsToStorage() {
    localStorage.setItem('budgets', JSON.stringify(budgets));
}

function getTransactions() {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
}

function getSpentAmount(category, period) {
    const transactions = getTransactions();
    const now = new Date();
    let startDate = new Date();

    if (period === 'Weekly') {
        startDate.setDate(now.getDate() - now.getDay());
    } else if (period === 'Monthly') {
        startDate.setDate(1);
    } else if (period === 'Quarterly') {
        startDate.setMonth(Math.floor(now.getMonth() / 3) * 3);
        startDate.setDate(1);
    } else if (period === 'Yearly') {
        startDate.setMonth(0);
        startDate.setDate(1);
    }

    startDate.setHours(0, 0, 0, 0);

    const spent = transactions.reduce((sum, t) => {
        const tDate = new Date(t.date);
        tDate.setHours(0, 0, 0, 0);
        if (t.category === category && t.type === 'expense' && tDate >= startDate) {
            return sum + parseFloat(t.amount || 0);
        }
        return sum;
    }, 0);

    return spent;
}

function openAddBudgetModal() {
    editingId = null;
    document.getElementById('modalTitle').textContent = 'Add Budget';
    document.getElementById('budgetForm').reset();
    document.getElementById('budgetModal').classList.add('active');
    document.getElementById('categoryDisplay').textContent = 'Select a category';
    document.getElementById('periodDisplay').textContent = 'Monthly';
    document.getElementById('categoryMenu').classList.remove('open');
    document.getElementById('periodMenu').classList.remove('open');
}

function openEditBudgetModal(id) {
    const budget = budgets.find(b => b.id === id);
    if (!budget) return;

    editingId = id;
    document.getElementById('modalTitle').textContent = 'Edit Budget';
    document.getElementById('categoryDisplay').textContent = budget.category;
    document.getElementById('budgetAmount').value = budget.amount;
    document.getElementById('periodDisplay').textContent = budget.period;
    document.getElementById('budgetModal').classList.add('active');
    document.getElementById('categoryMenu').classList.remove('open');
    document.getElementById('periodMenu').classList.remove('open');
}

function closeBudgetModal() {
    document.getElementById('budgetModal').classList.remove('active');
    editingId = null;
}

function saveBudget(e) {
    e.preventDefault();

    const category = document.getElementById('categorySelect').value;
    const amount = parseFloat(document.getElementById('budgetAmount').value);
    const period = document.getElementById('timePeriod').value;

    if (!category || category === 'Select a category' || !amount || !period) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    const isDuplicate = budgets.some(b => 
        b.category === category && 
        b.period === period && 
        b.id !== editingId
    );

    if (isDuplicate) {
        showToast('A budget for this category and period already exists', 'error');
        return;
    }

    if (editingId) {
        const budget = budgets.find(b => b.id === editingId);
        if (budget) {
            budget.category = category;
            budget.amount = amount;
            budget.period = period;
            showToast('Budget updated successfully', 'success');
        }
    } else {
        const newBudget = {
            id: Date.now(),
            category,
            amount,
            period,
            createdAt: new Date().toISOString()
        };
        budgets.push(newBudget);
        showToast('Budget created successfully', 'success');
    }

    saveBudgetsToStorage();
    closeBudgetModal();
    renderBudgets();
}

function openDeleteConfirm(id) {
    deletingId = id;
    document.getElementById('confirmModal').classList.add('active');
}

function closeConfirmModal() {
    document.getElementById('confirmModal').classList.remove('active');
    deletingId = null;
}

function confirmDelete() {
    if (deletingId) {
        budgets = budgets.filter(b => b.id !== deletingId);
        saveBudgetsToStorage();
        closeConfirmModal();
        showToast('Budget deleted successfully', 'success');
        renderBudgets();
    }
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function renderBudgets() {
    const budgetsList = document.getElementById('budgetsList');

    if (budgets.length === 0) {
        budgetsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fi fi-rr-money-bill-wave"></i></div>
                <p>No budgets created yet</p>
            </div>
        `;
        updateSummary();
        return;
    }

    budgetsList.innerHTML = budgets.map(budget => {
        const spent = getSpentAmount(budget.category, budget.period);
        const percentage = (spent / budget.amount) * 100;
        const isOverBudget = spent > budget.amount;
        const remaining = budget.amount - spent;

        let fillColor = '#c7d2fe';
        if (percentage >= 100) {
            fillColor = '#fca5a5';
        } else if (percentage >= 80) {
            fillColor = '#fcd34d';
        }

        return `
            <div class="budget-item">
                <div class="budget-header">
                    <div class="budget-title-section">
                        <span class="budget-title">${budget.category}</span>
                        <span class="budget-period">${budget.period}</span>
                    </div>
                    <div class="budget-actions">
                        <button class="icon-button" onclick="openEditBudgetModal(${budget.id})"><i class="fi fi-rr-pencil"></i></button>
                        <button class="icon-button delete" onclick="openDeleteConfirm(${budget.id})"><i class="fi fi-rr-trash"></i></button>
                    </div>
                </div>
                <div class="budget-spending">₱${spent.toFixed(2)} of ₱${budget.amount.toFixed(2)} spent</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="background: ${fillColor}; width: ${Math.min(percentage, 100)}%;"></div>
                </div>
                <div class="budget-footer">
                    <span class="budget-percentage">${percentage.toFixed(1)}% used</span>
                    <span class="budget-remaining ${isOverBudget ? 'red' : ''}">₱${Math.abs(remaining).toFixed(2)} ${isOverBudget ? 'over' : 'left'}</span>
                </div>
            </div>
        `;
    }).join('');

    updateSummary();
}

function updateSummary() {
    const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + getSpentAmount(b.category, b.period), 0);
    const totalRemaining = totalBudgeted - totalSpent;
    const spentPercentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

    document.getElementById('totalBudgeted').textContent = `₱${totalBudgeted.toFixed(2)}`;
    document.getElementById('totalSpent').textContent = `₱${totalSpent.toFixed(2)}`;
    document.getElementById('totalRemaining').textContent = `₱${Math.abs(totalRemaining).toFixed(2)}`;
    document.getElementById('spentPercentage').textContent = `${spentPercentage.toFixed(1)}% of budget`;
    document.getElementById('statusText').textContent = totalRemaining >= 0 ? 'Under budget' : 'Over budget';

    const remainingEl = document.getElementById('totalRemaining');
    if (totalRemaining < 0) {
        remainingEl.classList.remove('green');
        remainingEl.classList.add('red');
    } else {
        remainingEl.classList.remove('red');
        remainingEl.classList.add('green');
    }
}

function toggleCategoryDropdown() {
    const menu = document.getElementById('categoryMenu');
    const trigger = document.getElementById('categoryTrigger');
    menu.classList.toggle('open');
    trigger.classList.toggle('active');
    
    // Close period dropdown if open
    document.getElementById('periodMenu').classList.remove('open');
    document.getElementById('periodTrigger').classList.remove('active');
}

function selectCategory(category) {
    document.getElementById('categoryDisplay').textContent = category;
    document.getElementById('categorySelect').value = category;
    document.getElementById('categoryMenu').classList.remove('open');
    document.getElementById('categoryTrigger').classList.remove('active');
    
    // Update selected state
    document.querySelectorAll('#categoryMenu .dropdown-option').forEach(opt => {
        opt.classList.remove('selected');
        if (opt.textContent.trim().startsWith(category)) {
            opt.classList.add('selected');
        }
    });
}

function togglePeriodDropdown() {
    const menu = document.getElementById('periodMenu');
    const trigger = document.getElementById('periodTrigger');
    menu.classList.toggle('open');
    trigger.classList.toggle('active');
    
    // Close category dropdown if open
    document.getElementById('categoryMenu').classList.remove('open');
    document.getElementById('categoryTrigger').classList.remove('active');
}

function selectPeriod(period) {
    document.getElementById('periodDisplay').textContent = period;
    document.getElementById('timePeriod').value = period;
    document.getElementById('periodMenu').classList.remove('open');
    document.getElementById('periodTrigger').classList.remove('active');
    
    // Update selected state
    document.querySelectorAll('#periodMenu .dropdown-option').forEach(opt => {
        opt.classList.remove('selected');
        if (opt.textContent.trim().startsWith(period)) {
            opt.classList.add('selected');
        }
    });
}

function incrementBudgetAmount() {
    const input = document.getElementById('budgetAmount');
    const currentValue = parseFloat(input.value) || 0;
    input.value = (currentValue + 100).toFixed(2);
}

function decrementBudgetAmount() {
    const input = document.getElementById('budgetAmount');
    const currentValue = parseFloat(input.value) || 0;
    if (currentValue >= 100) {
        input.value = (currentValue - 100).toFixed(2);
    }
}

document.addEventListener('click', function(e) {
    if (!e.target.closest('.custom-dropdown')) {
        document.querySelectorAll('.custom-dropdown-menu').forEach(menu => {
            menu.classList.remove('open');
        });
        document.querySelectorAll('.custom-dropdown-trigger').forEach(trigger => {
            trigger.classList.remove('active');
        });
    }
});

document.getElementById('budgetModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeBudgetModal();
    }
});

document.getElementById('confirmModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeConfirmModal();
    }
});

init();

