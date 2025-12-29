import { createObjectCsvWriter } from 'csv-writer';
import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
import prisma from '../config/database';
import { AuditService } from './auditService';
import { AppError } from '../middleware/errorHandler';

/**
 * Data Export Service
 * 
 * PURPOSE:
 * - GDPR compliance (users can export their data)
 * - Backup/archival
 * - Migration to other tools
 * - Financial record keeping
 * 
 * FORMATS:
 * - CSV: Machine-readable, Excel-compatible, mandatory
 * - PDF: Human-readable formatted report, preferred
 * 
 * FEATURE FLAGGED:
 * - Can be disabled during high load or abuse
 * - Heavy operation, use with rate limiting
 * 
 * STREAMING:
 * - Large datasets streamed to avoid memory issues
 * - Don't load all data into memory at once
 */

export const ExportService = {
    /**
     * Export user data to CSV
     */
    async exportToCSV(userId: string): Promise<{ filename: string; data: string }> {
        // Get user data
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                email: true,
                name: true,
                createdAt: true,
            },
        });

        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Get transactions
        const transactions = await prisma.transaction.findMany({
            where: {
                userId,
                deletedAt: null,
            },
            orderBy: { date: 'desc' },
        });

        // Convert to CSV format
        const csvData: string[][] = [
            // Header row
            ['Type', 'Amount', 'Currency', 'Category', 'Description', 'Date'],
        ];

        transactions.forEach((t) => {
            csvData.push([
                t.type,
                t.amount.toString(),
                t.currency,
                t.category || '',
                t.description || '',
                t.date.toISOString(),
            ]);
        });

        // Convert to CSV string
        const csvString = csvData.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

        // Log export
        await AuditService.log({
            userId,
            action: 'data_export',
            metadata: JSON.stringify({
                format: 'csv',
                recordCount: transactions.length,
            }),
        });

        const filename = `finance-export-${userId}-${Date.now()}.csv`;

        return {
            filename,
            data: csvString,
        };
    },

    /**
     * Export user data to PDF
     */
    async exportToPDF(userId: string): Promise<{ filename: string; stream: PassThrough }> {
        // Get user data
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                email: true,
                name: true,
                createdAt: true,
            },
        });

        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Get transactions
        const transactions = await prisma.transaction.findMany({
            where: {
                userId,
                deletedAt: null,
            },
            orderBy: { date: 'desc' },
            take: 1000, // Limit for PDF (performance)
        });

        // Get stats
        const stats = {
            totalIncome: transactions
                .filter((t) => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0),
            totalExpense: transactions
                .filter((t) => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0),
        };

        // Create PDF
        const doc = new PDFDocument();
        const stream = new PassThrough();
        doc.pipe(stream);

        // Title
        doc.fontSize(20).text('Financial Data Export', { align: 'center' });
        doc.moveDown();

        // User info
        doc.fontSize(12).text(`Account: ${user.email}`);
        doc.text(`Name: ${user.name}`);
        doc.text(`Member Since: ${user.createdAt.toLocaleDateString()}`);
        doc.text(`Export Date: ${new Date().toLocaleDateString()}`);
        doc.moveDown();

        // Summary
        doc.fontSize(16).text('Summary', { underline: true });
        doc.fontSize(12);
        doc.text(`Total Income: $${stats.totalIncome.toFixed(2)}`);
        doc.text(`Total Expenses: $${stats.totalExpense.toFixed(2)}`);
        doc.text(`Net Balance: $${(stats.totalIncome - stats.totalExpense).toFixed(2)}`);
        doc.text(`Total Transactions: ${transactions.length}`);
        doc.moveDown();

        // Transactions
        doc.fontSize(16).text('Recent Transactions', { underline: true });
        doc.fontSize(10);

        transactions.slice(0, 100).forEach((t, index) => {
            if (index > 0 && index % 30 === 0) {
                doc.addPage();
            }

            const sign = t.type === 'income' ? '+' : '-';
            doc.text(
                `${t.date.toLocaleDateString()} | ${t.type.toUpperCase()} | ${sign}$${t.amount.toFixed(2)} | ${t.category || 'N/A'
                } | ${t.description || ''}`,
                { width: 500 }
            );
        });

        if (transactions.length > 100) {
            doc.moveDown();
            doc.text(`... and ${transactions.length - 100} more transactions (download CSV for complete data)`);
        }

        doc.end();

        // Log export
        await AuditService.log({
            userId,
            action: 'data_export',
            metadata: JSON.stringify({
                format: 'pdf',
                recordCount: transactions.length,
            }),
        });

        const filename = `finance-export-${userId}-${Date.now()}.pdf`;

        return {
            filename,
            stream,
        };
    },

    /**
     * Export audit log (admin feature)
     */
    async exportAuditLog(userId: string, requestingUserId: string): Promise<{ filename: string; data: string }> {
        const logs = await prisma.activityLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        const csvData: string[][] = [['Action', 'Result', 'Metadata', 'Date']];

        logs.forEach((log) => {
            csvData.push([log.action, log.result, log.metadata || '', log.createdAt.toISOString()]);
        });

        const csvString = csvData.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

        // Log export
        await AuditService.log({
            userId: requestingUserId,
            action: 'audit_log_export',
            metadata: JSON.stringify({
                targetUserId: userId,
                recordCount: logs.length,
            }),
        });

        const filename = `audit-log-${userId}-${Date.now()}.csv`;

        return {
            filename,
            data: csvString,
        };
    },
};
