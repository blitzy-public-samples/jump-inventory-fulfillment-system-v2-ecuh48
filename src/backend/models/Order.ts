import { Schema, model, Document } from 'mongoose';
import { OrderStatus } from '../types/OrderStatus';

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
  }
});

// Define the Order schema
const OrderSchema = new Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  shopifyOrderId: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    address: {
      street: {
        type: String,
        required: true
      },
      city: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: true
      },
      zipCode: {
        type: String,
        required: true
      },
      country: {
        type: String,
        required: true
      }
    }
  },
  items: {
    type: [OrderItemSchema],
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: OrderStatus,
    default: OrderStatus.PENDING
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  shippingLabel: {
    type: String
  },
  trackingNumber: {
    type: String
  }
});

// Method to calculate the total amount of the order
OrderSchema.methods.calculateTotalAmount = function(): number {
  return this.items.reduce((total, item) => total + item.price * item.quantity, 0);
};

// Define the OrderDocument interface
interface OrderDocument extends Document {
  orderNumber: string;
  shopifyOrderId: string;
  customer: {
    name: string;
    email: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  items: Array<{
    product: Schema.Types.ObjectId;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  shippingLabel: string;
  trackingNumber: string;
  calculateTotalAmount: () => number;
}

// Create and export the Order model
export const Order = model<OrderDocument>('Order', OrderSchema);