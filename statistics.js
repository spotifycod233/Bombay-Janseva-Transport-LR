import db from './db.js';

document.addEventListener('DOMContentLoaded', async function() {
    // Initialize database and load LRs
    await db.init();
    let lrs = await db.getAllLRs();
    
    // Sort LRs by date in descending order (newest first)
    lrs.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // DOM elements - Updated IDs to match LR convention
    const lrsTableBody = document.getElementById('lrsTableBody');
    const totalLRsEl = document.getElementById('totalLRs');
    const totalAmountEl = document.getElementById('totalAmount');
    const todaysLRsEl = document.getElementById('todaysLRs');
    const clearStorageBtn = document.getElementById('clearStorage');
    const exportDataBtn = document.getElementById('exportData');
    const dateFilter = document.getElementById('dateFilter');
    const lrNoFilter = document.getElementById('lrNoFilter');
    const applyFiltersBtn = document.getElementById('applyFilters');
    const resetFiltersBtn = document.getElementById('resetFilters');
    
    // Display all LRs
    function displayLRs(lrsToDisplay = lrs) {
        lrsTableBody.innerHTML = '';
        
        lrsToDisplay.forEach(lr => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${lr.lrNo}</td>
                <td>${lr.date}</td>
                <td>${lr.consignor}</td>
                <td>${lr.consignee}</td>
                <td>${lr.from}</td>
                <td>${lr.to}</td>
                <td>₹${lr.total.toFixed(2)}</td>
                <td>
                    <button class="action-btn view-btn" data-id="${lr.lrNo}">View</button>
                    <button class="action-btn delete-btn" data-id="${lr.lrNo}">Delete</button>
                </td>
            `;
            
            lrsTableBody.appendChild(row);
        });
        
        // Update summary stats
        updateSummaryStats(lrsToDisplay);
    }
    
    // Update summary statistics
    function updateSummaryStats(lrsToCalculate = lrs) {
        totalLRsEl.textContent = lrsToCalculate.length;
        
        const totalAmount = lrsToCalculate.reduce((sum, lr) => sum + lr.total, 0);
        totalAmountEl.textContent = `₹${totalAmount.toFixed(2)}`;
        
        const today = new Date().toISOString().slice(0, 10);
        const todaysLRs = lrsToCalculate.filter(lr => lr.date === today);
        todaysLRsEl.textContent = todaysLRs.length;
    }
    
    // Filter LRs
    function filterLRs() {
        const dateFilterValue = dateFilter.value;
        const lrNoFilterValue = lrNoFilter.value.toLowerCase();
        
        const filteredLRs = lrs.filter(lr => {
            const matchesDate = !dateFilterValue || lr.date === dateFilterValue;
            const matchesLRNo = !lrNoFilterValue || lr.lrNo.toLowerCase().includes(lrNoFilterValue);
            return matchesDate && matchesLRNo;
        });
        
        // Sort filtered results by date (newest first)
        filteredLRs.sort((a, b) => new Date(b.date) - new Date(a.date));
        displayLRs(filteredLRs);
    }
    
    // Clear all data
    clearStorageBtn.addEventListener('click', async function() {
        if (confirm('Are you sure you want to delete all LR data? This cannot be undone.')) {
            await db.clearAllLRs();
            lrs = [];
            lrsTableBody.innerHTML = '';
            updateSummaryStats([]);
        }
    });
    
    // Export to CSV
    exportDataBtn.addEventListener('click', function() {
        // Sort LRs by date (newest first) before exporting
        const sortedLRs = [...lrs].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        const headers = ['LR No.', 'Date', 'Consignor', 'Consignee', 'From', 'To', 'Total'];
        const csvRows = [headers.join(',')];
        
        sortedLRs.forEach(lr => {
            const row = [
                lr.lrNo,
                lr.date,
                lr.consignor,
                lr.consignee,
                lr.from,
                lr.to,
                lr.total.toFixed(2)
            ];
            csvRows.push(row.join(','));
            
        });
        
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `lrs_export_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
    
    // Apply filters
    applyFiltersBtn.addEventListener('click', filterLRs);
    
    // Reset filters
    resetFiltersBtn.addEventListener('click', function() {
        dateFilter.value = '';
        lrNoFilter.value = '';
        displayLRs();
    });
    
    // View LR details
    lrsTableBody.addEventListener('click', function(e) {
        if (e.target.classList.contains('view-btn')) {
            const lrNo = e.target.getAttribute('data-id');
            const lr = lrs.find(l => l.lrNo === lrNo);
            if (lr) {
                alert(`LR Details:\n\nLR No: ${lr.lrNo}\nDate: ${lr.date}\nConsignor: ${lr.consignor}\nConsignee: ${lr.consignee}\nFrom: ${lr.from}\nTo: ${lr.to}\nTotal: ₹${lr.total.toFixed(2)}`);
            }
        }
        
        if (e.target.classList.contains('delete-btn')) {
            const lrNo = e.target.getAttribute('data-id');
            if (confirm(`Are you sure you want to delete LR ${lrNo}?`)) {
                const index = lrs.findIndex(l => l.lrNo === lrNo);
                if (index !== -1) {
                    // Remove from IndexedDB first
                    db.deleteLR(lrNo).then(() => {
                        // Then remove from local array
                        lrs.splice(index, 1);
                        displayLRs();
                    }).catch(error => {
                        console.error('Error deleting LR:', error);
                        alert('Error deleting LR');
                    });
                }
            }
        }
    });
    
    // Initial display
    displayLRs();
});