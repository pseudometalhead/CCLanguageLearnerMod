import type { Course } from '../course'
import { german } from './de'

/** Every course the app offers. Add a language by importing its file here. */
export const COURSES: Record<string, Course> = { [german.code]: german }
export const DEFAULT_COURSE = german.code
export const courseOf = (code: string): Course => COURSES[code] ?? COURSES[DEFAULT_COURSE]
