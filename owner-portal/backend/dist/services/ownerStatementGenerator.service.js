"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OwnerStatementGenerator = void 0;
const jspdf_1 = __importDefault(require("jspdf"));
const jspdf_autotable_1 = __importDefault(require("jspdf-autotable"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class OwnerStatementGenerator {
    static ensureDirectoryExists(dirPath) {
        if (!fs_1.default.existsSync(dirPath)) {
            fs_1.default.mkdirSync(dirPath, { recursive: true });
        }
    }
    static async generatePDF(statementData) {
        const doc = new jspdf_1.default();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        // Header
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('OWNER STATEMENT', pageWidth / 2, 30, { align: 'center' });
        // Property and Period Info
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Property: ${statementData.propertyName}`, 20, 50);
        doc.text(`Period: ${statementData.period.startDate} to ${statementData.period.endDate}`, 20, 60);
        doc.text(`Generated: ${statementData.generatedAt}`, 20, 70);
        // Revenue Section
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('REVENUE BREAKDOWN', 20, 90);
        const revenueData = [
            ['Description', 'Amount'],
            ['Gross Revenue', this.formatCurrency(statementData.revenue.grossRevenue, statementData.currency)],
            ['Net Revenue', this.formatCurrency(statementData.revenue.netRevenue, statementData.currency)],
            ['Total Revenue', this.formatCurrency(statementData.revenue.total, statementData.currency)]
        ];
        (0, jspdf_autotable_1.default)(doc, {
            startY: 95,
            head: [revenueData[0]],
            body: revenueData.slice(1),
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] },
            styles: { fontSize: 10 }
        });
        // Expenses Section
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('EXPENSES BREAKDOWN', 20, 140);
        const expensesData = [
            ['Description', 'Amount'],
            ['Commission', this.formatCurrency(statementData.expenses.commission, statementData.currency)],
            ['Fees', this.formatCurrency(statementData.expenses.fees, statementData.currency)],
            ['Other Expenses', this.formatCurrency(statementData.expenses.other, statementData.currency)],
            ['Total Expenses', this.formatCurrency(statementData.expenses.total, statementData.currency)]
        ];
        (0, jspdf_autotable_1.default)(doc, {
            startY: 145,
            head: [expensesData[0]],
            body: expensesData.slice(1),
            theme: 'grid',
            headStyles: { fillColor: [231, 76, 60] },
            styles: { fontSize: 10 }
        });
        // Summary Section
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('SUMMARY', 20, 200);
        const summaryData = [
            ['Item', 'Amount'],
            ['Total Revenue', this.formatCurrency(statementData.revenue.total, statementData.currency)],
            ['Total Expenses', this.formatCurrency(statementData.expenses.total, statementData.currency)],
            ['NET PAYOUT', this.formatCurrency(statementData.netPayout, statementData.currency)]
        ];
        (0, jspdf_autotable_1.default)(doc, {
            startY: 205,
            head: [summaryData[0]],
            body: summaryData.slice(1),
            theme: 'grid',
            headStyles: { fillColor: [39, 174, 96] },
            bodyStyles: {
                fontSize: 12,
                fontStyle: 'bold'
            },
            styles: { fontSize: 12 }
        });
        // Footer
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('This statement was generated automatically by Owner Portal', pageWidth / 2, pageHeight - 20, { align: 'center' });
        doc.text(`Statement ID: ${statementData.statement.id}`, pageWidth / 2, pageHeight - 15, { align: 'center' });
        return Buffer.from(doc.output('arraybuffer'));
    }
    static async generateCSV(statementData) {
        const csvData = [
            ['OWNER STATEMENT'],
            ['Property', statementData.propertyName],
            ['Period', `${statementData.period.startDate} to ${statementData.period.endDate}`],
            ['Generated', statementData.generatedAt],
            [''],
            ['REVENUE BREAKDOWN'],
            ['Description', 'Amount'],
            ['Gross Revenue', this.formatCurrency(statementData.revenue.grossRevenue, statementData.currency)],
            ['Net Revenue', this.formatCurrency(statementData.revenue.netRevenue, statementData.currency)],
            ['Total Revenue', this.formatCurrency(statementData.revenue.total, statementData.currency)],
            [''],
            ['EXPENSES BREAKDOWN'],
            ['Description', 'Amount'],
            ['Commission', this.formatCurrency(statementData.expenses.commission, statementData.currency)],
            ['Fees', this.formatCurrency(statementData.expenses.fees, statementData.currency)],
            ['Other Expenses', this.formatCurrency(statementData.expenses.other, statementData.currency)],
            ['Total Expenses', this.formatCurrency(statementData.expenses.total, statementData.currency)],
            [''],
            ['SUMMARY'],
            ['Item', 'Amount'],
            ['Total Revenue', this.formatCurrency(statementData.revenue.total, statementData.currency)],
            ['Total Expenses', this.formatCurrency(statementData.expenses.total, statementData.currency)],
            ['NET PAYOUT', this.formatCurrency(statementData.netPayout, statementData.currency)],
            [''],
            ['Statement ID', statementData.statement.id],
            ['Status', statementData.statement.status],
            ['Created', statementData.statement.createdAt],
            ['Updated', statementData.statement.updatedAt]
        ];
        // Convert to CSV string
        const csvString = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        return Buffer.from(csvString, 'utf-8');
    }
    static async savePDF(statementData, filename) {
        const pdfBuffer = await this.generatePDF(statementData);
        const statementsDir = path_1.default.join(process.cwd(), 'statements');
        this.ensureDirectoryExists(statementsDir);
        const fileName = filename || `owner-statement-${statementData.statement.id}-${Date.now()}.pdf`;
        const filePath = path_1.default.join(statementsDir, fileName);
        fs_1.default.writeFileSync(filePath, pdfBuffer);
        return filePath;
    }
    static async saveCSV(statementData, filename) {
        const csvBuffer = await this.generateCSV(statementData);
        const statementsDir = path_1.default.join(process.cwd(), 'statements');
        this.ensureDirectoryExists(statementsDir);
        const fileName = filename || `owner-statement-${statementData.statement.id}-${Date.now()}.csv`;
        const filePath = path_1.default.join(statementsDir, fileName);
        fs_1.default.writeFileSync(filePath, csvBuffer);
        return filePath;
    }
    static formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }
    static async generateMonthlyStatementPDF(propertyId, propertyName, year, month, statements) {
        const doc = new jspdf_1.default();
        const pageWidth = doc.internal.pageSize.getWidth();
        // Header
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('MONTHLY OWNER STATEMENT', pageWidth / 2, 30, { align: 'center' });
        // Property and Period Info
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Property: ${propertyName}`, 20, 50);
        doc.text(`Period: ${year}-${month.toString().padStart(2, '0')}`, 20, 60);
        doc.text(`Generated: ${new Date().toISOString().split('T')[0]}`, 20, 70);
        // Summary
        const totalRevenue = statements.reduce((sum, stmt) => sum + stmt.revenue.total, 0);
        const totalExpenses = statements.reduce((sum, stmt) => sum + stmt.expenses.total, 0);
        const totalNetPayout = statements.reduce((sum, stmt) => sum + stmt.netPayout, 0);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('MONTHLY SUMMARY', 20, 90);
        const summaryData = [
            ['Metric', 'Amount'],
            ['Total Revenue', this.formatCurrency(totalRevenue)],
            ['Total Expenses', this.formatCurrency(totalExpenses)],
            ['NET PAYOUT', this.formatCurrency(totalNetPayout)],
            ['Number of Statements', statements.length.toString()]
        ];
        (0, jspdf_autotable_1.default)(doc, {
            startY: 95,
            head: [summaryData[0]],
            body: summaryData.slice(1),
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] },
            styles: { fontSize: 12 }
        });
        // Individual Statements
        if (statements.length > 0) {
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('INDIVIDUAL STATEMENTS', 20, 150);
            const statementsData = statements.map(stmt => [
                stmt.id,
                stmt.period.startDate,
                stmt.period.endDate,
                this.formatCurrency(stmt.revenue.total),
                this.formatCurrency(stmt.expenses.total),
                this.formatCurrency(stmt.netPayout),
                stmt.status
            ]);
            (0, jspdf_autotable_1.default)(doc, {
                startY: 155,
                head: [['Statement ID', 'Start Date', 'End Date', 'Revenue', 'Expenses', 'Net Payout', 'Status']],
                body: statementsData,
                theme: 'grid',
                headStyles: { fillColor: [52, 73, 94] },
                styles: { fontSize: 8 }
            });
        }
        return Buffer.from(doc.output('arraybuffer'));
    }
}
exports.OwnerStatementGenerator = OwnerStatementGenerator;
