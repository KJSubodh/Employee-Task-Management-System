import api from './api';

class TaskService {
  async getTasks(params = {}) {
    const response = await api.get('/tasks', { params });
    return response.data;
  }

  async getTaskById(id) {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  }

  async createTask(taskData) {
    const formData = new FormData();
    Object.keys(taskData).forEach(key => {
      if (taskData[key] !== null && taskData[key] !== undefined) {
        formData.append(key, taskData[key]);
      }
    });
    
    const response = await api.post('/tasks', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async updateTask(id, taskData) {
    const formData = new FormData();
    Object.keys(taskData).forEach(key => {
      if (taskData[key] !== null && taskData[key] !== undefined) {
        formData.append(key, taskData[key]);
      }
    });
    
    const response = await api.put(`/tasks/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async deleteTask(id) {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  }

  async getTaskStats() {
    const response = await api.get('/tasks/stats');
    return response.data;
  }

  async getTasksByEmployee(employeeId, status = null) {
    const params = { employeeId };
    if (status) params.status = status;
    const response = await api.get('/tasks/employee', { params });
    return response.data;
  }

  async getUpcomingTasks(days = 3) {
    const response = await api.get('/tasks/upcoming', { params: { days } });
    return response.data;
  }

  async searchTasks(query) {
    const response = await api.get('/tasks/search', { params: { query } });
    return response.data;
  }

  async bulkUpdateStatus(taskIds, status) {
    const response = await api.put('/tasks/bulk-status', { taskIds, status });
    return response.data;
  }
}

export default new TaskService();