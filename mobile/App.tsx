import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, ink, paper } from './controls';
import { SourceScreen } from './SourceScreen';
import { ReviewerScreen } from './ReviewerScreen';
import { useLesson } from './use-lesson';
import { prepareOffline } from './offline';
export default function App() {
  const state = useLesson(), [stage, setStage] = useState('setup'), [busy, setBusy] = useState(false);
  const [offline, setOffline] = useState('Downloading offline files...'), [offlineError, setOfflineError] = useState(false);
  async function offlineSetup() { setOfflineError(false); setOffline('Downloading offline files...');
    try { setOffline(await prepareOffline()); } catch (error) { setOffline(error instanceof Error ? error.message : 'Offline download failed. Retry.'); setOfflineError(true); } }
  useEffect(() => { void offlineSetup(); }, []);
  return <View style={styles.root}>
    <View style={styles.nav}>{['setup','source','reviewer'].map(name => <Button key={name} disabled={busy}
      label={stage === name ? `${name[0].toUpperCase()+name.slice(1)} selected` : `Show ${name}`}
      onPress={() => setStage(name)} />)}</View>
    {stage === 'setup' && <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.small}>PocketReview / Mock MVP</Text>
      <Text accessibilityRole="header" style={styles.title}>A lesson you can return to</Text>
      <Text style={styles.body}>Photograph a printed lesson, correct its text, then study with five cards and a three-question quiz.</Text>
      <Text style={styles.notice}>Mock AI only. No model runs, no endpoint is used, and your photos and text stay on this device.</Text>
      <Text style={styles.body}>Start with your own photos in Source, or try the built-in lesson. The demo contains typed sample text and an image placeholder; it does not demonstrate photo OCR.</Text>
      <Button primary label="Try the demo lesson" disabled={!state.ready || !!state.saveError || state.lesson.pages.length > 0}
        onPress={() => { void state.loadDemo().then(() => setStage('source')); }} />
      {state.lesson.pages.length > 0 && <Text style={styles.body}>Your lesson is already here. Open Source to confirm it or Reviewer to continue studying.</Text>}
      <Text style={styles.body}>English and Filipino demo questions and answers are handwritten fixtures. Other source text uses copied excerpts, without translation or reasoning. Mock chat uses keyword matching and can miss relevant questions.</Text>
      <Text style={styles.body}>Desktop web OCR runs locally. Native phone OCR still needs a later development build and device check. Saved study works offline after the app finishes downloading its offline files.</Text>
      <Text accessibilityLiveRegion="polite" style={styles.body}>{offline}</Text>
      {offlineError && <Button label="Retry offline download" onPress={() => void offlineSetup()} />}
      <Button label="Open source" onPress={() => setStage('source')} />
    </ScrollView>}
    <View style={{ flex: 1, display: stage === 'source' ? 'flex' : 'none' }}><SourceScreen state={state} onBusyChange={setBusy} /></View>
    <View style={{ flex: 1, display: stage === 'reviewer' ? 'flex' : 'none' }}><ReviewerScreen state={state} onBusyChange={setBusy} /></View>
  </View>;
}
const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: paper }, nav: { padding: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 12, borderBottomWidth: 1, borderColor: ink },
  page: { padding: 24, gap: 24, width: '100%', maxWidth: 850, alignSelf: 'center' }, title: { fontSize: 34, fontWeight: '600', color: ink },
  body: { fontSize: 17, lineHeight: 27, color: ink }, small: { fontSize: 14, color: ink }, notice: { fontSize: 17, lineHeight: 27, color: ink, borderLeftWidth: 3, borderColor: ink, paddingLeft: 16 } });
