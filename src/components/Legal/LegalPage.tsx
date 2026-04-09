import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface LegalPageProps {
    title: string;
    content: string;
    onBack: () => void;
}

const LegalPage: React.FC<LegalPageProps> = ({ title, content, onBack }) => {
    return (
        <div className="fixed inset-0 z-[100] bg-background flex flex-col animate-fade-in">
            <header className="px-6 py-4 border-b border-border flex items-center gap-4 bg-card/50 backdrop-blur-md">
                <button onClick={onBack} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
                    <ChevronLeft size={20} />
                </button>
                <h2 className="text-lg font-display font-bold">{title}</h2>
            </header>

            <main className="flex-1 overflow-y-auto p-6 md:p-12 max-w-3xl mx-auto w-full">
                <div className="prose prose-invert prose-yellow max-w-none">
                    {content.split('\n').map((line, i) => {
                        if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-black mb-6 text-primary">{line.replace('# ', '')}</h1>;
                        if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold mt-8 mb-4 text-primary/80">{line.replace('## ', '')}</h2>;
                        if (line.startsWith('* ')) return <li key={i} className="ml-4 mb-2 text-text-muted">{line.replace('* ', '')}</li>;
                        if (line.trim() === '') return <br key={i} />;
                        return <p key={i} className="mb-4 text-text-main leading-relaxed">{line}</p>;
                    })}
                </div>
            </main>
        </div>
    );
};

export default LegalPage;
