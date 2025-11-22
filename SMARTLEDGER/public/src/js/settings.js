// Settings page logic moved from inline <script> in components/Settings.html
// This script is loaded by public/src/components/Settings.html

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '<i class="fi fi-rr-check-circle"></i>',
        error: '<i class="fi fi-rr-cross-circle"></i>',
        info: '<i class="fi fi-rr-info"></i>'
    };
    
    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || icons.info}</div>
        <div class="toast-content">${message}</div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fi fi-rr-cross-small"></i>
        </button>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function switchTab(event, tabName) {
    event.preventDefault();
    
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));
    
    const triggers = document.querySelectorAll('.tab-trigger');
    triggers.forEach(trigger => trigger.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    event.target.closest('.tab-trigger').classList.add('active');
}

function toggleSwitch(element, settingKey) {
    element.classList.toggle('active');
    const isActive = element.classList.contains('active');
    
    const settings = Store.getSettings();
    
    if (settingKey === 'darkMode') {
        Store.updateSettings({ darkMode: isActive });
    } else if (['emailNotifications', 'pushNotifications', 'budgetAlerts'].includes(settingKey)) {
        const notifications = { ...settings.notifications };
        if (settingKey === 'emailNotifications') notifications.email = isActive;
        if (settingKey === 'pushNotifications') notifications.push = isActive;
        if (settingKey === 'budgetAlerts') notifications.budget = isActive;
        
        Store.updateSettings({ notifications });
    } else if (['analytics', 'dataSharing'].includes(settingKey)) {
        const privacy = { ...settings.privacy };
        if (settingKey === 'analytics') privacy.analytics = isActive;
        if (settingKey === 'dataSharing') privacy.sharing = isActive;
        
        Store.updateSettings({ privacy });
    }
    
    showToast('Settings updated', 'info');
}

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    input.type = input.type === 'password' ? 'text' : 'password';
}

function saveProfile() {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    
    localStorage.setItem('smartledger_profile', JSON.stringify({ firstName, lastName, email }));
    
    showToast('Profile updated successfully!', 'success');
}

function changePassword() {
    showToast('Password changed successfully!', 'success');
}

function exportData() {
    const transactions = Store.getTransactions();
    const budgets = Store.getBudgets();
    const settings = Store.getSettings();
    const receipts = JSON.parse(localStorage.getItem('smartledger_receipts') || '[]');

    const data = {
        transactions,
        budgets,
        settings,
        receipts,
        exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartledger-backup-${Date.now()}.json`;
    a.click();
    showToast('Data exported successfully!', 'success');
}

function importData(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.transactions) {
                localStorage.setItem('smartledger_transactions', JSON.stringify(data.transactions));
            }
            if (data.budgets) {
                localStorage.setItem('smartledger_budgets', JSON.stringify(data.budgets));
            }
            if (data.settings) {
                localStorage.setItem('smartledger_settings', JSON.stringify(data.settings));
            }
            if (data.receipts) {
                localStorage.setItem('smartledger_receipts', JSON.stringify(data.receipts));
            }

            Store.notifyChange();
            loadSettings();
            updateStorageCount();
            showToast('Data imported successfully!', 'success');
        } catch (error) {
            showToast('Failed to import data. Invalid file format.', 'error');
        }
    };
    reader.readAsText(file);
}

function clearAllData() {
    if (confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
        localStorage.removeItem('smartledger_transactions');
        localStorage.removeItem('smartledger_budgets');
        localStorage.removeItem('smartledger_receipts');
        localStorage.removeItem('smartledger_settings');
        localStorage.removeItem('smartledger_profile');
        
        Store.init();
        Store.notifyChange();
        
        loadSettings();
        updateStorageCount();
        showToast('All data cleared successfully', 'success');
    }
}

function updateStorageCount() {
    const transactions = Store.getTransactions();
    const budgets = Store.getBudgets();
    const receipts = JSON.parse(localStorage.getItem('smartledger_receipts') || '[]');

    document.getElementById('transactionCount').textContent = `${transactions.length} items`;
    document.getElementById('budgetCount').textContent = `${budgets.length} items`;
    document.getElementById('receiptCount').textContent = `${receipts.length} items`;
}

function loadSettings() {
    const settings = Store.getSettings();
    
    const profile = JSON.parse(localStorage.getItem('smartledger_profile') || '{}');
    if (profile.firstName) document.getElementById('firstName').value = profile.firstName;
    if (profile.lastName) document.getElementById('lastName').value = profile.lastName;
    if (profile.email) document.getElementById('email').value = profile.email;

    const darkModeToggle = document.getElementById('darkModeToggle');
    if (settings.darkMode) darkModeToggle.classList.add('active');
    else darkModeToggle.classList.remove('active');

    const emailToggle = document.getElementById('emailNotificationsToggle');
    if (settings.notifications?.email) emailToggle.classList.add('active');
    else emailToggle.classList.remove('active');

    const pushToggle = document.getElementById('pushNotificationsToggle');
    if (settings.notifications?.push) pushToggle.classList.add('active');
    else pushToggle.classList.remove('active');

    const budgetToggle = document.getElementById('budgetAlertsToggle');
    if (settings.notifications?.budget) budgetToggle.classList.add('active');
    else budgetToggle.classList.remove('active');

    const frequency = settings.notifications?.frequency || 'weekly';
    selectFrequency(frequency, false);
}

function selectFrequency(freq, save = true) {
    ['daily', 'weekly', 'monthly'].forEach(f => {
        const btn = document.getElementById(`freq-${f}`);
        if (btn) {
            if (f === freq) {
                btn.className = 'button';
            } else {
                btn.className = 'button button-outline';
            }
        }
    });

    if (save) {
        const settings = Store.getSettings();
        const notifications = { ...settings.notifications, frequency: freq };
        Store.updateSettings({ notifications });
        showToast(`Alert frequency set to ${freq}`, 'info');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    updateStorageCount();
});

