import React, { useState } from 'react';

interface BatchEditorProps {
    format: string;
    data: any;
    onChange: (newData: any) => void;
}

export default function BatchEditor({ format, data, onChange }: BatchEditorProps) {
    const [status, setStatus] = useState<string | null>(null);

    const applyAction = (actionName: string, actionFn: (prev: any) => any) => {
        try {
            const newData = JSON.parse(JSON.stringify(data));
            const result = actionFn(newData);
            onChange(result);
            setStatus(`Successfully applied: ${actionName}`);
            setTimeout(() => setStatus(null), 3000);
        } catch (err: any) {
            setStatus(`Error applying action: ${err.message}`);
        }
    };

    const actionsByFormat: Record<string, Array<{ name: string; description: string; run: (data: any) => any }>> = {
        rpgmaker: [
            {
                name: "Max Gold",
                description: "Set gold to 9,999,999",
                run: (d) => {
                    if (d.party) {
                        d.party._gold = 9999999;
                        d.party.gold = 9999999;
                    } else {
                        d.gold = 9999999;
                    }
                    return d;
                }
            },
            {
                name: "Level 99 (All Actors)",
                description: "Set all party members to level 99",
                run: (d) => {
                    if (d.actors?._data) {
                        d.actors._data.forEach((actor: any) => {
                            if (actor) {
                                actor._level = 99;
                                actor.level = 99;
                            }
                        });
                    }
                    return d;
                }
            },
            {
                name: "Max Stats (All Actors)",
                description: "Set all HP/MP and parameters to high values",
                run: (d) => {
                    if (d.actors?._data) {
                        d.actors._data.forEach((actor: any) => {
                            if (actor) {
                                actor._hp = 9999;
                                actor._mp = 9999;
                                if (actor._paramPlus) {
                                    actor._paramPlus = actor._paramPlus.map(() => 999);
                                }
                            }
                        });
                    }
                    return d;
                }
            }
        ],
        palworld: [
            {
                name: "Rich Player",
                description: "Heuristic: Set found gold/money to high value",
                run: (d) => {
                    // This is heuristic, usually we'd need to find the gold path
                    // For now, let's keep it simple or placeholders
                    return d;
                }
            }
        ]
    };

    const actions = actionsByFormat[format] || [];

    if (actions.length === 0) {
        return (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                No batch actions available for this format yet.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h4 className="font-bold text-gray-900 flex items-center gap-2">
                <span className="text-xl">⚡</span> Batch Actions (Mass Edit)
            </h4>

            {status && (
                <div className={`p-3 rounded-lg text-sm ${status.includes('Error') ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                    {status}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {actions.map((action) => (
                    <button
                        key={action.name}
                        onClick={() => applyAction(action.name, action.run)}
                        className="flex flex-col text-left p-4 bg-white border border-gray-200 rounded-xl hover:border-primary-500 hover:shadow-md transition-all group"
                    >
                        <span className="font-bold text-gray-900 group-hover:text-primary-600">{action.name}</span>
                        <span className="text-xs text-gray-500 mt-1">{action.description}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
