alter table public.categories
  add column icon text
    check (icon is null or char_length(icon) <= 60);

alter table public.technologies
  add column icon text
    check (icon is null or char_length(icon) <= 60);

grant insert (icon), update (icon) on table public.categories to authenticated;
grant insert (icon), update (icon) on table public.technologies to authenticated;
