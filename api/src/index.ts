import { config } from "./config";
import { server } from "./lib/server";

async function main() {
  server.listen(config.port, () => { console.log(`Server has started on port ${config.port}`) });
}

main();