import { useEffect } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { confirmationError, SOURCE_LIMIT } from '../shared/lesson';
import { Button, paper, ink } from './controls';
import type { LessonState } from './use-lesson';
export function SourceScreen({ state, onBusyChange }: { state: LessonState; onBusyChange: (busy: boolean) => void }) {
  const { width } = useWindowDimensions();
  useEffect(() => { onBusyChange(!!state.busy); }, [state.busy, onBusyChange]);
  const count = state.lesson.pages.reduce((total, page) => total + page.correctedText.length, 0);
  const reason = confirmationError(state.lesson), busy = !!state.busy;
  return <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.page, { padding: width < 600 ? 20 : 40 }]}>
      <Text style={styles.small}>PocketReview / Source / 02</Text>
      <Text accessibilityRole="header" style={[styles.title, width < 600 && { fontSize: 30 }]}>Read it before you study it</Text>
      <Text style={styles.body}>{Platform.OS === 'web' ? 'Add up to two photos of printed notes. Text is read on this device. Compare each page with its photo and correct any mistakes before confirming.' : 'Add up to two photos and compare each page with its corrected text. Native OCR is not configured yet; use desktop web for local recognition. You can enter source text manually here.'}</Text>
      <View style={styles.actions}>
        <Button primary label="Select photos" disabled={busy || !state.ready || !!state.saveError || state.lesson.pages.length >= 2} onPress={() => void state.add(false)} />
        <Button label="Take a photo" disabled={busy || !state.ready || !!state.saveError || state.lesson.pages.length >= 2} onPress={() => void state.add(true)} />
        {state.canCancel && <Button label="Cancel OCR" onPress={state.cancel} />}
      </View>
      <Text accessibilityLiveRegion="polite" style={styles.small}>{busy || (!state.ready && !state.readError ? 'Reading your saved source...' : `${state.lesson.pages.length}/2 photos`)}</Text>
      {state.error && <Text accessibilityRole="alert" style={styles.error}>{state.error}</Text>}
      {state.readError && <View><Text accessibilityRole="alert" style={styles.error}>{state.readError}</Text><Button label="Retry reading lesson" onPress={() => void state.load()} /></View>}
      {state.saveError && <View><Text accessibilityRole="alert" style={styles.error}>Not saved. {state.saveError}</Text><Button label="Retry saving lesson" disabled={busy} onPress={() => void state.retrySave()} /></View>}
      {!state.lesson.pages.length && <Text style={styles.empty}>Your lesson starts with a printed page. Use a clear, well-lit photo; diagrams and handwriting are outside this demo.</Text>}
      {state.lesson.pages.map((page, index) => <View key={page.id} style={styles.pageSection}>
        <Text accessibilityRole="header" style={styles.heading}>Page {index + 1}</Text>
        <Text style={styles.small}>{page.name} / {page.id}</Text>
        <View style={[styles.spread, width >= 900 && { flexDirection: 'row', gap: 32 }]}>
          <View style={[styles.column, width >= 900 && { flex: 1 }]}><Image accessibilityLabel={`Source photo ${index + 1}`} source={{ uri: page.photo }} style={styles.image} resizeMode="contain" /></View>
          <View style={[styles.column, width >= 900 && { flex: 1 }]}>
            <Text style={styles.label}>Corrected text</Text>
            <TextInput accessibilityLabel={`Corrected text page ${index + 1}`} multiline value={page.correctedText} onChangeText={text => state.edit(page.id, text)} editable={!busy && state.ready} style={styles.input} placeholder="Type or correct the text from this photo" placeholderTextColor="#545454" />
            {page.error && <Text accessibilityRole="alert" style={styles.error}>{page.error}</Text>}
            <Text style={styles.label}>Original OCR</Text>
            <Text selectable style={styles.raw}>{page.rawText || (page.ocrState === 'pending' ? 'Not read yet. Retry OCR or type the source above.' : 'No text extracted.')}</Text>
            <Text style={styles.small}>Retrying OCR replaces this page's corrected text. Editing or removing source resets derived study material and requires confirmation again.</Text>
            <View style={styles.actions}>
              <Button label={`Retry OCR page ${index + 1}`} disabled={busy || !state.ready || !!state.saveError} onPress={() => void state.retry(page.id)} />
              <Button label={`Remove page ${index + 1}`} disabled={busy || !state.ready} onPress={() => state.remove(page.id)} />
            </View>
          </View>
        </View>
      </View>)}
      <View style={styles.confirm}>
        <Text style={styles.heading}>Confirm this source</Text>
        <Text style={styles.small}>{count}/{SOURCE_LIMIT} characters; about {Math.ceil(count / 3)} tokens (characters divided by 3, an estimate).</Text>
        {reason && <Text style={styles.body}>{reason}</Text>}
        <Button primary label={state.lesson.confirmed ? 'Source confirmed' : 'Confirm corrected text'} disabled={busy || !state.ready || !!state.saveError || !!reason || state.lesson.confirmed} onPress={() => void state.confirm()} />
        <Text accessibilityLiveRegion="polite" style={styles.body}>{state.saved ? state.lesson.confirmed ? 'Confirmed source saved on this device.' : 'Draft source saved on this device.' : state.lesson.pages.length ? 'Source is in memory; saving is pending or failed.' : 'No source saved yet.'}</Text>
        <Text style={styles.small}>Revision {state.lesson.revision}. Open Reviewer after confirming the source. Native OCR and camera behavior need later phone verification.</Text>
      </View>
    </ScrollView>
  </KeyboardAvoidingView>;
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: paper }, page: { maxWidth: 1200, width: '100%', alignSelf: 'center', gap: 16 },
  title: { fontSize: 38, color: ink, fontWeight: '600' }, heading: { fontSize: 22, color: ink, fontWeight: '600' },
  body: { color: ink, fontSize: 17, lineHeight: 26 }, small: { color: ink, fontSize: 14, lineHeight: 22 }, label: { color: ink, fontSize: 16, fontWeight: '600' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, empty: { paddingVertical: 32, color: ink, fontSize: 18, lineHeight: 28 },
  pageSection: { borderTopWidth: 1, borderColor: ink, paddingTop: 24, gap: 12 }, spread: { gap: 20 }, column: { minWidth: 0, gap: 12 },
  image: { width: '100%', height: 380, backgroundColor: '#ffffff' },
  input: { minHeight: 180, borderWidth: 1, borderColor: ink, borderRadius: 4, padding: 12, color: ink, fontSize: 17, lineHeight: 26, textAlignVertical: 'top' },
  raw: { color: ink, fontSize: 16, lineHeight: 25, fontFamily: Platform.OS === 'web' ? 'Georgia' : undefined },
  error: { color: ink, borderLeftWidth: 3, borderColor: ink, paddingLeft: 12, fontSize: 16, lineHeight: 25 },
  confirm: { borderTopWidth: 1, borderColor: ink, paddingTop: 24, gap: 14 },
});
