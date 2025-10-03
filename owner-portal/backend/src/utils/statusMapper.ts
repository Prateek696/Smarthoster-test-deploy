/**
 * Maps Hostaway/Hostkit booking statuses to user-friendly display values
 */

export const mapBookingStatus = (rawStatus: string | undefined | null): string => {
  if (!rawStatus) {
    return 'Unknown';
  }

  const status = rawStatus.toLowerCase().trim();

  // Map Hostaway statuses to display values
  const statusMap: { [key: string]: string } = {
    // Confirmed/Active statuses
    'confirmed': 'Confirmed',
    'active': 'Confirmed',
    'booked': 'Confirmed',
    'reserved': 'Confirmed',
    
    // Pending/Inquiry statuses
    'inquiry': 'In Enquiry',
    'inquiryPreapproved': 'inquiryPreapproved',
    'pending': 'Pending',
    'waiting': 'Pending',
    'preapproved': 'inquiryPreapproved',
    
    // Expired statuses
    'expired': 'Expired',
    'timeout': 'Expired',
    'timedout': 'Expired',
    
    // Cancelled statuses
    'cancelled': 'Cancelled',
    'canceled': 'Cancelled',
    'cancelledbyguest': 'Cancelled',
    'cancelledbyhost': 'Cancelled',
    'cancelledbyadmin': 'Cancelled',
    
    // Modified statuses
    'modified': 'Modified',
    'changed': 'Modified',
    'updated': 'Modified',
    
    // No-show statuses
    'noshow': 'No Show',
    'no-show': 'No Show',
    'no_show': 'No Show',
    
    // Completed statuses
    'completed': 'Completed',
    'finished': 'Completed',
    'checkedout': 'Completed',
    'checked_out': 'Completed'
  };

  return statusMap[status] || rawStatus; // Return original if no mapping found
};

export const mapPaymentStatus = (rawPaymentStatus: string | undefined | null, bookingStatus: string): string => {
  const status = bookingStatus.toLowerCase().trim();
  
  // For certain booking statuses, payment status should be N/A regardless of rawPaymentStatus
  if (status.includes('cancelled') || status.includes('expired')) {
    return 'N/A';
  }
  
  // For inquiry statuses, payment status should be Pending, not Unknown
  if (status.includes('inquiry') || status.includes('pending') || status.includes('new')) {
    return 'Pending';
  }
  
  // If no raw payment status, derive from booking status
  if (!rawPaymentStatus) {
    if (status.includes('confirmed') || status.includes('active') || status.includes('modified')) {
      return 'Paid'; // Assume confirmed/modified bookings are paid
    }
    
    return 'Pending'; // Default to Pending instead of Unknown
  }

  const paymentStatus = rawPaymentStatus.toLowerCase().trim();

  // Handle "Unknown" payment status from API
  if (paymentStatus === 'unknown') {
    if (status.includes('inquiry') || status.includes('pending') || status.includes('new')) {
      return 'Pending';
    }
    if (status.includes('confirmed') || status.includes('active') || status.includes('modified')) {
      return 'Paid';
    }
    return 'Pending'; // Default to Pending instead of Unknown
  }

  const paymentMap: { [key: string]: string } = {
    'paid': 'Paid',
    'completed': 'Paid',
    'success': 'Paid',
    'successful': 'Paid',
    
    'pending': 'Pending',
    'processing': 'Pending',
    'waiting': 'Pending',
    
    'partial': 'Partial',
    'partially_paid': 'Partial',
    'partiallypaid': 'Partial',
    
    'failed': 'Failed',
    'error': 'Failed',
    'declined': 'Failed',
    
    'refunded': 'Refunded',
    'refund': 'Refunded',
    'cancelled': 'Refunded'
  };

  return paymentMap[paymentStatus] || rawPaymentStatus;
};
