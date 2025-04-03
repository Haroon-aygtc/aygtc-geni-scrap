import { DataTypes, Model } from "sequelize";
import { getMySQLClient } from "@/services/mysqlClient";

class User extends Model {
  public id!: string;
  public email!: string;
  public full_name!: string;
  public password_hash?: string;
  public role!: string;
  public is_active!: boolean;
  public avatar_url?: string;
  public last_login_at?: Date;
  public reset_token?: string;
  public reset_token_expires?: Date;
  public email_verified?: boolean;
  public verification_token?: string;
  public verification_token_expires?: Date;
  public failed_login_attempts?: number;
  public account_locked_until?: Date;
  public created_at!: Date;
  public updated_at!: Date;
}

export const initUser = async () => {
  const sequelize = await getMySQLClient();

  User.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      full_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      role: {
        type: DataTypes.ENUM("user", "admin", "moderator"),
        allowNull: false,
        defaultValue: "user",
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      avatar_url: {
        type: DataTypes.STRING(1024),
        allowNull: true,
        validate: {
          isUrl: true,
        },
      },
      last_login_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      reset_token: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      reset_token_expires: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      email_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      verification_token: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      verification_token_expires: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      failed_login_attempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      account_locked_until: {
        type: DataTypes.DATE,
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
      tableName: "users",
      timestamps: false,
      indexes: [
        {
          name: "users_email_idx",
          fields: ["email"],
        },
        {
          name: "users_reset_token_idx",
          fields: ["reset_token"],
        },
        {
          name: "users_verification_token_idx",
          fields: ["verification_token"],
        },
      ],
    },
  );

  return User;
};

/**
 * Get a user by ID with sensitive fields removed
 */
export const getSafeUser = (user: User) => {
  if (!user) return null;

  const userObj = user.get({ plain: true });
  delete userObj.password_hash;
  delete userObj.reset_token;
  delete userObj.reset_token_expires;
  delete userObj.verification_token;
  delete userObj.verification_token_expires;
  delete userObj.failed_login_attempts;
  delete userObj.account_locked_until;

  return userObj;
};

export default User;
