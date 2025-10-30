// Archivo principal del servidor
import app from "./app.js"
import "./database.js";
import { config } from "./src/config.js";

// Iniciar el servidor
async function main() {
    app.listen(config.server.port);
    console.log("Server is running " + config.server.port)
}

main();