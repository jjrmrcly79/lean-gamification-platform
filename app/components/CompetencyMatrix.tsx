
'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase-client';
import { Database } from '@/lib/database.types';

type KnowledgeType = Database['public']['Enums']['knowledge_type'];
type CognitiveLevel = Database['public']['Enums']['cognitive_level'];

interface MatrixData {
    [key: string]: number; // key format: "cognitive-knowledge" -> count
}

const KNOWLEDGE_TYPES: KnowledgeType[] = ['factual', 'conceptual', 'procedural', 'metacognitive'];
const COGNITIVE_LEVELS: CognitiveLevel[] = ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'];

export default function CompetencyMatrix() {
    const supabase = getSupabaseBrowserClient();
    const [data, setData] = useState<MatrixData>({});
    const [domains, setDomains] = useState<any[]>([]);
    const [selectedDomain, setSelectedDomain] = useState<string>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDomains();
        fetchMatrixData();
    }, [selectedDomain]);

    const fetchDomains = async () => {
        const { data } = await supabase.from('domains').select('id, name');
        if (data) setDomains(data);
    };

    const fetchMatrixData = async () => {
        setLoading(true);
        let query = supabase.from('master_questions').select('knowledge_type, cognitive_level');

        if (selectedDomain !== 'all') {
            query = query.eq('domain_id', selectedDomain);
        }

        const { data: questions, error } = await query;

        if (error) {
            console.error('Error fetching questions:', error);
            setLoading(false);
            return;
        }

        const matrix: MatrixData = {};
        questions?.forEach((q) => {
            if (q.knowledge_type && q.cognitive_level) {
                const key = `${q.cognitive_level}-${q.knowledge_type}`;
                matrix[key] = (matrix[key] || 0) + 1;
            }
        });

        setData(matrix);
        setLoading(false);
    };

    const getCount = (cog: CognitiveLevel, know: KnowledgeType) => {
        return data[`${cog}-${know}`] || 0;
    };

    const getCellColor = (count: number) => {
        if (count === 0) return 'bg-gray-50 text-gray-400';
        if (count < 3) return 'bg-yellow-100 text-yellow-800';
        if (count < 5) return 'bg-green-100 text-green-800';
        return 'bg-blue-100 text-blue-800 font-bold';
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Matriz de Competencias (Anderson & Krathwohl)</h2>
                <select
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                >
                    <option value="all">Todos los Dominios</option>
                    {domains.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </select>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="p-3 bg-gray-50 border border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Proceso Cognitivo
                            </th>
                            {KNOWLEDGE_TYPES.map(k => (
                                <th key={k} className="p-3 bg-gray-50 border border-gray-200 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    {k.charAt(0).toUpperCase() + k.slice(1)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {COGNITIVE_LEVELS.slice().reverse().map((cog) => ( // Reverse to show Create at top usually, but standard matrix often has Remember at bottom. Let's strictly follow standard: Remember (bottom) -> Create (top). Or 1-6 Top-Down. Table usually 1-6. Let's do 6 (Create) at top.
                            <tr key={cog}>
                                <td className="p-3 border border-gray-200 font-medium text-gray-700 capitalize">
                                    {cog}
                                </td>
                                {KNOWLEDGE_TYPES.map((know) => {
                                    const count = getCount(cog, know);
                                    return (
                                        <td key={know} className={`p-4 border border-gray-200 text-center transition-colors hover:opacity-80 cursor-pointer ${getCellColor(count)}`}>
                                            {loading ? '...' : count}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-50 border border-gray-200 block"></span> Vacío</div>
                <div className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-100 block"></span> Bajo (1-2)</div>
                <div className="flex items-center gap-1"><span className="w-3 h-3 bg-green-100 block"></span> Bueno (3-4)</div>
                <div className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-100 block"></span> Óptimo (5+)</div>
            </div>
        </div>
    );
}
