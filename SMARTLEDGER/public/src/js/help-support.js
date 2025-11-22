// Help & Support page logic moved from inline <script> in components/HelpSupport.html
// This script is loaded by public/src/components/HelpSupport.html

function showToast(message) {
    const container = document.getElementById('toast-container') || (() => {
        const div = document.createElement('div');
        div.id = 'toast-container';
        div.className = 'toast-container';
        document.body.appendChild(div);
        return div;
    })();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
        const item = header.parentElement;
        item.classList.toggle('open');
    });
});

document.querySelectorAll('.contact-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        showToast('This would redirect to the support channel. Feature coming soon!');
    });
});

document.querySelectorAll('.learn-more-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        showToast('This would navigate to the help article. Feature coming soon!');
    });
});

document.querySelector('.primary-btn').addEventListener('click', () => {
    showToast('Thank you! Your feedback has been submitted.');
});

document.querySelector('.search-input').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    
    document.querySelectorAll('.accordion-item').forEach(item => {
        const headerText = item.querySelector('.accordion-header span').textContent.toLowerCase();
        const contentText = item.querySelector('.accordion-content').textContent.toLowerCase();
        const matches = headerText.includes(query) || contentText.includes(query);
        item.style.display = matches || query === '' ? 'block' : 'none';
    });

    document.querySelectorAll('.resource-card').forEach(card => {
        const titleText = card.querySelector('.resource-title').textContent.toLowerCase();
        const descText = card.querySelector('.resource-description').textContent.toLowerCase();
        const matches = titleText.includes(query) || descText.includes(query);
        card.style.display = matches || query === '' ? 'flex' : 'none';
    });
});

