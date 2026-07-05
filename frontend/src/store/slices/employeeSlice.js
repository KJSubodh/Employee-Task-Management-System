import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { toast } from 'react-toastify';

export const fetchEmployees = createAsyncThunk(
  'employees/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/employees', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch employees');
    }
  }
);

export const createEmployee = createAsyncThunk(
  'employees/create',
  async (employeeData, { rejectWithValue }) => {
    try {
      const response = await api.post('/employees', employeeData);
      toast.success('Employee created successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create employee';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateEmployee = createAsyncThunk(
  'employees/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/employees/${id}`, data);
      toast.success('Employee updated successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update employee';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteEmployee = createAsyncThunk(
  'employees/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/employees/${id}`);
      toast.success('Employee deleted successfully');
      return id;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete employee';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  employees: [],
  total: 0,
  currentPage: 1,
  totalPages: 1,
  isLoading: false,
  error: null
};

const employeeSlice = createSlice({
  name: 'employees',
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
      .addCase(fetchEmployees.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.isLoading = false;
        state.employees = action.payload.employees || [];
        state.total = action.payload.total || 0;
        state.currentPage = action.payload.page || 1;
        state.totalPages = action.payload.totalPages || 1;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.employees.unshift(action.payload.employee);
        state.total += 1;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        const index = state.employees.findIndex(emp => emp.id === action.payload.employee.id);
        if (index !== -1) {
          state.employees[index] = action.payload.employee;
        }
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.employees = state.employees.filter(emp => emp.id !== action.payload);
        state.total -= 1;
      });
  }
});

export const { clearError, setPage } = employeeSlice.actions;
export default employeeSlice.reducer;