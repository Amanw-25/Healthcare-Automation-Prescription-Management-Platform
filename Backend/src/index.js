import { app } from "./app.js";
import connectdb from "./database/dbConnect.js";
import appconfig from "./config/appConfig.js";
import { connectRedis } from "./config/redisClient.js"; 

(async () => {
  try {
    await connectdb();
    await connectRedis();

    app.listen(appconfig.PORT, () => {
      console.log(
        `Server started at http://localhost:${appconfig.PORT}`
      );
    });
  } catch (error) {
    console.error(" Server initialization error:", error);
    process.exit(1);
  }
})();
