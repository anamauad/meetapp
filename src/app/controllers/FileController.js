import File from '../models/File';

class FileController {
  async store(req, res) {
    const {
      originalname: name,
      filename: path,
      mimetype,
      encoding,
      size,
    } = req.file;

    const file = await File.create({
      name,
      mimetype,
      path,
      encoding,
      size,
    });
    return res.json(file);
  }
}
export default new FileController();
