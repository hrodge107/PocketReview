import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import type { Language } from '../shared/model';
import { mockReviewer } from '../shared/mock-study';
import { mockChat, quiz, type ChatEntry } from '../shared/practice';
import { Button, ink, paper } from './controls';
import type { LessonState } from './use-lesson';
export function ReviewerScreen({ state, onBusyChange }: { state: LessonState; onBusyChange: (busy: boolean) => void }) {
  const { width } = useWindowDimensions(), [language, setLanguage] = useState<Language>('English');
  const [tab, setTab] = useState('Cards'), [revealed, setRevealed] = useState<string[]>([]), [error, setError] = useState('');
  const [question, setQuestion] = useState(''), [busy, setBusy] = useState(false);
  const items = state.lesson.studyItems, questions = quiz(items), chat = state.lesson.chatAnswers as ChatEntry[];
  useEffect(() => { onBusyChange(busy); }, [busy, onBusyChange]);
  useEffect(() => { setRevealed([]); }, [state.lesson.revision, items]);
  async function generate() {
    setError(''); setBusy(true);
    try { await state.saveReviewer(mockReviewer(state.lesson, language), state.lesson.revision); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not create mock items.'); }
    finally { setBusy(false); }
  }
  async function ask() {
    setError(''); setBusy(true);
    try { if (await state.saveChat(mockChat(state.lesson, question, language))) setQuestion(''); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not answer.'); }
    finally { setBusy(false); }
  }
  const score = questions.filter(entry => state.lesson.quizProgress[entry.item.id] === entry.correctId).length;
  const attempted = questions.filter(entry => !!state.lesson.quizProgress[entry.item.id]).length;
  const disabled = busy || !state.ready || !!state.saveError || !state.lesson.confirmed;
  return <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.page, { padding: width < 600 ? 20 : 40 }]} style={styles.root}>
    <Text style={styles.small}>PocketReview / Reviewer / Mock</Text>
    <Text accessibilityRole="header" style={styles.title}>Keep the source close</Text>
    <Text style={styles.body}>Simulated study content. No AI or endpoint calls. Demo answers are fixed bilingual fixtures; other lessons use exact excerpts without translation or reasoning.</Text>
    <View style={styles.actions}>{(['English','Filipino'] as Language[]).map(value => <Button key={value} disabled={busy} label={language === value ? `${value} selected` : `Use ${value}`} onPress={() => setLanguage(value)} />)}</View>
    {!state.lesson.confirmed && <Text style={styles.body}>Confirm corrected text in Source before studying.</Text>}
    <Button primary label={items.length ? 'Create a new mock reviewer' : 'Create mock reviewer'} disabled={disabled} onPress={() => void generate()} />
    {busy && <Text accessibilityLiveRegion="polite" style={styles.body}>Saving your study work...</Text>}
    {(error || state.readError) && <Text accessibilityRole="alert" style={styles.body}>{error || state.readError}</Text>}
    {state.saveError && <View><Text accessibilityRole="alert" style={styles.body}>Study work not saved. {state.saveError}</Text><Button label="Retry saving study work" onPress={() => void state.retrySave()} /></View>}
    {items.length > 0 && <Text accessibilityLiveRegion="polite" style={styles.small}>{state.saved ? 'Study work saved on this device.' : 'Study work is in memory; not saved yet.'}</Text>}
    <View style={styles.actions}>{['Cards','Quiz','Chat'].map(value => <Button key={value} label={tab === value ? `${value} selected` : `Open ${value.toLowerCase()}`} onPress={() => setTab(value)} />)}</View>
    {tab === 'Cards' && <>
      {!items.length && <Text style={styles.body}>No cards yet. Create a mock reviewer from five short confirmed facts.</Text>}
      {items.map((item,index) => <View key={item.id} style={styles.item}>
        <Text style={styles.small}>Card {index+1} / {item.language} / {item.mode === 'mock' ? 'Simulated' : 'Previously saved cloud content'}</Text>
        <Text accessibilityRole="header" style={styles.heading}>{item.question}</Text>
        <Button label={revealed.includes(item.id) ? `Hide answer ${index+1}` : `Show answer ${index+1}`} onPress={() => setRevealed(old => old.includes(item.id) ? old.filter(id => id !== item.id) : [...old,item.id])} />
        {revealed.includes(item.id) && <><Text style={styles.body}>{item.answer}</Text>{item.evidence.map((entry,n) => <Text key={n} selectable style={styles.quote}>Source {entry.pageId}: {entry.quote}</Text>)}</>}
      </View>)}
    </>}
    {tab === 'Quiz' && <>
      <Text accessibilityRole="header" style={styles.heading}>Three questions, one lesson</Text>
      <Text accessibilityLiveRegion="polite" style={styles.body}>Score: {score}/3. Answered: {attempted}/3.</Text>
      {!questions.length && <Text style={styles.body}>Create five study items with at least three distinct answers to unlock the quiz.</Text>}
      {questions.map((entry,index) => {
        const selected = state.lesson.quizProgress[entry.item.id], correct = selected === entry.correctId;
        return <View key={entry.item.id} style={styles.item}>
          <Text style={styles.heading}>{index+1}. {entry.item.question}</Text>
          {entry.choices.map((choice,n) => <Button key={choice.id} label={`${String.fromCharCode(65+n)}. ${choice.text}`} accessibilityLabel={`Question ${index+1} choice ${n+1}: ${choice.text}`} disabled={disabled || !!selected} onPress={() => void state.saveProgress(entry.item.id, choice.id)} />)}
          {selected && <View><Text style={styles.body}>{correct ? 'Correct.' : 'Not quite.'} Correct answer: {entry.item.answer}</Text>
            <Text style={styles.small}>This answer matches the saved study item. Compare it with the source:</Text>
            {entry.item.evidence.map((e,n) => <Text key={n} selectable style={styles.quote}>Source {e.pageId}: {e.quote}</Text>)}</View>}
        </View>;
      })}
    </>}
    {tab === 'Chat' && <>
      <Text accessibilityRole="header" style={styles.heading}>Ask the mock lesson</Text>
      <Text style={styles.body}>Try “Where do roots get water?” or “Saan kumukuha ng tubig ang mga ugat?” with the demo. Unmatched questions return a mock not-found message. This does not prove the answer is absent.</Text>
      <TextInput accessibilityLabel="Lesson question" value={question} onChangeText={setQuestion} maxLength={300} multiline style={styles.input} placeholder="Ask about an excerpt" placeholderTextColor={ink} />
      <Button label="Ask mock lesson" disabled={disabled || !question.trim()} onPress={() => void ask()} />
      {chat.length === 0 && <Text style={styles.small}>No messages yet. Up to 20 exchanges are saved with this lesson.</Text>}
      {chat.slice().reverse().map((entry,index) => <View key={index} style={styles.item}>
        <Text style={styles.small}>{entry.language} / Simulated keyword match</Text><Text style={styles.heading}>{entry.question}</Text>
        <Text style={styles.body}>{entry.answer}</Text>{entry.evidence.map((e,n) => <Text key={n} selectable style={styles.quote}>Source {e.pageId}: {e.quote}</Text>)}
      </View>)}
    </>}
    <Text style={styles.small}>Editing source removes cards, quiz progress and chat. Source revision {state.lesson.revision}. Quotes are inspectable; mock output is not verified AI.</Text>
  </ScrollView>;
}
const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: paper }, page: { gap: 20, width: '100%', maxWidth: 900, alignSelf: 'center', paddingBottom: 60 },
  title: { fontSize: 32, lineHeight: 41, fontWeight: '600', color: ink }, heading: { fontSize: 21, lineHeight: 30, fontWeight: '600', color: ink },
  body: { fontSize: 17, lineHeight: 27, color: ink }, small: { fontSize: 14, lineHeight: 23, color: ink },
  quote: { fontSize: 17, lineHeight: 28, color: ink, borderLeftWidth: 2, borderColor: ink, paddingLeft: 14 },
  item: { gap: 16, borderTopWidth: 1, borderColor: ink, paddingTop: 24 }, actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  input: { minHeight: 100, borderWidth: 1, borderColor: ink, padding: 14, fontSize: 17, color: ink, borderRadius: 4 } });
