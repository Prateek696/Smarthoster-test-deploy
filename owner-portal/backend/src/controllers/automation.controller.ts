import { Request, Response } from 'express';
import { 
  fetchAutomations, 
  fetchAutomationTemplates, 
  fetchAutomationActivity,
  createAutomation as createAutomationService,
  updateAutomation as updateAutomationService,
  deleteAutomation as deleteAutomationService,
  toggleAutomation as toggleAutomationService,
  runAutomation as runAutomationService,
  createFromTemplate as createFromTemplateService
} from '../services/automation.service';

export async function getAutomations(req: Request, res: Response) {
  try {
    const propertyId = req.query.propertyId ? Number(req.query.propertyId) : undefined;
    const automations = await fetchAutomations(propertyId);
    res.json({ automations });
  } catch (error) {
    console.error('Error fetching automations:', error);
    res.status(500).json({ error: 'Failed to fetch automations' });
  }
}

export async function getAutomationTemplates(req: Request, res: Response) {
  try {
    const templates = await fetchAutomationTemplates();
    res.json({ templates });
  } catch (error) {
    console.error('Error fetching automation templates:', error);
    res.status(500).json({ error: 'Failed to fetch automation templates' });
  }
}

export async function getAutomationActivity(req: Request, res: Response) {
  try {
    const propertyId = req.query.propertyId ? Number(req.query.propertyId) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const activities = await fetchAutomationActivity(propertyId, limit);
    res.json({ activities });
  } catch (error) {
    console.error('Error fetching automation activity:', error);
    res.status(500).json({ error: 'Failed to fetch automation activity' });
  }
}

export async function createAutomation(req: Request, res: Response) {
  try {
    const automationData = req.body;
    const userId = (req as any).user?.userId || (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const automation = await createAutomationService(automationData, userId);
    res.status(201).json({ automation });
  } catch (error) {
    console.error('Error creating automation:', error);
    res.status(500).json({ error: 'Failed to create automation' });
  }
}

export async function updateAutomation(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = (req as any).user?.userId || (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const automation = await updateAutomationService(id, updateData, userId);
    res.json({ automation });
  } catch (error) {
    console.error('Error updating automation:', error);
    res.status(500).json({ error: 'Failed to update automation' });
  }
}

export async function deleteAutomation(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId || (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    await deleteAutomationService(id, userId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting automation:', error);
    res.status(500).json({ error: 'Failed to delete automation' });
  }
}

export async function toggleAutomation(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = (req as any).user?.userId || (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const automation = await toggleAutomationService(id, status, userId);
    res.json({ automation });
  } catch (error) {
    console.error('Error toggling automation:', error);
    res.status(500).json({ error: 'Failed to toggle automation' });
  }
}

export async function runAutomation(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId || (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const result = await runAutomationService(id, userId);
    res.json({ result });
  } catch (error) {
    console.error('Error running automation:', error);
    res.status(500).json({ error: 'Failed to run automation' });
  }
}

export async function createFromTemplate(req: Request, res: Response) {
  try {
    const { templateId } = req.body;
    const userId = (req as any).user?.userId || (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const automation = await createFromTemplateService(templateId, userId);
    res.status(201).json({ automation });
  } catch (error) {
    console.error('Error creating automation from template:', error);
    res.status(500).json({ error: 'Failed to create automation from template' });
  }
}
