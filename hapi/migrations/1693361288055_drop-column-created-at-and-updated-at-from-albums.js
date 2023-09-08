exports.up = (pgm) => {
  pgm.dropColumn('albums', 'created_at');
  pgm.dropColumn('albums', 'updated_at');
};

exports.down = (pgm) => {
  pgm.addColumns('albums', {
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
