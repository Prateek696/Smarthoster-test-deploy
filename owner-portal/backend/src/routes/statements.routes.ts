import { Router } from 'express';
import { generateStatementHandler  } from '../controllers/statements.controller';

const router = Router();

router.post('/properties/:propertyId/statements/generate', generateStatementHandler );

export default router;
