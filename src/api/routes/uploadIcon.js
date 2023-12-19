const formidable = require('formidable');
const { renameSync } = require('fs');
const path = require('path');
// const debug = require('../../util/debug');

module.exports = {
  type: 'post',
  route: 'upload/icon',
  exec: (request, response) => {
    const form = new formidable.IncomingForm({
      uploadDir: path.resolve('./src/app/assets/icons')
    });
    // Parse `req` and upload all associated files
    form.parse(request, (err, fields, files) => {
      if (err) {
        return response.status(400).json({ error: err.message });
      }

      const nfp = files.file[0].filepath;
      renameSync(nfp, nfp + '_' + files.file[0].originalFilename);
      response.send({ oldName: files.file[0].originalFilename, newName: files.file[0].newFilename + '_' + files.file[0].originalFilename });
    });
  }
};
