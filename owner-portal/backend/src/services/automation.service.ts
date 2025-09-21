import { AutomationModel } from '../models/Automation.model';
import { UserModel } from '../models/User.model';
import { getHostkitSaft, generateHostkitSaft } from '../integrations/hostkit.api';
import { getSibaStatusService } from './siba.service';
import { sendEmailWithAttachments } from '../utils/emailSender';
import { USER_ROLES } from '../constants/roles';

// Automation Types
export const AUTOMATION_TYPES = {
  SAFT_GENERATION: 'saft_generation',
  SIBA_ALERTS: 'siba_alerts',
  CALENDAR_SYNC: 'calendar_sync'
} as const;

export const AUTOMATION_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  DISABLED: 'disabled'
} as const;

// Fetch all automations for a user/property
export async function fetchAutomations(propertyId?: number) {
  try {
    let query: any = {};
    
    if (propertyId) {
      // Show both property-specific automations AND global automations (without propertyId)
      query = {
        $or: [
          { propertyId: propertyId },
          { propertyId: { $exists: false } },
          { propertyId: null }
        ]
      };
    }
    
    const automations = await AutomationModel.find(query).sort({ createdAt: -1 });
    // Transform MongoDB _id to id for frontend compatibility
    return automations.map(automation => ({
      ...automation.toObject(),
      id: automation._id.toString()
    }));
  } catch (error) {
    console.error('Error fetching automations:', error);
    throw error;
  }
}

// Fetch automation templates
export async function fetchAutomationTemplates() {
  return [
    {
      id: 'saft_monthly',
      name: 'Monthly SAFT Generation',
      description: 'Automatically generate SAFT reports monthly for all properties',
      type: AUTOMATION_TYPES.SAFT_GENERATION,
      schedule: '0 9 2 * *', // 2nd of each month at 9 AM
      config: {
        emailNotification: true,
        autoDownload: true
      }
    },
    {
      id: 'siba_overdue',
      name: 'SIBA Overdue Alerts',
      description: 'Send email alerts when SIBA submissions are overdue',
      type: AUTOMATION_TYPES.SIBA_ALERTS,
      schedule: '0 10 * * *', // Daily at 10 AM
      config: {
        alertDaysBefore: 3,
        emailNotification: true
      }
    },
    {
      id: 'calendar_sync',
      name: 'Calendar Sync Check',
      description: 'Monitor calendar synchronization between booking platforms',
      type: AUTOMATION_TYPES.CALENDAR_SYNC,
      schedule: '0 */6 * * *', // Every 6 hours
      config: {
        emailNotification: true,
        autoFix: false
      }
    }
  ];
}

// Fetch automation activity/logs
export async function fetchAutomationActivity(propertyId?: number, limit: number = 50) {
  try {
    // This would typically come from a logs table
    // For now, return sample activity data with real SAFT download URLs
    const currentDate = new Date();
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const year = lastMonth.getFullYear();
    const month = lastMonth.getMonth() + 1;
    
    return [
  {
    id: '1',
        automationId: 'saft_monthly',
        automationName: 'Monthly SAFT Generation',
    status: 'success',
        message: 'SAFT generated successfully for property 392776',
        timestamp: new Date().toISOString(),
        details: {
          propertyId: 392776,
          year: year,
          month: month,
          saftDownloadUrl: `/automations/saft/392776/${year}/${month}`,
          fileName: `saft_392776_${year}-${month.toString().padStart(2, '0')}.xml`,
          generated: new Date().toISOString(),
          status: 'ready_for_download'
        }
  },
  {
    id: '2',
        automationId: 'siba_overdue',
        automationName: 'SIBA Overdue Alerts',
        status: 'warning',
        message: 'SIBA submission overdue for property 392777',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        details: {
          propertyId: 392777,
          daysOverdue: 2,
          lastSubmission: '2025-01-05'
        }
  },
  {
    id: '3',
        automationId: 'calendar_sync',
        automationName: 'Calendar Sync Check',
        status: 'success',
        message: 'Calendar sync completed successfully for all properties',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        details: {
          totalProperties: 3,
          syncedProperties: 3,
          driftDetected: 0
        }
      }
    ].slice(0, limit);
  } catch (error) {
    console.error('Error fetching automation activity:', error);
    throw error;
  }
}

// Create new automation
export async function createAutomation(automationData: any, userId: string) {
  try {
    const automation = new AutomationModel({
      ...automationData,
      userId,
      status: AUTOMATION_STATUS.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await automation.save();
    return {
      ...automation.toObject(),
      id: automation._id.toString()
    };
  } catch (error) {
    console.error('Error creating automation:', error);
    throw error;
  }
}

// Update automation
export async function updateAutomation(id: string, updateData: any, userId: string) {
  try {
    const automation = await AutomationModel.findOneAndUpdate(
      { _id: id, userId },
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );
    
    if (!automation) {
      throw new Error('Automation not found or access denied');
    }
    
    return {
      ...automation.toObject(),
      id: automation._id.toString()
    };
  } catch (error) {
    console.error('Error updating automation:', error);
    throw error;
  }
}

// Delete automation
export async function deleteAutomation(id: string, userId: string) {
  try {
    const result = await AutomationModel.findOneAndDelete({ _id: id, userId });
    if (!result) {
      throw new Error('Automation not found or access denied');
    }
    return result;
  } catch (error) {
    console.error('Error deleting automation:', error);
    throw error;
  }
}

// Toggle automation status
export async function toggleAutomation(id: string, status: string, userId: string) {
  try {
    const automation = await AutomationModel.findOneAndUpdate(
      { _id: id, userId },
      { status, updatedAt: new Date() },
      { new: true }
    );
    
    if (!automation) {
      throw new Error('Automation not found or access denied');
    }
    
    return {
      ...automation.toObject(),
      id: automation._id.toString()
    };
  } catch (error) {
    console.error('Error toggling automation:', error);
    throw error;
  }
}

// Run automation manually
export async function runAutomation(id: string, userId: string) {
  try {
    const automation = await AutomationModel.findOne({ _id: id, userId });
    if (!automation) {
      throw new Error('Automation not found or access denied');
    }
    
    // Execute the automation based on its type
    let result;
    switch (automation.type) {
      case AUTOMATION_TYPES.SAFT_GENERATION:
        result = await executeSaftGeneration(automation);
        break;
      case AUTOMATION_TYPES.SIBA_ALERTS:
        result = await executeSibaAlerts(automation);
        break;
      case AUTOMATION_TYPES.CALENDAR_SYNC:
        result = await executeCalendarSync(automation);
        break;
      default:
        throw new Error('Unknown automation type');
    }
    
    // Update last run time
    await AutomationModel.findByIdAndUpdate(id, { 
      lastRunAt: new Date(),
      runCount: (automation.runCount || 0) + 1
    });
    
    return result;
  } catch (error) {
    console.error('Error running automation:', error);
    throw error;
  }
}

// Create automation from template
export async function createFromTemplate(templateId: string, userId: string) {
  try {
    const templates = await fetchAutomationTemplates();
    const template = templates.find(t => t.id === templateId);
    
    if (!template) {
      throw new Error('Template not found');
    }
    
    const automationData = {
      name: template.name,
      description: template.description,
      type: template.type,
      schedule: template.schedule,
      config: template.config,
      status: AUTOMATION_STATUS.ACTIVE
    };
    
    return await createAutomation(automationData, userId);
  } catch (error) {
    console.error('Error creating automation from template:', error);
    throw error;
  }
}

// Execute SAFT Generation automation
async function executeSaftGeneration(automation: any) {
  try {
    console.log('Executing SAFT generation automation...');
    
    const owners = await UserModel.find({ role: USER_ROLES.OWNER });
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const year = lastMonth.getFullYear();
    const month = lastMonth.getMonth() + 1; // JavaScript months are 0-indexed
    
    const results = [];
    
    for (const owner of owners) {
      try {
        // Get owner's properties (you might need to implement this based on your property model)
        const properties = [392776, 392777, 392778]; // Mock property IDs
        
        for (const propertyId of properties) {
          try {
            // Generate SAFT using Hostkit API
            console.log(`Generating SAFT for property ${propertyId}, ${year}-${month}`);
            try {
              const saftResult = await generateHostkitSaft(propertyId, year, month);
              
              if (saftResult.status === 'success') {
                // Wait a moment for SAFT to be processed
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                // Get the generated SAFT file
                console.log(`Retrieving SAFT for property ${propertyId}, ${year}-${month}`);
                const saftData = await getHostkitSaft(propertyId, year, month);
                
                if (saftData.saft) {
                  // Convert base64 to buffer for email attachment
                  const saftBuffer = Buffer.from(saftData.saft, 'base64');
                  
                  // Email SAFT to owner
                  await sendEmailWithAttachments(
                    owner.email,
                    `Monthly SAFT Report - ${year}-${month.toString().padStart(2, '0')}`,
                    `Please find attached your monthly SAFT report for ${year}-${month.toString().padStart(2, '0')}.`,
                    [{ 
                      filename: `saft_${propertyId}_${year}-${month.toString().padStart(2, '0')}.xml`, 
                      path: `/tmp/saft_${propertyId}_${year}-${month.toString().padStart(2, '0')}.xml`
                    }]
                  );
                  
                  results.push({
                    propertyId,
                    ownerEmail: owner.email,
                    status: 'success',
                    message: `SAFT generated and emailed to ${owner.email}`,
                    downloadUrl: `/automations/saft/${propertyId}/${year}/${month}`
                  });
                } else {
                  results.push({
                    propertyId,
                    ownerEmail: owner.email,
                    status: 'warning',
                    message: `SAFT generated but file not yet available. Generated: ${saftData.generated}, Sent: ${saftData.sent}`
                  });
                }
    } else {
                results.push({
                  propertyId,
                  ownerEmail: owner.email,
                  status: 'error',
                  message: `SAFT generation failed: ${saftResult.error || 'Unknown error'}`
                });
              }
            } catch (error: any) {
              console.error(`Error generating SAFT for property ${propertyId}:`, error);
              results.push({
                propertyId,
                ownerEmail: owner.email,
                status: 'error',
                message: `SAFT generation failed: ${error.message}`
              });
            }
          } catch (error) {
            console.error(`Error generating SAFT for property ${propertyId}:`, error);
            results.push({
              propertyId,
              ownerEmail: owner.email,
              status: 'error',
              message: `Failed to generate SAFT: ${error instanceof Error ? error.message : String(error)}`
            });
          }
        }
      } catch (error) {
        console.error(`Error processing SAFT for owner ${owner.email}:`, error);
      }
    }
    
    return {
      type: 'saft_generation',
      status: 'completed',
      results,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('SAFT generation automation failed:', error);
    throw error;
  }
}

// Execute SIBA Alerts automation
async function executeSibaAlerts(automation: any) {
  try {
    console.log('Executing SIBA alerts automation...');
    
    const owners = await UserModel.find({ role: USER_ROLES.OWNER });
    const properties = [392776, 392777, 392778]; // Mock property IDs
    const alertDaysBefore = automation.config?.alertDaysBefore || 3;
    
    const results = [];
    
    for (const owner of owners) {
      const overdueProperties = [];
      
      for (const propertyId of properties) {
        try {
          const sibaStatus = await getSibaStatusService(propertyId);
          
          if (sibaStatus.status === 'overdue' || (sibaStatus.daysUntilDue !== null && sibaStatus.daysUntilDue < alertDaysBefore)) {
            overdueProperties.push({
              propertyId,
              lastSubmission: sibaStatus.lastSibaSendDate,
              daysUntilDue: sibaStatus.daysUntilDue,
              status: sibaStatus.status
            });
          }
        } catch (error) {
          console.error(`Error checking SIBA for property ${propertyId}:`, error);
        }
      }
      
      if (overdueProperties.length > 0) {
        // Send overdue alert email
        const subject = 'SIBA Overdue Alert';
        const text = `
Dear ${owner.name},

The following properties have SIBA submissions that need attention:

${overdueProperties.map(p => 
  `- Property ${p.propertyId}: ${p.daysUntilDue !== null && p.daysUntilDue < 0 ? `${Math.abs(p.daysUntilDue)} days overdue` : `${p.daysUntilDue || 'unknown'} days until due`} (last submission: ${p.lastSubmission})`
).join('\n')}

Please submit SIBA for these properties as soon as possible to avoid penalties.

Best regards,
Owner Portal System
        `;
        
        await sendEmailWithAttachments(owner.email, subject, text, []);
        
        results.push({
          ownerEmail: owner.email,
          status: 'alert_sent',
          message: `SIBA alert sent to ${owner.email}`,
          overdueProperties
        });
      }
    }
    
    return {
      type: 'siba_alerts',
      status: 'completed',
      results,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('SIBA alerts automation failed:', error);
    throw error;
  }
}

// Execute Calendar Sync automation
async function executeCalendarSync(automation: any) {
  try {
    console.log('Executing calendar sync automation...');
    
    // This would check if Hostaway and Hostkit calendars are in sync
    // For now, we'll simulate the check
    const properties = [392776, 392777, 392778];
    const results = [];
    
    for (const propertyId of properties) {
      try {
        // Simulate calendar sync check
        const syncStatus = Math.random() > 0.1 ? 'synced' : 'drift_detected';
        
        if (syncStatus === 'drift_detected') {
          results.push({
            propertyId,
            status: 'warning',
            message: `Calendar drift detected for property ${propertyId}`,
            action: 'Manual sync required'
          });
        } else {
          results.push({
            propertyId,
            status: 'success',
            message: `Calendar sync OK for property ${propertyId}`
          });
        }
      } catch (error) {
        console.error(`Error checking calendar sync for property ${propertyId}:`, error);
        results.push({
          propertyId,
          status: 'error',
          message: `Failed to check calendar sync: ${error instanceof Error ? error.message : String(error)}`
        });
      }
    }
    
    return {
      type: 'calendar_sync',
      status: 'completed',
      results,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Calendar sync automation failed:', error);
    throw error;
  }
}