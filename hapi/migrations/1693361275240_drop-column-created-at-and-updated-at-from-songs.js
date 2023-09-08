exports.up = (pgm) => {
  pgm.dropColumn('songs', 'created_at');
  pgm.dropColumn('songs', 'updated_at');
};

exports.down = (pgm) => {
  pgm.addColumns('songs', {
    created_at: {
      type: 'TEXT',
      notNull: true,
    },
    updated_at: {
      type: 'TEXT',
      notNull: true,
    },
  });
};
