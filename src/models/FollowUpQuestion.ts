import { DataTypes, Model } from "sequelize";
import { getMySQLClient } from "@/services/mysqlClient";

class FollowUpQuestion extends Model {
  public id!: string;
  public config_id!: string;
  public question!: string;
  public display_order!: number;
  public is_active!: boolean;
  public created_at!: Date;
  public updated_at!: Date;
}

export const initFollowUpQuestion = async () => {
  const sequelize = await getMySQLClient();

  FollowUpQuestion.init(
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
      question: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      display_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
      tableName: "follow_up_questions",
      timestamps: false,
    },
  );

  return FollowUpQuestion;
};

export default FollowUpQuestion;
