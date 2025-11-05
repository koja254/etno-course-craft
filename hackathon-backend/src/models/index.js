import Curriculum from "./curriculum.model.js";
import Resource from "./resource.model.js";
import CurriculumResource from "./curriculum_resource.model.js";

// Establish many-to-many association between Curriculum and Resource through CurriculumResource
Curriculum.belongsToMany(Resource, {
  through: CurriculumResource,
  foreignKey: "curriculumId",
  otherKey: "resourceId",
  as: "resources",
});

Resource.belongsToMany(Curriculum, {
  through: CurriculumResource,
  foreignKey: "resourceId",
  otherKey: "curriculumId",
  as: "curriculums",
});

export { Curriculum, Resource, CurriculumResource };



