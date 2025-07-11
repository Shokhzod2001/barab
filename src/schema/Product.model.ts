import mongoose, { Schema } from "mongoose";
import {
  ProductCategory,
  ProductSize,
  ProductSpice,
  ProductStatus,
  ProductTime,
  ProductVolume,
} from "../libs/enums/product.enum";

// Menu Item Schema - Schema first approach
const productSchema = new Schema(
  {
    productStatus: {
      type: String,
      enum: ProductStatus,
      default: ProductStatus.PAUSE,
    },

    productCategory: {
      type: String,
      enum: ProductCategory,
      required: true,
    },

    productName: {
      type: String,
      required: true,
    },

    productPrice: {
      type: Number,
      required: true,
    },

    productDesc: {
      type: String,
    },

    productImages: {
      type: [String],
      default: [],
    },

    productSize: {
      type: String,
      enum: ProductSize,
      default: ProductSize.REGULAR,
    },

    productVolume: {
      type: Number,
      enum: ProductVolume,
      default: ProductVolume.ONE,
    },

    productTime: {
      type: [String],
      enum: ProductTime,
      default: [ProductTime.ALL_DAY],
    },

    productSpice: {
      type: String,
      enum: ProductSpice,
      default: ProductSpice.MEDIUM,
    },

    calories: {
      type: Number,
      min: 0,
    },

    preparationTime: {
      type: Number, // in minutes
      min: 1,
      default: 15,
    },

    productViews: {
      type: Number,
      default: 0,
      min: 0,
    },

    productOrders: {
      type: Number,
      default: 0,
      min: 0,
    },

    tags: {
      type: [String],
      default: [],
    },

    productLeftCount: {
      type: Number,
      default: 999,
      min: 0,
    },

    combos: [
      {
        comboName: { type: String, required: true },
        comboPrice: { type: Number, required: true, min: 0 },
        comboItems: [{ type: Schema.Types.ObjectId, ref: "Product" }],
        comboDrink: { type: Schema.Types.ObjectId, ref: "Product" },
        comboSide: { type: Schema.Types.ObjectId, ref: "Product" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Indexes for better query performance
productSchema.index({ productCategory: 1, productStatus: 1 });
productSchema.index({ productPrice: 1 });
productSchema.index({ isPopular: -1 });
productSchema.index({ productTime: 1 });
productSchema.index({ productSpice: 1 });
productSchema.index({ productName: "text", productDesc: "text" }); // Text search
productSchema.index({ createdAt: -1 }); // For newest items

// Compound index for unique menu items
productSchema.index(
  { productName: 1, productSize: 1, productCategory: 1 },
  { unique: true }
);

// Static methods
productSchema.statics.findAvailable = function () {
  return this.find({
    productStatus: ProductStatus.PROCESS,
    productLeftCount: { $gt: 0 },
  });
};

productSchema.statics.findByCategory = function (category) {
  return this.find({
    productCategory: category,
    productStatus: ProductStatus.PROCESS,
  });
};

productSchema.statics.findPopular = function () {
  return this.find({
    isPopular: true,
    productStatus: ProductStatus.PROCESS,
  }).sort({ productOrders: -1 });
};

productSchema.statics.findByPriceRange = function (minPrice, maxPrice) {
  return this.find({
    productPrice: { $gte: minPrice, $lte: maxPrice },
    productStatus: ProductStatus.PROCESS,
  });
};

// Instance methods
productSchema.methods.incrementViews = function () {
  this.productViews += 1;
  return this.save();
};

productSchema.methods.incrementOrders = function () {
  this.productOrders += 1;
  return this.save();
};

export default mongoose.model("Product", productSchema);
