const multer = require('multer');

const storage = multer.memoryStorage();

// Kiểm tra định dạng file
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPG, PNG, and GIF are allowed.'), false);
    }
};

// Giới hạn kích thước file (2MB)
const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, 
    fileFilter: fileFilter
});

module.exports = upload;
