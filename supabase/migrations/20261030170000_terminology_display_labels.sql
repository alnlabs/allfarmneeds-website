-- Display-only terminology updates (slugs / enums unchanged).

update public.service_categories
set name_te = 'వ్యవసాయ పని సేవలు',
    name_en = 'Farm worker services'
where slug = 'farm-labour';
