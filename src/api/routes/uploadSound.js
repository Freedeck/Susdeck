const formidable = require('formidable');
const { renameSync } = require('fs');
const path = require('path');

module.exports = {
  type: 'post',
  route: 'upload/sounds',
  exec: (request, response) => {
    const form = new formidable.IncomingForm({
      uploadDir: path.resolve('./src/app/assets/sounds')
    });
    // Parse `req` and upload all associated files
    form.parse(request, function (err, fields, files) {
      if (err) {
        return response.status(400).json({ error: err.message });
      }

      const nfp = files.file[0].filepath;
      const ext = files.file[0].mimetype.split('/')[1];

      renameSync(nfp, nfp + '.' + ext);
      response.send({ oldName: files.file[0].originalFilename, newName: files.file[0].newFilename + '.' + ext });
    });
  }
};
