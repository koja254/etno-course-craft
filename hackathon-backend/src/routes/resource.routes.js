import express from "express";
import {
  createResourceHandler,
  listResourcesHandler,
  getResourceByIdHandler,
  updateResourceHandler,
  deleteResourceHandler,
} from "../controllers/resource.controller.js";

const router = express.Router();

router.get("/", listResourcesHandler);
router.get("/:id", getResourceByIdHandler);
router.post("/", createResourceHandler);
router.put("/:id", updateResourceHandler);
router.delete("/:id", deleteResourceHandler);

export default router;
