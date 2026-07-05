import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { toast } from 'react-toastify';

export const fetchTasks = createAsyncThunk(
  'tasks/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/tasks', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
    }
  }
);

export const fetchTaskStats = createAsyncThunk(
  'tasks/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/tasks/stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch task stats');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/create',
  async (taskData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      Object.keys(taskData).forEach(key => {
        if (taskData[key] !== null && taskData[key] !== undefined) {
          formData.append(key, taskData[key]);
        }
      });
      
      const response = await api.post('/tasks', formData);
      
      toast.success('Task created successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create task';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key]);
        }
      });
      
      const response = await api.put(`/tasks/${id}`, formData);
      
      toast.success('Task updated successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update task';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${id}`);
      toast.success('Task deleted successfully');
      return id;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete task';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// ✅ NEW: Delete attachment from task
export const deleteAttachment = createAsyncThunk(
  'tasks/deleteAttachment',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/tasks/${id}/attachment`);
      toast.success('Attachment deleted successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete attachment';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  tasks: [],
  total: 0,
  currentPage: 1,
  totalPages: 1,
  stats: {
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0
  },
  isLoading: false,
  error: null
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setPage: (state, action) => {
      state.currentPage = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload.tasks || [];
        state.total = action.payload.total || 0;
        state.currentPage = action.payload.page || 1;
        state.totalPages = action.payload.totalPages || 1;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchTaskStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload.task);
        state.total += 1;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(task => task.id === action.payload.task.id);
        if (index !== -1) {
          state.tasks[index] = action.payload.task;
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(task => task.id !== action.payload);
        state.total -= 1;
      })
      // ✅ NEW: Handle delete attachment
      .addCase(deleteAttachment.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(task => task.id === action.payload.task.id);
        if (index !== -1) {
          state.tasks[index] = action.payload.task;
        }
      });
  }
});

export const { clearError, setPage } = taskSlice.actions;
export default taskSlice.reducer;