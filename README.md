![Glonie](src/assets/sprint_1/glonie_banner.png)

---

## Developer

| Name | Role | Social |
|:----:|:----:|:------:|
İbrahim DOĞAN|Solo Developer & Product Owner|[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/dogan-ibrahim/) [![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/doganibrahim) [![Gmail](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:ibrahimdogan.js@gmail.com)

---

<details>
  <summary><h2>Product Description</h2></summary>

Glonie is an EdTech SaaS application for language acquisition, strictly based on the **natural approach**. The app does not teach grammar rules and never uses native language translations. Learning happens through contextual visual cues, audio, and target language text paired with IPA (International Phonetic Alphabet) transcriptions.

To avoid cognitive overload, Glonie uses a *micro-learning* UX philosophy. A single traditional book chapter is broken down into 3-4 **bite-sized lessons**. The UI is a flashcard system where users process one sentence/interaction at a time.

The architecture follows a local-first hybrid approach, majority of the app runs on a static SQLite database to minimize API costs and maximize speed.



</details>

---

<details>
  <summary><h2>Tech Stack</h2></summary>

| Layer | Technology | Role |
|-------|-----------|------|
| Frontend | React 19 + Vite 8 | SPA with component-based UI |
| Styling | Tailwind CSS 3.4 | Utility-first CSS framework |
| State Management | React useState/useEffect | Local component state |
| Backend | FastAPI 0.121 | RESTful API server |
| ORM | SQLAlchemy | Database abstraction layer |
| Database | SQLite | Local-first, zero-config persistence |
| Static Assets | FastAPI StaticFiles | Serves images and audio from `/assets/` |
| Localization | Custom JSON + useLocale hook | `en.json` → `t('key')` pattern |
| Audio | pyttsx3 (TTS generation) | Generated audio files for cards |

</details>

---

![Sprints](src/assets/sprint_1/sprints_banner.png)

---

<details>
  <summary><h1>Sprint 1</h1></summary>

---

<details>
  <summary><h2>App Screenshots</h2></summary>

### Lesson Selection Screen

![LessonSelect](src/assets/sprint_1/select_lesson_screen.png)

---

### Learning Card — Story Type

![StoryCard](src/assets/sprint_1/story_card.png)

---

### Learning Card — IPA Pronunciation

![IPACard](src/assets/sprint_1/show_ipa.png)

</details>

---

<details>
  <summary><h2>Project Management</h2></summary>

![backlog_1](src/assets/sprint_1/backlog_1.png)

![backlog_2](src/assets/sprint_1/backlog_2.png)

![backlog_3](src/assets/sprint_1/backlog_3.png)

</details>

---

<details>
  <summary><h2>Burndown Chart</h2></summary>

![Burndown](src/assets/sprint_1/burndown_chart.png)

</details>

---

<details>
  <summary><h2>Database Schema</h2></summary>

![Schema](src/assets/sprint_1/db_schema.png)

**Tables:**

```
lessons
├── id (PK, Integer)
├── order_index (Integer, unique)
└── title (String)

cards
├── id (PK, Integer)
├── lesson_id (FK → lessons.id, CASCADE)
├── order_index (Integer)
├── image_url (String)
├── audio_url (String)
├── text_target (String)
├── text_ipa (String)
└── card_type (String: STORY | FILL_BLANK | SPEECH)
```

</details>

---

- **Sprint Notes:**
  * It was decided to use _`Tailwind CSS`_ for styling with a minimalist design approach.
  * It was decided to use _`Miro`_ as the project management tool.
  * AI-assisted pair programming was used throughout the sprint via _`Kiro`_.
  * It was decided that the pedagogical approach would be strictly _`Natural Approach`_ — no grammar, no translations.
  * It was decided that _`IPA transcriptions`_ would be included on every card for pronunciation guidance.
  * It was decided to use _`SQLite`_ for local-first data serving to minimize API costs.
  * It was decided that all UI strings would be in **target language** with localization support ready via JSON.

- **Expected point completion within Sprint:**
  * `13` tasks

- **Point Completion Logic:**
  * A total of 3 sprints are planned. Sprint 1 focused on architectural foundation and the core learning flow prototype. Sprint 2 will focus on interactivity and content expansion. Sprint 3 will handle deployment and polish.

- **Sprint Review:**
  * The full-stack architecture was established: React frontend consuming FastAPI backend with SQLite.
  * The core learning flow is functional end-to-end: select lesson → view cards → hear audio → see IPA (opt.) → navigate → complete.
  * Multiple UI iterations were done and there will be (only) one more, i hope.
  * Constants and localization layers were extracted for maintainability.
  * TTS-generated audio files provide working audio playback on all cards.
  * The seed script provides reproducible demo data with accurate IPA transcriptions.

- **Sprint Review Participants:**
  * `İbrahim :D`

- **Sprint Retrospective:**
  * It was decided to research and integrate AI-powered adaptive learning for Sprint 2 and 3.
  * It was decided to expand contents for more structured learning experience.
  * It was decided to implement interactive fill-the-blank input as core interactivity.
  * It was decided to postpone Speech API integration to Sprint 3 due to complexity and browser dependency.
  * It was decided to define visual style guide BEFORE coding UI in future sprints to avoid multiple redesign iterations.
  * It was decided to commit more frequently — one commit per completed task instead of batching.

---

**Lessons Learned:**

| Issue | Root Cause | Action for Sprint 2 |
|-------|-----------|---------------------|
| Placeholder images overwrote existing real assets | AI ran generation script without checking existing files | Always verify existing assets before generating |
| Seed URLs inconsistency (first card full URL, rest relative) | Partial manual edit | Use batch regex replacement |
| 3 UI redesign iterations | No visual direction defined upfront | Define style guide before coding |

---

**Git History:**

| Commit | Date | Message |
|--------|------|---------|
| `86964dd` | Jun 22 | first commit |
| `5659db9` | Jun 23 | integrate tailwindcss |
| `a7ee515` | Jun 23 | folder structure |
| `30fb7f7` | Jun 25 | fastapi |
| `ccc7c12` | Jun 25 | feat: setup SQLite database and SQLAlchemy models |
| `8f43e0f` | Jun 30 | feat: add API layer, seed data, and minimalist lesson/card UI with auto-play audio |
| `a09d3ca` | Jun 30 | add constants and locales |
| `df908ac` | Jul 04 | revise theme and lesson select screen |
| `936f23c` | Jul 05 | update README for first sprint |
| `997f549` | Jul 05 | track lesson progress in localStorage |
| `04938df` | Jul 05 | add lesson unlock mechanism |

</details>

---

<details>
  <summary><h2>Folder Structure</h2></summary>

```
glonie/
├── backend/
│   ├── assets/
│   │   ├── images/          # Card images (placeholder + real)
│   │   └── audio/           # TTS-generated audio files
│   ├── database.py          # SQLAlchemy models + engine
│   ├── schemas.py           # Pydantic serialization schemas
│   ├── crud.py              # Database query functions
│   ├── main.py              # FastAPI app, routes, CORS, static files
│   ├── seed.py              # Database seeding script
│   └── glonie.db            # SQLite database file
├── src/
│   ├── components/
│   │   ├── LessonSelect.jsx # Lesson list with lock/unlock states
│   │   ├── LessonLearning.jsx # Lesson flow manager
│   │   └── LearningCard.jsx # Card display + audio + IPA
│   ├── constants/
│   │   └── theme.js         # CARD_TYPES, LESSON_COLORS, AUDIO, API_BASE_URL
│   ├── locales/
│   │   └── en.json          # All UI strings
│   ├── hooks/
│   │   ├── useLocale.js     # t('key') translation hook
│   │   └── useLessons.js    # Data fetching hooks
│   ├── services/
│   │   └── api.js           # API client (getLessons, getLesson)
│   ├── styles/
│   │   └── global.css       # Tailwind directives
│   ├── App.jsx              # Root component, view routing
│   └── main.jsx             # React entry point
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── eslint.config.js
```

</details>

---