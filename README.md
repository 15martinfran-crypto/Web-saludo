# Compás — Dashboard de Artistas

Dashboard web simple (HTML/CSS/JS puro) para visualizar métricas de artistas leyendo
directamente un fichero `data.json` que actualizas a mano. No hay ninguna API en
tiempo real: todo lo que ves en pantalla sale de ese archivo.

La interfaz replica el diseño "Compás" (tema oscuro, tipografía Bodoni Moda +
Manrope, chips de artista, hero y tarjetas de plataforma con gráfico de evolución).

## Cómo arrancar el servidor local

Necesitas tener [Node.js](https://nodejs.org/) instalado (no hace falta instalar
ninguna dependencia, el servidor usa solo módulos incluidos en Node).

```bash
node server.js
```

Verás en la terminal:

```
Dashboard disponible en http://localhost:8080
```

Abre esa URL en el navegador. Si el puerto 8080 está ocupado, puedes usar otro:

```bash
PORT=3000 node server.js
```

(Alternativa si prefieres no usar Node: `python3 -m http.server 8080` desde esta
misma carpeta funciona igual de bien, ya que solo se sirven ficheros estáticos.)

## Cómo actualizar los datos

1. Abre `data.json` con cualquier editor de texto.
2. Cambia los números y textos que quieras (suscriptores, vistas, top contenido,
   `ultima_actualizacion`, etc.), respetando la estructura del JSON.
3. Guarda el archivo.
4. Recarga la página del navegador (F5). Los nuevos datos aparecen automáticamente,
   no hace falta reiniciar el servidor ni tocar código.

### Estructura de `data.json`

```jsonc
{
  "ultima_actualizacion": "2026-09-27",
  "artistas": {
    "clave_del_artista": {
      "color": "#hexcolor",          // color de acento de ese artista (chip, gráfico, botón)
      "color_fondo": "#hexcolor",    // color oscuro del degradado de fondo del hero, a juego con "color"
      "youtube": {
        "suscriptores": 0,
        "vistas_28d": 0,
        "watch_time_horas_28d": 0,
        "top_contenido": [
          { "titulo": "", "tipo": "video|short", "vistas": 0, "likes": 0 }
        ]
      },
      "tiktok": {
        "seguidores": 0,
        "likes_totales": 0,
        "top_contenido": [
          { "titulo": "", "vistas": 0, "likes": 0 }
        ]
      },
      "spotify": {                    // opcional, solo si el artista tiene Spotify
        "oyentes_mensuales": 0,
        "seguidores": 0,
        "top_canciones": [
          { "titulo": "", "reproducciones": 0 }
        ]
      }
    }
  }
}
```

- Puedes añadir o quitar artistas libremente: cada clave dentro de `artistas`
  genera automáticamente una pestaña en la interfaz.
- El bloque `spotify` es opcional; si un artista no lo tiene, simplemente no
  aparecen ni la tarjeta ni la tabla de Spotify para él.

## Sobre el gráfico de "Evolución"

Como `data.json` solo guarda una foto fija de cada momento (no un histórico),
la web construye la evolución por sí misma: cada vez que cargas la página con
una `ultima_actualizacion` distinta a la última guardada, se añade un punto
nuevo al histórico (guardado en el `localStorage` del navegador, por artista).
Así, con el tiempo, el gráfico de líneas va mostrando cómo evolucionan
suscriptores/seguidores/oyentes en cada actualización que hagas.

Si quieres reiniciar ese histórico (por ejemplo, para empezar de cero), basta
con borrar los datos del sitio desde las herramientas de desarrollador del
navegador (Application → Local Storage) o probar en una ventana de incógnito.

## Estructura de archivos

```
.
├── index.html   # estructura de la página
├── style.css    # tema oscuro + color de acento por artista
├── app.js       # lee data.json, renderiza pestañas, KPIs, tabla y gráfico
├── data.json    # tus datos (edítalo tú)
├── server.js    # servidor estático mínimo (sin dependencias)
└── README.md
```
