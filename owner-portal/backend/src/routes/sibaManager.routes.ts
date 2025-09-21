import express from 'express';
import { 
  validateSibaSubmission, 
  sendSibaSubmission, 
  getBulkSibaDashboard 
} from '../services/sibaManager.service';

const router = express.Router();

// Validate SIBA submission for a reservation
router.post('/validate', async (req, res) => {
  try {
    const { propertyId, reservationData } = req.body;
    
    if (!propertyId || !reservationData) {
      return res.status(400).json({
        success: false,
        error: 'Property ID and reservation data are required'
      });
    }

    const validation = await validateSibaSubmission(propertyId, reservationData);
    
    res.json({
      success: true,
      validation
    });
  } catch (error: any) {
    console.error('SIBA validation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Send SIBA submission for a reservation
router.post('/send', async (req, res) => {
  try {
    const { propertyId, reservationData } = req.body;
    
    if (!propertyId || !reservationData) {
      return res.status(400).json({
        success: false,
        error: 'Property ID and reservation data are required'
      });
    }

    const submission = await sendSibaSubmission(propertyId, reservationData);
    
    if (submission.success) {
      res.json({
        success: true,
        submissionId: submission.submissionId,
        reservationCode: submission.reservationCode,
        response: submission.response
      });
    } else {
      res.status(400).json({
        success: false,
        errors: submission.errors
      });
    }
  } catch (error: any) {
    console.error('SIBA submission error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get bulk SIBA dashboard with due/overdue flags
router.get('/dashboard', async (req, res) => {
  try {
    const dashboard = await getBulkSibaDashboard();
    
    if (dashboard.success) {
      res.json({
        success: true,
        data: dashboard.data,
        summary: dashboard.summary
      });
    } else {
      res.status(500).json({
        success: false,
        error: dashboard.error
      });
    }
  } catch (error: any) {
    console.error('Bulk SIBA dashboard error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get SIBA status for a specific property (for reservation view)
router.get('/status/:propertyId', async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    if (!propertyId) {
      return res.status(400).json({
        success: false,
        error: 'Property ID is required'
      });
    }

    const { getSibaStatusService } = await import('../services/siba.service');
    const status = await getSibaStatusService(parseInt(propertyId));
    
    res.json({
      success: true,
      status
    });
  } catch (error: any) {
    console.error('SIBA status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Bulk validate multiple reservations for SIBA
router.post('/bulk-validate', async (req, res) => {
  try {
    const { reservations } = req.body;
    
    if (!Array.isArray(reservations)) {
      return res.status(400).json({
        success: false,
        error: 'Reservations must be an array'
      });
    }

    const validations = await Promise.all(
      reservations.map(async (reservation) => {
        const validation = await validateSibaSubmission(reservation.propertyId, reservation);
        return {
          reservationId: reservation.id || reservation.reservationId,
          propertyId: reservation.propertyId,
          validation
        };
      })
    );

    res.json({
      success: true,
      validations
    });
  } catch (error: any) {
    console.error('Bulk SIBA validation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Bulk send SIBA submissions for multiple reservations
router.post('/bulk-send', async (req, res) => {
  try {
    const { reservations } = req.body;
    
    if (!Array.isArray(reservations)) {
      return res.status(400).json({
        success: false,
        error: 'Reservations must be an array'
      });
    }

    const submissions = await Promise.all(
      reservations.map(async (reservation) => {
        const submission = await sendSibaSubmission(reservation.propertyId, reservation);
        return {
          reservationId: reservation.id || reservation.reservationId,
          propertyId: reservation.propertyId,
          submission
        };
      })
    );

    const successful = submissions.filter(s => s.submission.success);
    const failed = submissions.filter(s => !s.submission.success);

    res.json({
      success: true,
      summary: {
        total: submissions.length,
        successful: successful.length,
        failed: failed.length
      },
      submissions
    });
  } catch (error: any) {
    console.error('Bulk SIBA submission error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
