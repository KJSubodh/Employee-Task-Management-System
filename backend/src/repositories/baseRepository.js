/**
 * Base Repository
 * Provides higher-level business operations
 * Uses DAO for low-level data access
 */
class BaseRepository {
  constructor(dao) {
    this.dao = dao;
  }

  /**
   * Create a new record
   */
  async create(data) {
    return await this.dao.create(data);
  }

  /**
   * Find by ID
   */
  async findById(id, options = {}) {
    return await this.dao.findById(id, options);
  }

  /**
   * Find one with conditions
   */
  async findOne(conditions, options = {}) {
    return await this.dao.findOne(conditions, options);
  }

  /**
   * Update a record
   */
  async update(id, data) {
    const instance = await this.dao.findById(id);
    if (!instance) {
      throw new Error(`${this.dao.model.name} not found`);
    }
    return await this.dao.update(instance, data);
  }

  /**
   * Delete a record
   */
  async delete(id) {
    const instance = await this.dao.findById(id);
    if (!instance) {
      throw new Error(`${this.dao.model.name} not found`);
    }
    return await this.dao.delete(instance);
  }

  /**
   * Count records
   */
  async count(conditions = {}) {
    return await this.dao.count(conditions);
  }

  /**
   * Check if record exists
   */
  async exists(conditions) {
    return await this.dao.exists(conditions);
  }

  /**
   * Begin a transaction
   */
  async transaction(callback) {
    return await this.dao.transaction(callback);
  }

  /**
   * Get DAO instance
   */
  getDao() {
    return this.dao;
  }
}

module.exports = BaseRepository;