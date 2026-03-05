import { Home, File as FileIcon } from "lucide-react";

export default function ProjectList() {

  const projects = [
    { id: 1, code: "SV-3254320326", title: "Proyecto 1", date: "23/03/2026" },
    { id: 2, code: "SV-3254320326", title: "Proyecto 2", date: "23/03/2026" },
    { id: 3, code: "SV-3254320326", title: "Alcance del proyecto", date: "23/03/2026" },
    { id: 4, code: "SV-3254320326", title: "Alcance del proyecto", date: "23/03/2026" }
  ];

  return (
    <div className="w-full max-w-xs">

      {/* HEADER */}
      <div className="mb-4">

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#EB0029]">
            Mis Proyectos
          </h1>

          <Home
          size={30}
          className="text-gray-500 hover:text-[#EB0029] hover:bg-gray-100 p-1 rounded cursor-pointer transition"
          />
        </div>

        <div className="h-[2px] w-full bg-[#EB0029] mt-1"></div>

      </div>

      {/* LISTA */}
      <div className="flex flex-col gap-3">

        {projects.map((project) => (
          <div
            key={project.id}
            className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-200 transition cursor-pointer"
          >

            {/* ICONO */}
            <div className="w-8 h-8 bg-[#EB0029] rounded-md flex items-center justify-center text-white">
              <FileIcon size={14} strokeWidth={2.5} />
            </div>

            {/* INFO */}
            <div className="flex-1">

              <div className="flex items-center">
                <span className="text-[#EB0029] text-sm font-semibold">
                  {project.code}
                </span>

                <span className="ml-auto text-[10px] text-gray-500">
                  {project.date}
                </span>
              </div>

              <div className="text-xs text-gray-600 mt-1">
                {project.title}
              </div>

            </div>

          </div>
        ))}

        {/* BOTON */}
<div className="flex justify-center mt-6">
  <button className="bg-[#EB0029] text-white text-sm px-6 py-2 rounded-lg hover:bg-red-700 transition">
    Ver Todos
  </button>
</div>

      </div>

    </div>
  );
}