declare namespace Express {
  namespace Multer {
    interface File {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      size: number;
      destination?: string;
      filename?: string;
      path: string;
      buffer?: Buffer;
    }
  }
}

declare module 'multer' {
  export interface FileFilterCallback {
    (error: Error): void;
    (error: null, acceptFile: boolean): void;
  }

  export interface Options {
    storage?: StorageEngine;
    fileFilter?: (
      req: import('express').Request,
      file: Express.Multer.File,
      callback: FileFilterCallback,
    ) => void;
    limits?: Record<string, number>;
  }

  export interface StorageEngine {}

  export interface Multer {
    single(fieldName: string): import('express').RequestHandler;
    array(fieldName: string, maxCount?: number): import('express').RequestHandler;
  }

  function multer(options?: Options): Multer;
  export default multer;
}
