import { Readable } from 'stream';

export async function streamToString(content: Readable, encoding: BufferEncoding = 'utf-8'): Promise<string> {
  const chunks = [];

  for await (const chunk of content) {
    chunks.push(chunk);
  }

  const buffer = Buffer.concat(chunks);
  return buffer.toString(encoding);
}
