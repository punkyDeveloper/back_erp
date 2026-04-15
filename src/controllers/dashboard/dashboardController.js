const Movimiento = require('../../moduls/movimiento'); // ajusta la ruta
const Mecanica   = require('../../moduls/mecanica');
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

    // Whitelist para evitar inyección de valores arbitrarios en la lógica de fechas
    const PERIODOS_VALIDOS = ["mensual", "trimestral", "anual"];
    const periodo = PERIODOS_VALIDOS.includes(req.query.periodo) ? req.query.periodo : "anual";
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

/* ══════════════════════════════════════════════════════════════
   GET /api/v1/dashboard/mecanica

   Respuesta:
   {
     kpis: { serviciosMes, ticketPromedio, vehiculosAtendidos },
     servicios: [{ nombre, cantidad }],
     tipos: [{ name, value, color }],
     recientes: [{ _id, cliente, vehiculo, placa, servicio, costo, estado, fecha }]
   }
══════════════════════════════════════════════════════════════ */
const TIPO_COLORS = {
  Preventivo: "#6366f1",
  Correctivo: "#f97316",
  Predictivo: "#10b981",
  "Garantía": "#eab308",
};

exports.getDashboardMecanica = async (req, res) => {
  try {
    const companiaId = req.user?.compania || req.user?.empresa;
    if (!companiaId) return res.status(400).json({ message: "Compania no encontrada en el token" });

    const ahora     = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const finMes    = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59);
    const cid       = String(companiaId);

    /* ── 1. KPIs del mes ─────────────────────────────────── */
    const [kpiAgg] = await Mecanica.aggregate([
      { $match: { companiaId: cid, fecha: { $gte: inicioMes, $lte: finMes } } },
      {
        $group: {
          _id: null,
          serviciosMes:       { $sum: 1 },
          sumaIngresos:       { $sum: { $cond: [{ $ne: ["$tipo", "Garantía"] }, "$costoCliente", 0] } },
          vehiculosAtendidos: { $addToSet: "$placa" },
        },
      },
    ]);

    const serviciosMes       = kpiAgg?.serviciosMes       ?? 0;
    const sumaIngresos       = kpiAgg?.sumaIngresos        ?? 0;
    const vehiculosAtendidos = kpiAgg?.vehiculosAtendidos?.length ?? 0;
    const ticketPromedio     = serviciosMes > 0 ? Math.round(sumaIngresos / serviciosMes) : 0;

    /* ── 2. Top 5 servicios más solicitados (mes actual) ── */
    const serviciosAgg = await Mecanica.aggregate([
      { $match: { companiaId: cid, fecha: { $gte: inicioMes, $lte: finMes } } },
      { $unwind: { path: "$servicios", preserveNullAndEmptyArrays: false } },
      { $group: { _id: "$servicios.nombre", cantidad: { $sum: 1 } } },
      { $sort: { cantidad: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, nombre: "$_id", cantidad: 1 } },
    ]);

    /* ── 3. Distribución por tipo de mantenimiento (mes) ── */
    const tiposAgg = await Mecanica.aggregate([
      { $match: { companiaId: cid, fecha: { $gte: inicioMes, $lte: finMes } } },
      { $group: { _id: "$tipo", value: { $sum: 1 } } },
      { $project: { _id: 0, name: "$_id", value: 1 } },
    ]);

    const tipos = tiposAgg.map((t) => ({
      name:  t.name,
      value: t.value,
      color: TIPO_COLORS[t.name] || "#9ca3af",
    }));

    /* ── 4. Últimos 8 mantenimientos ─────────────────────── */
    const recientesRaw = await Mecanica.find({ companiaId: cid })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    const recientes = recientesRaw.map((m) => ({
      _id:      m._id,
      cliente:  m.nombreCliente || m.cedula,
      vehiculo: m.vehiculo,
      placa:    m.placa,
      servicio: (m.servicios?.[0]?.nombre) || m.descripcion?.slice(0, 40) || "—",
      costo:    m.costoCliente ?? 0,
      estado:   m.estado,
      fecha:    m.fecha,
    }));

    res.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return res.status(200).json({
      kpis: { serviciosMes, ticketPromedio, vehiculosAtendidos },
      servicios: serviciosAgg,
      tipos,
      recientes,
    });

  } catch (error) {
    console.error("[Dashboard Mecanica]", error.message);
    return res.status(500).json({ message: "Error al obtener datos de mecánica" });
  }
};