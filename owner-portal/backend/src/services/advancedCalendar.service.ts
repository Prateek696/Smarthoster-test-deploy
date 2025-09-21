import {
  getHostawayCalendar,
  updateHostawayCalendar,
  getHostawayReservations,
  updateHostawayPricing,
  updateHostawayMinimumStay,
  updateHostawayCheckInOut,
  updateHostawayMaintenance,
  updateHostawayCleaning,
  updateHostawayCOACOD,
  bulkUpdateHostawayPricing,
  bulkUpdateHostawayMinimumStay,
  bulkUpdateHostawayMaintenance,
  bulkUpdateHostawayCleaning,
  bulkUpdateHostawayCOACOD
} from '../integrations/hostaway.api';
import {
  updateHostkitCalendar,
  getChannelBookings
} from '../integrations/hostkit.api';

export interface CalendarEvent {
  id: string;
  propertyId: number;
  propertyName: string;
  type: 'block' | 'price_update' | 'minimum_stay' | 'maintenance' | 'cleaning';
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  price?: number;
  minimumStay?: number;
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  source: 'hostaway' | 'hostkit' | 'manual';
  externalId?: string;
}

export interface BulkOperation {
  id: string;
  type: 'block_dates' | 'price_update' | 'minimum_stay_update' | 'maintenance' | 'cleaning' | 'coa_cod';
  properties: number[];
  dates: string[];
  parameters: {
    price?: number;
    minimumStay?: number;
    reason?: string;
    maintenanceType?: string;
    cleaningType?: string;
    checkInAvailable?: boolean;
    checkOutAvailable?: boolean;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  error?: string;
  results?: {
    success: number;
    failed: number;
    errors: string[];
  };
}

export interface EventTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  parameters: Record<string, any>;
  isPopular: boolean;
}

// Mock data for demonstration
const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    propertyId: 392776,
    propertyName: 'Piece of Heaven',
    type: 'block',
    title: 'Maintenance Block',
    description: 'Annual maintenance and deep cleaning',
    startDate: '2025-09-15',
    endDate: '2025-09-17',
    status: 'active',
    createdBy: 'John Doe',
    createdAt: '2025-09-01T10:00:00Z',
    updatedAt: '2025-09-01T10:00:00Z',
    source: 'manual'
  },
  {
    id: '2',
    propertyId: 392776,
    propertyName: 'Piece of Heaven',
    type: 'price_update',
    title: 'Peak Season Pricing',
    description: 'Increase prices for holiday season',
    startDate: '2025-12-20',
    endDate: '2026-01-05',
    price: 250,
    status: 'pending',
    createdBy: 'John Doe',
    createdAt: '2025-09-02T14:30:00Z',
    updatedAt: '2025-09-02T14:30:00Z',
    source: 'manual'
  },
  {
    id: '3',
    propertyId: 392777,
    propertyName: 'Mountain View Villa',
    type: 'minimum_stay',
    title: 'Weekend Minimum Stay',
    description: 'Set 3-night minimum for weekends',
    startDate: '2025-10-01',
    endDate: '2025-12-31',
    minimumStay: 3,
    status: 'active',
    createdBy: 'John Doe',
    createdAt: '2025-09-03T09:15:00Z',
    updatedAt: '2025-09-03T09:15:00Z',
    source: 'manual'
  },
  {
    id: '4',
    propertyId: 392776,
    propertyName: 'Piece of Heaven',
    type: 'cleaning',
    title: 'Deep Cleaning Schedule',
    description: 'Scheduled deep cleaning between bookings',
    startDate: '2025-09-20',
    endDate: '2025-09-20',
    status: 'completed',
    createdBy: 'John Doe',
    createdAt: '2025-09-04T11:00:00Z',
    updatedAt: '2025-09-04T11:00:00Z',
    source: 'manual'
  },
  {
    id: '5',
    propertyId: 392776,
    propertyName: 'Piece of Heaven',
    type: 'block',
    title: 'Personal Use',
    description: 'Blocked for personal vacation',
    startDate: '2025-09-10',
    endDate: '2025-09-12',
    status: 'active',
    createdBy: 'John Doe',
    createdAt: '2025-09-05T08:00:00Z',
    updatedAt: '2025-09-05T08:00:00Z',
    source: 'manual'
  },
  {
    id: '6',
    propertyId: 392776,
    propertyName: 'Piece of Heaven',
    type: 'price_update',
    title: 'Weekend Premium Pricing',
    description: 'Higher rates for weekend bookings',
    startDate: '2025-09-06',
    endDate: '2025-09-08',
    price: 180,
    status: 'active',
    createdBy: 'John Doe',
    createdAt: '2025-09-06T12:00:00Z',
    updatedAt: '2025-09-06T12:00:00Z',
    source: 'manual'
  }
];

const mockBulkOperations: BulkOperation[] = [
  {
    id: 'bulk-1',
    type: 'block_dates',
    properties: [392776, 392777, 392778],
    dates: ['2024-12-24', '2024-12-25', '2024-12-26'],
    parameters: {
      reason: 'Holiday family time'
    },
    status: 'completed',
    createdAt: '2024-09-01T08:00:00Z',
    completedAt: '2024-09-01T08:05:00Z',
    results: {
      success: 3,
      failed: 0,
      errors: []
    }
  },
  {
    id: 'bulk-2',
    type: 'price_update',
    properties: [392776, 392777],
    dates: ['2024-10-01', '2024-10-02', '2024-10-03'],
    parameters: {
      price: 200
    },
    status: 'processing',
    createdAt: '2024-09-05T10:30:00Z'
  },
  {
    id: 'bulk-3',
    type: 'minimum_stay_update',
    properties: [392776, 392777, 392778, 392779],
    dates: ['2024-11-01', '2024-11-02'],
    parameters: {
      minimumStay: 2
    },
    status: 'failed',
    createdAt: '2024-09-06T15:45:00Z',
    completedAt: '2024-09-06T15:50:00Z',
    results: {
      success: 2,
      failed: 2,
      errors: ['Property 392778: API timeout', 'Property 392779: Invalid configuration']
    }
  }
];

const mockTemplates: EventTemplate[] = [
  {
    id: 'template-1',
    name: 'Maintenance Block',
    type: 'block',
    description: 'Block dates for maintenance work',
    parameters: {
      reason: 'maintenance',
      duration: 2
    },
    isPopular: true
  },
  {
    id: 'template-2',
    name: 'Cleaning Schedule',
    type: 'cleaning',
    description: 'Schedule cleaning between bookings',
    parameters: {
      duration: 1,
      frequency: 'between_bookings'
    },
    isPopular: true
  },
  {
    id: 'template-3',
    name: 'Price Increase',
    type: 'price_update',
    description: 'Increase prices for peak season',
    parameters: {
      priceMultiplier: 1.2,
      reason: 'peak_season'
    },
    isPopular: true
  },
  {
    id: 'template-4',
    name: 'Minimum Stay Update',
    type: 'minimum_stay',
    description: 'Set minimum stay requirements',
    parameters: {
      minimumStay: 3,
      reason: 'weekend_policy'
    },
    isPopular: false
  },
  {
    id: 'template-5',
    name: 'Holiday Block',
    type: 'block',
    description: 'Block dates for personal use',
    parameters: {
      reason: 'personal_use',
      duration: 7
    },
    isPopular: true
  },
  {
    id: 'template-6',
    name: 'Seasonal Pricing',
    type: 'price_update',
    description: 'Apply seasonal pricing rules',
    parameters: {
      season: 'winter',
      priceMultiplier: 0.8
    },
    isPopular: false
  }
];

export async function getAdvancedCalendarEventsService(
  propertyId?: number,
  startDate?: string,
  endDate?: string,
  userId?: string
): Promise<CalendarEvent[]> {
  console.log(`[Advanced Calendar Service] Fetching events - Property: ${propertyId}, Start: ${startDate}, End: ${endDate}, User: ${userId}`);
  
  let events: CalendarEvent[] = [];

  try {
    // Check if API credentials are available
    const hasHostawayToken = process.env.HOSTAWAY_TOKEN;
    const hasHostkitUrl = process.env.HOSTKIT_API_URL;
    
    console.log(`[Advanced Calendar Service] API Credentials Check:`);
    console.log(`- HOSTAWAY_TOKEN: ${hasHostawayToken ? 'Present' : 'Missing'}`);
    console.log(`- HOSTKIT_API_URL: ${hasHostkitUrl ? 'Present' : 'Missing'}`);
    console.log(`- HOSTAWAY_TOKEN value: ${hasHostawayToken ? hasHostawayToken.substring(0, 20) + '...' : 'Not set'}`);
    console.log(`- HOSTKIT_API_URL value: ${hasHostkitUrl ? hasHostkitUrl.substring(0, 20) + '...' : 'Not set'}`);

    // If propertyId is specified, fetch real data from APIs
    if (propertyId && startDate && endDate) {
      console.log(`[Advanced Calendar Service] Fetching real data for property ${propertyId}`);
      
      // Fetch from Hostaway API
      if (hasHostawayToken) {
        try {
          console.log(`[Advanced Calendar Service] Attempting Hostaway API call...`);
          const hostawayCalendar = await getHostawayCalendar(propertyId, startDate, endDate);
          console.log(`[Advanced Calendar Service] Hostaway calendar data:`, hostawayCalendar);
          
          if (hostawayCalendar.result && Array.isArray(hostawayCalendar.result)) {
            console.log(`[Advanced Calendar Service] Hostaway result structure:`, JSON.stringify(hostawayCalendar.result[0], null, 2));
            
            const hostawayEvents = hostawayCalendar.result
              .filter((item: any) => item.status === 'unavailable' || item.status === 'blocked')
              .map((item: any, index: number) => {
                // Try different possible field names for reason/description
                const reason = item.reason || item.description || item.notes || item.comment || item.message || 'No reason provided';
                const title = item.title || item.name || reason || 'Blocked by owner';
                
                console.log(`[Advanced Calendar Service] Processing Hostaway item ${index}:`, {
                  id: item.id,
                  status: item.status,
                  reason: reason,
                  title: title,
                  date: item.date,
                  startDate: item.startDate,
                  endDate: item.endDate
                });
                
                return {
                  id: `hostaway-${propertyId}-${index}`,
                  propertyId,
                  propertyName: `Property ${propertyId}`,
                  type: 'block' as const,
                  title: title,
                  description: `Blocked via Hostaway: ${reason}`,
                  startDate: item.date || item.startDate,
                  endDate: item.endDate || item.date,
                  status: 'active' as const,
                  createdBy: 'System',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  source: 'hostaway' as const,
                  externalId: item.id?.toString()
                };
              });
            
            events.push(...hostawayEvents);
            console.log(`[Advanced Calendar Service] Added ${hostawayEvents.length} Hostaway events`);
          } else {
            console.log(`[Advanced Calendar Service] No Hostaway events found in response`);
          }
        } catch (hostawayError) {
          console.error(`[Advanced Calendar Service] Hostaway API error:`, hostawayError);
        }
      } else {
        console.log(`[Advanced Calendar Service] Skipping Hostaway API - no token available`);
      }

      // Fetch from Hostkit API
      if (hasHostkitUrl) {
        try {
          console.log(`[Advanced Calendar Service] Attempting Hostkit API call...`);
          const hostkitBookings = await getChannelBookings(propertyId, startDate, endDate);
          console.log(`[Advanced Calendar Service] Hostkit bookings data:`, hostkitBookings);
          
          if (Array.isArray(hostkitBookings)) {
            console.log(`[Advanced Calendar Service] Hostkit bookings structure:`, JSON.stringify(hostkitBookings[0], null, 2));
            
            const hostkitEvents = hostkitBookings
              .filter((booking: any) => booking.status === 'blocked' || booking.status === 'unavailable')
              .map((booking: any, index: number) => {
                // Try different possible field names for reason/description
                const reason = booking.reason || booking.description || booking.notes || booking.comment || booking.message || 'No reason provided';
                const title = booking.title || booking.name || reason || 'Blocked by owner';
                
                console.log(`[Advanced Calendar Service] Processing Hostkit booking ${index}:`, {
                  id: booking.id,
                  status: booking.status,
                  reason: reason,
                  title: title,
                  startDate: booking.startDate,
                  endDate: booking.endDate
                });
                
                return {
                  id: `hostkit-${propertyId}-${index}`,
                  propertyId,
                  propertyName: `Property ${propertyId}`,
                  type: 'block' as const,
                  title: title,
                  description: `Blocked via Hostkit: ${reason}`,
                  startDate: booking.startDate || booking.date,
                  endDate: booking.endDate || booking.date,
                  status: 'active' as const,
                  createdBy: 'System',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  source: 'hostkit' as const,
                  externalId: booking.id?.toString()
                };
              });
            
            events.push(...hostkitEvents);
            console.log(`[Advanced Calendar Service] Added ${hostkitEvents.length} Hostkit events`);
          } else {
            console.log(`[Advanced Calendar Service] No Hostkit events found in response`);
          }
        } catch (hostkitError) {
          console.error(`[Advanced Calendar Service] Hostkit API error:`, hostkitError);
        }
      } else {
        console.log(`[Advanced Calendar Service] Skipping Hostkit API - no URL available`);
      }
    }

    // Add mock events for demonstration (fallback if APIs fail or for additional data)
    const mockEventsForProperty = mockEvents.filter(event => 
      !propertyId || event.propertyId === propertyId
    );
    
    // Filter mock events by date range
    const filteredMockEvents = mockEventsForProperty.filter(event => {
      if (!startDate || !endDate) return true;
      
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      const filterStart = new Date(startDate);
      const filterEnd = new Date(endDate);
      
      return (eventStart >= filterStart && eventStart <= filterEnd) ||
             (eventEnd >= filterStart && eventEnd <= filterEnd) ||
             (eventStart <= filterStart && eventEnd >= filterEnd);
    });

    // Add source field to mock events to indicate they are mock data
    const mockEventsWithSource = filteredMockEvents.map(event => ({
      ...event,
      source: 'manual' as const
    }));
    
    events.push(...mockEventsWithSource);
    console.log(`[Advanced Calendar Service] Added ${mockEventsWithSource.length} mock events (marked as 'manual' source)`);

    // Sort events by start date
    events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    // Summary of data sources
    const hostawayEvents = events.filter(e => e.source === 'hostaway').length;
    const hostkitEvents = events.filter(e => e.source === 'hostkit').length;
    const manualEvents = events.filter(e => e.source === 'manual').length;
    
    console.log(`[Advanced Calendar Service] Data Summary:`);
    console.log(`- Hostaway events: ${hostawayEvents}`);
    console.log(`- Hostkit events: ${hostkitEvents}`);
    console.log(`- Manual/Mock events: ${manualEvents}`);
    console.log(`- Total events: ${events.length}`);
    
    return events;

  } catch (error) {
    console.error(`[Advanced Calendar Service] Error fetching events:`, error);
    
    // Fallback to mock data on error
    console.log(`[Advanced Calendar Service] Falling back to mock data`);
    return mockEvents.filter(event => 
      (!propertyId || event.propertyId === propertyId) &&
      (!startDate || !endDate || (
        new Date(event.startDate) >= new Date(startDate) &&
        new Date(event.endDate) <= new Date(endDate)
      ))
    );
  }
}

export async function createAdvancedCalendarEventService(
  eventData: Partial<CalendarEvent>,
  userId: string
): Promise<CalendarEvent> {
  console.log(`[Advanced Calendar Service] Creating event:`, eventData);
  
  const propertyId = eventData.propertyId || 392776;
  const startDate = eventData.startDate || new Date().toISOString().split('T')[0];
  const endDate = eventData.endDate || new Date().toISOString().split('T')[0];
  const eventType = eventData.type || 'block';

  try {
    // Update the calendar via APIs based on event type
    if (eventType === 'block') {
      console.log(`[Advanced Calendar Service] Creating block event via APIs`);
      
      // Try Hostaway API first
      try {
        await updateHostawayCalendar(propertyId, startDate, endDate, 'blocked');
        console.log(`[Advanced Calendar Service] Successfully blocked dates via Hostaway`);
      } catch (hostawayError) {
        console.error(`[Advanced Calendar Service] Hostaway block failed:`, hostawayError);
      }

      // Try Hostkit API
      try {
        await updateHostkitCalendar(propertyId, startDate, endDate, 'blocked');
        console.log(`[Advanced Calendar Service] Successfully blocked dates via Hostkit`);
      } catch (hostkitError) {
        console.error(`[Advanced Calendar Service] Hostkit block failed:`, hostkitError);
      }
    } else if (eventType === 'price_update' && eventData.price) {
      console.log(`[Advanced Calendar Service] Creating price update event via APIs`);
      
      // Try Hostaway API for pricing
      try {
        await updateHostawayPricing(propertyId, startDate, endDate, eventData.price);
        console.log(`[Advanced Calendar Service] Successfully updated pricing via Hostaway`);
      } catch (hostawayError) {
        console.error(`[Advanced Calendar Service] Hostaway pricing update failed:`, hostawayError);
      }
    } else if (eventType === 'minimum_stay' && eventData.minimumStay) {
      console.log(`[Advanced Calendar Service] Creating minimum stay event via APIs`);
      
      // Try Hostaway API for minimum stay
      try {
        await updateHostawayMinimumStay(propertyId, startDate, endDate, eventData.minimumStay);
        console.log(`[Advanced Calendar Service] Successfully updated minimum stay via Hostaway`);
      } catch (hostawayError) {
        console.error(`[Advanced Calendar Service] Hostaway minimum stay update failed:`, hostawayError);
      }
    } else if (eventType === 'maintenance') {
      console.log(`[Advanced Calendar Service] Creating maintenance event via APIs`);
      
      // Try Hostaway API for maintenance
      try {
        await updateHostawayMaintenance(propertyId, startDate, endDate, eventData.title || 'General Maintenance', eventData.description);
        console.log(`[Advanced Calendar Service] Successfully updated maintenance via Hostaway`);
      } catch (hostawayError) {
        console.error(`[Advanced Calendar Service] Hostaway maintenance update failed:`, hostawayError);
      }
    } else if (eventType === 'cleaning') {
      console.log(`[Advanced Calendar Service] Creating cleaning event via APIs`);
      
      // Try Hostaway API for cleaning
      try {
        await updateHostawayCleaning(propertyId, startDate, endDate, eventData.title || 'General Cleaning', eventData.description);
        console.log(`[Advanced Calendar Service] Successfully updated cleaning via Hostaway`);
      } catch (hostawayError) {
        console.error(`[Advanced Calendar Service] Hostaway cleaning update failed:`, hostawayError);
      }
    }

    // Create the event record
    const newEvent: CalendarEvent = {
      id: `manual-${Date.now()}`,
      propertyId,
      propertyName: eventData.propertyName || `Property ${propertyId}`,
      type: eventType,
      title: eventData.title || 'New Event',
      description: eventData.description,
      startDate,
      endDate,
      price: eventData.price,
      minimumStay: eventData.minimumStay,
      status: 'active',
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: 'manual',
      externalId: undefined
    };

    // Add to mock events for persistence (in real app, this would go to database)
    mockEvents.push(newEvent);
    
    console.log(`[Advanced Calendar Service] Created event:`, newEvent);
    return newEvent;

  } catch (error) {
    console.error(`[Advanced Calendar Service] Error creating event:`, error);
    throw new Error(`Failed to create calendar event: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function updateAdvancedCalendarEventService(
  eventId: string,
  eventData: Partial<CalendarEvent>,
  userId: string
): Promise<CalendarEvent> {
  console.log(`[Advanced Calendar Service] Updating event: ${eventId}`, eventData);
  
  const index = mockEvents.findIndex(event => event.id === eventId);
  if (index === -1) {
    throw new Error('Event not found');
  }

  const originalEvent = mockEvents[index];
  const propertyId = eventData.propertyId || originalEvent.propertyId;
  const startDate = eventData.startDate || originalEvent.startDate;
  const endDate = eventData.endDate || originalEvent.endDate;
  const eventType = eventData.type || originalEvent.type;

  try {
    // If it's a block event, update the calendar via APIs
    if (eventType === 'block' && originalEvent.source === 'manual') {
      console.log(`[Advanced Calendar Service] Updating block event via APIs`);
      
      // First unblock the original dates
      try {
        await updateHostawayCalendar(propertyId, originalEvent.startDate, originalEvent.endDate, 'available');
        console.log(`[Advanced Calendar Service] Successfully unblocked original dates via Hostaway`);
      } catch (hostawayError) {
        console.error(`[Advanced Calendar Service] Hostaway unblock failed:`, hostawayError);
      }

      try {
        await updateHostkitCalendar(propertyId, originalEvent.startDate, originalEvent.endDate, 'available');
        console.log(`[Advanced Calendar Service] Successfully unblocked original dates via Hostkit`);
      } catch (hostkitError) {
        console.error(`[Advanced Calendar Service] Hostkit unblock failed:`, hostkitError);
      }

      // Then block the new dates
      try {
        await updateHostawayCalendar(propertyId, startDate, endDate, 'blocked');
        console.log(`[Advanced Calendar Service] Successfully blocked new dates via Hostaway`);
      } catch (hostawayError) {
        console.error(`[Advanced Calendar Service] Hostaway block failed:`, hostawayError);
      }

      try {
        await updateHostkitCalendar(propertyId, startDate, endDate, 'blocked');
        console.log(`[Advanced Calendar Service] Successfully blocked new dates via Hostkit`);
      } catch (hostkitError) {
        console.error(`[Advanced Calendar Service] Hostkit block failed:`, hostkitError);
      }
    }

    // Update the mock event
    mockEvents[index] = {
      ...originalEvent,
      ...eventData,
      updatedAt: new Date().toISOString()
    };

    console.log(`[Advanced Calendar Service] Successfully updated event: ${eventId}`);
    return mockEvents[index];

  } catch (error) {
    console.error(`[Advanced Calendar Service] Error updating event:`, error);
    throw error;
  }
}

export async function deleteAdvancedCalendarEventService(
  eventId: string,
  userId: string
): Promise<void> {
  console.log(`[Advanced Calendar Service] Deleting event: ${eventId}`);
  
  const index = mockEvents.findIndex(event => event.id === eventId);
  if (index === -1) {
    throw new Error('Event not found');
  }

  const event = mockEvents[index];
  
  try {
    // If it's a block event, unblock the dates via APIs
    if (event.type === 'block' && event.source === 'manual') {
      console.log(`[Advanced Calendar Service] Unblocking dates via APIs`);
      
      // Try Hostaway API first
      try {
        await updateHostawayCalendar(event.propertyId, event.startDate, event.endDate, 'available');
        console.log(`[Advanced Calendar Service] Successfully unblocked dates via Hostaway`);
      } catch (hostawayError) {
        console.error(`[Advanced Calendar Service] Hostaway unblock failed:`, hostawayError);
      }

      // Try Hostkit API
      try {
        await updateHostkitCalendar(event.propertyId, event.startDate, event.endDate, 'available');
        console.log(`[Advanced Calendar Service] Successfully unblocked dates via Hostkit`);
      } catch (hostkitError) {
        console.error(`[Advanced Calendar Service] Hostkit unblock failed:`, hostkitError);
      }
    }

    // Remove from mock events
    mockEvents.splice(index, 1);
    console.log(`[Advanced Calendar Service] Deleted event: ${eventId}`);

  } catch (error) {
    console.error(`[Advanced Calendar Service] Error deleting event:`, error);
    throw new Error(`Failed to delete calendar event: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getBulkOperationsService(userId: string): Promise<BulkOperation[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));

  return mockBulkOperations;
}

export async function createBulkOperationService(
  operationData: Partial<BulkOperation>,
  userId: string
): Promise<BulkOperation> {
  console.log(`[Advanced Calendar Service] Creating bulk operation:`, operationData);
  
  const newOperation: BulkOperation = {
    id: `bulk-${Date.now()}`,
    type: operationData.type || 'block_dates',
    properties: operationData.properties || [],
    dates: operationData.dates || [],
    parameters: operationData.parameters || {},
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  try {
    // Execute the bulk operation
    await executeBulkOperation(newOperation);
    
    // Update status to completed
    newOperation.status = 'completed';
    newOperation.completedAt = new Date().toISOString();
    
    console.log(`[Advanced Calendar Service] Bulk operation completed successfully: ${newOperation.id}`);
  } catch (error) {
    console.error(`[Advanced Calendar Service] Bulk operation failed:`, error);
    newOperation.status = 'failed';
    newOperation.error = error instanceof Error ? error.message : 'Unknown error';
  }

  mockBulkOperations.unshift(newOperation);
  return newOperation;
}

async function executeBulkOperation(operation: BulkOperation): Promise<void> {
  console.log(`[Advanced Calendar Service] Executing bulk operation: ${operation.type}`);
  
  const { type, properties, dates, parameters } = operation;
  
  for (const propertyId of properties) {
    for (const date of dates) {
      try {
        switch (type) {
          case 'block_dates':
            console.log(`[Advanced Calendar Service] Blocking property ${propertyId} on ${date}`);
            
            // Block via Hostaway API
            try {
              await updateHostawayCalendar(propertyId, date, date, 'blocked');
              console.log(`[Advanced Calendar Service] Successfully blocked ${propertyId} on ${date} via Hostaway`);
            } catch (hostawayError) {
              console.error(`[Advanced Calendar Service] Hostaway block failed for ${propertyId} on ${date}:`, hostawayError);
            }

            // Block via Hostkit API
            try {
              await updateHostkitCalendar(propertyId, date, date, 'blocked');
              console.log(`[Advanced Calendar Service] Successfully blocked ${propertyId} on ${date} via Hostkit`);
            } catch (hostkitError) {
              console.error(`[Advanced Calendar Service] Hostkit block failed for ${propertyId} on ${date}:`, hostkitError);
            }

            // Create local event
            const blockEvent: CalendarEvent = {
              id: `bulk-block-${propertyId}-${date}-${Date.now()}`,
              propertyId,
              propertyName: `Property ${propertyId}`,
              type: 'block',
              title: parameters.reason || 'Bulk blocked',
              description: `Bulk operation: ${parameters.reason || 'No reason provided'}`,
              startDate: date,
              endDate: date,
              status: 'active',
              createdBy: 'System',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              source: 'manual'
            };
            
            mockEvents.push(blockEvent);
            break;

          case 'price_update':
            console.log(`[Advanced Calendar Service] Updating price for property ${propertyId} on ${date} to €${parameters.price}`);
            
            // Update pricing via Hostaway API
            if (parameters.price) {
              try {
                await updateHostawayPricing(propertyId, date, date, parameters.price);
                console.log(`[Advanced Calendar Service] Successfully updated pricing via Hostaway for property ${propertyId}`);
              } catch (hostawayError) {
                console.error(`[Advanced Calendar Service] Hostaway pricing update failed for property ${propertyId}:`, hostawayError);
              }
            }
            
            // Create price update event
            const priceEvent: CalendarEvent = {
              id: `bulk-price-${propertyId}-${date}-${Date.now()}`,
              propertyId,
              propertyName: `Property ${propertyId}`,
              type: 'price_update',
              title: `Price Update - €${parameters.price}`,
              description: `Bulk price update: €${parameters.price} (${parameters.reason || 'No reason provided'})`,
              startDate: date,
              endDate: date,
              price: parameters.price,
              status: 'active',
              createdBy: 'System',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              source: 'manual'
            };
            
            mockEvents.push(priceEvent);
            break;

          case 'minimum_stay_update':
            console.log(`[Advanced Calendar Service] Updating minimum stay for property ${propertyId} on ${date} to ${parameters.minimumStay} nights`);
            
            // Update minimum stay via Hostaway API
            if (parameters.minimumStay) {
              try {
                await updateHostawayMinimumStay(propertyId, date, date, parameters.minimumStay);
                console.log(`[Advanced Calendar Service] Successfully updated minimum stay via Hostaway for property ${propertyId}`);
              } catch (hostawayError) {
                console.error(`[Advanced Calendar Service] Hostaway minimum stay update failed for property ${propertyId}:`, hostawayError);
              }
            }
            
            // Create minimum stay event
            const minStayEvent: CalendarEvent = {
              id: `bulk-minstay-${propertyId}-${date}-${Date.now()}`,
              propertyId,
              propertyName: `Property ${propertyId}`,
              type: 'minimum_stay',
              title: `Minimum Stay - ${parameters.minimumStay} nights`,
              description: `Bulk minimum stay update: ${parameters.minimumStay} nights (${parameters.reason || 'No reason provided'})`,
              startDate: date,
              endDate: date,
              minimumStay: parameters.minimumStay,
              status: 'active',
              createdBy: 'System',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              source: 'manual'
            };
            
            mockEvents.push(minStayEvent);
            break;

          case 'maintenance':
            console.log(`[Advanced Calendar Service] Updating maintenance for property ${propertyId} on ${date} - ${parameters.maintenanceType}`);
            
            // Update maintenance via Hostaway API
            if (parameters.maintenanceType) {
              try {
                await updateHostawayMaintenance(propertyId, date, date, parameters.maintenanceType, parameters.reason);
                console.log(`[Advanced Calendar Service] Successfully updated maintenance via Hostaway for property ${propertyId}`);
              } catch (hostawayError) {
                console.error(`[Advanced Calendar Service] Hostaway maintenance update failed for property ${propertyId}:`, hostawayError);
              }
            }
            
            // Create maintenance event
            const maintenanceEvent: CalendarEvent = {
              id: `bulk-maintenance-${propertyId}-${date}-${Date.now()}`,
              propertyId,
              propertyName: `Property ${propertyId}`,
              type: 'maintenance',
              title: `Maintenance - ${parameters.maintenanceType}`,
              description: `Bulk maintenance: ${parameters.maintenanceType} (${parameters.reason || 'No reason provided'})`,
              startDate: date,
              endDate: date,
              status: 'active',
              createdBy: 'System',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              source: 'manual'
            };
            
            mockEvents.push(maintenanceEvent);
            break;

          case 'cleaning':
            console.log(`[Advanced Calendar Service] Updating cleaning for property ${propertyId} on ${date} - ${parameters.cleaningType}`);
            
            // Update cleaning via Hostaway API
            if (parameters.cleaningType) {
              try {
                await updateHostawayCleaning(propertyId, date, date, parameters.cleaningType, parameters.reason);
                console.log(`[Advanced Calendar Service] Successfully updated cleaning via Hostaway for property ${propertyId}`);
              } catch (hostawayError) {
                console.error(`[Advanced Calendar Service] Hostaway cleaning update failed for property ${propertyId}:`, hostawayError);
              }
            }
            
            // Create cleaning event
            const cleaningEvent: CalendarEvent = {
              id: `bulk-cleaning-${propertyId}-${date}-${Date.now()}`,
              propertyId,
              propertyName: `Property ${propertyId}`,
              type: 'cleaning',
              title: `Cleaning - ${parameters.cleaningType}`,
              description: `Bulk cleaning: ${parameters.cleaningType} (${parameters.reason || 'No reason provided'})`,
              startDate: date,
              endDate: date,
              status: 'active',
              createdBy: 'System',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              source: 'manual'
            };
            
            mockEvents.push(cleaningEvent);
            break;

          case 'coa_cod':
            console.log(`[Advanced Calendar Service] Updating COA/COD for property ${propertyId} on ${date} - Check-in: ${parameters.checkInAvailable}, Check-out: ${parameters.checkOutAvailable}`);
            
            // Update COA/COD via Hostaway API
            if (parameters.checkInAvailable !== undefined && parameters.checkOutAvailable !== undefined) {
              try {
                await updateHostawayCOACOD(propertyId, date, date, parameters.checkInAvailable, parameters.checkOutAvailable, parameters.reason);
                console.log(`[Advanced Calendar Service] Successfully updated COA/COD via Hostaway for property ${propertyId}`);
              } catch (hostawayError) {
                console.error(`[Advanced Calendar Service] Hostaway COA/COD update failed for property ${propertyId}:`, hostawayError);
              }
            }
            
            // Create COA/COD event
            const coaCodEvent: CalendarEvent = {
              id: `bulk-coacod-${propertyId}-${date}-${Date.now()}`,
              propertyId,
              propertyName: `Property ${propertyId}`,
              type: 'block', // Using block type for COA/COD as it affects availability
              title: `COA/COD Control - Check-in: ${parameters.checkInAvailable ? 'Yes' : 'No'}, Check-out: ${parameters.checkOutAvailable ? 'Yes' : 'No'}`,
              description: `Bulk COA/COD control: Check-in ${parameters.checkInAvailable ? 'enabled' : 'disabled'}, Check-out ${parameters.checkOutAvailable ? 'enabled' : 'disabled'} (${parameters.reason || 'No reason provided'})`,
              startDate: date,
              endDate: date,
              status: 'active',
              createdBy: 'System',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              source: 'manual'
            };
            
            mockEvents.push(coaCodEvent);
            break;

          default:
            console.warn(`[Advanced Calendar Service] Unknown bulk operation type: ${type}`);
        }
      } catch (error) {
        console.error(`[Advanced Calendar Service] Error processing ${type} for property ${propertyId} on ${date}:`, error);
        throw error;
      }
    }
  }
}

export async function getEventTemplatesService(): Promise<EventTemplate[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));

  return mockTemplates;
}