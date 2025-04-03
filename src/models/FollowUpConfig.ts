import { DataTypes, Model } from "sequelize";
import { getMySQLClient } from "@/services/mysqlClient";

class FollowUpConfig extends Model {
  public id!: string;
  public user_id!: string;
  public name!: string;
  public enable_follow_up_questions!: boolean;
  public max_follow_up_questions!: number;
  public show_follow_up_as!: string;
  public generate_automatically!: boolean;
  public is_default!: boolean;
  public created_at!: Date;
  public updated_at!: Date;
}

export const initFollowUpConfig = async () => {
  const sequelize = await getMySQLClient();

  FollowUpConfig.init(
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
      enable_follow_up_questions: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      max_follow_up_questions: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 3,
      },
      show_follow_up_as: {
        type: DataTypes.ENUM("buttons", "chips", "list"),
        allowNull: false,
        defaultValue: "buttons",
      },
      generate_automatically: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
      tableName: "follow_up_configs",
      timestamps: false,
    },
  );

  return FollowUpConfig;
};

export default FollowUpConfig;
