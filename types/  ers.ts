export interface DatosGenerales {
  SOLICITANTE: string;
  INFO_CONTACTO: string;
  DGA: string;
  PATROCINADOR: string;
  CR: number;
  SOCIO: string;
  NOMBRE_INICIATIVA: string;
  TIPO_INICIATIVA: string;
}

export interface AreaImpactada {
  AREA_NEGOCIO: string;
  PROCESO_IMPACTO: string;
}

export interface Riesgo {
  TIPO: string;
  PROBABLE_PERDIDA: string | null;
  JUSTIFICACION: string | null;
}

export interface ERSData {
  DATOS_GENERALES: DatosGenerales;



  DESCRIPCION_INICIATIVA: string;
  OBJETIVOS_ALCANCE: {
    OBJETIVO: string;
    ALCANCE: string;
  };


  AREAS_IMPACTADAS: AreaImpactada[];
  TABLA_FR: {
    AREA_PARTICIPANTE: string;
    RESPONSABLE: string;
  };

  
  SUPUESTOS: string | null;
  ANEXOS: string[];
  RESTRICCIONES: string | null;
  RIESGOS: Riesgo[];
  REQUERIMIENTO_REGULATORIO: {
    FECHA_EMISION: string | null;
    MONTO_SANCION: number;
    AUTORIDAD: string | null;
    FECHA_RECEPCION: string | null;
    FECHA_ENTRADA_VIGOR: string | null;
    SISTEMAS_APLICATIVOS: string[];
  };
  BENEFICIOS: {
    OTROS_BENEFICIOS: string | null;
  };
  PARTICIPACION_OTRAS_AREAS: string | null;
  EXCLUSIONES: string | null;
  REQUERIMIENTO_NO_REGULATORIO: {
    FECHA_LIMITE: string | null;
    ES_URGENTE: boolean;
  };
  REQUERIMIENTO_PERIODICO: {
    FECHAS_ENTREGA: string[];
    PERIODICIDAD: string | null;
  };
}