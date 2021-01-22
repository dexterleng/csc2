const db = require('../db');

class TalentRepository {
  async insert({ name, description, profile_picture_path }) {
    // TODO: validations    

    await db('talent')
      .insert({
        name, description, profile_picture_path,
        created_at: new Date()
      });
  }

  async find(id) {
    const result = await db('talent').select().where({ id }).limit(1).first();

    // TODO: throw ResourceNotFound
    if (!result) {
      throw new Error('not found');
    }

    return result;
  }
}

module.exports = new TalentRepository();
