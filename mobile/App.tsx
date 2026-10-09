import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { Button, paper, ink } from './controls';
import { SourceScreen } from './SourceScreen';
import { checks } from './checks';
import { liveReviewed, type Review } from './evidence';
import { exportEvidence } from './export-evidence';
import { cloudService, mockService } from './model-service';
import { useSetup } from './use-setup';
import type { ExecutionMode } from '../shared/model';
export default function App() {
  const [stage, setStage] = useState<'setup' | 'source'>('setup');
  const [setupBusy, setSetupBusy] = useState(false), [sourceBusy, setSourceBusy] = useState(false);
  return <View style={{ flex: 1, backgroundColor: paper }}>
    <View style={{ padding: 16, flexDirection: 'row', gap: 12, flexWrap: 'wrap', borderBottomWidth: 1, borderColor: ink }}>
      <Button label={stage === 'setup' ? 'Setup selected' : 'Show setup'} disabled={setupBusy || sourceBusy} onPress={() => setStage('setup')} />
      <Button label={stage === 'source' ? 'Source selected' : 'Show source'} disabled={setupBusy || sourceBusy} onPress={() => setStage('source')} />
    </View>
    <View style={{ flex: 1, display: stage === 'setup' ? 'flex' : 'none' }}><SetupScreen onBusyChange={setSetupBusy} /></View>
    <View style={{ flex: 1, display: stage === 'source' ? 'flex' : 'none' }}><SourceScreen onBusyChange={setSourceBusy} /></View>
  </View>;
}

function SetupScreen({ onBusyChange }: { onBusyChange: (busy: boolean) => void }) {
  const { width } = useWindowDimensions();
  const [mode, setMode] = useState<ExecutionMode>('mock');
  const [endpoint, setEndpoint] = useState(process.env.EXPO_PUBLIC_WORKER_URL || '');
  const [access, setAccess] = useState('');
  const [exportError, setExportError] = useState('');
  const state = useSetup();
  const busy = !!state.busy;
  useEffect(() => { onBusyChange(busy); }, [busy, onBusyChange]);
  async function exportResults() {
    try { await exportEvidence(state.evidence); setExportError(''); } catch { setExportError('Export failed. Retry while the results are still on this screen.'); }
  }
  const reviewed = liveReviewed(state.evidence);
  return <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.page, { padding: width < 600 ? 20 : 40 }]}>
      <View style={styles.header}>
        <Text style={styles.wordmark}>PocketReview</Text>
        <Text style={styles.small}>Setup / 01</Text>
      </View>
      <Text accessibilityRole="header" style={styles.title}>Prepare your reviewer</Text>
      <Text style={styles.intro}>Check how answers are produced before studying from them. These short sample lessons help you inspect language, source evidence and missing answers.</Text>
      <View style={[styles.spread, width >= 900 && { flexDirection: 'row', gap: 48 }]}>
        <View style={styles.setup}>
          <Text accessibilityRole="header" style={styles.heading}>Answer service</Text>
          <View style={styles.actions}>
            <Button label={mode === 'mock' ? 'Mock selected' : 'Use mock'} disabled={busy} onPress={() => setMode('mock')} />
            <Button label={mode === 'cloud' ? 'Cloud selected' : 'Use cloud'} disabled={busy} onPress={() => setMode('cloud')} />
          </View>
          <Text accessibilityLiveRegion="polite" style={styles.body}>{mode === 'mock' ? 'Mock mode: predetermined sample answers. No model runs and no lesson text leaves this device.' : 'Cloud mode: sample lesson text and questions are sent to your Worker and Cloudflare Workers AI. Internet is required. Photos are not sent.'}</Text>
          {mode === 'cloud' && <View style={styles.form}>
            <Text style={styles.label}>Worker URL</Text>
            <TextInput accessibilityLabel="Worker URL" style={styles.input} value={endpoint} onChangeText={setEndpoint} editable={!busy} autoCapitalize="none" autoCorrect={false} keyboardType="url" placeholder="https://your-worker.workers.dev" placeholderTextColor="#545454" />
            <Text style={styles.label}>Demo access code</Text>
            <TextInput accessibilityLabel="Demo access code" style={styles.input} value={access} onChangeText={setAccess} editable={!busy} secureTextEntry autoCapitalize="none" autoCorrect={false} placeholder="Enter the code from the Worker owner" placeholderTextColor="#545454" />
            <Text style={styles.small}>This code stays in memory for this session. Do not enter your Cloudflare account token.</Text>
          </View>}
          <View style={styles.actions}>
            <Button primary label={busy ? `Checking ${state.busy}` : 'Run four sample checks'} disabled={busy || !state.ready || !!state.saveError} onPress={() => void state.run(mode === 'mock' ? mockService : cloudService(endpoint, access))} />
            {busy && <Button label="Cancel checks" onPress={state.cancel} />}
          </View>
          <Text accessibilityLiveRegion="polite" style={styles.small}>{!state.ready && !state.readError ? 'Reading saved results...' : busy ? 'One check at a time. Previous results remain available.' : 'Runs stop at the first error. Check the cause before retrying once.'}</Text>
          {state.readError && <View><Text accessibilityRole="alert" style={styles.error}>{state.readError}</Text><Button label="Retry reading results" onPress={() => void state.load()} /></View>}
          {state.saveError && <View><Text accessibilityRole="alert" style={styles.error}>Not saved. {state.saveError}</Text><Button label="Retry saving results" disabled={busy} onPress={() => void state.retrySave()} /></View>}
          <View style={styles.section}>
            <Text accessibilityRole="header" style={styles.heading}>The sample source</Text>
            <Text style={styles.small}>Page 1 / English</Text>
            <Text style={styles.source}>{checks[0].request.pages[0].text}</Text>
            <Text style={styles.small}>Page 1 / Filipino</Text>
            <Text style={styles.source}>{checks[2].request.pages[0].text}</Text>
          </View>
          <View style={styles.section}>
            <Text accessibilityRole="header" style={styles.heading}>Local deployment</Text>
            <Text style={styles.body}>Planned. The model service can later connect to a local runtime. Model weights, hardware needs and phone performance still need verification.</Text>
            <Text style={styles.small}>Photo capture, OCR, cards, quiz and lesson chat are later features. This screen verifies setup only.</Text>
          </View>
        </View>
        <View style={styles.results}>
          <View style={styles.resultHeading}><Text accessibilityRole="header" style={styles.heading}>Your check results</Text><Button label="Export results" disabled={!state.evidence.results.length} onPress={() => void exportResults()} /></View>
          <Text accessibilityLiveRegion="polite" style={styles.body}>{reviewed}/4 live checks reviewed as faithful. Mock results never count as live evidence.</Text>
          <Text accessibilityLiveRegion="polite" style={styles.small}>{state.saved ? 'Results saved on this device.' : state.evidence.results.length ? 'Results are in memory; saving is pending or failed.' : 'No checks yet. Run the sample checks, then compare each answer with its source.'}</Text>
          {exportError && <Text accessibilityRole="alert" style={styles.error}>{exportError}</Text>}
          {[...state.evidence.results].reverse().map(result => {
            const check = checks.find(entry => entry.id === result.checkId)!;
            return <View key={result.id} style={styles.result}>
              <Text style={styles.label}>{check.label} / {result.mode === 'mock' ? 'Simulated' : 'Live cloud'}</Text>
              <Text style={styles.body}>{check.request.question}</Text>
              {result.error ? <Text accessibilityRole="alert" style={styles.error}>{result.error}</Text> : <>
                <Text style={styles.source}>{result.response!.output.answer}</Text>
                {result.response!.output.evidence.map((entry, i) => <Text key={i} style={styles.small}>{entry.pageId}: “{entry.quote}”</Text>)}
                {!result.response!.output.supported && <Text style={styles.small}>The model marked this answer absent from the lesson.</Text>}
                <Text style={styles.small}>Review target: {check.expected}</Text>
                <Text style={styles.small}>Review: {result.review}. Check meaning and language; matching a quote alone is insufficient.</Text>
                <View style={styles.actions}>{(['faithful','incorrect','pending'] as Review[]).map(review => <Button key={review} disabled={busy || !state.ready} label={review === 'faithful' ? 'Mark faithful' : review === 'incorrect' ? 'Mark incorrect' : 'Reset review'} accessibilityLabel={`${review === 'faithful' ? 'Mark faithful' : review === 'incorrect' ? 'Mark incorrect' : 'Reset review'} / ${check.label}`} onPress={() => void state.review(result.id, review)} />)}</View>
              </>}
              <Text style={styles.small}>{(result.elapsedMs / 1000).toFixed(2)} s / {result.response ? `${result.response.provider} / ${result.response.model} / ${result.response.revision}` : 'No model result'}</Text>
              <Text style={styles.small}>{new Date(result.at).toLocaleString()}</Text>
            </View>;
          })}
        </View>
      </View>
    </ScrollView>
  </KeyboardAvoidingView>;
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: paper },
  page: { width: '100%', maxWidth: 1200, alignSelf: 'center', paddingBottom: 64 },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: 20, borderBottomWidth: 2, borderColor: ink, paddingBottom: 16, marginBottom: 28 },
  wordmark: { fontSize: 21, fontWeight: '700', color: ink },
  title: { fontSize: 34, lineHeight: 42, fontWeight: '600', color: ink, marginBottom: 12 },
  intro: { fontSize: 17, lineHeight: 27, color: ink, maxWidth: 700, marginBottom: 36 },
  spread: { gap: 36 }, setup: { flex: 1, minWidth: 0 }, results: { flex: 1.3, minWidth: 0 },
  heading: { color: ink, fontSize: 22, lineHeight: 30, fontWeight: '600', marginBottom: 16 },
  body: { color: ink, fontSize: 16, lineHeight: 25, marginBottom: 14 },
  small: { color: ink, fontSize: 14, lineHeight: 22, marginBottom: 12, flexShrink: 1 },
  label: { color: ink, fontSize: 16, lineHeight: 24, fontWeight: '600', marginBottom: 8 },
  source: { color: ink, fontFamily: Platform.OS === 'web' ? 'Georgia, serif' : undefined, fontSize: 18, lineHeight: 29, marginBottom: 16 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  form: { gap: 4, marginBottom: 18 },
  input: { borderWidth: 1, borderColor: ink, borderRadius: 4, padding: 12, minHeight: 48, fontSize: 16, color: ink, backgroundColor: paper, marginBottom: 12 },
  section: { borderTopWidth: 1, borderColor: ink, paddingTop: 24, marginTop: 22 },
  resultHeading: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  result: { borderTopWidth: 1, borderColor: ink, paddingTop: 22, marginTop: 14 },
  error: { color: ink, fontWeight: '600', fontSize: 16, lineHeight: 25, marginBottom: 14 },
});
