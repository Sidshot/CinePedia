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

    return (
        <>
            <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-50 items-end">
                {/* Request FAB (Glossy Orange Pill) */}
                <button
                    onClick={handleRequest}
                    className="group relative flex items-center justify-center gap-2 px-6 py-3 rounded-full backdrop-blur-2xl bg-gradient-to-r from-orange-500/85 to-amber-500/85 border border-white/30 shadow-[0_8px_32px_rgba(249,115,22,0.3)] shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] hover:scale-105 hover:bg-orange-500/95 transition-all duration-300 ring-1 ring-white/20"
                >
                    <span className="text-xl drop-shadow-md">⦿</span>
                    <span className="text-sm tracking-wide font-bold text-white drop-shadow-sm">Request Film</span>
                </button>

                {/* Report FAB (Glossy Red/Pink Pill) */}
                <button
                    onClick={() => setShowReportModal(true)}
                    className="group relative flex items-center justify-center gap-2 px-6 py-3 rounded-full backdrop-blur-2xl bg-gradient-to-r from-red-500/85 to-pink-500/85 border border-white/30 shadow-[0_8px_32px_rgba(239,68,68,0.3)] shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] hover:scale-105 hover:bg-red-500/95 transition-all duration-300 ring-1 ring-white/20"
                >
                    <span className="text-xl drop-shadow-md">🗨</span>
                    <span className="text-sm tracking-wide font-bold text-white drop-shadow-sm">Report Issue</span>
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
