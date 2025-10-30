// Archivo de configuración de la base de datos
import mongoose from "mongoose";

import { config } from "./src/config.js"; // Importar configuración

mongoose.connect(config.db.URI) // Conectar a la base de datos usando la URI del archivo de configuración


const connection = mongoose.connection
connection.once("open", ()=>{
    console.log("DB is connected");
});

connection.once("disconnected", ()=>{
    console.log("DB is disconnected");
});

connection.once("error", (error)=>{
    console.log("Error found" + error);
});