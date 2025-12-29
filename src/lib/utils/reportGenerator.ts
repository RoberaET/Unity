import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, Debt, Goal, Wallet } from '@/types/finance';
import { format } from 'date-fns';

interface ReportData {
    userName: string;
    wallets: Wallet[];
    transactions: Transaction[];
    debts: Debt[];
    goals: Goal[];
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    currency: string;
}

const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
    }).format(amount);
};

export const generateFinancialReport = (data: ReportData): void => {
    const {
        userName,
        wallets,
        transactions,
        debts,
        goals,
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        currency
    } = data;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const primaryColor: [number, number, number] = [16, 185, 129]; // emerald-500
    const textColor: [number, number, number] = [30, 41, 59]; // slate-800
    const mutedColor: [number, number, number] = [100, 116, 139]; // slate-500

    let yPos = 20;

    // ===== HEADER =====
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 45, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Financial Report', 20, 25);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated for: ${userName}`, 20, 35);
    doc.text(`Date: ${format(new Date(), 'MMMM dd, yyyy')}`, pageWidth - 20, 35, { align: 'right' });

    yPos = 60;

    // ===== SUMMARY SECTION =====
    doc.setTextColor(...textColor);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Financial Summary', 20, yPos);
    yPos += 10;

    // Summary boxes
    const boxWidth = (pageWidth - 60) / 3;
    const boxHeight = 35;

    // Total Balance Box
    doc.setFillColor(240, 253, 244); // emerald-50
    doc.roundedRect(20, yPos, boxWidth, boxHeight, 3, 3, 'F');
    doc.setFontSize(10);
    doc.setTextColor(...mutedColor);
    doc.text('Total Balance', 25, yPos + 12);
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(totalBalance, currency), 25, yPos + 25);

    // Monthly Income Box
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(30 + boxWidth, yPos, boxWidth, boxHeight, 3, 3, 'F');
    doc.setFontSize(10);
    doc.setTextColor(...mutedColor);
    doc.setFont('helvetica', 'normal');
    doc.text('Monthly Income', 35 + boxWidth, yPos + 12);
    doc.setFontSize(14);
    doc.setTextColor(34, 197, 94); // green-500
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(monthlyIncome, currency), 35 + boxWidth, yPos + 25);

    // Monthly Expenses Box
    doc.setFillColor(254, 242, 242); // rose-50
    doc.roundedRect(40 + boxWidth * 2, yPos, boxWidth, boxHeight, 3, 3, 'F');
    doc.setFontSize(10);
    doc.setTextColor(...mutedColor);
    doc.setFont('helvetica', 'normal');
    doc.text('Monthly Expenses', 45 + boxWidth * 2, yPos + 12);
    doc.setFontSize(14);
    doc.setTextColor(239, 68, 68); // red-500
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(monthlyExpenses, currency), 45 + boxWidth * 2, yPos + 25);

    yPos += boxHeight + 20;

    // ===== WALLETS SECTION =====
    if (wallets.length > 0) {
        doc.setTextColor(...textColor);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Wallets', 20, yPos);
        yPos += 5;

        autoTable(doc, {
            startY: yPos,
            head: [['Wallet Name', 'Type', 'Balance']],
            body: wallets.map(w => [
                w.name,
                w.type.charAt(0).toUpperCase() + w.type.slice(1),
                formatCurrency(w.balance, w.currency)
            ]),
            theme: 'striped',
            headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
            styles: { fontSize: 10, cellPadding: 4 },
            margin: { left: 20, right: 20 },
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
    }

    // ===== RECENT TRANSACTIONS SECTION =====
    if (transactions.length > 0) {
        // Check if we need a new page
        if (yPos > 230) {
            doc.addPage();
            yPos = 20;
        }

        doc.setTextColor(...textColor);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Recent Transactions (Last 20)', 20, yPos);
        yPos += 5;

        const recentTxns = [...transactions]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 20);

        autoTable(doc, {
            startY: yPos,
            head: [['Date', 'Description', 'Type', 'Amount']],
            body: recentTxns.map(t => [
                format(new Date(t.date), 'MMM dd, yyyy'),
                t.description.substring(0, 30) + (t.description.length > 30 ? '...' : ''),
                t.type.charAt(0).toUpperCase() + t.type.slice(1),
                (t.type === 'income' ? '+' : '-') + formatCurrency(t.amount, currency)
            ]),
            theme: 'striped',
            headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
            styles: { fontSize: 9, cellPadding: 3 },
            columnStyles: {
                0: { cellWidth: 35 },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 25 },
                3: { cellWidth: 35, halign: 'right' }
            },
            margin: { left: 20, right: 20 },
            didParseCell: function (data) {
                if (data.section === 'body' && data.column.index === 3) {
                    const value = data.cell.raw as string;
                    if (value.startsWith('+')) {
                        data.cell.styles.textColor = [34, 197, 94];
                    } else if (value.startsWith('-')) {
                        data.cell.styles.textColor = [239, 68, 68];
                    }
                }
            }
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
    }

    // ===== DEBTS SECTION =====
    if (debts.length > 0) {
        if (yPos > 230) {
            doc.addPage();
            yPos = 20;
        }

        doc.setTextColor(...textColor);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Debts & IOUs', 20, yPos);
        yPos += 5;

        autoTable(doc, {
            startY: yPos,
            head: [['Name', 'Type', 'Total', 'Remaining', 'Interest Rate']],
            body: debts.map(d => [
                d.name.substring(0, 25) + (d.name.length > 25 ? '...' : ''),
                d.type.charAt(0).toUpperCase() + d.type.slice(1),
                formatCurrency(d.totalAmount, currency),
                formatCurrency(d.remainingAmount, currency),
                d.interestRate ? `${d.interestRate}%` : 'N/A'
            ]),
            theme: 'striped',
            headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
            styles: { fontSize: 9, cellPadding: 3 },
            margin: { left: 20, right: 20 },
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
    }

    // ===== GOALS SECTION =====
    if (goals.length > 0) {
        if (yPos > 230) {
            doc.addPage();
            yPos = 20;
        }

        doc.setTextColor(...textColor);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Savings Goals', 20, yPos);
        yPos += 5;

        autoTable(doc, {
            startY: yPos,
            head: [['Goal', 'Current', 'Target', 'Progress', 'Status']],
            body: goals.map(g => {
                const progress = Math.round((g.currentAmount / g.targetAmount) * 100);
                return [
                    g.name,
                    formatCurrency(g.currentAmount, currency),
                    formatCurrency(g.targetAmount, currency),
                    `${progress}%`,
                    progress >= 100 ? 'Completed' : 'In Progress'
                ];
            }),
            theme: 'striped',
            headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
            styles: { fontSize: 9, cellPadding: 3 },
            margin: { left: 20, right: 20 },
            didParseCell: function (data) {
                if (data.section === 'body' && data.column.index === 4) {
                    const value = data.cell.raw as string;
                    if (value === 'Completed') {
                        data.cell.styles.textColor = [34, 197, 94];
                    } else {
                        data.cell.styles.textColor = [234, 179, 8]; // amber
                    }
                }
            }
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
    }

    // ===== FOOTER =====
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(...mutedColor);
        doc.text(
            `Page ${i} of ${pageCount}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
        doc.text(
            'Generated by Partner Finance App',
            pageWidth - 20,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'right' }
        );
    }

    // Save the PDF
    const fileName = `Financial_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    doc.save(fileName);
};
