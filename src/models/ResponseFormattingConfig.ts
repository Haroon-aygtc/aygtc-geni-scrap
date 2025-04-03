import { DataTypes, Model } from "sequelize";
import { getMySQLClient } from "@/services/mysqlClient";

class ResponseFormattingConfig extends Model {
  public id!: string;
  public user_id!: string;
  public name!: string;
  public enable_markdown!: boolean;
  public default_heading_level!: number;
  public enable_bullet_points!: boolean;
  public enable_numbered_lists!: boolean;
  public enable_emphasis!: boolean;
  public response_variability!: string;
  public default_template?: string;
  public is_default!: boolean;
  public created_at!: Date;
  public updated_at!: Date;
}

export const initResponseFormattingConfig = async () => {
  const sequelize = await getMySQLClient();

  ResponseFormattingConfig.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      enable_markdown: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      default_heading_level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 2,
      },
      enable_bullet_points: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      enable_numbered_lists: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      enable_emphasis: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      response_variability: {
        type: DataTypes.ENUM("concise", "balanced", "detailed"),
        allowNull: false,
        defaultValue: "balanced",
      },
      default_template: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "response_templates",
          key: "id",
        },
      },
      is_default: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
      tableName: "response_formatting_configs",
      timestamps: false,
    },
  );

  return ResponseFormattingConfig;
};

export default ResponseFormattingConfig;
