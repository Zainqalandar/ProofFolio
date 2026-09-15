import type { Request } from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../configs/cloudinary';

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'prooffolio/case-studies', // Folder in Cloudinary where the images will be stored
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    resource_type: 'image',
  } as any,
});

const imageFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: import('multer').FileFilterCallback,
): void => {
  if (file.mimetype.startsWith('image/')) {
    callback(null, true);
    return;
  }

  callback(new Error('Only image files are allowed'));
};

const uploadCaseStudyImages = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    files: 5,
    fileSize: 5 * 1024 * 1024,
  },
});

export default uploadCaseStudyImages;
