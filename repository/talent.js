const db = require('../db');
const { ResourceNotFound, ResourceValidationError } = require('./errors');
const talentAlgoliaIndex = require('../talentAlgoliaIndex');

// talentAlgoliaIndex.saveObject({
//   objectID: 1,
//   name: 'df',
//   description: 'sdfs'
// }).catch(e => console.log(e));

// talentAlgoliaIndex.partialUpdateObject({
//   objectID: 1,
//   name: '1231231',
//   description: '333333'
// });

// talentAlgoliaIndex.deleteObject(1).catch(e => console.log(e));

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

    const ids = await db('talent')
      .insert({
        name, description, profile_picture_path,
        created_at: new Date()
      });
    const id = ids[0];

    await talentAlgoliaIndex.saveObject({
      objectID: id,
      name,
      description
    });
  }

  async find(id) {
    const result = await db('talent').select().where({ id }).limit(1).first();

    if (!result) {
      throw new ResourceNotFound();
    }

    return result;
  }

  async findAll() {
    return await db('talent').select().orderBy('created_at', 'desc');
  }

  async search(query) {
    // TODO: pagination, if needed.

    const { hits } = await talentAlgoliaIndex.search(query);
    const ids = hits.map(hit => hit.objectID);
    const unorderedTalents = await db('talent').select().whereIn('id', ids).orderBy('created_at', 'desc');
    const talentsById = {}
    for (const talent of unorderedTalents) {
      talentsById[talent.id] = talent;
    }

    let talents = []
    for (const id of ids) {
      const talent = talentsById[id];

      if (talent === null || talent === undefined) {
        // talents in algolia out of sync with database.
        console.log(`Talent of ${id} is stored in algolia but not found in database.`);
      } else {
        talents.push(talent);
      }
    }

    return talents
  }
}

module.exports = new TalentRepository();
