import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import app from "./app";

mongoose
  .connect(process.env.MONGO_URL as string, {})
  .then((data) => {
    console.log(`Mongodb connection succeed`);
    const PORT = process.env.PORT ?? 3007;
    app.listen(PORT, function () {
      console.info(`The server running succesfully on port: ${PORT}`);
      console.info(`Admin project on http://localhost:${PORT}/admin \n`);
    });
  })
  .catch((err) => {
    console.log(`ERROR on connection Mongodb ${err}`);
  });
