/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.dropColumn('albums', 'created_at');
  pgm.dropColumn('albums', 'updated_at');
};

exports.down = (pgm) => {};
