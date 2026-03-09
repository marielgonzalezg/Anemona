// json del documento
export const ersMockData = {
  DATOS_GENERALES: {
    SOLICITANTE: "LIZETH",
    INFO_CONTACTO: "LIZ@TEC.MX",
    DGA: "TECNOLOGÍA",
    PATROCINADOR: "TECNOLOGÍA",
    CR: 0,
    SOCIO: "INTERNO",
    NOMBRE_INICIATIVA: "PRUEBA",
    TIPO_INICIATIVA: "PRUEBA CONCEPTO"
  },

  DESCRIPCION_INICIATIVA:
    "PRUEBA DE CONCEPTO PARA VALIDAR EL USO DE LA HERRAMIENTA ANEMONA",

  OBJETIVOS_ALCANCE: {
    OBJETIVO: "VALIDAR EL USO DE LA HERRAMIENTA ANEMONA",
    ALCANCE: "VALIDAR EL USO DE LA HERRAMIENTA ANEMONA"
  },

  AREAS_IMPACTADAS: [
    {
      AREA_NEGOCIO: "IT",
      PROCESO_IMPACTO: "Creación de API REST para el manejo de países"
    },
    {
      AREA_NEGOCIO: "FINANZAS",
      PROCESO_IMPACTO: "No impacta"
    }
  ],

  TABLA_FR: {
    AREA_PARTICIPANTE: "Tecnologia",
    RESPONSABLE: "TBD"
  },

  REQUERIMIENTO_REGULATORIO: {
    AUTORIDAD: null,
    FECHA_EMISION: null,
    FECHA_RECEPCION: null,
    FECHA_ENTRADA_VIGOR: null,
    MONTO_SANCION: 0,
    SISTEMAS_APLICATIVOS: []
  },

  REQUERIMIENTO_NO_REGULATORIO: {
    ES_URGENTE: false,
    FECHA_LIMITE: "2025-11-06"
  },

  REQUERIMIENTO_PERIODICO: {
    PERIODICIDAD: null,
    FECHAS_ENTREGA: ["2025-11-06"]
  },

  BENEFICIOS: {
    OTROS_BENEFICIOS: null
  },

  PARTICIPACION_OTRAS_AREAS: null,

  RIESGOS: [
    {
      TIPO: "Credito",
      PROBABLE_PERDIDA: null,
      JUSTIFICACION: null
    },
    {
      TIPO: "Liquidez",
      PROBABLE_PERDIDA: null,
      JUSTIFICACION: null
    },
    {
      TIPO: "Mercado",
      PROBABLE_PERDIDA: null,
      JUSTIFICACION: null
    },
    {
      TIPO: "Operativo",
      PROBABLE_PERDIDA: null,
      JUSTIFICACION: null
    },
    {
      TIPO: "Reputacional",
      PROBABLE_PERDIDA: null,
      JUSTIFICACION: null
    }
  ],

  EXCLUSIONES: null,
  SUPUESTOS: null,
  RESTRICCIONES: null,
  ANEXOS: []
};