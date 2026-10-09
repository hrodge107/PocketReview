import * as ImagePicker from 'expo-image-picker';
import { PHOTO_LIMIT, type SourcePage } from '../shared/lesson';
export async function selectPhotos(camera: boolean, remaining: number): Promise<SourcePage[]> {
  if (remaining <= 0) throw Error('One lesson holds at most two photos. Remove a page before adding another.');
  if (camera) {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) throw Error('Allow camera access or select an existing photo.');
  }
  const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], base64: true, quality: 1,
    allowsMultipleSelection: !camera, selectionLimit: remaining };
  const result = camera ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
  if (result.canceled) return [];
  if (result.assets.length > remaining) throw Error('Select at most two photos for this lesson. Existing pages are preserved.');
  return result.assets.map((asset, index) => {
    const photo = asset.uri.startsWith('data:') ? asset.uri : `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64 || ''}`;
    if (!/^data:image\/(png|jpeg|webp);base64,/.test(photo) || !asset.base64) throw Error('Choose a PNG, JPEG or WebP photo.');
    if (photo.length > PHOTO_LIMIT || asset.width * asset.height > 12000000) throw Error('Use a smaller crop: at most 2 MiB of encoded image data and 12 million pixels per photo.');
    return { id: `page-${Date.now()}-${index}`, name: asset.fileName || `Photo ${index + 1}`, photo,
      rawText: '', correctedText: '', ocrState: 'pending', error: null };
  });
}
