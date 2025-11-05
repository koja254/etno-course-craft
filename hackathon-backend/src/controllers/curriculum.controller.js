import {
  createCurriculum,
  listCurriculums,
  getCurriculumById,
  updateCurriculum,
  deleteCurriculum,
  addResourceToCurriculum,
  removeResourceFromCurriculum,
  listResourcesForCurriculum,
} from "../services/curriculum.service.js";

export async function createCurriculumHandler(req, res) {
  try {
    const curriculum = await createCurriculum(req.body);
    return res.status(201).json(curriculum);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create curriculum", error: error.message });
  }
}

export async function listCurriculumsHandler(req, res) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset) : undefined;
    const curriculums = await listCurriculums({ limit, offset });
    return res.json(curriculums);
  } catch (error) {
    return res.status(500).json({ message: "Failed to list curriculums", error: error.message });
  }
}

export async function getCurriculumByIdHandler(req, res) {
  try {
    const { id } = req.params;
    const withResources = req.query.withResources === "true";
    const curriculum = await getCurriculumById(id, withResources);
    if (!curriculum) return res.status(404).json({ message: "Curriculum not found" });
    return res.json(curriculum);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch curriculum", error: error.message });
  }
}

export async function updateCurriculumHandler(req, res) {
  try {
    const { id } = req.params;
    const curriculum = await updateCurriculum(id, req.body);
    if (!curriculum) return res.status(404).json({ message: "Curriculum not found" });
    return res.json(curriculum);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update curriculum", error: error.message });
  }
}

export async function deleteCurriculumHandler(req, res) {
  try {
    const { id } = req.params;
    const ok = await deleteCurriculum(id);
    if (!ok) return res.status(404).json({ message: "Curriculum not found" });
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete curriculum", error: error.message });
  }
}

export async function addResourceToCurriculumHandler(req, res) {
  try {
    const { id } = req.params;
    const { resourceId } = req.body;
    if (!resourceId) return res.status(400).json({ message: "resourceId is required" });
    const link = await addResourceToCurriculum(id, resourceId);
    return res.status(201).json(link);
  } catch (error) {
    return res.status(500).json({ message: "Failed to add resource", error: error.message });
  }
}

export async function removeResourceFromCurriculumHandler(req, res) {
  try {
    const { id } = req.params;
    const { resourceId } = req.body;
    if (!resourceId) return res.status(400).json({ message: "resourceId is required" });
    const ok = await removeResourceFromCurriculum(id, resourceId);
    if (!ok) return res.status(404).json({ message: "Link not found" });
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Failed to remove resource", error: error.message });
  }
}

export async function listCurriculumResourcesHandler(req, res) {
  try {
    const { id } = req.params;
    const resources = await listResourcesForCurriculum(id);
    return res.json(resources);
  } catch (error) {
    return res.status(500).json({ message: "Failed to list curriculum resources", error: error.message });
  }
}



