// Receipt page logic moved from inline <script> in components/receipt.html
// This script is loaded by public/src/components/receipt.html

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

// Mock data for demonstration
let uploadedFile = null;
let extractedData = null;
let receipts = [];

const categories = ['Groceries', 'Dining', 'Transport', 'Entertainment', 'Shopping', 'Utilities', 'Health'];

const receiptTemplates = [
    {
        merchant: 'Whole Foods Market',
        category: 'Groceries',
        items: [
            { name: 'Organic Bananas', price: 3.99 },
            { name: 'Almond Milk', price: 5.49 },
            { name: 'Chicken Breast', price: 12.99 },
            { name: 'Mixed Vegetables', price: 8.99 },
        ]
    },
    {
        merchant: 'Starbucks Coffee',
        category: 'Dining',
        items: [
            { name: 'Venti Latte', price: 5.95 },
            { name: 'Blueberry Muffin', price: 3.45 },
        ]
    },
    {
        merchant: 'Shell Gas Station',
        category: 'Transport',
        items: [
            { name: 'Regular Gasoline - 12.5 gal', price: 45.00 },
        ]
    }
];

// Load receipts from localStorage
function loadReceipts() {
    const saved = localStorage.getItem('receipts');
    if (saved) {
        receipts = JSON.parse(saved);
        updateStats();
        renderReceiptHistory();
    }
}

// Save receipts to localStorage
function saveReceiptsToStorage() {
    localStorage.setItem('receipts', JSON.stringify(receipts));
    updateStats();
}

// Update statistics
function updateStats() {
    const now = new Date();
    const thisMonth = receipts.filter(r => {
        const date = new Date(r.uploadedAt);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;

    document.getElementById('totalReceipts').textContent = receipts.length;
    document.getElementById('thisMonth').textContent = thisMonth;
    document.getElementById('totalAmount').textContent = '₱' + receipts.reduce((sum, r) => sum + r.amount, 0).toFixed(2);
    
    const avgConfidence = receipts.length > 0 
        ? (receipts.reduce((sum, r) => sum + r.confidence, 0) / receipts.length * 100).toFixed(1)
        : '0.0';
    document.getElementById('avgConfidence').textContent = avgConfidence + '%';

    document.getElementById('exportBtn').style.display = receipts.length > 0 ? 'flex' : 'none';
}

// Handle drag and drop
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('dropzone').classList.add('active');
}

function handleDragLeave(e) {
    e.preventDefault();
    document.getElementById('dropzone').classList.remove('active');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('dropzone').classList.remove('active');
    
    if (e.dataTransfer.files.length > 0) {
        handleFileSelect({ target: { files: e.dataTransfer.files } });
    }
}

// Handle file selection
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    uploadedFile = file;
    document.getElementById('dropzone').classList.add('hidden');
    document.getElementById('fileUploadedSection').classList.remove('hidden');
    document.getElementById('uploadedFileName').textContent = file.name;
    document.getElementById('uploadedFileSize').textContent = (file.size / 1024).toFixed(2) + ' KB';

    // Simulate OCR processing
    setTimeout(() => {
        const template = receiptTemplates[Math.floor(Math.random() * receiptTemplates.length)];
        const totalAmount = template.items.reduce((sum, item) => sum + item.price, 0);
        const tax = totalAmount * 0.08;
        const finalAmount = totalAmount + tax;

        extractedData = {
            merchant: template.merchant,
            date: new Date().toISOString().split('T')[0],
            amount: parseFloat(finalAmount.toFixed(2)),
            category: template.category.toLowerCase(),
            items: template.items,
            subtotal: parseFloat(totalAmount.toFixed(2)),
            tax: parseFloat(tax.toFixed(2)),
            confidence: 0.85 + Math.random() * 0.14
        };

        displayExtractedData();
    }, 1500);
}

// Display extracted data
function displayExtractedData() {
    if (!extractedData) return;

    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('extractedDataForm').classList.remove('hidden');
    document.getElementById('confidenceScore').textContent = (extractedData.confidence * 100).toFixed(1) + '%';
    
    document.getElementById('merchant').value = extractedData.merchant;
    document.getElementById('amount').value = extractedData.amount;
    document.getElementById('date').value = extractedData.date;
    document.getElementById('category').value = extractedData.category;
    document.getElementById('notes').value = '';

    if (extractedData.items && extractedData.items.length > 0) {
        document.getElementById('itemsSection').style.display = 'block';
        let itemsHTML = extractedData.items.map(item => 
            `<div class="item-row"><span class="item-name">${item.name}</span><span class="item-price">₱${item.price.toFixed(2)}</span></div>`
        ).join('');
        itemsHTML += `<div class="item-row item-total" style="border-top: 1px solid rgba(168, 85, 247, 0.2); padding-top: 8px; margin-top: 8px;">
            <span class="item-name">Total</span><span class="item-price">₱${extractedData.amount.toFixed(2)}</span>
        </div>`;
        document.getElementById('itemsList').innerHTML = itemsHTML;
    }
}

// Save receipt
function saveReceipt(e) {
    e.preventDefault();

    const newReceipt = {
        id: Date.now().toString(),
        merchant: document.getElementById('merchant').value,
        amount: parseFloat(document.getElementById('amount').value),
        category: document.getElementById('category').value,
        date: document.getElementById('date').value,
        notes: document.getElementById('notes').value,
        fileName: uploadedFile?.name || 'receipt.jpg',
        fileSize: uploadedFile?.size || 0,
        uploadedAt: new Date().toISOString(),
        status: 'processed',
        confidence: extractedData?.confidence || 0.95,
        items: extractedData?.items
    };

    receipts.push(newReceipt);
    saveReceiptsToStorage();
    resetUpload();
    showToast('Receipt saved successfully!', 'success');
}

// Reset upload
function resetUpload() {
    uploadedFile = null;
    extractedData = null;
    document.getElementById('fileInput').value = '';
    document.getElementById('dropzone').classList.remove('hidden');
    document.getElementById('fileUploadedSection').classList.add('hidden');
    document.getElementById('extractedDataForm').classList.add('hidden');
    document.getElementById('emptyState').style.display = 'block';
}

// Render receipt history
function renderReceiptHistory() {
    if (receipts.length === 0) {
        document.getElementById('receiptHistoryTable').innerHTML = `
            <div class="empty-icon"><i class="fi fi-rr-document"></i></div>
            <p style="color: #9ca3af;">No receipts uploaded yet</p>
        `;
        return;
    }

    let tableHTML = `
        <table class="receipt-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Merchant</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Confidence</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

    receipts.forEach(receipt => {
        const date = new Date(receipt.date).toLocaleDateString();
        const confidence = (receipt.confidence * 100).toFixed(0);
        tableHTML += `
            <tr>
                <td>${date}</td>
                <td>${receipt.merchant}</td>
                <td><span class="badge">${receipt.category}</span></td>
                <td>₱${receipt.amount.toFixed(2)}</td>
                <td>${confidence}%</td>
                <td><button class="btn btn-secondary" style="font-size: 12px; padding: 6px 10px;" onclick="deleteReceipt('${receipt.id}')"><i class="fi fi-rr-trash"></i> Delete</button></td>
            </tr>
        `;
    });

    tableHTML += `</tbody></table>`;
    document.getElementById('receiptHistoryTable').innerHTML = tableHTML;
}

// Filter receipts
function filterReceipts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;

    const filtered = receipts.filter(r => {
        const matchesSearch = r.merchant.toLowerCase().includes(searchTerm) || r.category.includes(searchTerm);
        const matchesCategory = !categoryFilter || r.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    if (filtered.length === 0) {
        document.getElementById('receiptHistoryTable').innerHTML = `
            <div class="empty-icon"><i class="fi fi-rr-document"></i></div>
            <p style="color: #9ca3af;">No receipts match your search</p>
        `;
        return;
    }

    let tableHTML = `
        <table class="receipt-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Merchant</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Confidence</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

    filtered.forEach(receipt => {
        const date = new Date(receipt.date).toLocaleDateString();
        const confidence = (receipt.confidence * 100).toFixed(0);
        tableHTML += `
            <tr>
                <td>${date}</td>
                <td>${receipt.merchant}</td>
                <td><span class="badge">${receipt.category}</span></td>
                <td>₱${receipt.amount.toFixed(2)}</td>
                <td>${confidence}%</td>
                <td><button class="btn btn-secondary" style="font-size: 12px; padding: 6px 10px;" onclick="deleteReceipt('${receipt.id}')"><i class="fi fi-rr-trash"></i> Delete</button></td>
            </tr>
        `;
    });

    tableHTML += `</tbody></table>`;
    document.getElementById('receiptHistoryTable').innerHTML = tableHTML;
}

// Delete receipt
function deleteReceipt(id) {
    receipts = receipts.filter(r => r.id !== id);
    saveReceiptsToStorage();
    renderReceiptHistory();
}

// Export receipts
function exportReceipts() {
    const csv = [
        ['Date', 'Merchant', 'Category', 'Amount', 'Confidence'].join(','),
        ...receipts.map(r => [
            new Date(r.date).toLocaleDateString(),
            r.merchant,
            r.category,
            r.amount,
            (r.confidence * 100).toFixed(1) + '%'
        ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipts-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Switch tabs
function switchTab(tabName, element) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    element.classList.add('active');
}

// Camera function
function openCamera() {
    showToast('Camera feature requires native mobile app support', 'info');
}

// Initialize
loadReceipts();

