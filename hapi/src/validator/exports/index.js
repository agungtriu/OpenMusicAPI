const { InvariantError } = require('../../exceptions');
const { ExportPlaylistsPayloadSchema } = require('./schema');

const ExportPlaylistsValidator = {
  validateExportPayload: (payload) => {
    const validationResult = ExportPlaylistsPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = ExportPlaylistsValidator;
