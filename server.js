import express, { Router, urlencoded } from 'express';
import cors from 'cors';
import axios from 'axios';
import baseRoutes from './routes/index.route.js'
import dotenv from 'dotenv';
import { errorHandler } from './middleware/error.middleware.js';
dotenv.config();

const app = express();


const router = Router();
const rootRouter = baseRoutes(router);

app.use(cors());
app.use(express.json());
app.use(urlencoded({ extended: false }));

//Home Route
app.get("/", (req, res) => {
    res.send("Welcome to HNG stage1 task home route, Enjoy 🔥");
  });
  
  app.use("/api", rootRouter)


app.use('*', (req, res) => {
    res.status(404).send({ message: 'Resource URL not found,check d url endpoint', success: false, data: null });
  });

  //error handling
  app.use(errorHandler);
const port = process.env.PORT;
app.listen(port,()=>{
    console.log("Server is functional on port",port);
});
