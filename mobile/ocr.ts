export async function recognizePhoto(_photo: string, _signal: AbortSignal, _progress: (message: string) => void): Promise<string> {
  throw Error('Native OCR is not configured yet. Use the desktop web app for local OCR; phone acceptance comes later.');
}
