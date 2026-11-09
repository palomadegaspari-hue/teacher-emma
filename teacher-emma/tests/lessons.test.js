import test from 'node:test';
import assert from 'node:assert/strict';
import { lessons, starterWords } from '../public/lessons.js';
test('offline lessons all have five valid quiz questions',()=>{
 assert.equal(lessons.length,8);
 for(const lesson of lessons){assert.equal(lesson.questions.length,5);for(const [question,options,correct,explanation] of lesson.questions){assert.ok(question);assert.ok(Array.isArray(options)&&options.length>=3);assert.ok(correct>=0&&correct<options.length);assert.ok(explanation);}}
});
test('identifiers unique and starter vocabulary valid',()=>{
 assert.equal(new Set(lessons.map(x=>x.id)).size,lessons.length);
 assert.ok(starterWords.every(w=>w.term&&w.meaning&&w.example));
});
