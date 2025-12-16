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

        console.log("Submitting Request:", title); // Debug
        try {
            const res = await fetch('/api/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: title.trim() })
            });

            const data = await res.json();
            console.log("Request Response:", data); // Debug

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
        console.log("Submitting Report:", { name: reportName, msg: reportMsg }); // Debug

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
            <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-50">
                {/* Request FAB (Glossy iOS Style) */}
                <button
                    onClick={handleRequest}
                    className="group relative flex items-center justify-center w-14 h-14 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:scale-110 hover:bg-white/20 transition-all duration-300"
                    title="Request Film"
                >
                    <span className="text-2xl drop-shadow-md">🎬</span>
                    <span className="absolute right-16 backdrop-blur-md bg-black/60 border border-white/10 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">Request Film</span>
                </button>

                {/* Report FAB (Glossy Red/Warning Style) */}
                <button
                    onClick={() => setShowReportModal(true)}
                    className="group relative flex items-center justify-center w-14 h-14 rounded-full backdrop-blur-xl bg-red-500/10 border border-red-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:scale-110 hover:bg-red-500/20 transition-all duration-300"
                    title="Report Issue"
                >
                    <span className="text-2xl drop-shadow-md">🚨</span>
                    <span className="absolute right-16 backdrop-blur-md bg-black/60 border border-white/10 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">Report Issue</span>
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
