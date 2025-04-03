import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { User, getSafeUser } from "@/models/User";
import logger from "@/utils/logger";
import { env } from "@/config/env";

// JWT configuration
const JWT_SECRET = env.JWT_SECRET || "your-secret-key-should-be-set-in-env";
const JWT_EXPIRES_IN = env.JWT_EXPIRES_IN || "24h";

// Security settings
const PASSWORD_MIN_LENGTH = 8;
const MAX_LOGIN_ATTEMPTS = 5;
const ACCOUNT_LOCK_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds

/**
 * Authentication service for user management
 */
const authService = {
  /**
   * Register a new user
   * @param email User email
   * @param password User password
   * @param name User name (optional)
   * @returns Created user object
   */
  register: async (email: string, password: string, name?: string) => {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    // Validate password strength
    if (password.length < PASSWORD_MIN_LENGTH) {
      throw new Error(
        `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
      );
    }

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      // Hash password with appropriate cost factor
      const salt = await bcrypt.genSalt(12); // Higher cost factor for better security
      const hashedPassword = await bcrypt.hash(password, salt);

      // Generate verification token
      const verificationToken = uuidv4();
      const verificationExpires = new Date();
      verificationExpires.setHours(verificationExpires.getHours() + 24); // Token valid for 24 hours

      // Create user
      const user = await User.create({
        id: uuidv4(),
        email,
        full_name: name || email.split("@")[0],
        password_hash: hashedPassword,
        role: "user",
        is_active: true,
        email_verified: false,
        verification_token: verificationToken,
        verification_token_expires: verificationExpires,
        created_at: new Date(),
        updated_at: new Date(),
      });

      // In a production environment, send verification email here
      logger.info(`Verification token for ${email}: ${verificationToken}`);

      return getSafeUser(user);
    } catch (error) {
      logger.error(
        "Error registering user",
        error instanceof Error ? error : new Error(String(error)),
      );
      throw error;
    }
  },

  /**
   * Verify user email with token
   * @param token Verification token
   * @returns Success status
   */
  verifyEmail: async (token: string) => {
    if (!token) {
      throw new Error("Verification token is required");
    }

    try {
      // Find user with this verification token
      const user = await User.findOne({
        where: {
          verification_token: token,
        },
      });

      if (!user) {
        throw new Error("Invalid verification token");
      }

      // Check if token is expired
      const tokenExpires = user.verification_token_expires;
      if (!tokenExpires || tokenExpires < new Date()) {
        throw new Error("Verification token has expired");
      }

      // Update user as verified
      await user.update({
        email_verified: true,
        verification_token: null,
        verification_token_expires: null,
        updated_at: new Date(),
      });

      return { success: true };
    } catch (error) {
      logger.error(
        "Error verifying email",
        error instanceof Error ? error : new Error(String(error)),
      );
      throw error;
    }
  },

  /**
   * Login a user
   * @param email User email
   * @param password User password
   * @returns User object and JWT token
   */
  login: async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    try {
      // Find user
      const user = await User.findOne({ where: { email } });
      if (!user) {
        throw new Error("Invalid credentials");
      }

      // Check if user is active
      if (!user.is_active) {
        throw new Error("User account is disabled");
      }

      // Check if account is locked
      if (user.account_locked_until && user.account_locked_until > new Date()) {
        const remainingTime = Math.ceil(
          (user.account_locked_until.getTime() - Date.now()) / 60000,
        );
        throw new Error(
          `Account is temporarily locked. Try again in ${remainingTime} minutes`,
        );
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password_hash || "");

      if (!isMatch) {
        // Increment failed login attempts
        const failedAttempts = (user.failed_login_attempts || 0) + 1;
        const updates: any = {
          failed_login_attempts: failedAttempts,
          updated_at: new Date(),
        };

        // Lock account if max attempts reached
        if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
          const lockUntil = new Date(Date.now() + ACCOUNT_LOCK_TIME);
          updates.account_locked_until = lockUntil;
          logger.warn(
            `Account locked for ${email} due to too many failed login attempts`,
          );
        }

        await user.update(updates);
        throw new Error("Invalid credentials");
      }

      // Reset failed login attempts and update last login time
      await user.update({
        failed_login_attempts: 0,
        account_locked_until: null,
        last_login_at: new Date(),
        updated_at: new Date(),
      });

      // Generate JWT token with appropriate claims
      const tokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
        verified: user.email_verified || false,
      };

      const token = jwt.sign(tokenPayload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
        audience: "chat-widget-app",
        issuer: "chat-widget-auth-service",
      });

      // Calculate token expiration time
      const expiresIn =
        typeof JWT_EXPIRES_IN === "string" && JWT_EXPIRES_IN.endsWith("h")
          ? parseInt(JWT_EXPIRES_IN.slice(0, -1)) * 60 * 60 * 1000
          : 24 * 60 * 60 * 1000; // Default to 24 hours

      return {
        user: getSafeUser(user),
        token,
        session: {
          access_token: token,
          expires_at: new Date(Date.now() + expiresIn).toISOString(),
        },
      };
    } catch (error) {
      logger.error(
        "Error logging in user",
        error instanceof Error ? error : new Error(String(error)),
      );
      throw error;
    }
  },

  /**
   * Logout the current user
   */
  logout: async () => {
    // With JWT, logout is handled client-side by removing the token
    // In a production environment, you might want to implement token blacklisting
    return { success: true };
  },

  /**
   * Get the current authenticated user
   * @param userId User ID
   */
  getCurrentUser: async (userId: string) => {
    if (!userId) {
      return null;
    }

    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return null;
      }

      return getSafeUser(user);
    } catch (error) {
      logger.error(
        "Error getting current user",
        error instanceof Error ? error : new Error(String(error)),
      );
      return null;
    }
  },

  /**
   * Verify JWT token
   * @param token JWT token
   * @returns Decoded token payload
   */
  verifyToken: (token: string) => {
    if (!token) {
      throw new Error("Token is required");
    }

    try {
      return jwt.verify(token, JWT_SECRET, {
        audience: "chat-widget-app",
        issuer: "chat-widget-auth-service",
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Token has expired");
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid token");
      }

      logger.error(
        "Error verifying token",
        error instanceof Error ? error : new Error(String(error)),
      );
      throw new Error("Token verification failed");
    }
  },

  /**
   * Request password reset
   * @param email User email
   * @returns Success status
   */
  requestPasswordReset: async (email: string) => {
    if (!email) {
      throw new Error("Email is required");
    }

    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        // Don't reveal that the user doesn't exist
        return { success: true };
      }

      // Generate secure reset token
      const resetToken = uuidv4();
      const resetExpires = new Date();
      resetExpires.setHours(resetExpires.getHours() + 1); // Token valid for 1 hour

      // Update user with reset token
      await user.update({
        reset_token: resetToken,
        reset_token_expires: resetExpires,
        updated_at: new Date(),
      });

      // In a production environment, send an email with the reset link
      logger.info(`Password reset token for ${email}: ${resetToken}`);

      return { success: true };
    } catch (error) {
      logger.error(
        `Error requesting password reset for ${email}`,
        error instanceof Error ? error : new Error(String(error)),
      );
      throw error;
    }
  },

  /**
   * Reset password with token
   * @param token Reset token
   * @param newPassword New password
   * @returns Success status
   */
  resetPassword: async (token: string, newPassword: string) => {
    if (!token || !newPassword) {
      throw new Error("Token and new password are required");
    }

    // Validate password strength
    if (newPassword.length < PASSWORD_MIN_LENGTH) {
      throw new Error(
        `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
      );
    }

    try {
      // Find user with this reset token
      const user = await User.findOne({
        where: {
          reset_token: token,
        },
      });

      if (!user) {
        throw new Error("Invalid or expired reset token");
      }

      // Check if token is expired
      const resetExpires = user.reset_token_expires;
      if (!resetExpires || resetExpires < new Date()) {
        throw new Error("Reset token has expired");
      }

      // Hash new password with appropriate cost factor
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update user with new password and remove reset token
      await user.update({
        password_hash: hashedPassword,
        reset_token: null,
        reset_token_expires: null,
        failed_login_attempts: 0,
        account_locked_until: null,
        updated_at: new Date(),
      });

      return { success: true };
    } catch (error) {
      logger.error(
        "Error resetting password",
        error instanceof Error ? error : new Error(String(error)),
      );
      throw error;
    }
  },

  /**
   * Update user profile
   * @param userId User ID
   * @param updates User profile updates
   * @returns Updated user object
   */
  updateProfile: async (userId: string, updates: any) => {
    if (!userId) {
      throw new Error("User ID is required");
    }

    if (!updates || typeof updates !== "object") {
      throw new Error("Updates must be an object");
    }

    // Prevent updating sensitive fields directly
    const forbiddenFields = [
      "id",
      "role",
      "is_active",
      "email_verified",
      "reset_token",
      "reset_token_expires",
      "verification_token",
      "verification_token_expires",
      "failed_login_attempts",
      "account_locked_until",
    ];

    for (const field of forbiddenFields) {
      if (field in updates) {
        delete updates[field];
      }
    }

    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Handle password update separately with validation
      if (updates.password) {
        if (updates.password.length < PASSWORD_MIN_LENGTH) {
          throw new Error(
            `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
          );
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(updates.password, salt);
        updates.password_hash = hashedPassword;
        delete updates.password;
      }

      // Validate email if being updated
      if (updates.email && updates.email !== user.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(updates.email)) {
          throw new Error("Invalid email format");
        }

        // Check if email is already in use
        const existingUser = await User.findOne({
          where: { email: updates.email },
        });
        if (existingUser) {
          throw new Error("Email is already in use");
        }

        // Generate new verification token for email change
        const verificationToken = uuidv4();
        const verificationExpires = new Date();
        verificationExpires.setHours(verificationExpires.getHours() + 24);

        updates.email_verified = false;
        updates.verification_token = verificationToken;
        updates.verification_token_expires = verificationExpires;

        // In a production environment, send verification email here
        logger.info(
          `Email change verification token for ${updates.email}: ${verificationToken}`,
        );
      }

      // Add updated_at timestamp
      updates.updated_at = new Date();

      // Update user
      await user.update(updates);

      // Refresh user from database
      const updatedUser = await User.findByPk(userId);
      if (!updatedUser) {
        throw new Error("Failed to retrieve updated user");
      }

      return getSafeUser(updatedUser);
    } catch (error) {
      logger.error(
        `Error updating user ${userId}`,
        error instanceof Error ? error : new Error(String(error)),
      );
      throw error;
    }
  },

  /**
   * Check if a user has a specific role
   * @param userId User ID
   * @param role Role to check
   * @returns Boolean indicating if user has the role
   */
  hasRole: async (userId: string, role: string) => {
    if (!userId || !role) {
      return false;
    }

    try {
      const user = await User.findByPk(userId);
      return user?.role === role;
    } catch (error) {
      logger.error(
        `Error checking role for user ${userId}`,
        error instanceof Error ? error : new Error(String(error)),
      );
      return false;
    }
  },

  /**
   * Change user role (admin only)
   * @param userId User ID
   * @param newRole New role to assign
   * @param adminId ID of admin making the change
   * @returns Updated user object
   */
  changeUserRole: async (userId: string, newRole: string, adminId: string) => {
    if (!userId || !newRole || !adminId) {
      throw new Error("User ID, new role, and admin ID are required");
    }

    // Validate role
    const validRoles = ["user", "admin", "moderator"];
    if (!validRoles.includes(newRole)) {
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(", ")}`);
    }

    try {
      // Verify admin permissions
      const isAdmin = await authService.hasRole(adminId, "admin");
      if (!isAdmin) {
        throw new Error("Only administrators can change user roles");
      }

      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error("User not found");
      }

      await user.update({
        role: newRole,
        updated_at: new Date(),
      });

      logger.info(
        `User ${userId} role changed to ${newRole} by admin ${adminId}`,
      );

      return getSafeUser(user);
    } catch (error) {
      logger.error(
        `Error changing role for user ${userId}`,
        error instanceof Error ? error : new Error(String(error)),
      );
      throw error;
    }
  },
};

export default authService;
