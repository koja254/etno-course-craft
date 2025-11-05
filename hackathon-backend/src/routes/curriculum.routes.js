import express from "express";
import {
  createCurriculumHandler,
  listCurriculumsHandler,
  getCurriculumByIdHandler,
  updateCurriculumHandler,
  deleteCurriculumHandler,
  addResourceToCurriculumHandler,
  removeResourceFromCurriculumHandler,
  listCurriculumResourcesHandler,
} from "../controllers/curriculum.controller.js";

const router = express.Router();

router.get("/", listCurriculumsHandler);
router.get("/:id", getCurriculumByIdHandler);
router.post("/", createCurriculumHandler);
router.put("/:id", updateCurriculumHandler);
router.delete("/:id", deleteCurriculumHandler);

// Nested resource management
router.get("/:id/resources", listCurriculumResourcesHandler);
router.post("/:id/resources", addResourceToCurriculumHandler);
router.delete("/:id/resources", removeResourceFromCurriculumHandler);

export default router;



