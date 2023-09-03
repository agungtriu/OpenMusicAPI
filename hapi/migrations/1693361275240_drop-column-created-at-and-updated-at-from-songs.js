/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.dropColumn('songs', 'created_at');
  pgm.dropColumn('songs', 'updated_at');
};

exports.down = (pgm) => {};
