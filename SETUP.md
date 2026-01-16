# 🚀 Guide d'installation TaskFlow

## Étape 1 : Créer un compte Supabase (2 minutes)

1. Va sur **[supabase.com](https://supabase.com)**
2. Clique sur **"Start your project"**
3. Connecte-toi avec **Google** (le plus rapide)
4. Crée un nouveau projet :
   - **Name** : `taskflow`
   - **Database Password** : génère un mot de passe fort (tu n'en auras pas besoin)
   - **Region** : `West EU (Paris)` (le plus proche)
5. Attends ~2 minutes que le projet se crée

## Étape 2 : Activer l'authentification Google (3 minutes)

1. Dans ton projet Supabase, va dans **Authentication** → **Providers**
2. Trouve **Google** et active-le
3. Tu as besoin de créer des credentials Google :

### Créer les credentials Google :
1. Va sur **[console.cloud.google.com](https://console.cloud.google.com)**
2. Crée un nouveau projet ou sélectionne un existant
3. Va dans **APIs & Services** → **Credentials**
4. Clique **"Create Credentials"** → **"OAuth client ID"**
5. Configure l'écran de consentement si demandé (juste ton email)
6. Type : **Web application**
7. **Authorized redirect URIs** : Copie l'URL depuis Supabase (format: `https://xxx.supabase.co/auth/v1/callback`)
8. Copie le **Client ID** et **Client Secret**
9. Colle-les dans Supabase

## Étape 3 : Créer la table des tâches

1. Va dans **SQL Editor** dans Supabase
2. Copie-colle ce code et clique **Run** :

```sql
-- Créer la table tasks
create table public.tasks (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  notes text,
  priority text default 'medium',
  category_id text,
  due_date date,
  recurrence text,
  completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  archived_at timestamptz
);

-- Créer la table categories
create table public.categories (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  color text default '#8b5cf6',
  created_at timestamptz default now()
);

-- Activer RLS (Row Level Security)
alter table public.tasks enable row level security;
alter table public.categories enable row level security;

-- Policies pour tasks (chaque user voit seulement ses tâches)
create policy "Users can view own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tasks"
  on public.tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- Policies pour categories
create policy "Users can view own categories"
  on public.categories for select
  using (auth.uid() = user_id);

create policy "Users can insert own categories"
  on public.categories for insert
  with check (auth.uid() = user_id);

create policy "Users can update own categories"
  on public.categories for update
  using (auth.uid() = user_id);

create policy "Users can delete own categories"
  on public.categories for delete
  using (auth.uid() = user_id);

-- Index pour performance
create index tasks_user_id_idx on public.tasks(user_id);
create index tasks_due_date_idx on public.tasks(due_date);
create index categories_user_id_idx on public.categories(user_id);
```

## Étape 4 : Récupérer tes clés API

1. Va dans **Project Settings** → **API**
2. Copie :
   - **Project URL** : `https://xxxxx.supabase.co`
   - **anon public key** : `eyJhbG...` (la clé publique)

## Étape 5 : Configurer l'app

Ouvre `index.html` et trouve ces lignes (vers le début du JavaScript) :

```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
```

Remplace par tes vraies valeurs :

```javascript
const SUPABASE_URL = 'https://abcdefgh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIs...';
```

## Étape 6 : Déployer sur Vercel

### Option A : GitHub + Vercel (recommandé)

1. Crée un repo GitHub avec tous les fichiers
2. Va sur **[vercel.com](https://vercel.com)**
3. Clique **"Add New Project"**
4. Importe ton repo GitHub
5. Clique **"Deploy"**
6. Note ton URL (ex: `taskflow-abc.vercel.app`)

### Option B : Vercel CLI

```bash
npm i -g vercel
cd taskflow-v2
vercel
```

## Étape 7 : Configurer l'URL de redirection

1. Retourne dans Supabase → **Authentication** → **URL Configuration**
2. Ajoute ton URL Vercel dans **Redirect URLs** :
   - `https://ton-app.vercel.app`
   - `https://ton-app.vercel.app/**`

## ✅ C'est terminé !

Ton app est maintenant :
- ✅ Déployée et accessible en ligne
- ✅ Synchronisée sur tous tes appareils
- ✅ Installable sur iPhone (voir ci-dessous)

---

## 📱 Installer sur iPhone

1. Ouvre Safari sur ton iPhone
2. Va sur ton URL Vercel (ex: `taskflow-abc.vercel.app`)
3. Appuie sur l'icône **Partage** (carré avec flèche)
4. Défile et appuie sur **"Sur l'écran d'accueil"**
5. Donne un nom (ex: "TaskFlow")
6. Appuie sur **"Ajouter"**

🎉 L'app apparaît sur ton écran d'accueil comme une vraie app !

---

## ⚡ Raccourci Siri

Pour ajouter une tâche avec Siri :

1. Ouvre l'app **Raccourcis** sur iPhone
2. Crée un nouveau raccourci
3. Ajoute l'action **"Ouvrir URL"**
4. Entre : `https://ton-app.vercel.app/?action=add`
5. Nomme le raccourci "Nouvelle tâche"
6. Active Siri pour ce raccourci

Maintenant tu peux dire : **"Dis Siri, Nouvelle tâche"** !

---

## 🔧 Mode local (sans compte)

L'app fonctionne aussi **sans Supabase** en mode local. Les données sont stockées dans le navigateur (localStorage). C'est parfait pour tester ou si tu utilises un seul appareil.

Pour activer le mode local, laisse simplement les valeurs par défaut dans le code :
```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';  // Ne pas changer
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';  // Ne pas changer
```

L'app détectera automatiquement que Supabase n'est pas configuré et passera en mode local.
