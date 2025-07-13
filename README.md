<div align="center"> 
<br> 
<br>
<img src="./src/assets/icons/ic-logo.svg" height="140" />
<h3> Project Management </h3>
  <p>
    <p style="font-size: 14px">
      Project Mangement is a modern admin dashboard template built with React 19, Vite, shadcn/ui, and TypeScript. It is designed to help developers easily manage working systems.
    </p>
    <br />
    <br />
    <br />
    <br />
</div>


## Features

- Built using React 19 hooks.
- Powered by Vite for rapid development and hot module replacement.
- Integrates shadcn/ui, providing a rich set of UI components and design patterns.
- Written in TypeScript, offering type safety and an improved development experience.
- Responsive design, adapting to various screen sizes and devices.
- Flexible routing configuration, supporting nested routes.
- Integrated access control based on user roles.
- Supports internationalization for easy language switching.
- Includes common admin features like user management, role management, and permission management.
- Customizable themes and styles to meet your branding needs.
- Mocking solution based on MSW and Faker.js.
- State management using Zustand.
- Data fetching using React-Query.

## Quick Start

### Get the Project Code

```bash
git clone https://github.com/d3george/slash-admin.git
```

### Install Dependencies

In the project's root directory, run the following command to install project dependencies:

```bash
pnpm install
```

### Start the Development Server

Run the following command to start the development server:

```bash
pnpm dev
```

Visit [http://localhost:3001](http://localhost:3001) to view your application.

### Build for Production

Run the following command to build the production version:

```bash
pnpm build
```

## Git Contribution submission specification
- `feat` new features
- `fix`  fix the
- `docs` documentation or comments
- `style` code format (changes that do not affect code execution)
- `refactor` refactor
- `perf` performance optimization
- `revert` revert commit
- `test` test related
- `chore` changes in the construction process or auxiliary tools
- `ci` modify CI configuration and scripts
- `types` type definition file changes
- `wip` in development


## Supabase configuration
create table public.interviews (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  proposal uuid null,
  meeting_link text null,
  meeting_date timestamp with time zone null,
  interviewer text null,
  progress smallint null default '0'::smallint,
  meeting_title text null,
  "user" uuid null,
  profile uuid null,
  job_description text null,
  constraint interviews_pkey primary key (id),
  constraint interviews_profile_fkey foreign KEY (profile) references profiles (id) on delete CASCADE,
  constraint interviews_proposal_fkey foreign KEY (proposal) references proposals (id) on delete CASCADE,
  constraint interviews_user_fkey foreign KEY ("user") references users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.profiles (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  name text null,
  dob date null,
  gender text null,
  phone text null,
  email text null,
  job_sites text null,
  country text null,
  "user" uuid null,
  constraint profiles_pkey primary key (id),
  constraint profiles_user_fkey foreign KEY ("user") references users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.proposals (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  profile uuid null,
  job_description text null,
  resume text null,
  cover_letter text null,
  "user" uuid null,
  job_link text null,
  company text null,
  constraint proposals_pkey primary key (id),
  constraint proposals_profile_fkey foreign KEY (profile) references profiles (id) on delete CASCADE,
  constraint proposals_user_fkey foreign KEY ("user") references users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.users (
  id uuid not null,
  updated_at timestamp with time zone null,
  username text null,
  email text null,
  country text null,
  status smallint null default '1'::smallint,
  role smallint null default '1'::smallint,
  summary text null,
  constraint users_pkey primary key (id),
  constraint users_username_key unique (username),
  constraint users_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE,
  constraint username_length check ((char_length(username) >= 3))
) TABLESPACE pg_default;


Public users are viewable by everyone.
alter policy "Public users are viewable by everyone."
on "public"."users"
to public
using (
  true
);

Users can insert their own profile.
alter policy "Users can insert their own profile."
on "public"."users"
to public
with check (
  (( SELECT auth.uid() AS uid) = id)
);

Users can update own profile.
alter policy "Users can update own profile."
on "public"."users"
to public
using (
  (( SELECT auth.uid() AS uid) = id)
);

handle_proposal_policy
alter policy "handle_proposal_policy"
on "public"."proposals"
to public
using (
  (EXISTS ( SELECT 1
   FROM users
  WHERE (users.id = auth.uid())))
with check (
  (EXISTS ( SELECT 1
   FROM users
  WHERE (users.id = auth.uid())))
);

handle_profile_policy
alter policy "handle_profile_policy"
on "public"."profiles"
to public
using (
(EXISTS ( SELECT 1
   FROM users
  WHERE (users.id = auth.uid())))
with check (
(EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = auth.uid()) AND (users.role = 0))))
);

handle_interview_policy
alter policy "handle_interview_policy"
on "public"."interviews"
to public
using (
   (EXISTS ( SELECT 1
   FROM users
  WHERE (users.id = auth.uid())))
with check (
(EXISTS ( SELECT 1
   FROM users
  WHERE (users.id = auth.uid())))
);


