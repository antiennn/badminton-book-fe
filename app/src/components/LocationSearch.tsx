'use client'

import { useEffect, useRef, useState } from 'react'

export interface LocationResult {
    id: string
    name: string
    address: string
    latitude: number
    longitude: number
}

interface LocationSearchProps {
    onSelect: (location: LocationResult) => void
}

export default function LocationSearch({
    onSelect,
}: LocationSearchProps) {
    const wrapperRef = useRef<HTMLDivElement>(null)

    const [keyword, setKeyword] = useState('')
    const skipNextSearch = useRef(false)
    const [results, setResults] = useState<LocationResult[]>([])
    const [loading, setLoading] = useState(false)
    const [onFocus, setOnFocus] = useState(false)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node)
            ) {
                setResults([])
            }
        }

        document.addEventListener('mousedown', handleClickOutside)

        return () =>
            document.removeEventListener(
                'mousedown',
                handleClickOutside
            )
    }, [])

    useEffect(() => {
        if (skipNextSearch.current) {
            skipNextSearch.current = false
            return
        }
        
        if (keyword.trim().length < 2) {
            setResults([])
            return
        }

        const controller = new AbortController()

        const timeout = setTimeout(async () => {
            try {
                setLoading(true)

                const response = await fetch(
                    `/api/location/search?text=${encodeURIComponent(
                        keyword
                    )}`,
                    {
                        signal: controller.signal,
                    }
                )

                if (!response.ok) {
                    throw new Error('Failed to search location')
                }

                const data: LocationResult[] = await response.json()

                setResults(data)
            } catch (error: any) {
                if (error.name !== 'AbortError') {
                    console.error(error)
                }
            } finally {
                setLoading(false)
            }
        }, 400)

        return () => {
            controller.abort()
            clearTimeout(timeout)
        }
    }, [keyword])

    return (
        <div
            ref={wrapperRef}
            className="relative w-full"
        >
            <div className="relative">
                <input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Search badminton court or address..."
                    className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 outline-none transition focus:border-blue-500"
                    onFocus={() => setOnFocus(true)}
                    onBlur={() => setOnFocus(false)}
                />

                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    🔍
                </span>
            </div>

            {loading && (
                <div className="mt-2 text-sm text-gray-500">
                    Searching...
                </div>
            )}

            {!loading && !skipNextSearch.current && onFocus &&
                keyword.length >= 2 &&
                results.length === 0 && (
                    <div className="absolute z-20 mt-2 w-full rounded-lg border bg-white p-4 text-sm text-gray-500 shadow-lg">
                        No locations found.
                    </div>
                )}

            {results.length > 0 && (
                <div className="absolute z-20 mt-2 max-h-80 w-full overflow-y-auto rounded-lg border bg-white shadow-xl">
                    {results.map((location) => (
                        <button
                            key={location.id}
                            type="button"
                            onClick={() => {
                                onSelect(location)
                                setKeyword(location.name)
                                setResults([])
                                skipNextSearch.current = true
                            }}
                            className="flex w-full flex-col px-4 py-3 text-left transition hover:bg-blue-50 border-b last:border-b-0"
                        >
                            <span className="font-medium text-gray-900">
                                🏸 {location.name}
                            </span>

                            <span className="mt-1 text-sm text-gray-500">
                                {location.address}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}