import { Widget } from "@/components/widgets/BibliotecaWidgets";
import { ERSWidgetsResponse, WidgetFromApi } from "@/types/  ers";

const mapErsDataToWidgets = (data: ERSWidgetsResponse["data"]): Widget[] => {
  const { posiciones, ...widgetMap } = data;

  return posiciones.map((widgetId: string, index: number) => {
    const widgetData = widgetMap[widgetId] as WidgetFromApi;
    return {
      posicion: index + 1,
      id_widget: widgetId,
      titulo: widgetData.titulo ?? widgetId,
      objetivo_widget: widgetData.objetivo_widget ?? "",
      descripcion_campos: widgetData.descripcion_campos ?? {},
      campos: widgetData.campos ?? {},
    };
  });
};