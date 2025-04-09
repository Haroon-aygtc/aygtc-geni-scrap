import { Router } from 'express';
import * as promptTemplateController from '../controllers/promptTemplateController.js';

const router = Router();

router.get('/', promptTemplateController.getAllPromptTemplates);
router.get('/:id', promptTemplateController.getPromptTemplateById);
router.post('/', promptTemplateController.createPromptTemplate);
router.put('/:id', promptTemplateController.updatePromptTemplate);
router.delete('/:id', promptTemplateController.deletePromptTemplate);

export default router;
