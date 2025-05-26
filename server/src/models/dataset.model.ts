import mongoose, { Document, Schema } from 'mongoose';

export interface IDataset extends Document {
  name: string;
  description?: string;
  data: any;
  columns: string[];
  owner: mongoose.Types.ObjectId;
  fileType?: string;
  originalFilename?: string;
  aiInsights?: any;
}

const datasetSchema = new Schema<IDataset>(
  {
    name: {
      type: String,
      required: [true, 'Dataset must have a name'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true
    },
    columns: {
      type: [String],
      required: [true, 'Dataset must have columns defined'],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Dataset must belong to a user'],
    },
    fileType: {
      type: String,
    },
    originalFilename: {
      type: String,
    },
    aiInsights: {
      type: Schema.Types.Mixed
    },
  },
  {
    timestamps: true,
  }
);

const Dataset = mongoose.model<IDataset>('Dataset', datasetSchema);

export default Dataset; 