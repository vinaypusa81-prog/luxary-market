import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { Request, Response, NextFunction } from 'express';

// Setup local upload directory
const UPLOAD_DIR = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer Storage Configuration (Local memory storage before Cloudinary/Local Save)
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpg, png, webp, gif) are allowed'));
  },
});

// Configure Cloudinary if credentials are present
const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Compression / Upload service
export const handleImageUpload = async (file: Express.Multer.File): Promise<string> => {
  if (isCloudinaryConfigured) {
    // Cloudinary upload
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'luxemarket_admin', resource_type: 'image' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result?.secure_url || '');
        }
      );
      uploadStream.end(file.buffer);
    });
  } else {
    // Local fallback: save file and return relative server URL
    const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    // Write file directly to public directory
    await fs.promises.writeFile(filePath, file.buffer);
    
    // Return relative URL path
    const serverUrl = `http://localhost:${process.env.PORT || 5001}/uploads/${filename}`;
    return serverUrl;
  }
};
