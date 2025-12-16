
import CompetencyMatrix from '@/app/components/CompetencyMatrix';

export default function MatrixPage() {
    return (
        <div className="container mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Arquitectura de Conocimiento</h1>
                <p className="text-gray-600 mt-2">
                    Visualiza la cobertura de tu banco de preguntas a través de los dominios temáticos y la matriz taxonómica.
                </p>
            </div>

            <CompetencyMatrix />

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-lg mb-3">Estadísticas Rápidas</h3>
                    <p className="text-sm text-gray-600">Conecta este panel con las tablas de intentos para ver el progreso real de los estudiantes.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-lg mb-2">Acciones</h3>
                    <a href="/consultor/analizador" className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                        + Subir nuevo documento para análisis
                    </a>
                </div>
            </div>
        </div>
    );
}
