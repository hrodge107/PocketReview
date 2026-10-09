import { Share } from 'react-native';
import { serializeEvidence, type Evidence } from './evidence';
export async function exportEvidence(data: Evidence): Promise<void> {
  await Share.share({ title: 'PocketReview setup evidence', message: serializeEvidence(data) });
}
