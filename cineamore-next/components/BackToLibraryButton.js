'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

export default function BackToLibraryButton() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [clicked, setClicked] = useState(false);

    const handleClick = (e) => {
        e.preventDefault();
        setClicked(true);
        startTransition(() => {
            router.push('/');
        });
    };

    return (
        <button
            onClick={handleClick}
            disabled={clicked}
            className={`bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-white/90 font-medium hover:bg-white/10 transition flex items-center gap-2 ${clicked ? 'opacity-70 cursor-wait' : ''}`}
        >
            {clicked ? (
                <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Loading Library...</span>
                </>
            ) : (
                <span>← Back to Library</span>
            )}
        </button>
    );
}
