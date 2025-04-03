import { DataTypes, Model } from "sequelize";
import { getMySQLClient } from "@/services/mysqlClient";

class PredefinedQuestionSet extends Model {
  public id!: string;
  public config_id!: string;
  public name!: string;
  public description?: string;
  public trigger_keywords?: string[];
  public created_at!: Date;
  public updated_at!: Date;
}

export const initPredefinedQuestionSet = async () => {
  const sequelize = await getMySQLClient();

  PredefinedQuestionSet.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      config_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "follow_up_configs",
          key: "id",
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      trigger_keywords: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: "predefined_question_sets",
      timestamps: false,
    },
  );

  return PredefinedQuestionSet;
};

export default PredefinedQuestionSet;
