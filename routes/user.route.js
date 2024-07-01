import express from "express";
import { clientInfo } from "../controllers/user.controller.js";


const router = express.Router();

router.get(
  "/hello",clientInfo)



export default router;
