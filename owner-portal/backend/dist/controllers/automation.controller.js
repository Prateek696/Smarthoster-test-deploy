"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAutomations = getAutomations;
exports.getAutomationTemplates = getAutomationTemplates;
exports.getAutomationActivity = getAutomationActivity;
exports.createAutomation = createAutomation;
exports.updateAutomation = updateAutomation;
exports.deleteAutomation = deleteAutomation;
exports.toggleAutomation = toggleAutomation;
exports.runAutomation = runAutomation;
exports.createFromTemplate = createFromTemplate;
const automation_service_1 = require("../services/automation.service");
async function getAutomations(req, res) {
    try {
        const propertyId = req.query.propertyId ? Number(req.query.propertyId) : undefined;
        const automations = await (0, automation_service_1.fetchAutomations)(propertyId);
        res.json({ automations });
    }
    catch (error) {
        console.error('Error fetching automations:', error);
        res.status(500).json({ error: 'Failed to fetch automations' });
    }
}
async function getAutomationTemplates(req, res) {
    try {
        const templates = await (0, automation_service_1.fetchAutomationTemplates)();
        res.json({ templates });
    }
    catch (error) {
        console.error('Error fetching automation templates:', error);
        res.status(500).json({ error: 'Failed to fetch automation templates' });
    }
}
async function getAutomationActivity(req, res) {
    try {
        const propertyId = req.query.propertyId ? Number(req.query.propertyId) : undefined;
        const limit = req.query.limit ? Number(req.query.limit) : 50;
        const activities = await (0, automation_service_1.fetchAutomationActivity)(propertyId, limit);
        res.json({ activities });
    }
    catch (error) {
        console.error('Error fetching automation activity:', error);
        res.status(500).json({ error: 'Failed to fetch automation activity' });
    }
}
async function createAutomation(req, res) {
    try {
        const automationData = req.body;
        const userId = req.user?.userId || req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const automation = await (0, automation_service_1.createAutomation)(automationData, userId);
        res.status(201).json({ automation });
    }
    catch (error) {
        console.error('Error creating automation:', error);
        res.status(500).json({ error: 'Failed to create automation' });
    }
}
async function updateAutomation(req, res) {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const userId = req.user?.userId || req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const automation = await (0, automation_service_1.updateAutomation)(id, updateData, userId);
        res.json({ automation });
    }
    catch (error) {
        console.error('Error updating automation:', error);
        res.status(500).json({ error: 'Failed to update automation' });
    }
}
async function deleteAutomation(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user?.userId || req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        await (0, automation_service_1.deleteAutomation)(id, userId);
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting automation:', error);
        res.status(500).json({ error: 'Failed to delete automation' });
    }
}
async function toggleAutomation(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user?.userId || req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const automation = await (0, automation_service_1.toggleAutomation)(id, status, userId);
        res.json({ automation });
    }
    catch (error) {
        console.error('Error toggling automation:', error);
        res.status(500).json({ error: 'Failed to toggle automation' });
    }
}
async function runAutomation(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user?.userId || req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const result = await (0, automation_service_1.runAutomation)(id, userId);
        res.json({ result });
    }
    catch (error) {
        console.error('Error running automation:', error);
        res.status(500).json({ error: 'Failed to run automation' });
    }
}
async function createFromTemplate(req, res) {
    try {
        const { templateId } = req.body;
        const userId = req.user?.userId || req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const automation = await (0, automation_service_1.createFromTemplate)(templateId, userId);
        res.status(201).json({ automation });
    }
    catch (error) {
        console.error('Error creating automation from template:', error);
        res.status(500).json({ error: 'Failed to create automation from template' });
    }
}
