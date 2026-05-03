//MODELOS WIDGETS
export interface WidgetFromApi {
  titulo?: string;
  objetivo_widget?: string;
  descripcion_campos?: Record<string, string>;
  campos?: Record<string, any>;
}

export interface ERSWidgetsResponse {
  ok: boolean;
  data: {
    posiciones: string[];
    [key: string]: WidgetFromApi | string[];
  };
}