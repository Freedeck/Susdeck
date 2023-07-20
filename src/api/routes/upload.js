const formidable = require('formidable');
const path = require('path');

module.exports = {
  type: 'post',
  route: 'upload',
  exec: (request, response) => {
    const form = new formidable.IncomingForm({
      uploadDir: path.resolve('./src/app/assets/icons')
    });
    // Parse `req` and upload all associated files
    form.parse(request, function (err, fields, files) {
      if (err) {
        return response.status(400).json({ error: err.message });
      }

      console.log(files, fields);
      response.json({ files, fields });
    });
  }
};
