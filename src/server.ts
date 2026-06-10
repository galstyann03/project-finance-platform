import { createApp } from "./app.js";
import { config } from "./configs/config.js";

async function main() {
  const app = await createApp();
  app.listen(config.port, () => {
    console.log(`🚀 Server ready at http://localhost:${config.port}/graphql`);
  });
}

main().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
