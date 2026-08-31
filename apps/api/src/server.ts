import "dotenv/config";
import { createApp } from "./app";
import { getConfigurationStatus } from "./services/cloudinaryService";
import { ensureRedisReady } from "./infrastructure/cache/redis";

const port = Number(process.env.PORT) || 4000;

const cloudinaryStatus = getConfigurationStatus();
console.log("[cloudinary] configuration", cloudinaryStatus);

const app = createApp();

// Redis is an optional optimization. Connect in the background so a cold or
// unavailable cache never prevents the API from serving PostgreSQL data.
void ensureRedisReady();

app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});
