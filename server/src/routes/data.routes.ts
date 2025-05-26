import express from 'express';
import multer from 'multer';
import { 
  uploadDataset, 
  createDataset, 
  getUserDatasets, 
  getDataset, 
  deleteDataset, 
  getAIInsights 
} from '../controllers/data.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// Configure multer for memory storage (buffer)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB file size limit
});

// Protect all routes
router.use(protect);

// Dataset routes
router.post('/upload', upload.single('file'), uploadDataset);
router.post('/', createDataset);
router.get('/', getUserDatasets);
router.get('/:id', getDataset);
router.delete('/:id', deleteDataset);
router.post('/:id/insights', getAIInsights);

export default router; 