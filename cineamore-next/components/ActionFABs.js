'use client';

import { useState } from 'react';

export default function ActionFABs() {
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportName, setReportName] = useState('');
    const [reportMsg, setReportMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Request Feature ---
    const handleRequest = async () => {
        const title = prompt("Search for your film? 🎬\nEnter the name of the movie you'd like to request:");
        if (!title || title.trim() === "") return;

        try {
            const res = await fetch('/api/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: title.trim() })
            });

            const data = await res.json();

            if (res.ok) {
                alert(`Request received: "${title}"\nWe'll look into it!`);
            } else {
                const errMsg = data.error || 'Unknown error';
                if (errMsg.includes('auth') || errMsg.includes('connection')) {
                    alert(`⚠️ Database Error: ${errMsg}\n(You are seeing this because the local DB connection failed. The site is running on static data, but saving new requests requires a live DB.)`);
                } else {
                    alert(`Failed to send request: ${errMsg}`);
                }
            }
        } catch (err) {
            console.error("Request Fetch Error:", err);
            alert('Error sending request. Check console for details.');
        }
    };

    // --- Report Feature ---
    const handleReportSubmit = async (e) => {
        e.preventDefault();
        if (!reportMsg.trim()) return;

        setIsSubmitting(true);

        try {
            const res = await fetch('/api/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: reportName.trim(),
                    message: reportMsg.trim(),
                    path: window.location.pathname // Capture where they are reporting from
                })
            });

            const data = await res.json();
            console.log("Report Response:", data); // Debug

            if (res.ok) {
                alert("Thanks! 🚨 Report received.");
                setShowReportModal(false);
                setReportName('');
                setReportMsg('');
            } else {
                const errMsg = data.error || 'Unknown error';
                if (errMsg.includes('auth') || errMsg.includes('connection')) {
                    alert(`⚠️ Database Error: ${errMsg}\n(You are seeing this because the local DB connection failed. The site is running on static data, but saving new reports requires a live DB.)`);
                } else {
                    alert(`❌ Failed to send report: ${errMsg}`);
                }
            }
        } catch (err) {
            console.error("Report Fetch Error:", err);
            alert("Error sending report. Check console for details.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const [showMenu, setShowMenu] = useState(false);

    return (
        <>
            <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50 items-end">
                {/* Menu Items (Slide Up Animation) */}
                <div className={`flex flex-col gap-3 transition-all duration-300 origin-bottom ${showMenu ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}`}>

                    {/* Request Item */}
                    <button
                        onClick={() => { handleRequest(); setShowMenu(false); }}
                        className="flex items-center gap-3 px-4 py-2 rounded-xl backdrop-blur-xl bg-orange-500/90 text-white shadow-lg hover:scale-105 transition-transform border border-white/20"
                    >
                        <span className="text-sm font-bold">Request Film</span>
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-lg">⦿</span>
                    </button>

                    {/* Report Item */}
                    <button
                        onClick={() => { setShowReportModal(true); setShowMenu(false); }}
                        className="flex items-center gap-3 px-4 py-2 rounded-xl backdrop-blur-xl bg-red-500/90 text-white shadow-lg hover:scale-105 transition-transform border border-white/20"
                    >
                        <span className="text-sm font-bold">Report Issue</span>
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-lg">🗨</span>
                    </button>
                </div>

                {/* Main FAB (Circular Glossy) */}
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className={`
                        group relative flex items-center justify-center w-14 h-14 rounded-full 
                        backdrop-blur-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent2)] 
                        border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.3)] 
                        hover:scale-110 active:scale-95 transition-all duration-300 z-50
                        ${showMenu ? 'rotate-45' : 'rotate-0'}
                    `}
                >
                    <span className="text-3xl text-white font-light drop-shadow-md pb-1">+</span>
                </button>
            </div>

            {/* Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-[90%] max-w-md bg-[var(--card-bg)] border border-white/10 p-6 rounded-2xl shadow-2xl relative">
                        <button
                            onClick={() => setShowReportModal(false)}
                            className="absolute top-4 right-4 text-[var(--muted)] hover:text-white text-2xl"
                        >
                            &times;
                        </button>

                        <h2 className="text-2xl font-bold mb-4 text-white">Report an Issue</h2>
                        <form onSubmit={handleReportSubmit} className="flex flex-col gap-4">
                            <input
                                type="text"
                                placeholder="Your Name (Optional)"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--accent)] transition-colors"
                                value={reportName}
                                onChange={(e) => setReportName(e.target.value)}
                            />
                            <textarea
                                placeholder="Describe the issue..."
                                rows="4"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--accent)] transition-colors"
                                value={reportMsg}
                                onChange={(e) => setReportMsg(e.target.value)}
                                required
                            ></textarea>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-[var(--accent)] text-black font-bold py-3 rounded-xl hover:bg-[var(--accent2)] transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? 'Sending...' : 'Send Report'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
