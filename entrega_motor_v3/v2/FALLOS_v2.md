# Vídeo de prueba v2 (motor v3.9) — lista de fallos
MP4: 1080x1920, 30 fps, 840 fotogramas (28 s), H.264 yuv420p CRF 20, sin pista de audio.
Render: 2 procesos en paralelo, 1,96 s/fotograma de media por proceso (máx 3,77 s), unos 14 min en total.
Cortes (fotograma de entrada): 90, 210, 300*, 402, 450, 525, 570*, 750. (* = fundido a negro de 8 fotogramas: 296-299 salida, 300-303 entrada; 566-569 / 570-573.)

## Comprobaciones
- Cams.check cada 0,5 s (56 muestras), cabeza de cada sujeto del plano: dentro de cuadro (|x|,|y|<0,9) en todas salvo Zapi entrando en f90 y f105 (entrada prevista) y los pies de Zapi sentado en two_wide f690-735 (y=-0,94, justo bajo el límite).
- Saltos (diferencia media entre fotogramas > 3x mediana 1,33): los cortes planeados dan x16-x45 (f89/90, 209/210, 401/402, 449/450, 524/525, 749/750) y los fundidos x8-x16. El resto son movimiento continuo (x3-x8: girar de Mar f75-89, andar f304-380, puerta/agarrar f372-381, Mar f549-554, sentarse f657-683, dar_mano f769-772). Ningún salto aislado fuera de cortes y fundidos.
- Fotogramas negros: ninguno fuera de los fundidos (luminancia mínima 8,7 en f569-570, en pleno fundido).
- Escala: scale.y de Mar y Zapi oscila entre 0,995 y 1,005 (respiración), sin deriva, medida cada 5 fotogramas.
- Boca de Zapi pegada a la cara en los giros (f123-132, f663-672) y sentado (f702, f808): sin bocas flotantes.

## Fallos del motor / de cámara (no corregidos)
| Plano | Fotogramas | Fallo |
|---|---|---|
| 1 med_a | 0-89 | tq_a y prof_a dejan la cara en el borde izquierdo (gafas/nariz pegadas al borde) y no enseñan portátil ni mesa; por eso usé med_a. En tq_a/prof_a Zapi no cabe (hFOV ~17°). |
| 1 med_a | 75-89 | Al girar la silla hacia Zapi, Mar da la espalda a cámara unos 0,4 s y la cara desaparece. |
| 1 med_a | 0-89 | Plano de 3 s con poca acción: solo respiración, brazo en el ratón y duda (f57). No hay silla: Mar se ve "sentado" sobre el aire. |
| 2 two_med | 90-209 | Zapi entra de espaldas y pegado a cámara (f111-126); sale por la izquierda del encuadre, no por la derecha (el eje de two_med lo impone). |
| 2 two_med | 192-209 | Mar se levanta sin silla; el movimiento se lee poco. |
| 3 close_b | 210-299 | Orejas de Zapi tocan los bordes laterales; por lo demás cara completa y boca/cejas correctas (hexágono + lengua en la risa). |
| 4 full_a | 300-401 | La cara de Mar queda a contraluz y se lee como mancha oscura; la cámara es casi de perfil (73°), no de frente ni tres cuartos. |
| 4 full_a | 372-401 | La puerta de la nevera solo se anima por script (el modelo la trae abierta y fija); la he volteado (bisagra a la derecha) y animado desde la escena. En f393-399 la mano de Mar llega a la puerta, pero el gesto de agarrar es dar_mano (no existe un gesto "agarrar"). |
| 5 med_a | 402-449 | La nevera cae casi fuera de cuadro (med_a mira de lado) y la puerta solo se ve de refilón; añadí una luz de relleno para que se lea la cara. Mar casi quieto 1,6 s (solo cambia la expresión). |
| 6 med_b | 450-524 | Zapi correcto, cabeza entera. Mar no sale (fuera de plano). |
| 6 two_med cocina | 525-567 | Zapi de espaldas, cabeza recortada por el borde derecho y abajo. La mano de Mar sale del cuadro por la derecha (f528-549). Mancha clara en el pecho de Mar por la luz de la nevera. |
| 7 two_wide | 573-690 | Los dos caminan hacia cámara con la cara visible; Zapi sentándose f678-690 pasa de pie a sentado en ~0,5 s, con el cuerpo atravesando el cojín un instante. |
| 7 two_wide | 696-837 | Piezas naranjas sueltas junto a Zapi sentado (pies/cola separados del cuerpo). Pies de Zapi en el límite inferior del encuadre. |
| 8 two_med final | 750-837 | dar_mano (Mar) y celebrar (Zapi): las manos quedan solapadas junto a la cara de Zapi pero no se ve un choque limpio. Zapi no tiene gesto dar_mano; usé celebrar. |
| 8 two_med final | 750-837 | Zapi sale de 3/4: nunca se le ve la cara de frente porque two_med se coloca detrás de Zapi. |
| Todos | — | Mar y Zapi no tienen sincronía labial ni sonido (limitación declarada en el LEEME). |
