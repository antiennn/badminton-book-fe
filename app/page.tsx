"use client";

import { gql, useMutation, useQuery } from "@apollo/client";
import { useAuth0 } from "@auth0/auth0-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const SYNC_USER = gql`
  mutation SyncUser($input: LoginInput!) {
    syncUser(input: $input) {
      _id
      email
      name
      avatar
      profileCompleted
    }
  }
`;


const GET_BOOKINGS = gql`
  query GetBookings(
    $day: String
    $longitude: Float
    $latitude: Float
    $withinKm: Float
    $page: Int
    $limit: Int
  ) {
    bookings(
      day: $day
      longitude: $longitude
      latitude: $latitude
      withinKm: $withinKm
      page: $page
      limit: $limit
    ) {
      _id
      maleLevelRequired
      femaleLevelRequired
      maleRequired
      femaleRequired
      startTime
      endTime
      day
      malePrice
      femalePrice
      address
      longitude
      latitude
      facilities
      userId
      maleJoined
      femaleJoined
    }
  }
`;

const levels = ["Beginner", "Low Intermediate", "Intermediate", "Advanced"];

const formatLevel = (level: string) =>
  level
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace("LowIntermediate", "Low Intermediate");

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

type Booking = {
  _id: string;
  maleLevelRequired?: string[];
  femaleLevelRequired?: string[];
  maleRequired?: number;
  femaleRequired?: number;
  startTime?: string;
  endTime?: string;
  day?: string;
  malePrice?: number;
  femalePrice?: number;
  address?: string;
  facilities?: string[];
  userId?: string;
  maleJoined?: number;
  femaleJoined?: number;
  latitude?: number;
  longitude?: number;
};

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { user, isAuthenticated, isLoading } = useAuth0();
  const [selectedRange, setSelectedRange] = useState<
    "all" | "today" | "tomorrow" | "custom"
  >("all");
  const [selectedDate, setSelectedDate] = useState(formatDateKey(new Date()));
  const [nearYouEnabled, setNearYouEnabled] = useState(false);
  const [distanceKm, setDistanceKm] = useState(5);
  const [nearYouLoading, setNearYouLoading] = useState(false);
  const [debouncedDistanceKm, setDebouncedDistanceKm] = useState(distanceKm);
  const [openMenu, setOpenMenu] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const PAGE_SIZE = 10;

  const [syncUser, { data, loading }] = useMutation(SYNC_USER);


  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedDistanceKm(distanceKm);
    }, 300); // debounce 300ms

    return () => clearTimeout(timer);
  }, [distanceKm]);

  const todayKey = useMemo(() => formatDateKey(new Date()), []);
  const tomorrowKey = useMemo(() => {
    const tomorrow = new Date(todayKey);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return formatDateKey(tomorrow);
  }, [todayKey]);

  const selectedDay = useMemo(() => {
    if (selectedRange === "today") return todayKey;

    if (selectedRange === "tomorrow") return tomorrowKey;

    if (selectedRange === "custom") return selectedDate;

    return undefined;
  }, [selectedDate, selectedRange, todayKey, tomorrowKey]);

  const bookingVariables = useMemo(
    () => ({
      day: selectedDay,
      longitude:
        nearYouEnabled && userLocation ? userLocation.longitude : undefined,
      latitude:
        nearYouEnabled && userLocation ? userLocation.latitude : undefined,
      withinKm: nearYouEnabled && userLocation ? debouncedDistanceKm : undefined,
      page: currentPage,
      limit: PAGE_SIZE,
    }),
    [nearYouEnabled, selectedDay, userLocation, debouncedDistanceKm, currentPage],
  );

  const {
    data: bookingsData,
    loading: bookingsLoading,
    error: bookingsError,
  } = useQuery(GET_BOOKINGS, {
    variables: bookingVariables,
    fetchPolicy: "cache-and-network",
  });

  const bookings: Booking[] = allBookings;
  const hasMoreBookings = (bookingsData?.bookings?.length ?? 0) === PAGE_SIZE;

  const handleJoinBooking = (booking: Booking) => {
    router.push(`/bookings/${booking._id}`);
  };

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handleNearYouToggle = () => {
    if (nearYouEnabled) {
      setNearYouEnabled(false);
      setGeoError(null);
      return;
    }

    if (!navigator.geolocation) {
      setGeoError("Geolocation is not available on this browser.");
      return;
    }

    setNearYouLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setNearYouEnabled(true);
        setNearYouLoading(false);
      },
      () => {
        setGeoError(
          "Unable to access your location. Please allow location permission and try again.",
        );
        setNearYouEnabled(false);
        setNearYouLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  };

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    setCurrentPage(1);
    setAllBookings([]);
  }, [selectedDay, nearYouEnabled, distanceKm, userLocation]);

  useEffect(() => {
    if (!bookingsData?.bookings) return;

    if (currentPage === 1) {
      setAllBookings(bookingsData.bookings);
      return;
    }

    setAllBookings((prevBookings) => {
      const nextBookings: Booking[] = bookingsData.bookings ?? [];
      const existingIds = new Set(prevBookings.map((booking) => booking._id));

      return [
        ...prevBookings,
        ...nextBookings.filter(
          (booking: Booking) => !existingIds.has(booking._id),
        ),
      ];
    });
  }, [bookingsData, currentPage]);

  useEffect(() => {
    if (isAuthenticated && user) {
      syncUser({
        variables: {
          input: {
            auth0Id: user.sub,
            email: user.email,
            name: user.name,
            avatar: user.picture,
          },
        },
      });
    }
  }, [isAuthenticated, user, syncUser]);

  useEffect(() => {
    if (!data?.syncUser) return;

    const skipParam = searchParams?.get("skipOnboarding") === "1";

    const skipLocal =
      typeof window !== "undefined" &&
      localStorage.getItem("skipOnboarding") === "1";

    if (!data.syncUser.profileCompleted && !skipParam && !skipLocal) {
      router.push("/onboarding");
    }
  }, [data, router, searchParams]);

  if (isLoading) {
    return (
      <main className="flex h-screen items-center justify-center">
        Loading...
      </main>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (loading || bookingsLoading) {
    return (
      <main className="flex h-screen items-center justify-center">
        Loading profile...
      </main>
    );
  }

  if (bookingsError) {
    return (
      <main className="flex h-screen items-center justify-center px-6 text-center text-red-600">
        Unable to load bookings right now.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">

          <div>
            <h1 className="text-3xl font-bold">
              🏸 Badminton Booking
            </h1>

            <p className="mt-1 text-gray-500">
              Welcome back, {user?.name}
            </p>
          </div>

          <div className="relative">

            <button
              onClick={() => setOpenMenu(!openMenu)}
              className="
                flex
                items-center
                gap-3
                rounded-2xl
                px-3
                py-2
                transition
                hover:bg-gray-100
              "
            >
              <div className="text-right">

                <p className="font-semibold">
                  {user?.name}
                </p>

                <p className="text-sm text-gray-500">
                  {user?.email}
                </p>

              </div>

              <img
                src={user?.picture}
                className="h-12 w-12 rounded-full border"
              />
            </button>

            {openMenu && (

              <div
                className="
                  absolute
                  right-0
                  top-16
                  z-50
                  w-64
                  overflow-hidden
                  rounded-2xl
                  border
                  bg-white
                  shadow-xl
                "
              >

                <div className="border-b p-4">

                  <p className="font-semibold">
                    {user?.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    {user?.email}
                  </p>

                </div>

                <button
                  onClick={() => {
                    router.push("/history");
                  }}
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    px-5
                    py-4
                    text-left
                    transition
                    hover:bg-gray-100
                  "
                >
                  History
                </button>

                <button
                  onClick={() => router.push("/login")}
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    border-t
                    px-5
                    py-4
                    text-left
                    text-red-600
                    transition
                    hover:bg-red-50
                  "
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Search */}

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <input
            placeholder="🔍 Search location..."
            className="w-full rounded-xl border px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setSelectedRange("all")}
              className={`rounded-full px-5 py-2 ${selectedRange === "all" ? "bg-blue-600 text-white" : "border bg-white"}`}
            >
              All
            </button>

            <button
              type="button"
              onClick={() => setSelectedRange("today")}
              className={`rounded-full px-5 py-2 ${selectedRange === "today" ? "bg-blue-600 text-white" : "border bg-white"}`}
            >
              Today
            </button>

            <button
              type="button"
              onClick={() => setSelectedRange("tomorrow")}
              className={`rounded-full px-5 py-2 ${selectedRange === "tomorrow" ? "bg-blue-600 text-white" : "border bg-white"}`}
            >
              Tomorrow
            </button>

            <button
              type="button"
              onClick={handleNearYouToggle}
              disabled={nearYouLoading}
              className={`rounded-full px-5 py-2 transition ${nearYouEnabled ? "bg-green-600 text-white" : "border bg-white hover:border-green-500 hover:text-green-600"} ${nearYouLoading ? "cursor-wait opacity-70" : ""}`}
            >
              {nearYouLoading ? "Locating..." : "Near you"}
            </button>
          </div>

          {geoError ? (
            <p className="mt-3 text-sm text-red-600">{geoError}</p>
          ) : null}

          {nearYouEnabled && (
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Search radius
                </span>

                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                  {distanceKm} km
                </span>
              </div>

              <input
                type="range"
                min={1}
                max={20}
                step={1}
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value))}
                className="w-full accent-blue-600"
              />

              <div className="mt-2 flex justify-between text-xs text-gray-400">
                <span>1 km</span>
                <span>5 km</span>
                <span>10 km</span>
                <span>15 km</span>
                <span>20 km</span>
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center gap-3">
            <label
              htmlFor="booking-date"
              className="text-sm font-medium text-gray-700"
            >
              Select day
            </label>
            <input
              id="booking-date"
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedRange("custom");
              }}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mt-6">
            <p className="mb-3 font-medium">Level</p>

            <div className="flex flex-wrap gap-2">
              {levels.map((level) => (
                <button
                  key={level}
                  className="rounded-full border bg-white px-4 py-2 hover:border-blue-500 hover:text-blue-600"
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* List */}

        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Available Booking</h2>

          <span className="text-gray-500">{bookings.length} results</span>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {bookings.length === 0 ? (
            <div className="rounded-2xl bg-white p-6 text-gray-500 shadow-sm w-full text-center">
              No bookings found for this date range.
            </div>
          ) : (
            bookings.map((booking: Booking) => (
              <article
                key={booking._id}
                className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {booking.address || "Badminton Booking"}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      📍 {booking.address}
                    </p>
                  </div>

                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    OPEN
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap gap-5 text-sm text-gray-600">
                  <span>📅 {booking.day}</span>

                  <span>
                    🕕 {booking.startTime} - {booking.endTime}
                  </span>
                </div>

                <div className="mt-6">
                  <p className="font-medium">
                    👨 Need {booking.maleRequired} players
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {(booking.maleLevelRequired ?? []).map((level: string) => (
                      <span
                        key={`${booking._id}-male-${level}`}
                        className="rounded-full bg-blue-100 px-3 py-1 text-sm"
                      >
                        {formatLevel(level)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <p className="font-medium">
                    👩 Need {booking.femaleRequired} players
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {(booking.femaleLevelRequired ?? []).map(
                      (level: string) => (
                        <span
                          key={`${booking._id}-female-${level}`}
                          className="rounded-full bg-pink-100 px-3 py-1 text-sm"
                        >
                          {formatLevel(level)}
                        </span>
                      ),
                    )}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">
                      👨 {booking.malePrice?.toLocaleString()}đ
                    </p>

                    <p className="font-semibold">
                      👩 {booking.femalePrice?.toLocaleString()}đ
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleJoinBooking(booking)}
                    className="rounded-xl bg-blue-600 px-5 py-3 text-white transition hover:bg-blue-700"
                  >
                    Join
                  </button>
                </div>
              </article>
            ))
          )}
        </div>

        {hasMoreBookings && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={bookingsLoading}
              className="rounded-xl border border-blue-600 px-5 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {bookingsLoading ? "Loading..." : "Load more"}
            </button>
          </div>
        )}
      </div>

      {/* Floating Button */}

      <button
        onClick={() => router.push("bookings/create-booking")}
        className="
          fixed
          bottom-8
          right-8
          flex
          h-16
          w-16
          items-center
          justify-center
          rounded-full
          bg-blue-600
          text-4xl
          text-white
          shadow-lg
          transition
          hover:scale-105
        "
      >
        +
      </button>
    </main>
  );
}
