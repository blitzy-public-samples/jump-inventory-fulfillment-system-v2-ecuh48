import { Schema, model, Document } from 'mongoose';
import { Product } from './Product';

// Define the InventoryItem schema
const InventoryItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  location: {
    type: String,
    required: true
  },
  reorderPoint: {
    type: Number,
    default: 0
  },
  lastRestockedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Method to check if the item is low in stock
InventoryItemSchema.methods.isLowStock = function(): boolean {
  return this.quantity <= this.reorderPoint;
};

// Method to adjust the quantity of the inventory item
InventoryItemSchema.methods.adjustQuantity = function(adjustment: number): number {
  this.quantity += adjustment;
  if (this.quantity < 0) {
    this.quantity = 0;
  }
  return this.quantity;
};

// Define the InventoryItemDocument interface
interface InventoryItemDocument extends Document {
  product: Schema.Types.ObjectId;
  quantity: number;
  location: string;
  reorderPoint: number;
  lastRestockedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  isLowStock: () => boolean;
  adjustQuantity: (adjustment: number) => number;
}

// Create and export the InventoryItem model
export const InventoryItem = model<InventoryItemDocument>('InventoryItem', InventoryItemSchema);