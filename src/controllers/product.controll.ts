import { Request, Response } from "express";
import { shapeIntoMongooseObjectId } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common";
import ProductService from "../models/Product.service";
import { ProductInput, ProductInquiry } from "../libs/types/product";
import { ExtendedRequest } from "../libs/types/member";
import { ProductCategory, ProductTime } from "../libs/enums/product.enum";

const productService = new ProductService();

const productController: T = {};

//SPA
productController.getProducts = async (req: Request, res: Response) => {
  try {
    console.log("getProducts");
    const { page, limit, order, productCollection, search } = req.query;
    const inquiry: ProductInquiry = {
      order: String(order),
      page: Number(page),
      limit: Number(limit),
    };

    if (productCollection) {
      inquiry.productCategory = productCollection as ProductCategory;
    }
    if (search) inquiry.search = String(search);

    const result = await productService.getProducts(inquiry);

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getProducts", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

productController.getProduct = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("getProduct");
    const { id } = req.params;
    const reqmemberId = req.member?._id ?? null,
      memberId = shapeIntoMongooseObjectId(reqmemberId),
      result = await productService.getProduct(memberId, id);

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getProduct", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

//BSSR
productController.getAllProducts = async (req: Request, res: Response) => {
  try {
    console.log("getAllProducts");
    const data = await productService.getAllProducts();
    const availableProducts = await productService.getAvailableProducts();

    res.render("products", {
      products: data,
      availableProducts: availableProducts,
    });
  } catch (err) {
    console.log("Error, getAllProducts", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

productController.createNewProduct = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    console.log("createNewProduct");
    console.log("req.body", req.body);

    // Validate images
    if (!req.files?.length) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.NOT_IMAGE);
    }

    const data: ProductInput = req.body;
    data.productImages = req.files?.map((ele) => {
      return ele.path.replace(/\\/g, "/");
    });

    // Handle combo products
    if (data.productCategory === "COMBO") {
      // Validate combo requirements
      if (!data.comboName?.trim() || !data.comboPrice) {
        throw new Errors(HttpCode.BAD_REQUEST, Message.COMBO_REQUIRE);
      }

      // Convert and validate combo price
      const comboPrice = parseFloat(data.comboPrice.toString());
      if (isNaN(comboPrice) || comboPrice <= 0) {
        throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_COMBO_PRICE);
      }

      // Structure combo data
      data.combos = [
        {
          comboName: data.comboName.trim(),
          comboPrice: comboPrice,
          comboItems: normalizeComboItems(data.comboItems),
          comboDrink: data.comboDrink?.trim() || undefined,
          comboSide: data.comboSide?.trim() || undefined,
        },
      ];

      // Set main product price from combo price
      data.productPrice = comboPrice;

      // Clean up temporary fields
      const comboFields: (keyof ProductInput)[] = [
        "comboName",
        "comboPrice",
        "comboItems",
        "comboDrink",
        "comboSide",
      ];
      comboFields.forEach((field) => delete data[field]);
    } else {
      // Validate regular product price
      data.productPrice = parseFloat(data.productPrice.toString());
      if (isNaN(data.productPrice)) {
        throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_PRODUCT_PRICE);
      }
    }

    // Normalize other fields
    data.productTime = normalizeArrayField(
      data.productTime,
      ProductTime.ALL_DAY
    );
    data.tags = normalizeArrayField(data.tags);

    // Create the product
    const product = await productService.createNewProduct(data);

    res.send(
      `<script> alert("Product created succesfully!"); window.location.replace("/admin/product/all") </script>`
    );
  } catch (err) {
    console.error("Error in createNewProduct:", err);
    const message = err instanceof Errors ? err.message : Message.CREATE_FAILED;
    res.send(
      `<script> alert("${message}"); window.location.replace("/admin/product/all") </script>`
    );
  }
};

// Helper functions
function normalizeComboItems(items: string[] | string | undefined): string[] {
  if (!items) return [];
  if (Array.isArray(items)) return items.filter(Boolean);
  return items
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeArrayField(value: any, defaultValue?: any): any[] {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string")
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  return defaultValue ? [defaultValue] : [];
}

productController.updateChosenProduct = async (req: Request, res: Response) => {
  try {
    console.log("updateChosenProduct");
    const id = req.params.id;
    const result = await productService.updateChosenProduct(id, req.body);
    res.status(HttpCode.OK).json({ data: result });
  } catch (err) {
    console.log("Error, updateChosenProduct", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

export default productController;
