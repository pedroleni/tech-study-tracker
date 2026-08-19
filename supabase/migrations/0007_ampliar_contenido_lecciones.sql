begin;

-- Sube el tope de lecciones.contenido de 60 000 a 200 000 caracteres.
-- Motivo: los bloques ```laboratorio``` (specs/features/laboratorios.md,
-- pendiente) se intercalan en el mismo Markdown, y 60 000 se queda corto
-- en cuanto una lección larga combina prosa con varios bloques. Escribir
-- lecciones sigue restringido a admin (lecciones_insert_admin,
-- lecciones_update_admin en 0004), así que ampliar el margen no cambia
-- quién puede escribir, solo cuánto.
alter table public.lecciones
  drop constraint lecciones_contenido_check,
  add constraint lecciones_contenido_check check (char_length(contenido) <= 200000);

commit;
