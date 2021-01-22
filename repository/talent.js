const db = require('../db');
const { ResourceNotFound, ResourceValidationError } = require('./errors');

class TalentRepository {
  async insert({ name, description, profile_picture_path }) {
    const validationErrors = [];
    if (typeof(name) !== 'string') {
      validationErrors.push({
        field: 'name',
        description: 'field must be a string'
      });
    } else {
      if (name.length === 0) {
        validationErrors.push({
          field: 'name',
          description: 'field length must be > 0'
        });
      }
    }

    if (typeof(description) !== 'string') {
      validationErrors.push({
        field: 'description',
        description: 'field must be a string'
      }); 
    }

    if (validationErrors.length > 0) {
      throw new ResourceValidationError(validationErrors);
    }

    await db('talent')
      .insert({
        name, description, profile_picture_path,
        created_at: new Date()
      });
  }

  async find(id) {
    const result = await db('talent').select().where({ id }).limit(1).first();

    if (!result) {
      throw new ResourceNotFound();
    }

    return result;
  }
}

module.exports = new TalentRepository();
