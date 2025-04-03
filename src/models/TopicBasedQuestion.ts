import { DataTypes, Model } from "sequelize";
import { getMySQLClient } from "@/services/mysqlClient";

class TopicBasedQuestion extends Model {
  public id!: string;
  public set_id!: string;
  public question_text!: string;
  public display_order!: number;
  public created_at!: Date;
  public updated_at!: Date;
}

export const initTopicBasedQuestion = async () => {
  const sequelize = await getMySQLClient();

  TopicBasedQuestion.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      set_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "topic_based_question_sets",
          key: "id",
        },
      },
      question_text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      display_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
      tableName: "topic_based_questions",
      timestamps: false,
    },
  );

  return TopicBasedQuestion;
};

export default TopicBasedQuestion;
