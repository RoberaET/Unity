import { Router } from 'express';
import { ExportService } from '../../services/exportService';
import { FeatureFlagService } from '../../services/featureFlagService';
import { authenticate } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';

const router = Router();

/**
 * GET /api/v1/export/csv
 * Export user data to CSV
 */
router.get('/csv', authenticate, async (req, res, next) => {
    try {
        // Check feature flag
        const enabled = await FeatureFlagService.isEnabled('data-export', req.user!.id);
        if (!enabled) {
            throw new AppError('Data export is currently disabled', 503);
        }

        const result = await ExportService.exportToCSV(req.user!.id);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
        res.send(result.data);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/v1/export/pdf
 * Export user data to PDF
 */
router.get('/pdf', authenticate, async (req, res, next) => {
    try {
        // Check feature flags
        const dataExportEnabled = await FeatureFlagService.isEnabled('data-export', req.user!.id);
        const pdfEnabled = await FeatureFlagService.isEnabled('pdf-export', req.user!.id);

        if (!dataExportEnabled || !pdfEnabled) {
            throw new AppError('PDF export is currently disabled', 503);
        }

        const result = await ExportService.exportToPDF(req.user!.id);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);

        result.stream.pipe(res);
    } catch (error) {
        next(error);
    }
});

export default router;
