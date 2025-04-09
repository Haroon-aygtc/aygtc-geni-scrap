import express from 'express';
import {
  getAllWidgets,
  getWidgetById,
  createWidget,
  updateWidget,
  deleteWidget,
} from '../controllers/widgetController';

const router = express.Router();

router.get('/', getAllWidgets);
router.get('/:id', getWidgetById);
router.post('/', createWidget);
router.put('/:id', updateWidget);
router.delete('/:id', deleteWidget);

export default router;
