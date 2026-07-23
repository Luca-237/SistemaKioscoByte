# Documentación de FitoShop

Índice de la documentación del proyecto (fuera del `README.md` de la raíz,
que cubre puesta en marcha y modelo de negocio).

- [`reestructuracion-backend-2026-07-22.md`](./reestructuracion-backend-2026-07-22.md)
  — registro de la reestructuración del backend de `modules/<recurso>/routes.js`
  a capas `routes/ → controllers/ → services/ → models/`: qué cambió, por qué
  se hizo, qué mejoras trae y por qué se tomó esa decisión.
- [`arquitectura-backend-referencia.txt`](./arquitectura-backend-referencia.txt)
  — documento de convenciones (stack, estructura de carpetas, estilo de
  código, patrones por capa) usado como referencia para reproducir el mismo
  esqueleto en proyectos propios. Es la base que se siguió en la
  reestructuración de arriba.

## Convención

Los documentos de reestructuración/decisiones técnicas se nombran
`<tema>-<fecha ISO>.md` y viven en esta carpeta. Cada uno registra: qué se
hizo, por qué, qué mejora y por qué se eligió esa alternativa sobre otras.
