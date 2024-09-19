import { Schema, model, Document } from 'mongoose';

// Define the OrderItem schema
const OrderItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'InventoryItem',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  sku: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  }
});

// Method to calculate the subtotal for this order item
OrderItemSchema.methods.calculateSubtotal = function(): number {
  return this.quantity * this.price;
};

// Define the OrderItemDocument interface
interface OrderItemDocument extends Document {
  product: Schema.Types.ObjectId;
  quantity: number;
  price: number;
  sku: string;
  name: string;
  calculateSubtotal: () => number;
}

// Create and export the OrderItem model
export const OrderItem = model<OrderItemDocument>('OrderItem', OrderItemSchema);