const UserRepository = require('../repositories/userRepository');

class EmployeeService {
  constructor() {
    this.userRepository = UserRepository;
  }

  async getEmployees(params) {
    return await this.userRepository.getEmployees(params);
  }

  async getEmployeeById(id) {
    const employee = await this.userRepository.getEmployeeById(id);
    if (!employee) {
      throw new Error('Employee not found');
    }
    return employee;
  }

  async createEmployee(employeeData) {
    return await this.userRepository.createEmployee(employeeData);
  }

  async updateEmployee(id, updateData) {
    return await this.userRepository.updateEmployee(id, updateData);
  }

  async deleteEmployee(id) {
    return await this.userRepository.deleteEmployee(id);
  }

  async getEmployeeTaskStats(id) {
    const stats = await this.userRepository.getEmployeeTaskStats(id);
    if (!stats) {
      throw new Error('Employee not found');
    }
    return stats;
  }

  async getActiveEmployees() {
    return await this.userRepository.getActiveEmployees();
  }

  async searchEmployees(query) {
    return await this.userRepository.searchEmployees(query);
  }

  async getEmployeeByEmail(email) {
    return await this.userRepository.findByEmail(email);
  }

  async getEmployeesWithTaskCounts() {
    return await this.userRepository.getEmployeesWithTaskCounts();
  }

  // ADDED: lightweight summary used by the admin dashboard to show
  // "Total Employees". Reuses userRepository.getStats() (which already
  // counts admins/employees/active/inactive) and just surfaces the
  // employee count specifically.
  async getEmployeeStatsSummary() {
    const stats = await this.userRepository.getStats();
    return { total: stats.employees };
  }
}

module.exports = new EmployeeService();