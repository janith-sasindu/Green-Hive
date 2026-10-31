import { Router } from "express";
import { getAdminHealth, getAllUsers } from "../controllers/admin.controller";

const route = Router();

route.get('/health', getAdminHealth);

route.get('/user', getAllUsers);

export default route;
