import AsyncStorage from '@react-native-async-storage/async-storage';
import { decodeLesson, emptyLesson, type Lesson } from '../shared/lesson';
const KEY = 'pocketreview-lesson-v1';
export const lessonStore = {
  async read(): Promise<Lesson> { const value = await AsyncStorage.getItem(KEY); return value ? decodeLesson(JSON.parse(value)) : emptyLesson(); },
  async write(lesson: Lesson): Promise<void> { decodeLesson(lesson); await AsyncStorage.setItem(KEY, JSON.stringify(lesson)); },
};
