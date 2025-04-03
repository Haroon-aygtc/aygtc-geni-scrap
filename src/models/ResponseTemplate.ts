import { DataTypes, Model } from "sequelize";
import { getMySQLClient } from "@/services/mysqlClient";

class ResponseTemplate extends Model {
  public id!: string;
  public config_id!: string;
  public name!: string;
  public template!: string;
  public description?: string;
  public created_at!: Date;
  public updated_at!: Date;
}

export const initResponseTemplate = async () => {
  const sequelize = await getMySQLClient();

  ResponseTemplate.init(
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
          model: "response_formatting_configs",
          key: "id",
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      template: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
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
      tableName: "response_templates",
      timestamps: false,
    },
  );

  return ResponseTemplate;
};

export default ResponseTemplate;
