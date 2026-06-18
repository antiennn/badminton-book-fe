"use client";

import { gql, useQuery } from "@apollo/client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth0 } from "@auth0/auth0-react";
import * as Dialog from "@radix-ui/react-dialog";

const MY_BOOKINGS = gql`
  query MyBookingsPage {
    myJoinedBookings {
      upcoming {
        _id
        status

        booking {
          _id
          address
          day
          startTime
          endTime
          malePrice
          femalePrice

          owner {
            name
            avatar
          }
        }
      }

      pending {
        _id
        status

        booking {
          _id
          address
          day
          startTime
          endTime
          malePrice
          femalePrice

          owner {
            name
            avatar
          }
        }
      }

      history {
        _id
        status

        booking {
          _id
          address
          day
          startTime
          endTime
          malePrice
          femalePrice

          owner {
            name
            avatar
          }
        }
      }
    }

    myBookings {
      _id
      address
      day
      startTime
      endTime

      maleRequired
      femaleRequired
      maleJoined
      femaleJoined

      owner {
        name
        avatar
      }

      participants {
        _id
        gender
        level
        status

        user {
          _id
          name
          avatar
        }
      }
    }

    me {
      gender
    }
  }
`;

export default function MyBookingsPage() {
  const router = useRouter();
  const { user } = useAuth0();

  const [reviewOpen, setReviewOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);

  const [selectedBooking, setSelectedBooking] =
    useState<any>(null);

  const acceptedPlayers =
    selectedBooking?.participants?.filter(
      (p: any) =>
        p.status === "ACCEPTED" &&
        p.userId !== user?.sub,
    ) || [];

  const [tab, setTab] = useState<"upcoming" | "pending" | "history" | "hosting">(
    "upcoming",
  );

  const { data, loading, refetch } = useQuery(
    MY_BOOKINGS,
    {
      fetchPolicy: "network-only",
    },
  );

  const gender = data?.me?.gender;

  const upcoming = data?.myJoinedBookings?.upcoming ?? [];

  const pending = data?.myJoinedBookings?.pending ?? [];

  const history = data?.myJoinedBookings?.history ?? [];

  const myCreatedBookings = data?.myBookings ?? [];

  const currentData = useMemo(() => {
    switch (tab) {
      case "pending":
        return pending;

      case "history":
        return history;

      case "hosting":
        return myCreatedBookings;

      default:
        return upcoming;
    }
  }, [
    tab,
    upcoming,
    pending,
    history,
    myCreatedBookings,
  ]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="h-44 rounded-3xl bg-gray-200" />

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <div className="h-36 rounded-3xl bg-gray-200" />
            <div className="h-36 rounded-3xl bg-gray-200" />
            <div className="h-36 rounded-3xl bg-gray-200" />
          </div>

          <div className="mt-8 h-16 rounded-full bg-gray-200" />

          <div className="mt-8 space-y-5">
            <div className="h-52 rounded-3xl bg-gray-200" />
            <div className="h-52 rounded-3xl bg-gray-200" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-20">

      <Dialog.Root
        open={reviewOpen}
        onOpenChange={setReviewOpen}
      >
        <Dialog.Portal>

          <Dialog.Overlay
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />

          <Dialog.Content
            className="
              fixed
              left-1/2
              top-1/2
              w-[95vw]
              max-w-3xl
              -translate-x-1/2
              -translate-y-1/2
              overflow-hidden
              rounded-[32px]
              bg-white
              shadow-2xl
            "
          >

            {/* Header */}

            <div className="border-b bg-gradient-to-r from-yellow-50 to-orange-50 p-8">

              <Dialog.Title className="text-3xl font-bold">
                Review Players
              </Dialog.Title>

              <p className="mt-2 text-gray-500">
                Reward great teammates and help the community.
              </p>

            </div>

            {/* Body */}

            <div className="max-h-[65vh] space-y-5 overflow-y-auto p-8">

              {acceptedPlayers.map((player: any) => (

                <div
                  key={player.userId}
                  className="
                    flex
                    items-center
                    justify-between
                    rounded-3xl
                    border
                    border-gray-100
                    bg-gray-50
                    p-5
                    transition
                    hover:-translate-y-1
                    hover:bg-white
                    hover:shadow-lg
                  "
                >

                  <div className="flex items-center gap-5">

                    <img
                      src={player.user.avatar}
                      className="
                        h-16
                        w-16
                        rounded-full
                        border-4
                        border-white
                        shadow
                      "
                    />

                    <div>

                      <h3 className="text-lg font-bold">
                        {player.user.name}
                      </h3>

                      <div className="mt-1 flex items-center gap-2">

                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                          {player.level}
                        </span>

                        <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-medium text-pink-700">
                          {player.gender}
                        </span>

                      </div>

                      <p className="mt-3 text-sm text-gray-500">
                        Reputation
                      </p>
                      <div className="flex items-center gap-2">

                        <span className="font-semibold">
                          Score: {player.user.reputationScore}
                        </span>

                      </div>

                    </div>

                  </div>

                  <div className="flex flex-col gap-3">

                    <button
                      className="
                        rounded-2xl
                        bg-yellow-500
                        px-6
                        py-3
                        font-semibold
                        text-white
                        transition
                        hover:scale-105
                        hover:bg-yellow-600
                      "
                    >
                       Give 5 Stars
                    </button>

                    <button
                      className="
                        rounded-2xl
                        border
                        border-red-200
                        px-6
                        py-3
                        font-semibold
                        text-red-600
                        transition
                        hover:bg-red-50
                      "
                    >
                      🚩 Report
                    </button>

                  </div>

                </div>

              ))}

              {acceptedPlayers.length === 0 && (

                <div className="py-16 text-center">

                  <div className="text-6xl">
                    🏸
                  </div>

                  <h3 className="mt-6 text-2xl font-bold">
                    No players to review
                  </h3>

                  <p className="mt-2 text-gray-500">
                    All accepted players have already been reviewed.
                  </p>

                </div>

              )}

            </div>

            {/* Footer */}

            <div className="flex justify-end border-t bg-gray-50 p-6">

              <button
                onClick={() => setReviewOpen(false)}
                className="
                  rounded-2xl
                  border
                  px-6
                  py-3
                  font-semibold
                  hover:bg-white
                "
              >
                Close
              </button>

            </div>

          </Dialog.Content>

        </Dialog.Portal>
      </Dialog.Root>

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
      <div className="mx-auto max-w-7xl px-6 py-10">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mb-6 text-sm font-medium text-blue-600 hover:underline"
        >
          ← Back
        </button>
        {/* HERO */}

        <div className="rounded-[32px] bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-10 text-white shadow-xl">
          <p className="text-sm opacity-80">Dashboard</p>

          <h1 className="mt-3 text-5xl font-bold">My Activities 🏸</h1>

          <p className="mt-4 max-w-2xl text-white/80">
            Track every badminton session you've joined, waiting requests and
            completed matches.
          </p>
        </div>

        {/* STATS */}

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <p className="text-gray-500">Upcoming</p>

            <h2 className="mt-3 text-5xl font-bold text-blue-600">
              {upcoming.length}
            </h2>

            <p className="mt-2 text-sm text-gray-400">Accepted matches</p>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <p className="text-gray-500">Pending</p>

            <h2 className="mt-3 text-5xl font-bold text-orange-500">
              {pending.length}
            </h2>

            <p className="mt-2 text-sm text-gray-400">Waiting approval</p>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <p className="text-gray-500">History</p>

            <h2 className="mt-3 text-5xl font-bold text-green-600">
              {history.length}
            </h2>

            <p className="mt-2 text-sm text-gray-400">Completed matches</p>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <p className="text-gray-500">My Created Bookings</p>

            <h2 className="mt-3 text-5xl font-bold text-blue-600">
              {myCreatedBookings.length}
            </h2>

            <p className="mt-2 text-sm text-gray-400">Hosting</p>
          </div>
        </div>

        {/* TABS */}

        <div className="mt-10 flex flex-wrap gap-4">
          <button
            onClick={() => setTab("upcoming")}
            className={`rounded-full px-6 py-3 font-semibold transition ${
              tab === "upcoming" ? "bg-blue-600 text-white" : "bg-white shadow"
            }`}
          >
            Upcoming
          </button>

          <button
            onClick={() => setTab("pending")}
            className={`rounded-full px-6 py-3 font-semibold transition ${
              tab === "pending" ? "bg-orange-500 text-white" : "bg-white shadow"
            }`}
          >
            Pending
          </button>

          <button
            onClick={() => setTab("history")}
            className={`rounded-full px-6 py-3 font-semibold transition ${
              tab === "history" ? "bg-green-600 text-white" : "bg-white shadow"
            }`}
          >
            History
          </button>

          <button
            onClick={() => setTab("hosting")}
            className={`rounded-full px-6 py-3 font-semibold transition ${
              tab === "hosting"
                ? "bg-purple-600 text-white"
                : "bg-white shadow"
            }`}
          >
            Hosting ({myCreatedBookings.length})
          </button>
        </div>

        {currentData.length === 0 && tab !== "hosting" && (
          <div className="mt-20 rounded-3xl bg-white p-20 text-center shadow">
            <div className="text-7xl">🏸</div>

            <h2 className="mt-6 text-3xl font-bold">No bookings</h2>

            <p className="mt-3 text-gray-500">
              Start joining badminton matches around you.
            </p>
          </div>
        )}
        <div className="mt-8 space-y-6"></div>


        {tab === "hosting" &&
        currentData.map((booking: any) => {
          const endTime = new Date(
            `${booking.day}T${booking.endTime}:00`,
          );

          const finished = endTime.getTime() < Date.now();

          const pendingCount =
            booking.participants?.filter(
              (p: any) => p.status === "PENDING",
            ).length || 0;

          const acceptedCount =
            booking.participants?.filter(
              (p: any) => p.status === "ACCEPTED",
            ).length || 0;

          return (
            <div
              key={booking._id}
              className="
                overflow-hidden
                rounded-[32px]
                bg-white
                shadow-sm
                transition
                hover:-translate-y-1
                hover:shadow-xl
              "
            >
              <div className="grid lg:grid-cols-[1fr_280px]">

                {/* LEFT */}

                <div className="p-8">

                  <div className="flex items-start justify-between">

                    <div>
                      <h2 className="text-3xl font-bold">
                        🏸 {booking.address}
                      </h2>

                      <p className="mt-3 text-gray-500">
                        📅 {booking.day}
                      </p>

                      <p className="text-gray-500">
                        🕘 {booking.startTime} - {booking.endTime}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-5 py-2 text-sm font-semibold ${
                        finished
                          ? "bg-gray-100 text-gray-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {finished ? "Finished" : "Hosting"}
                    </span>
                  </div>

                  <div className="my-8 h-px bg-gray-100" />

                  <div className="grid grid-cols-2 gap-5 md:grid-cols-4">

                    <div className="rounded-2xl bg-slate-50 p-5">
                      <p className="text-sm text-gray-500">
                        Male
                      </p>

                      <p className="mt-2 text-3xl font-bold">
                        {booking.maleJoined}/{booking.maleRequired}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-5">
                      <p className="text-sm text-gray-500">
                        Female
                      </p>

                      <p className="mt-2 text-3xl font-bold">
                        {booking.femaleJoined}/{booking.femaleRequired}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-5">
                      <p className="text-sm text-gray-500">
                        Accepted
                      </p>

                      <p className="mt-2 text-3xl font-bold text-green-600">
                        {acceptedCount}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-5">
                      <p className="text-sm text-gray-500">
                        Pending
                      </p>

                      <p className="mt-2 text-3xl font-bold text-orange-500">
                        {pendingCount}
                      </p>
                    </div>
                  </div>

                  {finished && (
                    <div className="mt-8 rounded-2xl bg-green-50 p-5">
                      <p className="font-semibold text-green-700">
                        ✅ Match Finished
                      </p>

                      <p className="mt-2 text-sm text-green-600">
                        You can now review the players who joined this booking.
                      </p>
                    </div>
                  )}

                  {!finished && pendingCount > 0 && (
                    <div className="mt-8 rounded-2xl bg-orange-50 p-5">
                      <p className="font-semibold text-orange-700">
                        ⏳ Waiting Requests
                      </p>

                      <p className="mt-2 text-sm text-orange-600">
                        {pendingCount} player(s) are waiting for your approval.
                      </p>
                    </div>
                  )}
                </div>

                {/* RIGHT */}

                <div className="flex flex-col justify-between bg-slate-50 p-8">

                  <div>

                    <p className="text-sm text-gray-500">
                      Participants
                    </p>

                    <h2 className="mt-3 text-5xl font-bold">
                      {booking.participants?.filter((p: any) => p.status === "ACCEPTED").length || 0}
                    </h2>

                    <p className="mt-3 text-gray-500">
                      Total requests received
                    </p>
                  </div>

                  <div className="mt-10 flex flex-col gap-3">

                    {!finished && (
                      <button
                        onClick={() =>
                          router.push(`/bookings/${booking._id}`)
                        }
                        className="
                          rounded-2xl
                          bg-purple-600
                          py-4
                          font-semibold
                          text-white
                          hover:bg-purple-700
                        "
                      >
                        Manage Booking
                      </button>
                    )}

                    {finished && (
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setReviewOpen(true);
                        }}
                        className="
                          rounded-2xl
                          bg-yellow-500
                          py-4
                          font-semibold
                          text-white
                          hover:bg-yellow-600
                        "
                      >
                        ⭐ Review Players
                      </button>
                    )}

                    <button
                      onClick={() =>
                        router.push(`/bookings/${booking._id}`)
                      }
                      className="
                        rounded-2xl
                        border
                        py-4
                        font-semibold
                        hover:bg-white
                      "
                    >
                      View Detail
                    </button>

                  </div>

                </div>

              </div>
            </div>
          );
        })}

        {currentData.length > 0 && tab !== "hosting" &&
          currentData.map((item: any) => {
            const booking = item.booking;

            const price =
              gender === "Female" ? booking?.femalePrice : booking?.malePrice;

            const badge =
              tab === "upcoming"
                ? {
                    bg: "bg-green-100",
                    text: "text-green-700",
                    label: "Accepted",
                  }
                : tab === "pending"
                  ? {
                      bg: "bg-orange-100",
                      text: "text-orange-700",
                      label: "Waiting Approval",
                    }
                  : {
                      bg: "bg-gray-100",
                      text: "text-gray-700",
                      label: "Completed",
                    };

            return (
              <div
                key={item._id}
                className="
                    overflow-hidden
                    rounded-[32px]
                    bg-white
                    shadow-sm
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:shadow-xl
                  "
              >
                <div className="grid lg:grid-cols-[1fr_260px]">
                  {/* LEFT */}

                  <div className="p-8">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                      <div>
                        <h2 className="text-3xl font-bold">
                          🏸 {booking.address}
                        </h2>

                        <p className="mt-3 text-gray-500">📅 {booking.day}</p>

                        <p className="mt-1 text-gray-500">
                          🕘 {booking.startTime} - {booking.endTime}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-5 py-2 text-sm font-semibold ${badge.bg} ${badge.text}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <div className="my-8 h-px bg-gray-100" />

                    <div className="flex items-center gap-5">
                      <img
                        src={
                          booking.owner?.avatar ||
                          "https://ui-avatars.com/api/?name=Host"
                        }
                        className="h-16 w-16 rounded-full border"
                      />

                      <div>
                        <p className="text-sm text-gray-400">Organizer</p>

                        <h3 className="text-lg font-semibold">
                          {booking.owner?.name}
                        </h3>
                      </div>
                    </div>

                    {tab === "pending" && (
                      <div className="mt-8 rounded-2xl bg-orange-50 p-5">
                        <p className="font-semibold text-orange-700">
                          ⏳ Waiting for organizer approval
                        </p>

                        <p className="mt-2 text-sm text-orange-600">
                          Your request has been submitted successfully. The
                          organizer will review it soon.
                        </p>
                      </div>
                    )}

                    {tab === "history" && (
                      <div className="mt-8 rounded-2xl bg-gray-50 p-5">
                        <p className="font-semibold">Match Finished ✅</p>

                        <p className="mt-2 text-sm text-gray-500">
                          Thank you for joining this badminton session.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* RIGHT */}

                  <div className="flex flex-col justify-between bg-slate-50 p-8">
                    <div>
                      <p className="text-sm text-gray-500">Your Price</p>

                      <h2 className="mt-3 text-4xl font-bold">
                        {price ? `${Number(price).toLocaleString()}đ` : "--"}
                      </h2>
                    </div>

                    <div className="mt-10 flex flex-col gap-3">
                      <button
                        onClick={() => router.push(`/bookings/${booking._id}`)}
                        className="
                            rounded-2xl
                            bg-blue-600
                            py-4
                            font-semibold
                            text-white
                            transition
                            hover:bg-blue-700
                          "
                      >
                        View Booking
                      </button>

                      {tab === "pending" && (
                        <button
                          className="
                              rounded-2xl
                              border
                              py-4
                              font-semibold
                              hover:bg-gray-100
                            "
                        >
                          Cancel Request
                        </button>
                      )}

                      {tab === "history" && (
                        <button
                          className="
                              rounded-2xl
                              border
                              py-4
                              font-semibold
                              hover:bg-gray-100
                            "
                        >
                          Book Again
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </main>
  );
}
