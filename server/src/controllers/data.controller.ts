import { Request, Response, NextFunction } from 'express';
import * as XLSX from 'xlsx';
import Dataset from '../models/dataset.model';
import { AppError } from '../middleware/error.middleware';
import axios from 'axios';

// Upload and process dataset
export const uploadDataset = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      return next(new AppError('Please upload a file', 400));
    }

    const file = req.file;
    const originalFilename = file.originalname;
    const fileType = originalFilename.split('.').pop()?.toLowerCase();

    if (!fileType || !['xlsx', 'xls', 'csv'].includes(fileType)) {
      return next(new AppError('Please upload an Excel or CSV file', 400));
    }

    // Read the file
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    if (data.length === 0) {
      return next(new AppError('File is empty', 400));
    }

    // Extract column names
    const columns = Object.keys(data[0] as object);

    // Create dataset
    const dataset = await Dataset.create({
      name: req.body.name || originalFilename.split('.')[0],
      description: req.body.description,
      data,
      columns,
      owner: req.user._id,
      fileType,
      originalFilename,
    });

    res.status(201).json({
      status: 'success',
      data: {
        dataset,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create dataset manually
export const createDataset = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, description, data, columns } = req.body;

    if (!name || !data || !columns) {
      return next(
        new AppError('Please provide name, data, and columns', 400)
      );
    }

    // Create dataset
    const dataset = await Dataset.create({
      name,
      description,
      data,
      columns,
      owner: req.user._id,
    });

    res.status(201).json({
      status: 'success',
      data: {
        dataset,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all datasets for a user
export const getUserDatasets = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const datasets = await Dataset.find({ owner: req.user._id }).sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: datasets.length,
      data: {
        datasets,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get a single dataset
export const getDataset = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dataset = await Dataset.findById(req.params.id);

    if (!dataset) {
      return next(new AppError('No dataset found with that ID', 404));
    }

    // Check if the dataset belongs to the user
    if (dataset.owner.toString() !== req.user._id.toString()) {
      return next(new AppError('You do not have permission to access this dataset', 403));
    }

    res.status(200).json({
      status: 'success',
      data: {
        dataset,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete a dataset
export const deleteDataset = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dataset = await Dataset.findById(req.params.id);

    if (!dataset) {
      return next(new AppError('No dataset found with that ID', 404));
    }

    // Check if the dataset belongs to the user
    if (dataset.owner.toString() !== req.user._id.toString()) {
      return next(new AppError('You do not have permission to delete this dataset', 403));
    }

    await Dataset.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// Get AI insights for a dataset
export const getAIInsights = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dataset = await Dataset.findById(req.params.id);

    if (!dataset) {
      return next(new AppError('No dataset found with that ID', 404));
    }

    // Check if the dataset belongs to the user
    if (dataset.owner.toString() !== req.user._id.toString()) {
      return next(new AppError('You do not have permission to access this dataset', 403));
    }

    try {
      // Make a request to the AI service
      const aiResponse = await axios.post(
        'http://localhost:8000/api/insights',
        {
          data: dataset.data,
          columns: dataset.columns,
        }
      );

      // Update the dataset with AI insights
      dataset.aiInsights = aiResponse.data as any; // Store the entire response object
      await dataset.save();

      res.status(200).json({
        status: 'success',
        data: {
          insights: aiResponse.data, // Return the full insights object to the frontend
        },
      });
    } catch (aiError: any) { // Added type annotation for aiError
      console.error('AI Service Error:', aiError.response?.data || aiError.message || aiError);
      return next(new AppError('Failed to get AI insights from AI service.', 500)); // More specific error message
    }
  } catch (error) {
    next(error);
  }
}; 