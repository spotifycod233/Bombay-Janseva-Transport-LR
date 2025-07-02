import db from './db.js';

// LR number generation and management
function generateLRNo() {
    const now = new Date();
    const datePart = now.getFullYear() + 
                   (now.getMonth()+1).toString().padStart(2, '0') + 
                   now.getDate().toString().padStart(2, '0');
    
    const lastNo = localStorage.getItem('lastLRNo') || 0;
    const newNo = parseInt(lastNo) + 1;
    
    localStorage.setItem('lastLRNo', newNo);
    return `${datePart}-${newNo.toString().padStart(4, '0')}`;
}

// Initialize the page
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize database
    await db.init();
    
    // Get DOM elements
    const generateLRBtn = document.getElementById('generateLR');
    const printLRBtn = document.getElementById('printLR');
    const lrPreview = document.getElementById('lrPreview');
    const freightInput = document.getElementById('freight');
    
    // Initialize LR number and date
    // document.getElementById('lrNo').value = generateLRNo();
    document.getElementById('date').valueAsDate = new Date();
    
    // Calculate CGST and SGST when freight changes
    freightInput.addEventListener('input', function() {
        const freight = parseFloat(this.value) || 0;
        const cgst = freight * 0;
        const sgst = freight * 0;
        
        document.getElementById('cgst').value = cgst.toFixed(2);
        document.getElementById('sgst').value = sgst.toFixed(2);
    });
    
    // Generate LR button click handler
    generateLRBtn.addEventListener('click', async function() {
        // Get all input values
        const lrNo = document.getElementById('lrNo').value;
        if (!lrNo.trim()) {
            alert("Please enter a valid LR number.");
            return;
        }
        const consignor = document.getElementById('consignor').value || 'A NEW SAGE CONVENTURE';
        const consignee = document.getElementById('consignee').value;
        const to = document.getElementById('to').value;
        const date = document.getElementById('date').value;
        const truckNo = document.getElementById('truckNo').value;
        const from = document.getElementById('from').value;
        const noOfPackages = document.getElementById('noOfPackages').value;
        const natureOfGoods = document.getElementById('natureOfGoods').value;
        const actualWeight = document.getElementById('actualWeight').value;
        const freight = document.getElementById('freight').value;
        const kaanta = document.getElementById('kaanta').value;
        const cgst = document.getElementById('cgst').value;
        const sgst = document.getElementById('sgst').value;
        const stCh = document.getElementById('stCh').value;
        const collection = document.getElementById('collection').value;
        const ddCh = document.getElementById('ddCh').value;
        const privateMark = document.getElementById('privateMark').value;
        const remarks = document.getElementById('remarks').value;
        
        // if (!lrNo.trim()) {
        //     alert("Please enter a valid LR number.");
        //     return;
        // }

        // Calculate total
        const total = ((parseFloat(freight) || 0) * 
                     (parseFloat(actualWeight) || 0)) + 
                     (parseFloat(kaanta) || 0) ;
        
        // Format date in DD/MM/YYYY format
        const formattedDate = date ? new Date(date).toLocaleDateString('en-IN') : '';
        
        // Create LR object
        const lr = {
            lrNo,
            date: new Date(date).toISOString().slice(0, 10),
            consignor,
            consignee,
            from,
            to,
            noOfPackages,
            natureOfGoods,
            actualWeight,
            freight: parseFloat(freight) || 0,
            kaanta: parseFloat(kaanta) || 0,
            cgst: parseFloat(cgst) || 0,
            sgst: parseFloat(sgst) || 0,
            stCh: parseFloat(stCh) || 0,
            collection: parseFloat(collection) || 0,
            ddCh: parseFloat(ddCh) || 0,
            total,
            privateMark,
            remarks
        };
        
        // Save LR to database
        try {
            await db.addLR(lr);
        } catch (error) {
            console.error('Error saving LR:', error);
            alert('Error saving LR to database');
            return;
        }
        
        // Generate LR HTML
        lrPreview.innerHTML = `
            <style>
                @page {
                    size: landscape;
                    margin: 10mm;
                }
                .lr-container {
                    width: 100%;
                    font-family: Arial, sans-serif;
                }
                .company-header {
                    text-align: center;
                    margin-bottom: 15px;
                }
                .company-name {
                    font-size: 18px;
                    font-weight: bold;
                    text-transform: uppercase;
                }
                .company-tagline {
                    font-size: 14px;
                }
                .company-address {
                    font-size: 12px;
                }
                .lr-no {
                    text-align: right;
                    margin: 0;
                    padding: 0;
                }
                .lr-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 10px 0;
                }
                .lr-table th, .lr-table td {
                    border: 1px solid #000;
                    padding: 5px;
                    text-align: center;
                }
                .lr-table th {
                    background-color: #f2f2f2;
                }
            </style>
            
            <div class="lr-container">
                <div class="company-header">
                    <div class="company-name">BOMBAY JANSEVA TRANSPORT CO.</div>
                    <div class="company-tagline">PART LOAD & FULL LOAD DAILY KALAMBOLI TO ALL OVER MUMBAI</div>
                    <div class="company-address">OFFICE: 338 Victoria Over Bridge, Opus Brimme Company<br>
                        Reap Road, Mumbai - 400 010, Private Bag #15156 / 9552021074 / 9506799279
                    </div>
                    <p class="lr-no"><strong>LR NO:</strong> ${lrNo}</p>
                    <p><strong>CONSIGNOR:</strong> ${consignor}</p>
                    
                    <table class="lr-table">
                        <tr>
                            <th>CONSIGNEE:</th>
                            <th>DATE:</th>
                            <th>TRUCK NO.:</th>
                            <th>FROM:</th>
                            <th>TO:</th>
                        </tr>
                        <tr>
                            <td>${consignee}</td>
                            <td>${formattedDate}</td>
                            <td>${truckNo}</td>
                            <td>${from}</td>
                            <td>${to}</td>
                        </tr>
                    </table>
                    
                    <table class="lr-table">
                        <tr>
                            <th>Sr.no</th>
                            <th>No. of Packages</th>
                            <th>Nature of Goods</th>
                            <th>Actual Wt.</th>
                            <th>Rate</th>
                            <th>DUE OR PAID Rs.</th>
                            <th>Rs.</th>
                            <th>TO PAY</th>
                            <th>Freight Payment Receipt</th>
                        </tr>
                        <tr>
                            <td>1</td>
                            <td>${noOfPackages}</td>
                            <td>${natureOfGoods}</td>
                            <td>${actualWeight}</td>
                            <td>Freight</td>
                            <td>${freight || '0.00'}</td>
                            <td></td>
                            <td></td>
                            <td>Freight To Pay</td>
                        </tr>
                        <tr>
                            <td>2</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>Kaanta</td>
                            <td>${kaanta || '0.00'}</td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>3</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>CGST 2.5%</td>
                            <td>${cgst || '0.00'}</td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>4</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>SGST 2.5%</td>
                            <td>${sgst || '0.00'}</td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>5</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>S.T. Ch.</td>
                            <td>${stCh || '0.00'}</td>
                            <td>${stCh || '0.00'}</td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>6</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>Collection</td>
                            <td>${collection || '0.00'}</td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>7</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>D.D. Ch.</td>
                            <td>${ddCh || '0.00'}</td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>B. TOTAL</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>Value Rs.=</td>
                        </tr>
                    </table>
                    
                    
                </div>
            </div>

         <div class="lr-container">
        <!-- ... existing LR content ... -->
        
        <div class="consignor-copy" style="margin-top: 20px; display: flex; justify-content: space-between; align-items: flex-end;">
    <div style="text-align: left;">
        <p>Accepted for cartings on the terms and conditions printed overleaf.</p>
        <p>Not Responsible for Breakage & Leakage.</p>
        <p>(GSTIN : 27CHYPK2888PTZY)</p>
    </div>
    <div style="text-align: center;">
        <p style="font-weight: bold; margin: 10px 0;">CONSIGNOR COPY</p>
    </div>
    <div style="text-align: right;">
        <p>For BOMBAY JANSEVA TRANSPORT CO.</p>
    </div>
</div>
        `;
        
        // Show print button
        printLRBtn.style.display = 'block';
        
        // Generate new LR number for next LR
        document.getElementById('lrNo').value = '';
    });
    
    // Print LR button click handler
    printLRBtn.addEventListener('click', function() {
        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        
        // Write the LR content to the new window
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>LR Print</title>
                <style>
                    body { font-family: Arial; margin: 0; padding: 20px; }
                    @page { size: landscape; margin: 10mm; }
                    .lr-container { width: 100%; font-family: Arial, sans-serif; }
                    .company-header { text-align: center; margin-bottom: 15px; }
                    .company-name { font-size: 18px; font-weight: bold; text-transform: uppercase; }
                    .company-tagline { font-size: 14px; }
                    .company-address { font-size: 12px; }
                    .lr-no { text-align: right; margin: 0; padding: 0; }
                    .lr-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                    .lr-table th, .lr-table td { border: 1px solid #000; padding: 5px; text-align: center; }
                    .lr-table th { background-color: #f2f2f2; }
                </style>
            </head>
            <body>
                ${lrPreview.innerHTML}
            </body>
            </html>
        `);
        
        // Close the document to ensure content is loaded
        printWindow.document.close();
        
        // Print after a short delay to ensure content is loaded
        setTimeout(() => {
            printWindow.print();
        }, 500);
    });
});
