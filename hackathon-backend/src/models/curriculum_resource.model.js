import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const CurriculumResource = sequelize.define(
  "CurriculumResource",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    curriculumId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "curriculum_id",
      references: { model: "curriculums", key: "id" },
    },
    resourceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "resource_id",
      references: { model: "resources", key: "id" },
    },
    addedOn: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "added_on",
    },
  },
  {
    tableName: "curriculum_resources",
    timestamps: false,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["curriculum_id", "resource_id"],
        name: "uniq_curriculum_resource",
      },
    ],
  }
);

export default CurriculumResource;



