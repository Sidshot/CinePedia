'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ThemeToggle from './ThemeToggle';

export default function Header() {
    return (
        <header className="sticky top-0 z-40 backdrop-blur-[20px] bg-[rgba(11,15,20,0.4)] border-b border-[var(--border)] mask-image-[linear-gradient(to_bottom,black_85%,transparent_100%)]">
            <div className="max-w-[1600px] mx-auto px-5 py-4">
                <div className="flex items-center justify-between gap-5">

                    {/* Brand */}
                    <Link href="/" className="flex items-center gap-2.5 no-underline group">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent2)] shadow-[0_0_20px_rgba(255,176,63,0.5)] group-hover:scale-110 transition-transform"></div>
                        <h1 className="text-[1.45rem] font-extrabold tracking-wide m-0 bg-clip-text text-transparent bg-gradient-to-r from-[var(--fg)] to-[var(--accent)]">
                            CineAmore <span className="text-xl">🎞️</span>
                        </h1>
                    </Link>

                    {/* Right Controls */}
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </header>
    );
}
