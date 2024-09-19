import { Schema, model, Document } from 'mongoose';

// Define the ProductSchema
const ProductSchema = new Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  description: { type: String },
  price: { type: Number, required: true, min: 0 },
  category: { type: String },
  tags: { type: [String] },
  dimensions: {
    length: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 },
    weight: { type: Number, min: 0 }
  },
  shopifyProductId: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add getVolume method to calculate the volume of the product
ProductSchema.methods.getVolume = function(): number {
  const { length, width, height } = this.dimensions;
  return length * width * height;
};

// Define the ProductDocument interface
interface ProductDocument extends Document {
  name: string;
  sku: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  dimensions: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
  shopifyProductId: string;
  createdAt: Date;
  updatedAt: Date;
  getVolume: () => number;
}

// Create and export the Product model
export const Product = model<ProductDocument>('Product', ProductSchema);