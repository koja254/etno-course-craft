import {
  addResourceToCurriculum,
  removeResourceFromCurriculum,
} from "../services/curriculum.service.js";

export async function linkCurriculumResourceHandler(req, res) {
  try {
    const { curriculumId, resourceId } = req.body;
    if (!curriculumId || !resourceId) return res.status(400).json({ message: "curriculumId and resourceId are required" });
    const link = await addResourceToCurriculum(curriculumId, resourceId);
    return res.status(201).json(link);
  } catch (error) {
    return res.status(500).json({ message: "Failed to link curriculum/resource", error: error.message });
  }
}

export async function unlinkCurriculumResourceHandler(req, res) {
  try {
    const { curriculumId, resourceId } = req.body;
    if (!curriculumId || !resourceId) return res.status(400).json({ message: "curriculumId and resourceId are required" });
    const ok = await removeResourceFromCurriculum(curriculumId, resourceId);
    if (!ok) return res.status(404).json({ message: "Link not found" });
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Failed to unlink curriculum/resource", error: error.message });
  }
}



