/* quiz: exams in the block format and the psychometric test, all worked out on the server.
   const { parse_block, RULES, exam_public, auto_marks, make_psych, score_psych } = require('../quiz') */
const { parse_block } = require('./parse');
const { RULES } = require('./rules');
const { secs_for, question_secs } = require('./timing');
const { exam_public, auto_marks, exam_score, to_mark } = require('./exam');
const { make_psych, psych_public, score_psych } = require('./psych');

module.exports = { parse_block, RULES, secs_for, question_secs, exam_public, auto_marks, exam_score, to_mark, make_psych, psych_public, score_psych };
