import express from "express";
import usersRoutes from "./routes/usersRoutes.js";
import cors from "cors";

//express
const app = express();
const PORT = process.env.PORT || 3001;

//Configuracion de cors
const corsOptions={
    origin : "http://localhost:5173",
    methods: ["GET","POST", "PUT","DELETE","OPTIONS"],
    allowedHeaders:["Content-Type"],
    credentials:true,
};

//middlewares
app.use(cors(corsOptions));
app.options("*",cors(corsOptions));


//Rutas
app.use("/users", usersRoutes);

//Inicializar servidor

app.listen(PORT, () =>{
    console.log( `el servidor corriendo en el puerto ${PORT}`);
});