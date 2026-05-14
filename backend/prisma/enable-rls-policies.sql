-- Enable Row Level Security for public tables used by Supabase.
-- Backend Prisma queries that use the Supabase Postgres owner/service connection
-- can still run server-side; browser clients using anon/authenticated roles are
-- constrained by these policies.

alter table public.categories enable row level security;
alter table public.cities enable row level security;
alter table public.hotels enable row level security;
alter table public.posts enable row level security;
alter table public.users enable row level security;
alter table public.bookings enable row level security;
alter table public.payments enable row level security;
alter table public.reviews enable row level security;

drop policy if exists "Public can read categories" on public.categories;
create policy "Public can read categories"
on public.categories
for select
to anon, authenticated
using (true);

drop policy if exists "Public can read cities" on public.cities;
create policy "Public can read cities"
on public.cities
for select
to anon, authenticated
using (true);

drop policy if exists "Public can read hotels" on public.hotels;
create policy "Public can read hotels"
on public.hotels
for select
to anon, authenticated
using (true);

drop policy if exists "Public can read published posts" on public.posts;
create policy "Public can read published posts"
on public.posts
for select
to anon, authenticated
using (published = true);

drop policy if exists "Users can read own profile" on public.users;
create policy "Users can read own profile"
on public.users
for select
to authenticated
using (id = auth.uid()::text);

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
on public.users
for update
to authenticated
using (id = auth.uid()::text)
with check (id = auth.uid()::text);

drop policy if exists "Users can read own bookings" on public.bookings;
create policy "Users can read own bookings"
on public.bookings
for select
to authenticated
using ("userId" = auth.uid()::text);

drop policy if exists "Users can create own bookings" on public.bookings;
create policy "Users can create own bookings"
on public.bookings
for insert
to authenticated
with check ("userId" = auth.uid()::text);

drop policy if exists "Users can update own pending bookings" on public.bookings;
create policy "Users can update own pending bookings"
on public.bookings
for update
to authenticated
using ("userId" = auth.uid()::text and status = 'pending')
with check ("userId" = auth.uid()::text);

drop policy if exists "Users can read own payments" on public.payments;
create policy "Users can read own payments"
on public.payments
for select
to authenticated
using (
  exists (
    select 1
    from public.bookings b
    where b.id = public.payments."bookingId"
      and b."userId" = auth.uid()::text
  )
);

drop policy if exists "Public can read reviews" on public.reviews;
create policy "Public can read reviews"
on public.reviews
for select
to anon, authenticated
using (true);

drop policy if exists "Users can create own reviews" on public.reviews;
create policy "Users can create own reviews"
on public.reviews
for insert
to authenticated
with check ("userId" = auth.uid()::text);

drop policy if exists "Users can update own reviews" on public.reviews;
create policy "Users can update own reviews"
on public.reviews
for update
to authenticated
using ("userId" = auth.uid()::text)
with check ("userId" = auth.uid()::text);

drop policy if exists "Users can delete own reviews" on public.reviews;
create policy "Users can delete own reviews"
on public.reviews
for delete
to authenticated
using ("userId" = auth.uid()::text);
