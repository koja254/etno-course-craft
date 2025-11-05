import { Curriculum, Resource, CurriculumResource } from "../models/index.js";

export async function createCurriculum(data) {
  const curriculum = await Curriculum.create(data);
  return curriculum;
}

export async function listCurriculums(options = {}) {
  const { limit, offset } = options;
  return Curriculum.findAll({ limit, offset, order: [["created_at", "DESC"]] });
}

export async function getCurriculumById(id, withResources = false) {
  if (!withResources) return Curriculum.findByPk(id);
  return Curriculum.findByPk(id, {
    include: [
      {
        model: Resource,
        through: { attributes: [] },
      },
    ],
  });
}

export async function updateCurriculum(id, updates) {
  const curriculum = await Curriculum.findByPk(id);
  if (!curriculum) return null;
  await curriculum.update(updates);
  return curriculum;
}

export async function deleteCurriculum(id) {
  const curriculum = await Curriculum.findByPk(id);
  if (!curriculum) return false;
  await curriculum.destroy();
  return true;
}

// Association helpers
export async function addResourceToCurriculum(curriculumId, resourceId) {
  return CurriculumResource.findOrCreate({
    where: { curriculumId, resourceId },
    defaults: { curriculumId, resourceId },
  }).then(([cr]) => cr);
}

export async function removeResourceFromCurriculum(curriculumId, resourceId) {
  const deleted = await CurriculumResource.destroy({ where: { curriculumId, resourceId } });
  return deleted > 0;
}

export async function listResourcesForCurriculum(curriculumId) {
  const curriculum = await Curriculum.findByPk(curriculumId);
  if (!curriculum) return [];
  
  return curriculum.getResources();
}



