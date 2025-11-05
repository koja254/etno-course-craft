import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Curriculum = sequelize.define(
  "Curriculum",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "creator_id",
      references: { model: "users", key: "id" },
    },

    curriculumCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: "curriculum_code",
    },

    curriculumName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "curriculum_name",
    },

    curriculumGroup: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "curriculum_group",
    },

    approvalDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: "approval_date",
    },

    targetGroup: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      field: "target_group",
    },

    learningObjectives: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      field: "learning_objectives",
    },

    learningOutcomes: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      field: "learning_outcomes",
    },

    basisCurriculumDevelopment: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "basis_curriculum_development",
    },

    prerequisites: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },

    totalHours: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "total_hours",
    },

    classroomHours: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "classroom_hours",
    },

    independentHours: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "independent_hours",
    },

    independentWork: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      field: "independent_work",
    },

    descriptionLearningEnvironment: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "description_learning_environment",
    },

    studyContent: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      field: "study_content",
    },

    teachingMethods: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "teaching_methods",
    },

    completionRequirements: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "completion_requirements",
    },

    documentsIssued: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "documents_issued",
    },

    status: {
      type: DataTypes.ENUM(
        "approved",
        "rejected",
        "draft",
        "pending",
        "published"
      ),
      allowNull: false,
      defaultValue: "draft",
    },
  },
  {
    tableName: "curriculums",
    timestamps: true,
    underscored: true,
  }
);

export default Curriculum;
