import { Readable } from 'stream';

export interface IFile {
  filename?: string;
  mimetype?: string;
  encoding?: BufferEncoding;
  content: Readable;
}
