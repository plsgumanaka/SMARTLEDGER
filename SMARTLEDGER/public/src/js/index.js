// Check if user is logged in0
//if (!localStorage.getItem('isLoggedIn')) {
  //  window.location.href = 'login.html';
//}

const menuLinks = document.querySelectorAll('.menu-link');
const contentFrame = document.getElementById('content-iframe');
const pageTitle = document.getElementById('page-title');

menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();

        if (link.getAttribute('data-page')) {
            menuLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            const page = link.getAttribute('data-page');
            contentFrame.src = page;

            pageTitle.textContent = link.querySelector('span:last-child').textContent;
        }
    });
});

window.addEventListener('message', (event) => {
    if (event.data.action === 'navigate') {
        const page = event.data.page;

        const menuLink = Array.from(menuLinks).find(link => link.getAttribute('data-page') === page);
        if (menuLink) {
            menuLink.click();
        }
    }
    if (event.data.action === 'store-update') {
        console.log('[v0] Store updated in iframe');
    }
});

function toggleQuickActions() {
    const menu = document.getElementById('quickActionsMenu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

let notifications = [
    { id: 1, title: "Budget alert: You've spent 85% of your Groceries budget this month", time: "2 hours ago", type: "orange", read: false, link: "#" },
    { id: 2, title: "Over budget in Entertainment by ₱45.50", time: "5 hours ago", type: "red", read: false, link: "#" },
    { id: 3, title: "New transaction added: ₱120.00 for Whole Foods Market", time: "Yesterday", type: "blue", read: false, link: "#" },
    { id: 4, title: "Monthly report is ready to view", time: "2 days ago", type: "blue", read: false, link: "#" },
    { id: 5, title: "You're on track to meet your savings goal this month", time: "3 days ago", type: "blue", read: false, link: "#" }
];

function renderNotifications() {
    const list = document.getElementById('notificationsList');
    const badge = document.getElementById('notificationBadge');
    const countLabel = document.getElementById('notificationCount');

    const unreadCount = notifications.filter(n => !n.read).length;

    if (unreadCount > 0) {
        badge.style.display = 'flex';
        badge.textContent = unreadCount;
        countLabel.textContent = `${unreadCount} new`;
        countLabel.style.display = 'inline-block';
        countLabel.style.background = 'rgba(34, 34, 46, 0.8)';
        countLabel.style.color = '#e0e0e7';
    } else {
        badge.style.display = 'none';
        countLabel.textContent = 'No new notifications';
        countLabel.style.background = 'transparent';
        countLabel.style.color = '#9ca3af';
    }

    list.innerHTML = '';
    if (notifications.length === 0) {
        list.innerHTML = '<div style="padding: 20px; text-align: center; color: #6b7280; font-size: 13px;">No notifications</div>';
        return;
    }

    notifications.forEach(notification => {
        const item = document.createElement('div');
        item.className = `notification-item ${notification.read ? 'read' : ''}`;

        if (notification.read) {
            item.style.opacity = '0.6';
        }

        item.innerHTML = `
            <div class="notification-dot ${notification.type}" style="${notification.read ? 'background: #6b7280;' : ''}"></div>
            <div class="notification-content">
                <p class="notification-title" style="${notification.read ? 'font-weight: 400;' : ''}">${notification.title}</p>
                <p class="notification-time">${notification.time}</p>
                ${!notification.read ? `<a href="#" onclick="markAsRead(${notification.id}, event)" class="notification-action">Mark as read</a>` : ''}
            </div>
            <button onclick="deleteNotification(${notification.id}, event)" style="background:none; border:none; color:#6b7280; cursor:pointer; padding:4px;">
                <i class="fi fi-rr-cross-small"></i>
            </button>
        `;

        item.onclick = (e) => {
            if (!e.target.closest('button') && !e.target.closest('a')) {
                markAsRead(notification.id);
            }
        };

        list.appendChild(item);
    });
}

function toggleNotifications() {
    const menu = document.getElementById('notificationsMenu');
    menu.classList.toggle('active');
    if (menu.classList.contains('active')) {
        document.getElementById('quickActionsMenu').style.display = 'none';
        document.getElementById('userMenu').style.display = 'none';
    }
}

function markAsRead(id, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.read) {
        notification.read = true;
        renderNotifications();
    }
}

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Deletes a notification by its ID.
 * @param {number} id - The ID of the notification to delete.
 * @param {Event} [event] - The event object, if applicable.
 */
/*******  e5a6dc9a-b356-4880-bc47-27400593c650  *******/
function deleteNotification(id, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    notifications = notifications.filter(n => n.id !== id);
    renderNotifications();
    showToast('Notification removed', 'info');
}

function markAllAsRead() {
    const unreadCount = notifications.filter(n => !n.read).length;
    if (unreadCount === 0) {
        showToast('All notifications are already read', 'info');
        return;
    }

    notifications.forEach(n => n.read = true);
    renderNotifications();
    showToast('All notifications marked as read!', 'success');
}

renderNotifications();

function toggleUserMenu() {
    const menu = document.getElementById('userMenu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

const searchItems = [
    { icon: 'fi-rr-dashboard', label: 'Dashboard', page: 'components/dashboard.html', shortcut: '⌘D' },
    { icon: 'fi-rr-edit', label: 'Transactions', page: 'components/transactions.html', shortcut: '⌘T' },
    { icon: 'fi-rr-briefcase', label: 'Budget Planner', page: 'components/budget.html', shortcut: '⌘B' },
    { icon: 'fi-rr-search', label: 'AI Insights', page: 'components/ai-insight.html', shortcut: '⌘I' },
    { icon: 'fi-rr-chart-histogram', label: 'Reports', page: 'components/financial-reports.html', shortcut: '⌘R' },
    { icon: 'fi-rr-upload', label: 'Upload Receipt', page: 'components/receipt.html', shortcut: '⌘U' }
];

let selectedIndex = 0;

function openSearchModal() {
    const modal = document.getElementById('searchModal');
    const input = document.getElementById('modalSearchInput');
    modal.style.display = 'flex';
    modal.offsetHeight;
    modal.classList.add('active');
    input.value = '';
    input.focus();
    renderSearchResults();
}

function closeSearchModal(e) {
    if (e && e.target !== e.currentTarget) return;
    const modal = document.getElementById('searchModal');
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 200);
}

function renderSearchResults(filter = '') {
    const container = document.getElementById('searchResults');
    container.innerHTML = '';

    const filteredItems = searchItems.filter(item =>
        item.label.toLowerCase().includes(filter.toLowerCase())
    );

    if (filteredItems.length === 0) {
        container.innerHTML = '<div style="padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">No results found</div>';
        return;
    }

    filteredItems.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = `search-item ${index === selectedIndex ? 'selected' : ''}`;
        div.onclick = () => navigateTo(item.page);
        div.innerHTML = `
            <i class="fi ${item.icon}"></i>
            <span>${item.label}</span>
            <span class="shortcut-badge">${item.shortcut}</span>
        `;
        div.addEventListener('mouseenter', () => {
            selectedIndex = index;
            document.querySelectorAll('.search-item').forEach(el => el.classList.remove('selected'));
            div.classList.add('selected');
        });
        container.appendChild(div);
    });
}

document.getElementById('modalSearchInput').addEventListener('input', (e) => {
    selectedIndex = 0;
    renderSearchResults(e.target.value);
});

document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('searchModal');
    if (modal.style.display === 'none') {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            openSearchModal();
        }
        return;
    }

    const items = document.querySelectorAll('.search-item');

    if (e.key === 'Escape') {
        closeSearchModal();
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
        renderSearchResults(document.getElementById('modalSearchInput').value);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        renderSearchResults(document.getElementById('modalSearchInput').value);
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (items[selectedIndex]) {
            items[selectedIndex].click();
            closeSearchModal();
        }
    }
});

function toggleSearch() {
    openSearchModal();
}

function toggleMobileMenu() {
    showToast('Mobile menu', 'info');
}

function navigateTo(page) {
    const menuLink = Array.from(menuLinks).find(link => link.getAttribute('data-page') === page);
    if (menuLink) {
        menuLink.click();
        document.getElementById('quickActionsMenu').style.display = 'none';
        document.getElementById('notificationsMenu').classList.remove('active');
        document.getElementById('userMenu').style.display = 'none';
    }
}

function refreshData() {
    // Show loader
    const loaderOverlay = document.getElementById('loaderOverlay');
    if (loaderOverlay) {
        loaderOverlay.classList.add('active');
    }
    
    // Reload the page after a short delay to show the loader
    setTimeout(() => {
        window.location.reload();
    }, 3000);
}

function toggleTheme() {
    const currentBg = getComputedStyle(document.body).backgroundColor;
    if (currentBg === 'rgb(30, 30, 46)') {
        document.body.style.background = 'rgb(245, 245, 247)';
    } else {
        document.body.style.background = 'rgb(30, 30, 46)';
    }
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    showToast('Logged out!', 'success');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1000);
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.quick-actions-btn') && !e.target.closest('#quickActionsMenu')) {
        document.getElementById('quickActionsMenu').style.display = 'none';
    }
    if (!e.target.closest('.notifications-btn') && !e.target.closest('#notificationsMenu')) {
        document.getElementById('notificationsMenu').classList.remove('active');
    }
    if (!e.target.closest('.user-menu-btn') && !e.target.closest('#userMenu')) {
        document.getElementById('userMenu').style.display = 'none';
    }
});

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

document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
});


