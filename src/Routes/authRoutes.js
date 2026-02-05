import express from "express";
import {signup}from '../Controllers/authControllers.js';
import { login } from "../Controllers/authControllers.js";

const router = express.Router();

router.post('/signup' , signup);
router.post('/login' , login);

export default router ;
