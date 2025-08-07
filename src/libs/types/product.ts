import { ObjectId } from "mongoose";
import {
  ProductCategory,
  ProductSize,
  ProductSpice,
  ProductStatus,
  ProductTime,
  ProductVolume,
} from "../enums/product.enum";

interface Combo {
  comboName?: string;
  comboPrice?: number;
  comboItems?: string[]; // Array of menu item IDs
  comboDrink?: string;
  comboSide?: string;
  createdAt?: Date;
}

export interface Product {
  _id: ObjectId;
  productStatus: ProductStatus;
  productCategory: ProductCategory;
  productName: string;
  productPrice: number;
  productLeftCount: number;
  productSize: ProductSize;
  productVolume: ProductVolume;
  productTime: ProductTime[];
  productSpice: ProductSpice;
  calories?: number;
  productDesc?: string;
  productImages: string[];
  preparationTime: number;
  productViews: number;
  productOrders: number;
  tags: string[];
  combos?: Combo[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductInquiry {
  order: string;
  page: number;
  limit: number;
  productCategory?: ProductCategory | ProductCategory[];
  search?: string;
}

export interface ProductInput {
  productStatus?: ProductStatus;
  productCategory: ProductCategory;
  productName: string;
  productPrice: number;
  productLeftCount?: number;
  productSize?: ProductSize;
  productVolume?: ProductVolume;
  productTime?: ProductTime[];
  productSpice?: ProductSpice;
  calories?: number;
  productDesc?: string;
  productImages?: string[];
  preparationTime?: number;
  tags?: string[];
  productViews?: number;
  combos?: Combo[];
  comboName?: string;
  comboPrice?: string;
  comboItems?: string[] | string; // Can be array or comma-separated string
  comboDrink?: string;
  comboSide?: string;
}

export interface ProductUpdateInput {
  _id: ObjectId;
  productStatus?: ProductStatus;
  productCategory?: ProductCategory;
  productName?: string;
  productPrice?: number;
  productLeftCount?: number;
  productSize?: ProductSize;
  productVolume?: ProductVolume;
  productTime?: ProductTime[];
  productSpice?: ProductSpice;
  calories?: number;
  productDesc?: string;
  productImages?: string[];
  preparationTime?: number;
  tags?: string[];
  combos?: Combo[];
  productViews?: number;
}
