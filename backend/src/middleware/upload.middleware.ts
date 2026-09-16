import type { Request } from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../configs/cloudinary';

const createStorage = (folder: string) => new CloudinaryStorage({
  cloudinary,
  params: {
    folder,
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
  storage: createStorage('prooffolio/case-studies'),
  fileFilter: imageFileFilter,
  limits: {
    files: 5,
    fileSize: 5 * 1024 * 1024,
  },
});

const uploadProfilePicture = multer({
  storage: createStorage('prooffolio/profile-pictures'),
  fileFilter: imageFileFilter,
  limits: {
    files: 1,
    fileSize: 5 * 1024 * 1024,
  },
});

export { uploadProfilePicture };
export default uploadCaseStudyImages;
