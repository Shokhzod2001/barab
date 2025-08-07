import express from "express";
import restaurantController from "./controllers/restaurant.controll";
import productController from "./controllers/product.controll";
import makeUploader from "./libs/utils/uploader";
const routerAdmin = express.Router();

// Restaurant
routerAdmin.get("/", restaurantController.goHome);
routerAdmin
  .get("/login", restaurantController.getLogin)
  .post("/login", restaurantController.processLogin);
routerAdmin
  .get("/signup", restaurantController.getSignup)
  .post(
    "/signup",
    makeUploader("members").single("memberImage"),
    restaurantController.processSignup
  );

routerAdmin.get("/logout", restaurantController.logout);
routerAdmin.get("/check-me", restaurantController.checkAuthVerification);

// Product
routerAdmin.get(
  "/product/all",
  restaurantController.verifyRestaurant,
  productController.getAllProducts
);
routerAdmin.post(
  "/product/create",
  restaurantController.verifyRestaurant,
  makeUploader("products").array("productImages", 5),
  productController.createNewProduct
);
routerAdmin.post(
  "/product/:id",
  restaurantController.verifyRestaurant,
  productController.updateChosenProduct
);

// User
routerAdmin.get(
  "/user/all",
  restaurantController.verifyRestaurant,
  restaurantController.getUsers
);
routerAdmin.post(
  "/user/edit",
  restaurantController.verifyRestaurant,
  restaurantController.updateChosenUSer
);

// Chef
routerAdmin.get(
  "/chef/all",
  restaurantController.verifyRestaurant,
  restaurantController.getChefs
);

routerAdmin.post(
  "/chef/create",
  restaurantController.verifyRestaurant,
  makeUploader("members").single("memberImage"),
  restaurantController.createNewChef
);

// Reservation routes
routerAdmin.get(
  "/reserve/all",
  restaurantController.verifyRestaurant,
  restaurantController.getReserves
);
routerAdmin.post("/reserve/create", restaurantController.createNewReserve);

export default routerAdmin;
