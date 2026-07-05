import api from './api';

class EmployeeService {
  async getEmployees(params = {}) {
    const response = await api.get('/employees', { params });
    return response.data;
  }

  async getEmployeeById(id) {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  }

  async createEmployee(employeeData) {
    const response = await api.post('/employees', employeeData);
    return response.data;
  }

  async updateEmployee(id, employeeData) {
    const response = await api.put(`/employees/${id}`, employeeData);
    return response.data;
  }

  async deleteEmployee(id) {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  }

  async getEmployeeTaskStats(id) {
    const response = await api.get(`/employees/${id}/stats`);
    return response.data;
  }

  async getActiveEmployees() {
    const response = await api.get('/employees/active');
    return response.data;
  }

  async searchEmployees(query) {
    const response = await api.get('/employees/search', { params: { query } });
    return response.data;
  }
}

export default new EmployeeService();