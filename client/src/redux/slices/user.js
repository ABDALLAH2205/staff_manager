import { createSlice } from '@reduxjs/toolkit';
import sum from 'lodash/sum';
import uniqBy from 'lodash/uniqBy';
import axios from '../../utils/axios';
import { dispatch } from '../store';
import {
  ACTION_DELETE,
  ACTION_FETCH_ALL,
  ACTION_UPDATE,
  ACTION_USERS_DELETE,
  ACTION_USERS_FETCH_ALL,
  ACTION_USERS_UPDATE,
} from 'src/pages/dashboard/create-request-form/ids.constant';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  isLoadingNotifs: false,
  errorNotifs: null,
  error: null,
  success: false,
  registerSuccess: false,
  updateSuccess: false,
  token: null,
  newLogin: null,
  user: {},
  expire: null,
  notifications: undefined,
  users: {
    isLoading: false,
    error: null,
    success: false,
    successMessage: null,
    list: null,
    actionType: null,
  },
  userRequest: {
    isLoading: false,
    error: null,
    success: false,
    successMessage: null,
    requests: null,
    actionType: null,
  },
};

const slice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    /**
     * Sets the isLoading property of the state object to true.
     *
     * @param {Object} state - The state object.
     * @return {void}
     */
    startLoading(state) {
      state.isLoading = true;
    },

    startLoadingNotifs(state) {
      state.isLoadingNotifs = true;
    },

    /**
     * Sets the isLoading property of the userRequest state object to true.
     *
     * @param {Object} state - The state object.
     * @param {Object} action - The action object containing payload data.
     * @return {void}
     */
    startUserRequestLoading(state, action) {
      if (state && state.userRequest) {
        state.userRequest.successMessage = null;
        state.userRequest.isLoading = true;
        state.userRequest.actionType = action?.payload?.actionType ?? null;
      }
    },

    /**
     * Sets the successMessage, isLoading, and actionType properties of the users state object to null, true, and the actionType from the payload respectively.
     *
     * @param {Object} state - The state object.
     * @param {Object} action - The action object containing payload data.
     * @return {void}
     */
    startUsersLoading(state, action) {
      state.users.successMessage = null;
      state.users.isLoading = true;
      state.users.actionType = action?.payload?.actionType || null;
    },

    /**
     * Updates the state when an error occurs.
     *
     * @param {Object} state - The current state of the user slice.
     * @param {Object} action - The action object containing the payload data.
     */
    hasError(state, action) {
      console.log(action);
      state.isLoading = false;
      state.error = action.payload?.error;
      state.success = false;
      state.registerSuccess = false;
      state.updateSuccess = false;
      // state.expire = null;
      // state.token = null;
      // state.user = null;
    },

    /**
     * Updates the state when an error occurs in the user request.
     *
     * @param {Object} state - The current state of the user slice.
     * @param {Object} action - The action object containing the payload data.
     */
    hasErrorUserRequest(state, action) {
      state.userRequest.isLoading = false;
      state.userRequest.error = action.payload?.error;
      state.userRequest.success = false;
      state.userRequest.successMessage = null;
    },

    hasErrorUsers(state, action) {
      state.users.isLoading = false;
      state.users.error = action.payload?.error;
      state.users.success = false;
      state.users.successMessage = null;
    },

    /**
     * Initializes the user request state object with default values.
     *
     * @param {Object} state - The current state of the user slice.
     * @param {Object} action - The action object containing the payload data.
     */
    initializeUserRequest(state, action) {
      state.userRequest = {
        error: null,
        isLoading: false,
        success: false,
        successMessage: null,
        requests: null,
        actionType: action?.payload?.actionType ?? null,
        actionTimeExpire: null,
      };
    },

    /**
     * Updates the user login success state based on the action payload.
     *
     * @param {Object} state - The current state of the user slice.
     * @param {Object} action - The action object containing payload data.
     */
    loginSuccess(state, action) {
      state.isLoading = false;
      state.user = action.payload.data.user;
      state.token = action.payload.data.token;
      state.success = true;
      state.registerSuccess = false;
      state.updateSuccess = false;
      state.expire = action.payload.data.expire;
      state.error = null;

      localStorage.removeItem('authToken');
      localStorage.removeItem('loggedIsAdmin');

      // Enregistrer le token dans le cache
      localStorage.setItem('authToken', action.payload.data.token);
      localStorage.setItem('loggedIsAdmin', action.payload.data.isAdmin);
    },

    /**
     * Resets the user state by setting the user, token, expire, and success properties to null or false.
     *
     * @param {Object} state - The current state of the user slice.
     */
    logout(state) {
      state.user = null;
      state.token = null;
      state.expire = null;
      state.success = null;
      state.registerSuccess = null;
      state.updateSuccess = null;
      state.error = null;
      state.isLoading = false;
      state.notifications = undefined;
      state.userRequest = {
        error: null,
        isLoading: false,
        success: false,
        successMessage: null,
        requests: null,
        actionType: null,
        actionTimeExpire: null,
      };
    },

    /**
     * Updates the user registration success state based on the action payload.
     *
     * @param {Object} state - The current state of the user slice.
     * @param {Object} action - The action object containing payload data.
     */
    registerSuccess(state, action) {
      state.user = action.payload.data.user;
      state.token = action.payload.data.token;
      state.expire = action.payload.data.expire;
      state.isLoading = false;
      state.success = false;
      state.updateSuccess = false;
      state.registerSuccess = true;
      state.error = null;
    },

    /**
     * Updates the account success state based on the action payload.
     *
     * @param {Object} state - The current state of the user slice.
     * @param {Object} action - The action object containing payload data.
     */
    updateAccountSuccess(state, action) {
      state.user = action.payload.data;
      state.isLoading = false;
      state.updateSuccess = true;
      state.error = null;
    },

    /**
     * Updates the account success state based on the action payload.
     *
     * @param {Object} state - The current state of the user slice.
     * @param {Object} action - The action object containing payload data.
     */
    getNotificationSuccess(state, action) {
      state.notifications = action.payload.data;
      state.isLoadingNotifs = false;
      state.errorNotifs = null;
    },

    /**
     * Marks all notifications as read by clearing the notifications array and
     * resetting the loading and error state.
     *
     * @param {Object} state - The current state of the user slice.
     * @return {void}
     */
    markAllAsReadSuccess(state) {
      state.notifications = [];
      state.isLoadingNotifs = false;
      state.errorNotifs = null;
    },

    /**
     * Updates the state with the success of getting user requests.
     *
     * @param {Object} state - The current state of the user slice.
     * @param {Object} action - The action object containing payload data.
     * @return {void}
     */
    getUserRequestSuccess(state, action) {
      state.userRequest.isLoading = false;
      state.userRequest.success = true;
      state.userRequest.successMessage = action.payload.message;
      state.userRequest.requests = action.payload.data;
    },

    /**
     * Updates the state with the success of storing a user request.
     *
     * @param {Object} state - The current state of the user slice.
     * @param {Object} action - The action object containing payload data.
     */
    storeUserRequestSuccess(state, action) {
      state.userRequest.isLoading = false;
      state.userRequest.success = true;
      // state.userRequest.requests.push(action.payload.data);
    },

    /**
     * Updates the state with the success of deleting a user request.
     *
     * @param {Object} state - The current state of the user slice.
     * @param {Object} action - The action object containing payload data.
     */
    deleteUserRequestSuccess(state, action) {
      state.userRequest.isLoading = false;
      state.userRequest.success = true;
      state.userRequest.actionType = ACTION_DELETE;
      state.userRequest.error = null;
      // state.userRequest.requests = null; // onDelete clear request list
      // Ajouter 10 secondes d'expiration
      const currentTime = new Date().getTime();
      state.userRequest.actionTimeExpire = currentTime + 10000; // 10 secondes en millisecondes
    },

    /**
     * Updates the state with the success of retrieving users.
     *
     * @param {Object} state - The current state of the user slice.
     * @param {Object} action - The action object containing payload data.
     */
    getUsersSuccess(state, action) {
      state.users.isLoading = false;
      state.users.success = true;
      state.users.successMessage = action.payload.message;
      state.users.list = action.payload.data;
      state.users.actionType = ACTION_USERS_FETCH_ALL;
    },

    /**
     * Updates the state with the success of updating a single user.
     *
     * @param {Object} state - The current state of the users slice.
     * @param {Object} action - The action object containing payload data.
     * @return {void}
     */
    updateSingleUserSuccess(state, action) {
      state.users.isLoading = false;
      state.users.success = true;
      state.users.successMessage = action.payload.message;
      state.users.list = null;
      state.users.actionType = ACTION_USERS_UPDATE;
    },

    /**
     * Updates the state with the success of deleting a single user.
     *
     * @param {Object} state - The current state of the users slice.
     * @param {Object} action - The action object containing payload data.
     * @return {void}
     */
    deleteSingleUserSuccess(state, action) {
      state.users.isLoading = false;
      state.users.success = true;
      state.users.successMessage = action.payload.message;
      state.users.list = null;
      state.users.actionType = ACTION_USERS_DELETE;
    },
  },
});

// Reducer
export default slice.reducer;

// Actions
export const { logout } = slice.actions;

// ----------------------------------------------------------------------

/**
 * Initiates the login process by sending a request to the server to authenticate the user.
 *
 * @param {type} matemp - Description of the parameter matemp
 * @param {type} password - Description of the parameter password
 * @return {type} Description of the return value
 */
export function login(matemp, password) {
  return async () => {
    dispatch(slice.actions.startLoading());
    // localStorage.removeItem('authToken');
    // localStorage.removeItem('loggedIsAdmin');

    try {
      const response = await axios.post('/auth/login', { matemp, password });
      dispatch(slice.actions.loginSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function logout_() {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.post('/auth/logout');
    } catch (error) {
      // dispatch(slice.actions.hasError(error));
    }

    // localStorage.removeItem('authToken');
    // localStorage.removeItem('loggedIsAdmin');
    dispatch(slice.actions.logout());
  };
}

/**
 * Sends a POST request to the '/auth/register' endpoint to register a new user.
 *
 * @param {Object} payload - The data to be sent in the request body. It should contain the following properties:
 *   - nomemp: The name of the user.
 *   - premp: The prefix of the user's email.
 *   - matemp: The user's email.
 *   - foncemp: The user's phone number.
 *   - email: The user's email.
 *   - password: The user's password.
 * @return {Promise<void>} A promise that resolves when the request is successful, or rejects with an error.
 */
export function register(payload) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.post('/auth/register', payload);
      dispatch(slice.actions.registerSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

/**
 * Updates the user's account information.
 *
 * @param {Object} payload - The payload containing the updated account information.
 * @return {Promise<void>} A Promise that resolves when the account information is successfully updated.
 */
export function updateAccount(payload) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.put('/user/update-profile', payload);
      dispatch(slice.actions.updateAccountSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

/**
 * Retrieves notifications for the user.
 *
 * @param {Object} payload - The payload for fetching notifications.
 * @return {Promise<void>} A Promise that resolves when notifications are successfully fetched.
 */
export function getNotifications(payload) {
  return async () => {
    dispatch(slice.actions.startLoadingNotifs());
    try {
      if (!payload || !payload.user_id) {
        throw new Error('Invalid payload: user_id is missing');
      }

      const userId = payload.user_id;

      const response = await axios.get(`/user/${userId}/notifications`, payload);
      dispatch(slice.actions.getNotificationSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

/**
 * Mark all notifications as read.
 *
 * @return {Promise<void>} A Promise that resolves after marking all notifications as read.
 */
export function markAllNotificationAsRead() {
  return async () => {
    dispatch(slice.actions.startLoadingNotifs());
    try {
      const response = await axios.post('/user/notifications/mark-all-as-read');
      dispatch(slice.actions.markAllAsReadSuccess(response.data));
    } catch (error) {
      // dispatch(slice.actions.hasError(error));
    }
  };
}

/**
 * Retrieves user requests by sending a GET request to '/user/requests'.
 *
 * @return {Promise<void>} A Promise that resolves when user requests are successfully fetched.
 */
export function getUserRequests(payload) {
  return async () => {
    // dispatch(slice.actions.initializeUserRequest());
    dispatch(slice.actions.startUserRequestLoading({ actionType: ACTION_FETCH_ALL }));
    try {
      const response = await axios.get('/user/requests' + payload);
      dispatch(slice.actions.getUserRequestSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasErrorUserRequest(error));
    }
  };
}

/**
 * Initiates the user request process.
 *
 * @return {Promise<void>} A Promise that resolves when the user request initialization is successful.
 */
export function initUserRequest() {
  return async () => {
    dispatch(slice.actions.initializeUserRequest());
  };
}

/**
 * Saves a user request by sending a POST request to '/user/requests' endpoint.
 *
 * @param {Object} payload - The payload containing the user request data.
 * @return {Promise<void>} A Promise that resolves when the user request is successfully saved,
 * or rejects with an error if the request fails.
 */
export function saveUserRequest(payload) {
  return async () => {
    dispatch(slice.actions.startUserRequestLoading({ actionType: ACTION_UPDATE }));
    try {
      const response = await axios.post('/user/requests', payload);
      dispatch(slice.actions.storeUserRequestSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasErrorUserRequest(error));
    }
  };
}

/**
 * Deletes a user request by sending a DELETE request to '/user/requests' endpoint.
 *
 * @param {Object} payload - The payload containing the user request data to be deleted.
 * @return {Promise<void>} A Promise that resolves when the user request is successfully deleted,
 * or rejects with an error if the deletion fails.
 */
export function deleteUserRequest(payload) {
  return async () => {
    dispatch(slice.actions.startUserRequestLoading({ actionType: ACTION_DELETE }));
    try {
      const response = await axios.delete('/user/requests', { data: payload });
      dispatch(slice.actions.deleteUserRequestSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasErrorUserRequest(error));
    }
  };
}

/**
 * Fetches all users from the server.
 *
 * @param {Object} payload - The payload containing additional parameters for the request.
 * @return {Function} An asynchronous function that dispatches actions to start and complete the user loading process.
 * If the request is successful, it dispatches an action to store the fetched users. If the request fails, it dispatches an action to handle the error.
 */
export function fetchAllUsers(payload) {
  return async () => {
    dispatch(slice.actions.startUsersLoading({ actionType: ACTION_USERS_FETCH_ALL }));
    try {
      const response = await axios.get('/user/list' + (payload || ''));
      if (response && response.data) {
        dispatch(slice.actions.getUsersSuccess(response.data));
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      dispatch(slice.actions.hasErrorUsers(error));
    }
  };
}

/**
 * Updates a user by sending a PUT request to '/user/update-profile'.
 *
 * @param {Object} payload - The payload containing the user data to be updated.
 * @return {Function} An asynchronous function that dispatches actions to start and complete the user loading process.
 * If the request is successful, it dispatches an action to update the single user. If the request fails, it dispatches an action to handle the error.
 */
export function updateUser(payload) {
  return async () => {
    dispatch(slice.actions.startUsersLoading({ actionType: ACTION_USERS_UPDATE }));
    try {
      const response = await axios.put('/user/update-profile', payload);
      dispatch(slice.actions.updateSingleUserSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasErrorUsers(error));
    }
  };
}

/**
 * Deletes a user by sending a DELETE request to '/user/delete'.
 *
 * @param {Object} payload - The payload containing the user data to be deleted.
 * @return {Promise<void>} A Promise that resolves when the user is successfully deleted,
 * or rejects with an error if the deletion fails.
 */
export function deleteUser(payload) {
  return async () => {
    dispatch(slice.actions.startUsersLoading({ actionType: ACTION_USERS_DELETE }));
    try {
      const response = await axios.delete('/user/delete', { data: payload });
      dispatch(slice.actions.deleteSingleUserSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasErrorUsers(error));
    }
  };
}

// export function loggedIsUser(payload) {
//   return async () => {
//     dispatch(slice.actions.startUsersLoading({ actionType: ACTION_USERS_DELETE }));
//     try {
//       const response = await axios.delete('/user/delete', { data: payload });
//       dispatch(slice.actions.deleteSingleUserSuccess(response.data));
//     } catch (error) {
//       dispatch(slice.actions.hasErrorUsers(error));
//     }
//   };
// }
