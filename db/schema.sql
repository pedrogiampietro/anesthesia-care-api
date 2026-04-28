create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name varchar(120) not null,
  email varchar(255) not null,
  password_hash text not null,
  role varchar(40) not null default 'admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists users_email_unique on users (email);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name varchar(160) not null,
  description text,
  sku varchar(80),
  category varchar(80) not null default 'geral',
  unit varchar(40) not null default 'unidade',
  price_cents integer not null default 0,
  stock_quantity numeric(12, 2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists products_user_sku_unique on products (user_id, sku);
create index if not exists products_user_id_idx on products (user_id);

create table if not exists medications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name varchar(160) not null,
  generic_name varchar(160),
  category varchar(80) not null,
  concentration varchar(80) not null,
  dosage_form varchar(80),
  route varchar(80),
  unit varchar(40) not null default 'mL',
  min_dose numeric(10, 3),
  max_dose numeric(10, 3),
  dose_unit varchar(60),
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists medications_user_id_idx on medications (user_id);
create index if not exists medications_name_idx on medications (name);

create table if not exists patients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name varchar(160) not null,
  age integer not null,
  weight numeric(7, 2) not null,
  height numeric(7, 2) not null,
  sex char(1) not null check (sex in ('M', 'F')),
  asa varchar(20) not null default 'ASA I',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists patients_user_id_idx on patients (user_id);
create index if not exists patients_name_idx on patients (name);
