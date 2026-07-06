import { app } from "./app.js";
import { config } from "./config.js";

app.listen(config.port, () => {
  console.log(`${config.serviceName} listening on port ${config.port}`);
});
