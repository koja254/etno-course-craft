import express from "express";
import resourceRoutes from "./resource.routes.js";
import curriculumRoutes from "./curriculum.routes.js";
import curriculumResourceRoutes from "./curriculum_resource.routes.js";

const router = express.Router();

router.use("/resources", resourceRoutes);
router.use("/curriculums", curriculumRoutes);
router.use("/curriculum-resources", curriculumResourceRoutes);

export default router;
