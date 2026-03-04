# Dienstplan App

Eine moderne Web-App zur Verwaltung von Mitarbeiter-Dienstplänen.  
Gebaut mit **Next.js 14**, **Supabase** und **Tailwind CSS**.

---

## Features

- Wochenansicht (Mo–Fr) für alle Mitarbeiter
- Schichttypen: `frei`, `HO`, `Früh`, `Spät`, `Urlaub`, `MD`
- Schichttausch-Anfragen mit Admin-Genehmigung
- Dark Mode · Apple-Style UI · Mobile-First
- Supabase Auth + Row Level Security

---

## Setup

### 1. Supabase Projekt erstellen

1. Gehe zu [supabase.com](https://supabase.com) und erstelle ein neues Projekt
2. Öffne den **SQL Editor** und führe `supabase/schema.sql` aus
3. Erstelle Auth-User für alle Mitarbeiter unter **Authentication → Users**

### 2. Environment Variables

Kopiere `.env.example` nach `.env.local` und fülle die Werte aus:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://dein-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-anon-key
```

Die Werte findest du in deinem Supabase-Dashboard unter **Settings → API**.

### 3. Mitarbeiter anlegen

Nach dem Erstellen der Auth-User füge die Mitarbeiter in die `employees`-Tabelle ein.  
Verwende dafür den kommentierten Block am Ende von `supabase/schema.sql`.

Die `user_id` bekommst du aus **Authentication → Users** im Supabase-Dashboard.

### 4. Lokale Entwicklung

```bash
npm install
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000)

---

## Projektstruktur

```
dienstplan/
├── app/
│   ├── layout.tsx          # Root Layout, Dark Mode
│   ├── page.tsx            # Redirect → /schedule
│   ├── login/page.tsx      # Login-Seite
│   ├── schedule/page.tsx   # Mitarbeiter-Dienstplan
│   └── admin/page.tsx      # Admin-Panel
├── components/
│   ├── Navigation.tsx      # Top-Navigation
│   ├── WeekNavigator.tsx   # Woche vor/zurück
│   ├── WeeklySchedule.tsx  # Wochenansicht (Mitarbeiter)
│   ├── ShiftBadge.tsx      # Schicht-Badge (farbig)
│   ├── ShiftSwapModal.tsx  # Tauschanfrage-Modal
│   ├── AdminShiftEditor.tsx # Schichten bearbeiten
│   └── SwapRequestsList.tsx # Tauschanfragen verwalten
├── hooks/
│   ├── useAuth.ts          # Auth-State Hook
│   └── useSchedule.ts      # Schedule-Daten Hook
├── lib/
│   ├── supabase.ts         # Supabase Client
│   ├── api.ts              # REST API Calls
│   └── week.ts             # Woche-Utilities (date-fns)
├── types/
│   └── index.ts            # TypeScript Typen
└── supabase/
    ├── schema.sql          # Tabellen + RLS Policies
    └── seed.sql            # Beispiel-Schichten
```

---

## Berechtigungen

| Aktion                   | Mitarbeiter | Admin |
|--------------------------|:-----------:|:-----:|
| Dienstplan ansehen       | ✅          | ✅    |
| Schichttausch anfragen   | ✅          | –     |
| Schichten bearbeiten     | ❌          | ✅    |
| Tauschanfragen bestätigen| ❌          | ✅    |

---

## Schichttypen

| Kürzel   | Farbe   |
|----------|---------|
| frei     | Grau    |
| HO       | Cyan    |
| Früh     | Orange  |
| Spät     | Lila    |
| Urlaub   | Grün    |
| MD       | Rot     |

---

## Deployment

```bash
npm run build
npm start
```

Oder deploye direkt auf [Vercel](https://vercel.com) – verbinde dein Git-Repo und setze die Environment Variables.
