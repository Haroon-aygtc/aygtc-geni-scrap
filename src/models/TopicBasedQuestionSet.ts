import { DataTypes, Model } from "sequelize";
import { getMySQLClient } from "@/services/mysqlClient";

class TopicBasedQuestionSet extends Model {
  public id!: string;
  public config_id!: string;
  public topic!: string;
  public created_at!: Date;
  public updated_at!: Date;
}

export const initTopicBasedQuestionSet = async () => {
  const sequelize = await getMySQLClient();

  TopicBasedQuestionSet.init(
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
      topic: {
        type: DataTypes.STRING,
        allowNull: false,
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
      tableName: "topic_based_question_sets",
      timestamps: false,
    },
  );

  return TopicBasedQuestionSet;
};

export default TopicBasedQuestionSet;
