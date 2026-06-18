import { log } from 'console'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const text = searchParams.get('text')

  if (!text) {
    return NextResponse.json([])
  }

  const url = new URL(
    'https://api.geoapify.com/v1/geocode/autocomplete'
  )

  url.searchParams.set('text', text)
  url.searchParams.set('limit', '5')

  url.searchParams.set('filter', 'countrycode:vn')

  url.searchParams.set(
    'apiKey',
    process.env.NEXT_PUBLIC_GEOAPIFY_KEY ?? ''
  )

  const response = await fetch(url.toString(), {
    next: {
      revalidate: 60,
    },
  })

  const data = await response.json()

  const locations =
    data.features?.map((feature: any) => ({
        id: feature.properties.place_id,
        name:
        feature.properties.address_line1 ||
        feature.properties.formatted,
        address: feature.properties.formatted,
        latitude: feature.properties.lat,
        longitude: feature.properties.lon,
        country: feature.properties.country,
        city: feature.properties.city,
        state: feature.properties.state,
    })) ?? [];


  return NextResponse.json(locations)
}