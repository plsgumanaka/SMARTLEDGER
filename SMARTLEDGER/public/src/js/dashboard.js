const modal = document.getElementById('balanceModal');
const startingBalanceInput = document.getElementById('startingBalanceInput');
const modalStartingBalance = document.getElementById('modalStartingBalance');
const modalTotalBalance = document.getElementById('modalTotalBalance');
const currentBalanceDisplay = document.getElementById('currentBalanceDisplay');

// Mock data
const allTimeIncome = 6050.00;
const allTimeExpenses = 461.48;

function openBalanceModal() {
    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
}

// Close modal when clicking outside
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Update calculations when input changes
startingBalanceInput.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value) || 0;
    updateCalculations(val);
});

function updateCalculations(startingBalance) {
    const total = startingBalance + allTimeIncome - allTimeExpenses;

    const formatter = new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    });

    modalStartingBalance.textContent = formatter.format(startingBalance);
    modalTotalBalance.textContent = formatter.format(total);
}

function updateBalance() {
    const val = parseFloat(startingBalanceInput.value) || 0;
    const total = val + allTimeIncome - allTimeExpenses;

    const formatter = new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    });

    currentBalanceDisplay.textContent = formatter.format(total);
    closeModal();
}

function incrementBalance() {
    const currentValue = parseFloat(startingBalanceInput.value) || 0;
    const newValue = currentValue + 100;
    startingBalanceInput.value = newValue;
    updateCalculations(newValue);
}

function decrementBalance() {
    const currentValue = parseFloat(startingBalanceInput.value) || 0;
    const newValue = Math.max(0, currentValue - 100);
    startingBalanceInput.value = newValue;
    updateCalculations(newValue);
}

// Initialize charts when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeCharts();
});

function initializeCharts() {
    // Cash Flow Forecast Chart (Line Chart)
    const cashFlowCtx = document.getElementById('cashFlowChart');
    if (cashFlowCtx) {
        new Chart(cashFlowCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Income',
                    data: [4500, 4800, 5000, 5200, 5100, 5300, 5200, 5400, 5100, 5200, 5200, 5500],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Expenses',
                    data: [3200, 3400, 3600, 3500, 3800, 3700, 3600, 3800, 3500, 3520, 3400, 3600],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#9ca3af',
                            font: {
                                size: 12
                            },
                            usePointStyle: true,
                            padding: 15
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(40, 36, 61, 0.95)',
                        titleColor: '#e0e0e7',
                        bodyColor: '#e0e0e7',
                        borderColor: 'rgba(168, 85, 247, 0.3)',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ₱' + context.parsed.y.toLocaleString('en-PH');
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#9ca3af',
                            font: {
                                size: 11
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#9ca3af',
                            font: {
                                size: 11
                            },
                            callback: function(value) {
                                return '₱' + value.toLocaleString('en-PH');
                            }
                        }
                    }
                }
            }
        });
    }

    // Spending by Category Chart (Doughnut Chart)
    const categoryCtx = document.getElementById('categoryChart');
    if (categoryCtx) {
        new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: ['Groceries', 'Dining', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Other'],
                datasets: [{
                    data: [850, 420, 380, 150, 320, 600, 800],
                    backgroundColor: [
                        'rgba(168, 85, 247, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                        'rgba(139, 92, 246, 0.8)'
                    ],
                    borderColor: [
                        '#a855f7',
                        '#10b981',
                        '#3b82f6',
                        '#f59e0b',
                        '#ef4444',
                        '#ec4899',
                        '#8b5cf6'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'right',
                        labels: {
                            color: '#9ca3af',
                            font: {
                                size: 11
                            },
                            padding: 12,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(40, 36, 61, 0.95)',
                        titleColor: '#e0e0e7',
                        bodyColor: '#e0e0e7',
                        borderColor: 'rgba(168, 85, 247, 0.3)',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return label + ': ₱' + value.toLocaleString('en-PH') + ' (' + percentage + '%)';
                            }
                        }
                    }
                }
            }
        });
    }
}

