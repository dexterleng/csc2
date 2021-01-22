
exports.up = function(knex) {
  return knex.schema.createTable('talent', function(t) {
    t.increments('id').unsigned().primary();
    t.string('name').notNull();
    t.string('profile_picture_path').notNull();
    t.dateTime('created_at').notNull();
    t.dateTime('updated_at').nullable();
    t.dateTime('deleted_at').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('talent');
};
