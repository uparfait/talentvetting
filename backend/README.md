# TalentVetting API

The server behind TalentVetting: accounts, profiles and their documents, jobs, applications, AI scoring and summaries,
face checks, proctored tests and exams. Every decision is made here; the web app only shows data and sends input.
Node 22, Express, MongoDB Atlas, deployed on Vercel as one function (`api/index.js`).

## Run
```
npm install
npm run models      # copies the face models into models/ (already committed)
npm run dev         # http://localhost:5000/api
```
Settings come from `.env` (see `.env.example`); on Vercel from the project's environment variables.

## Settings
| Name | What it is |
|---|---|
| MONGO_URI | MongoDB connection string (mongodb+srv) |
| STARTER_PASSWORD | Password of the two starter accounts, job@gmail.com (recruiter) and seeker@gmail.com (job seeker), made on the first request when missing; leave empty for none |
| DNS_SERVERS | resolvers for the SRV lookup, for example 8.8.8.8,1.1.1.1 (public ones are used when the local one refuses) |
| AUTH_SECRET | signs sign in tokens |
| ALLOWED_ORIGINS | web app origins allowed to call the API |
| LLM_PROVIDER, SUMMARY_PROVIDER | first provider for most tasks, and for summaries |
| GEMINI_API_KEY, GEMINI_MODEL, GEMINI_FALLBACK_MODEL | Gemma on the Gemini API, and the model tried next on the same key (several keys may be comma separated) |
| GROQ_API_KEY, GROQ_MODEL | Groq |
| HF_TOKEN, HF_MODEL | Hugging Face inference |

## Models
| Model | Where it runs | Used for |
|---|---|---|
| tiny_face_detector (189 KB) | on this server, `models/` | finding faces in camera frames |
| face_landmark_68 (348 KB) | on this server | head turns (liveness), framing |
| face_recognition (6.3 MB) | on this server | 128 number face descriptor, matching exams to the registration photo |
| tfjs wasm backends (3 files) | on this server, `models/wasm` | running the three nets without native binaries |
| gemma-4-26b-a4b-it | Gemini API | scoring, document checks (reads the actual file), skills in a job |
| gemini-flash-lite-latest | Gemini API | next in line when Gemma is busy (also reads files) |
| openai/gpt-oss-120b | Groq | summaries of links and profiles, and fallback for every task |
| google/gemma-3-27b-it | Hugging Face | fallback for every AI task |

Every AI call is logged (task, provider, model, time, result) and fails over to the next provider when one is busy.

## Deploy
```
npx vercel deploy --prod
```
The function includes `models/`, gets 60 s and 1769 MB, and answers every path (`vercel.json`).
