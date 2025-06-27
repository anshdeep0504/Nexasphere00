import DataUriParser from 'datauri/parser.js';
import path from 'path';

const parser = new DataUriParser();

const getDataUri = (file) => {
    const extName = path.extname(file.originalname).toString();
    return parser.format(extName, file.buffer).content;
}

export default getDataUri;


// datauri/parser.js -> it helps convert file buffers into Data URIs (base64-encoded strings).
// path: Node.js built-in module used to work with file paths (e.g., get file extensions).


