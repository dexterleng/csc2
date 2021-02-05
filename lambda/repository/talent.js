const db = require('../db');
const { ResourceNotFound, ResourceValidationError } = require('./errors');
const talentAlgoliaIndex = require('../talentAlgoliaIndex');

// talentAlgoliaIndex.saveObject({
//   objectID: 1,
//   name: 'df',
//   description: 'sdfs'
// }).catch(e => console.log(e));


class TalentRepository {
  validate({ name, description, profile_picture_path }) {
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

    return validationErrors;
  }

  async insert(data) {
    const { name, description, profile_picture_path } = data;
    const validationErrors = this.validate(data);

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

  async update(id, data) {
    // TODO: consider deleting previous image
    const { name, description, profile_picture_path } = data;
    const validationErrors = this.validate(data);

    if (validationErrors.length > 0) {
      throw new ResourceValidationError(validationErrors);
    }

    // assert the presence of the talent
    await this.find(id);

    await db('talent')
      .where('id', id)
      .update({
        name, description, profile_picture_path,
        updated_at: new Date()
      });

    await talentAlgoliaIndex.partialUpdateObject({
      objectID: id,
      name,
      description,
    });
  }

  async find(id) {
    const result = await this._find(id);

    if (!result) {
      throw new ResourceNotFound();
    }

    return result;
  }

  async _find(id) {
    const result = await db('talent').select().where({ id }).limit(1).first();
    return result;
  }

  validatePagination({ limit, offset }) {
    const validationErrors = [];
    if (limit === undefined || limit === null || (typeof(limit) !== 'number') || (isNaN(limit)) || (limit < 0)) {
      validationErrors.push({
        field: 'limit',
        description: 'field must be a non-negative integer'
      });
    }

    if (offset === undefined || offset === null || (typeof(offset) !== 'number') || (isNaN(offset)) || (offset < 0)) {
      validationErrors.push({
        field: 'offset',
        description: 'field must be a non-negative integer'
      });
    }

    return validationErrors;
  }

  async findAll({ limit, offset }) {
    limit = parseInt(limit)
    offset = parseInt(offset)

    const validationErrors = this.validatePagination({ limit, offset });

    if (validationErrors.length > 0) {
      throw new ResourceValidationError(validationErrors);
    }

    return await db('talent')
      .select()
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }

  async search({ query, limit, offset }) {
    limit = parseInt(limit)
    offset = parseInt(offset)

    const validationErrors = this.validatePagination({ limit, offset });

    if (validationErrors.length > 0) {
      throw new ResourceValidationError(validationErrors);
    }

    const { hits } = await talentAlgoliaIndex.search(query, {
      hitsPerPage: limit,
      offset: offset
    });
    const ids = hits.map(hit => hit.objectID);
    const unorderedTalents = await db('talent').select().whereIn('id', ids);
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

  async delete(id) {
    // TODO: Consider deleting the image from disk/s3

    const talent = await this._find(id);
    await db('talent').where('id', talent.id).delete();

    await talentAlgoliaIndex.deleteObject(talent.id)
  }
}

module.exports = new TalentRepository();
