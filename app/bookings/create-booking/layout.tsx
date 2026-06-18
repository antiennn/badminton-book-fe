import React from 'react'
import Link from 'next/link'

export const metadata = {
    title: 'Create Booking',
}

export default function CreateBookingLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col items-center px-8 py-8 min-w-3xl mx-auto">
            <header className="flex items-center justify-between w-full mb-5">
                <Link
                    href="/"
                    className="text-sm text-gray-600 hover:underline"
                >
                    ← Back
                </Link>

                <h1 className="text-xl font-semibold">
                    Create Booking
                </h1>


                <div className="w-12" />
            </header>
            <main>{children}</main>
        </div>
    )
}
