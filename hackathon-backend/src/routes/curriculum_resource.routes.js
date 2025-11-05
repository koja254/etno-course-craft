import express from "express";
import {
  linkCurriculumResourceHandler,
  unlinkCurriculumResourceHandler,
} from "../controllers/curriculum_resource.controller.js";

const router = express.Router();

router.post("/", linkCurriculumResourceHandler);
router.delete("/", unlinkCurriculumResourceHandler);

export default router;



