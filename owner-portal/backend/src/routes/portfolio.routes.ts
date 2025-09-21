import { Router } from "express";
import { getPortfolioOverview, getPortfolioTrends } from "../services/portfolio.service";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireOwnerOrAccountant } from "../middlewares/role.middleware";
import { USER_ROLES } from "../constants/roles";

const router = Router();

// Get portfolio overview - owners and accountants
router.get("/overview", 
  authMiddleware, 
  requireOwnerOrAccountant, 
  async (req, res) => {
    try {
      const { propertyIds, month } = req.query;
      
      if (!propertyIds || !month) {
        return res.status(400).json({ message: 'propertyIds and month are required' });
      }
      
      const propertyIdsArray = Array.isArray(propertyIds) 
        ? propertyIds.map(id => Number(id))
        : [Number(propertyIds)];
      
      const overview = await getPortfolioOverview(propertyIdsArray, month as string);
      res.json(overview);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Get portfolio trends - owners and accountants
router.get("/trends", 
  authMiddleware, 
  requireOwnerOrAccountant, 
  async (req, res) => {
    try {
      const { propertyIds, months } = req.query;
      
      if (!propertyIds || !months) {
        return res.status(400).json({ message: 'propertyIds and months are required' });
      }
      
      const propertyIdsArray = Array.isArray(propertyIds) 
        ? propertyIds.map(id => Number(id))
        : [Number(propertyIds)];
      
      const monthsArray = Array.isArray(months) 
        ? months as string[]
        : [months as string];
      
      const trends = await getPortfolioTrends(propertyIdsArray, monthsArray);
      res.json(trends);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;






