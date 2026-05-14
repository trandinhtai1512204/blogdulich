do $$
begin
  if not exists (select 1 from pg_type where typname = 'PostStatus') then
    create type "PostStatus" as enum ('pending', 'approved', 'rejected');
  end if;
end $$;

alter table public.posts
add column if not exists "authorId" text,
add column if not exists "status" "PostStatus" not null default 'pending';

update public.posts
set "status" = 'approved'
where published = true and "status" = 'pending';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'posts_authorId_fkey'
  ) then
    alter table public.posts
    add constraint "posts_authorId_fkey"
    foreign key ("authorId") references public.users(id)
    on update cascade
    on delete set null;
  end if;
end $$;

create index if not exists "posts_authorId_idx" on public.posts("authorId");
create index if not exists "posts_status_createdAt_idx" on public.posts("status", "createdAt" desc);
