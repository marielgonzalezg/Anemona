// definir el tipo (estructura) del JSON que tiene tu ERS, respuestas esperadas
// sirve para decirle a TypeScript cómo es el objeto
// VSCode te dé autocompletado, TypeScript detecte errores en el JSON, el componente sepa exactamente qué campos esperar

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
  RIESGOS: Riesgo[];
}