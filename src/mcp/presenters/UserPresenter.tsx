/**
 * User Presenter
 * 
 * React component that presents user data and interactions.
 * Communicates with the Controller to manage state and business logic.
 */

import React, { useEffect, useState } from 'react';
import { UserController } from '../controllers/user.controller';
import { User, UserRegistration, UserState, UserUpdateRequest } from '../types/user.types';

// Create a singleton controller instance
const userController = new UserController();

/**
 * User List Presenter Component
 */
export const UserListPresenter: React.FC = () => {
  const [state, setState] = useState<UserState>(userController.getState());
  
  useEffect(() => {
    // Subscribe to controller state changes
    const unsubscribe = userController.subscribe(setState);
    
    // Load users on mount
    userController.loadUsers();
    
    // Unsubscribe on unmount
    return unsubscribe;
  }, []);
  
  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await userController.deleteUser(userId);
    }
  };
  
  if (state.isLoading) {
    return <div>Loading users...</div>;
  }
  
  if (state.error) {
    return <div className="error">{state.error}</div>;
  }
  
  return (
    <div className="user-list">
      <h2>Users</h2>
      {state.users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {state.users.map(user => (
              <tr key={user.id}>
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

/**
 * User Registration Presenter Component
 */
export const UserRegistrationPresenter: React.FC = () => {
  const [state, setState] = useState<UserState>(userController.getState());
  const [formData, setFormData] = useState<UserRegistration>({
    email: '',
    password: '',
    fullName: ''
  });
  
  useEffect(() => {
    // Subscribe to controller state changes
    const unsubscribe = userController.subscribe(setState);
    
    // Unsubscribe on unmount
    return unsubscribe;
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await userController.createUser(formData);
    
    // Reset form if successful
    if (!state.error) {
      setFormData({
        email: '',
        password: '',
        fullName: ''
      });
    }
  };
  
  return (
    <div className="user-registration">
      <h2>Register New User</h2>
      {state.error && <div className="error">{state.error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={8}
          />
        </div>
        
        <button type="submit" disabled={state.isLoading}>
          {state.isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

/**
 * User Profile Presenter Component
 */
export const UserProfilePresenter: React.FC = () => {
  const [state, setState] = useState<UserState>(userController.getState());
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserUpdateRequest>({
    fullName: '',
    email: ''
  });
  
  useEffect(() => {
    // Subscribe to controller state changes
    const unsubscribe = userController.subscribe(setState);
    
    // Unsubscribe on unmount
    return unsubscribe;
  }, []);
  
  useEffect(() => {
    // Update form data when current user changes
    if (state.currentUser) {
      setFormData({
        fullName: state.currentUser.fullName,
        email: state.currentUser.email
      });
    }
  }, [state.currentUser]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (state.currentUser) {
      await userController.updateUser(state.currentUser.id, formData);
      setIsEditing(false);
    }
  };
  
  if (!state.currentUser) {
    return <div>Please log in to view your profile.</div>;
  }
  
  return (
    <div className="user-profile">
      <h2>User Profile</h2>
      {state.error && <div className="error">{state.error}</div>}
      
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName || ''}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="button-group">
            <button type="submit" disabled={state.isLoading}>
              {state.isLoading ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="profile-info">
          <p><strong>Name:</strong> {state.currentUser.fullName}</p>
          <p><strong>Email:</strong> {state.currentUser.email}</p>
          <p><strong>Role:</strong> {state.currentUser.role}</p>
          <p><strong>Last Login:</strong> {state.currentUser.lastLoginAt?.toLocaleString() || 'Never'}</p>
          
          <button onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
          <button onClick={() => userController.logout()}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Login Presenter Component
 */
export const LoginPresenter: React.FC = () => {
  const [state, setState] = useState<UserState>(userController.getState());
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  
  useEffect(() => {
    // Subscribe to controller state changes
    const unsubscribe = userController.subscribe(setState);
    
    // Unsubscribe on unmount
    return unsubscribe;
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await userController.login(credentials);
  };
  
  // Redirect if already logged in
  if (state.currentUser) {
    return <div>You are already logged in as {state.currentUser.fullName}.</div>;
  }
  
  return (
    <div className="login-form">
      <h2>Login</h2>
      {state.error && <div className="error">{state.error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            required
          />
        </div>
        
        <button type="submit" disabled={state.isLoading}>
          {state.isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};
