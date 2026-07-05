/**
 * Base DAO - Provides low-level CRUD operations
 * All DAOs extend this class for basic database operations
 */
class BaseDao {
  constructor(model) {
    this.model = model;
  }

  /**
   * Create a new record
   */
  async create(data, options = {}) {
    return await this.model.create(data, options);
  }

  /**
   * Bulk create records
   */
  async bulkCreate(data, options = {}) {
    return await this.model.bulkCreate(data, options);
  }

  /**
   * Find all records
   */
  async findAll(options = {}) {
    return await this.model.findAll(options);
  }

  /**
   * Find a record by primary key
   */
  async findById(id, options = {}) {
    return await this.model.findByPk(id, options);
  }

  /**
   * Find one record with conditions
   */
  async findOne(conditions, options = {}) {
    return await this.model.findOne({
      where: conditions,
      ...options
    });
  }

  /**
   * Find and count all records (with pagination)
   */
  async findAndCountAll(options = {}) {
    return await this.model.findAndCountAll(options);
  }

  /**
   * Update a record
   */
  async update(instance, data) {
    return await instance.update(data);
  }

  /**
   * Update records matching conditions
   */
  async updateWhere(conditions, data) {
    return await this.model.update(data, { where: conditions });
  }

  /**
   * Delete a record
   */
  async delete(instance) {
    return await instance.destroy();
  }

  /**
   * Delete records matching conditions
   */
  async deleteWhere(conditions) {
    return await this.model.destroy({ where: conditions });
  }

  /**
   * Count records
   */
  async count(conditions = {}) {
    return await this.model.count({ where: conditions });
  }

  /**
   * Check if record exists
   */
  async exists(conditions) {
    const count = await this.count(conditions);
    return count > 0;
  }

  /**
   * Execute raw SQL query
   */
  async rawQuery(query, replacements = {}) {
    return await this.model.sequelize.query(query, { 
      replacements,
      type: this.model.sequelize.QueryTypes.SELECT
    });
  }

  /**
   * Execute raw SQL query (any type)
   */
  async rawQueryAll(query, replacements = {}) {
    return await this.model.sequelize.query(query, { replacements });
  }

  /**
   * Begin a transaction
   */
  async transaction(callback) {
    return await this.model.sequelize.transaction(callback);
  }

  /**
   * Get the model instance
   */
  getModel() {
    return this.model;
  }

  /**
   * Get the sequelize instance
   */
  getSequelize() {
    return this.model.sequelize;
  }
}

module.exports = BaseDao;