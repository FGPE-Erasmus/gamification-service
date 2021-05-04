import { sign, verify } from 'jsonwebtoken';

export function createToken(
  payload: { [k: string]: any },
  expiresIn: number,
  secret: string,
  authDomain?: string,
  issuer?: string,
): string {
  return sign(payload, secret, {
    expiresIn,
    audience: authDomain,
    issuer,
  });
}

export async function verifyToken(token: string, secret: string): Promise<{ [k: string]: any }> {
  return new Promise((resolve, reject) => {
    verify(token, secret, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      console.log(decoded);
      resolve(decoded);
    });
  });
}
