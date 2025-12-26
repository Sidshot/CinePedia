'use client';

import { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

/**
 * Infinite scroll hook
 * Automatically loads more content when user scrolls near the bottom
 */
export function useInfiniteScroll({ onLoadMore, hasMore, isLoading }) {
    const { ref, inView } = useInView({
        threshold: 0.5,
        rootMargin: '100px', // Trigger 100px before reaching the element
    });

    useEffect(() => {
        if (inView && hasMore && !isLoading) {
            onLoadMore();
        }
    }, [inView, hasMore, isLoading, onLoadMore]);

    return ref;
}

/**
 * InfiniteScrollTrigger component
 * Place at the end of your list to trigger loading more items
 */
export function InfiniteScrollTrigger({ onLoadMore, hasMore, isLoading }) {
    const ref = useInfiniteScroll({ onLoadMore, hasMore, isLoading });

    if (!hasMore) return null;

    return (
        <div ref={ref} className="w-full py-8 flex justify-center">
            {isLoading ? (
                <div className="flex items-center gap-3 text-[var(--muted)]">
                    <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading more...</span>
                </div>
            ) : (
                <div className="text-[var(--muted)] text-sm">
                    Scroll to load more
                </div>
            )}
        </div>
    );
}
