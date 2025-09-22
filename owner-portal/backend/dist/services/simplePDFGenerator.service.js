"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimplePDFGenerator = void 0;
class SimplePDFGenerator {
    static generatePDF(statementData) {
        // Create a simple HTML-based PDF using basic HTML structure
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Owner Statement - ${statementData.propertyName}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #2c3e50; margin-bottom: 10px; }
        .info { margin-bottom: 20px; }
        .section { margin-bottom: 25px; }
        .section h2 { color: #34495e; border-bottom: 2px solid #3498db; padding-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        th, td { padding: 10px; text-align: left; border: 1px solid #ddd; }
        th { background-color: #3498db; color: white; }
        .revenue th { background-color: #27ae60; }
        .expenses th { background-color: #e74c3c; }
        .summary th { background-color: #9b59b6; }
        .total { font-weight: bold; background-color: #ecf0f1; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #7f8c8d; }
    </style>
</head>
<body>
    <div class="header">
        <h1>OWNER STATEMENT</h1>
        <p><strong>Property:</strong> ${statementData.propertyName}</p>
        <p><strong>Period:</strong> ${statementData.period.startDate} to ${statementData.period.endDate}</p>
        <p><strong>Generated:</strong> ${statementData.generatedAt}</p>
    </div>

    <div class="section">
        <h2>REVENUE BREAKDOWN</h2>
        <table class="revenue">
            <tr>
                <th>Description</th>
                <th>Amount</th>
            </tr>
            <tr>
                <td>Gross Revenue</td>
                <td>${this.formatCurrency(statementData.revenue.grossRevenue, statementData.currency)}</td>
            </tr>
            <tr>
                <td>Net Revenue</td>
                <td>${this.formatCurrency(statementData.revenue.netRevenue, statementData.currency)}</td>
            </tr>
            <tr class="total">
                <td><strong>Total Revenue</strong></td>
                <td><strong>${this.formatCurrency(statementData.revenue.total, statementData.currency)}</strong></td>
            </tr>
        </table>
    </div>

    <div class="section">
        <h2>EXPENSES BREAKDOWN</h2>
        <table class="expenses">
            <tr>
                <th>Description</th>
                <th>Amount</th>
            </tr>
            <tr>
                <td>Commission</td>
                <td>${this.formatCurrency(statementData.expenses.commission, statementData.currency)}</td>
            </tr>
            <tr>
                <td>Fees</td>
                <td>${this.formatCurrency(statementData.expenses.fees, statementData.currency)}</td>
            </tr>
            <tr>
                <td>Other Expenses</td>
                <td>${this.formatCurrency(statementData.expenses.other, statementData.currency)}</td>
            </tr>
            <tr class="total">
                <td><strong>Total Expenses</strong></td>
                <td><strong>${this.formatCurrency(statementData.expenses.total, statementData.currency)}</strong></td>
            </tr>
        </table>
    </div>

    <div class="section">
        <h2>SUMMARY</h2>
        <table class="summary">
            <tr>
                <th>Item</th>
                <th>Amount</th>
            </tr>
            <tr>
                <td>Total Revenue</td>
                <td>${this.formatCurrency(statementData.revenue.total, statementData.currency)}</td>
            </tr>
            <tr>
                <td>Total Expenses</td>
                <td>${this.formatCurrency(statementData.expenses.total, statementData.currency)}</td>
            </tr>
            <tr class="total">
                <td><strong>NET PAYOUT</strong></td>
                <td><strong>${this.formatCurrency(statementData.netPayout, statementData.currency)}</strong></td>
            </tr>
        </table>
    </div>

    <div class="footer">
        <p>This statement was generated automatically by Owner Portal</p>
        <p>Statement ID: ${statementData.statement.id} | Status: ${statementData.statement.status}</p>
    </div>
</body>
</html>`;
        return Buffer.from(html, 'utf-8');
    }
    static generateCSV(statementData) {
        const csvLines = [
            'OWNER STATEMENT',
            `Property,${statementData.propertyName}`,
            `Period,${statementData.period.startDate} to ${statementData.period.endDate}`,
            `Generated,${statementData.generatedAt}`,
            '',
            'REVENUE BREAKDOWN',
            'Description,Amount',
            `Gross Revenue,${this.formatCurrency(statementData.revenue.grossRevenue, statementData.currency)}`,
            `Net Revenue,${this.formatCurrency(statementData.revenue.netRevenue, statementData.currency)}`,
            `Total Revenue,${this.formatCurrency(statementData.revenue.total, statementData.currency)}`,
            '',
            'EXPENSES BREAKDOWN',
            'Description,Amount',
            `Commission,${this.formatCurrency(statementData.expenses.commission, statementData.currency)}`,
            `Fees,${this.formatCurrency(statementData.expenses.fees, statementData.currency)}`,
            `Other Expenses,${this.formatCurrency(statementData.expenses.other, statementData.currency)}`,
            `Total Expenses,${this.formatCurrency(statementData.expenses.total, statementData.currency)}`,
            '',
            'SUMMARY',
            'Item,Amount',
            `Total Revenue,${this.formatCurrency(statementData.revenue.total, statementData.currency)}`,
            `Total Expenses,${this.formatCurrency(statementData.expenses.total, statementData.currency)}`,
            `NET PAYOUT,${this.formatCurrency(statementData.netPayout, statementData.currency)}`,
            '',
            'Statement Details',
            `Statement ID,${statementData.statement.id}`,
            `Status,${statementData.statement.status}`,
            `Created,${statementData.statement.createdAt}`,
            `Updated,${statementData.statement.updatedAt}`
        ];
        return Buffer.from(csvLines.join('\n'), 'utf-8');
    }
    static formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }
}
exports.SimplePDFGenerator = SimplePDFGenerator;
