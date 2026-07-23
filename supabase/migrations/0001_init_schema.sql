-- ============================================================
-- 資格勉強アプリ: 初期スキーマ
-- 対応: 資格勉強アプリ_データ設計書_v1.html の 3〜5章
-- 実行方法: Supabaseダッシュボード → SQL Editor → New query に
--          このファイルの中身を貼り付けて Run
-- ============================================================

-- ------------------------------------------------------------
-- 1. テーブル本体
--    「資格(exams) → 科目(subjects) → 教材(materials) → 単語(words)」
--    の親子関係を、外部キー(references)で表現している
-- ------------------------------------------------------------

create table exams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  exam_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_id uuid not null references exams(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete cascade,
  name text not null,
  material_type text not null check (material_type in ('参考書', '問題集', '動画', 'その他')),
  progress_note text,
  progress_percent numeric(5, 2) check (progress_percent between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table study_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete cascade,
  material_id uuid references materials(id) on delete set null,
  study_date date not null,
  start_time time,
  end_time time,
  duration_minutes integer not null check (duration_minutes >= 0),
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_id uuid not null references exams(id) on delete cascade,
  title text not null,
  priority text not null default '中' check (priority in ('高', '中', '低')),
  is_done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table words (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  material_id uuid not null references materials(id) on delete cascade,
  term text not null,
  meaning text,
  understanding_level text not null default '未理解' check (understanding_level in ('未理解', 'うろ覚え', '理解済み')),
  is_resolved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  unique (user_id, name)
);

-- words と tags の「多対多」を実現するための中間テーブル
-- (1つの単語に複数タグ、1つのタグを複数単語に付けられる)
create table word_tags (
  word_id uuid not null references words(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (word_id, tag_id)
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  word_id uuid references words(id) on delete cascade,
  material_id uuid references materials(id) on delete cascade,
  scheduled_date date not null,
  status text not null default '未実施' check (status in ('未実施', '実施済み')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- word_id か material_id のどちらか一方だけを対象にする(両方null/両方値ありは禁止)
  constraint reviews_target_check check (
    (word_id is not null and material_id is null) or
    (word_id is null and material_id is not null)
  )
);

create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_id uuid not null references exams(id) on delete cascade,
  period text not null check (period in ('日', '週', '月')),
  target_minutes integer not null check (target_minutes > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 2. インデックス
--    よく検索・絞り込みに使うカラムに索引を張り、クエリを高速化する
-- ------------------------------------------------------------

create index subjects_exam_id_idx on subjects (exam_id);
create index materials_subject_id_idx on materials (subject_id);
create index study_logs_user_date_idx on study_logs (user_id, study_date);
create index study_logs_subject_id_idx on study_logs (subject_id);
create index study_logs_material_id_idx on study_logs (material_id);
create index words_material_id_idx on words (material_id);
create index words_user_resolved_idx on words (user_id, is_resolved);
create index word_tags_tag_id_idx on word_tags (tag_id);
create index reviews_user_sched_status_idx on reviews (user_id, scheduled_date, status);
create index reviews_word_id_idx on reviews (word_id);
create index reviews_material_id_idx on reviews (material_id);
create index tasks_exam_done_idx on tasks (exam_id, is_done);
create index goals_exam_id_idx on goals (exam_id);

-- ------------------------------------------------------------
-- 3. Row Level Security (RLS)
--    「自分のデータは自分しか見えない/操作できない」をDB側で強制する
-- ------------------------------------------------------------

alter table exams enable row level security;
alter table subjects enable row level security;
alter table materials enable row level security;
alter table study_logs enable row level security;
alter table tasks enable row level security;
alter table words enable row level security;
alter table tags enable row level security;
alter table word_tags enable row level security;
alter table reviews enable row level security;
alter table goals enable row level security;

-- user_id を持つテーブル: 「自分の行(auth.uid() = user_id)だけ」read/write可能
create policy "exams_own" on exams
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "subjects_own" on subjects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "materials_own" on materials
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "study_logs_own" on study_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "tasks_own" on tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "words_own" on words
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "tags_own" on tags
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "reviews_own" on reviews
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "goals_own" on goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- word_tags は user_id を持たないので、紐づく words の持ち主かどうかで判定する
create policy "word_tags_own" on word_tags
  for all using (
    exists (select 1 from words w where w.id = word_tags.word_id and w.user_id = auth.uid())
  ) with check (
    exists (select 1 from words w where w.id = word_tags.word_id and w.user_id = auth.uid())
  );
