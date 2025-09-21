import { Request, Response, NextFunction } from 'express'

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Forbidden: Admin access required' 
    })
  }
  next()
}

export const requireAdminOrOwner = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user
  if (!user || !['admin', 'owner'].includes(user.role)) {
    return res.status(403).json({ 
      message: 'Forbidden: Admin or Owner access required' 
    })
  }
  next()
}

