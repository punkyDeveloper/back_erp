const Movimiento = require('../../moduls/movimiento'); // ajusta la ruta
const mongoose   = require('mongoose');

/* ══════════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════════ */

const MESES_ES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

function variacion(actual, anterior) {
  if (!anterior) return "+0%";
  const pct = ((actual - anterior) / anterior) * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
}

// Devuelve el rango de fechas según el período que pide el front
// periodo: "mensual" | "trimestral" | "anual"
function getRango(periodo) {
  const ahora = new Date();
  const y     = ahora.getFullYear();
  const m     = ahora.getMonth(); // 0-based

  if (periodo === "mensual") {
    // Solo el mes actual
    return {
      inicio: new Date(y, m, 1),
      fin:    new Date(y, m + 1, 0, 23, 59, 59),
    };
  }

  if (periodo === "trimestral") {
    // Últimos 3 meses
    return {
      inicio: new Date(y, m - 2, 1),
      fin:    new Date(y, m + 1, 0, 23, 59, 59),
    };
  }

  // "anual" → todo el año en curso
  return {
    inicio: new Date(y, 0, 1),
    fin:    new Date(y, 11, 31, 23, 59, 59),
  };
}

// Rango del período anterior equivalente (para calcular variación)
function getRangoAnterior(periodo) {
  const ahora = new Date();
  const y     = ahora.getFullYear();
  const m     = ahora.getMonth();

  if (periodo === "mensual") {
    return {
      inicio: new Date(y, m - 1, 1),
      fin:    new Date(y, m, 0, 23, 59, 59),
    };
  }

  if (periodo === "trimestral") {
    return {
      inicio: new Date(y, m - 5, 1),
      fin:    new Date(y, m - 2, 0, 23, 59, 59),
    };
  }

  // anual → año anterior
  return {
    inicio: new Date(y - 1, 0, 1),
    fin:    new Date(y - 1, 11, 31, 23, 59, 59),
  };
}

/* ══════════════════════════════════════════════════════════════
   GET /api/v1/dashboard/finanzas?periodo=anual
   
   Respuesta:
   {
     meses: [{ mes:"Ene", ingresos:0, egresos:0 }],
     totales: { ing, egr, gan, margen },
     cambios: { ingresos, egresos, ganancia, margen }
   }
══════════════════════════════════════════════════════════════ */
exports.getDashboardFinanzas = async (req, res) => {
  try {
    const compania = req.user?.compania;
    if (!compania) {
      return res.status(400).json({ message: "Compania no encontrada en el token" });
    }

    const periodo    = req.query.periodo || "anual";
    const companiaId = new mongoose.Types.ObjectId(compania);

    const { inicio, fin }             = getRango(periodo);
    const { inicio: iAnt, fin: fAnt } = getRangoAnterior(periodo);

    /* ── 1. Agrupar ingresos y egresos por mes ──────────── */
    const movimientosPorMes = await Movimiento.aggregate([
      {
        $match: {
          compania:        companiaId,
          fecha:           { $gte: inicio, $lte: fin },
          tipo_movimiento: { $in: ["ingreso", "egreso"] },
        }
      },
      {
        $group: {
          _id: {
            mes:  { $month: "$fecha" },
            tipo: "$tipo_movimiento",
          },
          total: { $sum: "$valor" },
        }
      },
      { $sort: { "_id.mes": 1 } }
    ]);

    // Construir array de meses con ingresos y egresos
    // Incluir solo los meses que caen dentro del rango
    const mesInicio = inicio.getMonth() + 1; // 1-based
    const mesFin    = fin.getMonth() + 1;
    const cantMeses = mesFin - mesInicio + 1;

    const mesesMap = {};
    for (let i = 0; i < cantMeses; i++) {
      const numMes = mesInicio + i;
      mesesMap[numMes] = { mes: MESES_ES[numMes - 1], ingresos: 0, egresos: 0 };
    }

    movimientosPorMes.forEach(({ _id, total }) => {
      if (mesesMap[_id.mes]) {
        if (_id.tipo === "ingreso") mesesMap[_id.mes].ingresos = total;
        if (_id.tipo === "egreso")  mesesMap[_id.mes].egresos  = total;
      }
    });

    const meses = Object.values(mesesMap);

    /* ── 2. Totales del período actual ──────────────────── */
    const totalesActual = await Movimiento.aggregate([
      {
        $match: {
          compania:        companiaId,
          fecha:           { $gte: inicio, $lte: fin },
          tipo_movimiento: { $in: ["ingreso", "egreso"] },
        }
      },
      {
        $group: {
          _id:  "$tipo_movimiento",
          suma: { $sum: "$valor" },
        }
      }
    ]);

    const ing = totalesActual.find(t => t._id === "ingreso")?.suma || 0;
    const egr = totalesActual.find(t => t._id === "egreso")?.suma  || 0;
    const gan = ing - egr;
    const margen = ing > 0 ? ((gan / ing) * 100).toFixed(1) : "0.0";

    const totales = { ing, egr, gan, margen };

    /* ── 3. Totales del período anterior (para variación) ── */
    const totalesAnterior = await Movimiento.aggregate([
      {
        $match: {
          compania:        companiaId,
          fecha:           { $gte: iAnt, $lte: fAnt },
          tipo_movimiento: { $in: ["ingreso", "egreso"] },
        }
      },
      {
        $group: {
          _id:  "$tipo_movimiento",
          suma: { $sum: "$valor" },
        }
      }
    ]);

    const ingAnt = totalesAnterior.find(t => t._id === "ingreso")?.suma || 0;
    const egrAnt = totalesAnterior.find(t => t._id === "egreso")?.suma  || 0;
    const ganAnt = ingAnt - egrAnt;
    const margenAnt = ingAnt > 0 ? (ganAnt / ingAnt) * 100 : 0;

    const cambios = {
      ingresos: variacion(ing,                    ingAnt),
      egresos:  variacion(egr,                    egrAnt),
      ganancia: variacion(gan,                    ganAnt),
      margen:   variacion(parseFloat(margen),     margenAnt),
    };

    /* ── Respuesta ──────────────────────────────────────── */
    res.set("Cache-Control", "no-store, no-cache, must-revalidate");
    res.set("Pragma", "no-cache");
    return res.status(200).json({ meses, totales, cambios });

  } catch (error) {
    console.error("[Dashboard Finanzas]", error.message);
    return res.status(500).json({ message: "Error al obtener datos financieros" });
  }
};