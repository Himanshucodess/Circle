import "dotenv/config";
import { createApp } from "./app";
import { getConfigurationStatus } from "./services/cloudinaryService";

const port = Number(process.env.PORT) || 4000;

const cloudinaryStatus = getConfigurationStatus();
console.log("[cloudinary] configuration", cloudinaryStatus);

const app = createApp();

app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});
