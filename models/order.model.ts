import mongoose, { Model, Schema } from "mongoose";

export interface IOrder extends Document {
  courseId: string;
  userId: string;
  paymentInfo: object;
}

const OrderSchema = new Schema<IOrder>(
  {
    courseId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    paymentInfo: {
      type: Object,
      // required:true
    },
  },
  { timestamps: true }
);

const OrderModel: Model<IOrder> = mongoose.model("order", OrderSchema);

export default OrderModel;
