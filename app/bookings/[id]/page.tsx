"use client";

import { useParams, useRouter } from "next/navigation";
import { gql, useMutation, useQuery } from "@apollo/client";
import { useAuth0 } from "@auth0/auth0-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";

const facilitiesLabel = [
  { id: "air-conditioning", label: "❄️ Air Conditioning" },
  { id: "industrial-fan", label: "🌬️ Industrial Fans" },
  { id: "shower", label: "🚿 Shower" },
  { id: "changing-room", label: "🧼 Changing Room" },
  { id: "locker", label: "🔒 Lockers" },
  { id: "restroom", label: "🚻 Clean Restrooms" },
  { id: "drinking-water", label: "💧 Free Drinking Water" },
  { id: "rest-area", label: "🪑 Rest Area" },
  { id: "wifi", label: "📶 Wi-Fi" },
  { id: "charging-station", label: "🔌 Charging Station" },
];
const ME = gql`
  query Me {
    me {
      gender
      level
    }
  }
`;

const ACCEPT_PARTICIPANT = gql`
  mutation AcceptParticipant($bookingId: String!, $participantId: String!) {
    acceptParticipant(bookingId: $bookingId, participantId: $participantId) {
      _id
      status
    }
  }
`;

const REJECT_PARTICIPANT = gql`
  mutation RejectParticipant($bookingId: String!, $participantId: String!) {
    rejectParticipant(bookingId: $bookingId, participantId: $participantId) {
      _id
      status
    }
  }
`;

const GET_BOOKING = gql`
  query GetBooking($id: ID!) {
    booking(id: $id) {
      _id
      address
      day
      startTime
      endTime
      maleRequired
      femaleRequired
      malePrice
      femalePrice
      maleJoined
      femaleJoined
      maleLevelRequired
      femaleLevelRequired
      facilities

      participants {
        _id
        userId
        gender
        level
        status
        user {
          name
          avatar
          reputationScore
        }
      }
      owner {
        _id
        auth0Id
        email
        name
        avatar
        profileCompleted
        level
        availableDays
        availableTimes
        expectedPrice
        reputationScore
      }
    }
  }
`;

const JOIN_BOOKING = gql`
  mutation JoinBooking($input: JoinBookingInput!) {
    joinBooking(input: $input) {
      _id
      status
    }
  }
`;

const formatLevel = (level: string) =>
  level
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace("LowIntermediate", "Low Intermediate");

export default function BookingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth0();
  const [open, setOpen] = useState(false);

  const bookingId = params.id as string;

  const { data, loading, refetch } = useQuery(GET_BOOKING, {
    variables: {
      id: bookingId,
    },
  });

  const { data: meData } = useQuery(ME);
  const gender = meData?.me?.gender;

  const isOrganizer = data?.booking?.owner?.auth0Id === user?.sub;

  const [activeTab, setActiveTab] = useState<"pending" | "accepted">("pending");

  const pendingParticipants =
    data?.booking?.participants?.filter((p: any) => p.status === "PENDING") ||
    [];

  const acceptedParticipants =
    data?.booking?.participants?.filter((p: any) => p.status === "ACCEPTED") ||
    [];

  const rejectedParticipants =
    data?.booking?.participants?.filter((p: any) => p.status === "REJECTED") ||
    [];

  const [acceptParticipant] = useMutation(ACCEPT_PARTICIPANT, {
    onCompleted() {
      refetch();
    },
  });

  const [rejectParticipant] = useMutation(REJECT_PARTICIPANT, {
    onCompleted() {
      refetch();
    },
  });

  const handleJoin = async () => {
    if (!meData?.me?.gender || !meData?.me?.level) {
      setOpen(true);
      return;
    }

    await joinBooking({
      variables: {
        input: {
          bookingId: booking._id,
        },
      },
    });
  };

  const booking = data?.booking;

  const joinPrice =
    gender === "Female"
      ? (booking?.femalePrice ?? 0)
      : (booking?.malePrice ?? 0);

  const [joinBooking, { loading: joining }] = useMutation(JOIN_BOOKING, {
    onCompleted() {
      refetch();
    },
    onError(error) {
      alert(error.message);
    },
  });

  const joined = booking?.participants?.some(
    (participant: any) => participant.userId === user?.sub,
  );

  const rejected = booking?.participants?.some(
    (participant: any) => participant.userId === user?.sub && participant.status === "REJECTED",
  );
  const facilities = booking?.facilities?.length ? booking.facilities : null;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-32">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 text-sm font-medium text-blue-600 hover:underline"
        >
          ← Back
        </button>

        <div className="overflow-hidden rounded-3xl bg-white shadow">
          <img
            src="https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1600"
            className="h-72 w-full object-cover"
          />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* LEFT */}

          <div>
            <div className="rounded-3xl bg-white p-8 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-4xl font-bold">
                    🏸 {booking?.address || "Badminton Booking"}
                  </h1>

                  <p className="mt-3 text-gray-500">
                    📍 {booking?.address || "Location details will appear here"}
                  </p>

                  <p className="mt-2 text-gray-500">
                    📅 {booking?.day || "Day not specified"} • 🕘{" "}
                    {booking?.startTime || "--:--"} -{" "}
                    {booking?.endTime || "--:--"}
                  </p>
                </div>

                <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                  OPEN
                </span>
              </div>

              <hr className="my-8" />

              <h2 className="text-xl font-semibold">About</h2>

              <p className="mt-4 leading-7 text-gray-600">
                This booking is for {booking?.maleRequired ?? 0} male player(s)
                and {booking?.femaleRequired ?? 0} female player(s). The session
                is scheduled for {booking?.day || "the selected day"} from{" "}
                {booking?.startTime || "the start time"} to{" "}
                {booking?.endTime || "the end time"} at{" "}
                {booking?.address || "the listed venue"}.
              </p>
            </div>

            <div className="mt-6 rounded-3xl bg-white p-8 shadow-sm">
              <h2 className="text-xl font-semibold">👥 Need Players</h2>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div className="rounded-2xl border p-5">
                  <h3 className="font-semibold">👨 Male</h3>

                  <p className="mt-3 text-gray-500">
                    Need {booking?.maleRequired ?? 0} players
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {(booking?.maleLevelRequired ?? []).length > 0 ? (
                      (booking?.maleLevelRequired ?? []).map((level: any) => (
                        <span
                          key={`male-${level}`}
                          className="rounded-full bg-blue-100 px-3 py-1 text-sm"
                        >
                          {formatLevel(level)}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm">
                        Open to all levels
                      </span>
                    )}
                  </div>

                  <p className="mt-5 text-xl font-bold">
                    {(booking?.malePrice ?? 0).toLocaleString()} VND
                  </p>
                </div>

                <div className="rounded-2xl border p-5">
                  <h3 className="font-semibold">👩 Female</h3>

                  <p className="mt-3 text-gray-500">
                    Need {booking?.femaleRequired ?? 0} players
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {(booking?.femaleLevelRequired ?? []).length > 0 ? (
                      (booking?.femaleLevelRequired ?? []).map((level: any) => (
                        <span
                          key={`female-${level}`}
                          className="rounded-full bg-pink-100 px-3 py-1 text-sm"
                        >
                          {formatLevel(level)}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-full bg-pink-100 px-3 py-1 text-sm">
                        Open to all levels
                      </span>
                    )}
                  </div>

                  <p className="mt-5 text-xl font-bold">
                    {(booking?.femalePrice ?? 0).toLocaleString()} VND
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-3xl bg-white p-8 shadow-sm">
              <h2 className="text-xl font-semibold">🏟 Facilities</h2>

              <div className="mt-6 flex flex-wrap gap-3">
                {facilities?.map((facilitie: string) => (
                  <div
                    key={facilitie}
                    className="rounded-full bg-gray-100 px-4 py-2"
                  >
                    {facilitiesLabel.find((f) => f.id === facilitie)?.label ||
                      facilitie}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-3xl bg-white p-8 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  👤 Organizer
                </h2>

                <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                  Verified Host
                </span>
              </div>

              <div className="mt-8 flex items-center gap-5">
                <div className="relative">
                  <img
                    src={booking?.owner.avatar}
                    alt={booking?.owner.name}
                    className="h-24 w-24 rounded-full border-4 border-blue-100 object-cover"
                  />

                  <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-2 border-white bg-green-500" />
                </div>

                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {booking?.owner.name}
                  </h3>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                      🏸 {booking?.owner.level || "Unknown"}
                    </span>

                    <span className="rounded-full bg-yellow-50 px-3 py-1 text-sm font-medium text-yellow-700">
                      Score: {booking?.owner.reputationScore ?? 0}
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-gray-500">
                    Created this badminton session and is responsible for
                    approving participants, coordinating schedules and
                    communicating with players.
                  </p>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4 rounded-2xl bg-gray-50 p-5">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {booking?.participants?.filter(
                      (p: any) => p.status === "ACCEPTED",
                    ).length ?? 0}
                  </p>
                  <p className="text-sm text-gray-500">
                    Accepted
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {booking?.maleRequired + booking?.femaleRequired}
                  </p>
                  <p className="text-sm text-gray-500">
                    Slots
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    Score: {booking?.owner.reputationScore ?? 0}
                  </p>
                  <p className="text-sm text-gray-500">
                    Rating
                  </p>
                </div>
              </div>
            </div>

            {isOrganizer && (
              <div className="mt-6 rounded-3xl bg-white p-8 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Join Requests</h2>

                  <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-700">
                    {pendingParticipants.length} Pending
                  </span>
                </div>

                {pendingParticipants.length === 0 && (
                  <div className="mt-8 rounded-2xl border border-dashed p-10 text-center text-gray-500">
                    No pending requests.
                  </div>
                )}

                <div className="mt-6 space-y-5">
                  {pendingParticipants.map((participant: any) => (
                    <div
                      key={participant._id}
                      className="rounded-2xl border p-5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img
                            src={participant.user.avatar}
                            className="h-14 w-14 rounded-full"
                          />

                          <div>
                            <h3 className="font-semibold">
                              {participant.user.name}
                            </h3>

                            <p className="text-sm text-gray-500">
                              {participant.gender} • {participant.level}
                            </p>

                            <p className="text-xs text-yellow-600">
                              Score: {participant.user.reputationScore}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button
                            className="rounded-xl border border-red-300 px-5 py-2 text-red-600 hover:bg-red-50"
                            onClick={() =>
                              rejectParticipant({
                                variables: {
                                  bookingId: booking._id,
                                  participantId: participant._id,
                                },
                              })
                            }
                          >
                            Reject
                          </button>

                          <button
                            className="rounded-xl bg-green-600 px-5 py-2 text-white hover:bg-green-700"
                            onClick={() =>
                              acceptParticipant({
                                variables: {
                                  bookingId: booking._id,
                                  participantId: participant._id,
                                },
                              })
                            }
                          >
                            Accept
                          </button>
                        </div>
                      </div>

                      {participant.message && (
                        <div className="mt-4 rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
                          "{participant.message}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {acceptedParticipants.map((participant: any) => (
                <div
                  key={participant._id}
                  className="
                    group
                    rounded-3xl
                    border
                    border-gray-200
                    bg-white
                    p-5
                    transition
                    hover:border-green-300
                    hover:shadow-lg
                  "
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={participant.user.avatar}
                        alt={participant.user.name}
                        className="
                          h-16
                          w-16
                          rounded-full
                          border-2
                          border-green-200
                          object-cover
                        "
                      />

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {participant.user.name}
                        </h3>

                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                            {participant.gender}
                          </span>

                          <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                            🏸 {participant.level}
                          </span>

                          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                            Score: {participant.user.reputationScore ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                        ✅ Accepted
                      </span>

                      <span className="mt-2 text-xs text-gray-400">
                        Ready to play
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-3xl bg-white p-8 shadow-sm">
              <h2 className="text-xl font-semibold">👥 Current Players</h2>

              <div className="mt-6 space-y-4">
                <div className="rounded-xl border p-4">
                  <p className="font-semibold">Current sign-ups</p>
                  <p className="mt-2 text-sm text-gray-500">
                    Male joined: {booking?.maleJoined ?? 0}
                  </p>
                  <p className="text-sm text-gray-500">
                    Female joined: {booking?.femaleJoined ?? 0}
                  </p>
                </div>

                <div className="rounded-xl border p-4">
                  <p className="font-semibold">Booking summary</p>
                  <p className="mt-2 text-sm text-gray-500">
                    This session currently needs {booking?.maleRequired ?? 0}{" "}
                    male and {booking?.femaleRequired ?? 0} female players.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}

          <div>
            <div className="sticky top-8 rounded-3xl bg-white p-8 shadow-sm">
              <p className="text-sm text-gray-500">Booking summary</p>

              <h3 className="mt-3 text-2xl font-bold">
                {booking?.address || "Badminton session"}
              </h3>

              <p className="mt-2 text-gray-500">
                {booking?.day || "Selected day"} •{" "}
                {booking?.startTime || "--:--"} - {booking?.endTime || "--:--"}
              </p>

              <div className="mt-5 rounded-xl bg-green-100 p-4 text-green-700">
                ✅ This booking currently needs {booking?.maleRequired ?? 0}{" "}
                male and {booking?.femaleRequired ?? 0} female players.
              </div>

              <hr className="my-8" />

              <div className="flex items-center justify-between">
                <span className="text-gray-500">Price</span>

                <span className="text-3xl font-bold">
                  {joinPrice > 0
                    ? `${joinPrice.toLocaleString()}đ`
                    : "Price available soon"}
                </span>
              </div>

              <button
                className="
                  mt-8
                  w-full
                  rounded-2xl
                  bg-blue-600
                  py-4
                  text-lg
                  font-semibold
                  text-white
                  transition
                  hover:bg-blue-700
                "
                onClick={handleJoin}
                disabled={joining || joined || rejected}
              >
                {joining
                  ? "Joining..."
                  : rejected
                    ? "Rejected"
                    : joined
                      ? "Joined"
                      : "Join Booking"}
              </button>

              <button
                className="
                  mt-3
                  w-full
                  rounded-2xl
                  border
                  py-4
                  font-medium
                  hover:bg-gray-100
                "
              >
                Chat Organizer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky */}

      <div
        className="
          fixed
          bottom-0
          left-0
          right-0
          border-t
          bg-white
          p-4
          lg:hidden
        "
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Price</p>

            <span className="text-3xl font-bold">
              {joinPrice > 0
                ? `${joinPrice.toLocaleString()}đ`
                : "Price available soon"}
            </span>
          </div>

          <button
            onClick={handleJoin}
            disabled={joining || joined || rejected}
          >
            {joining
              ? "Joining..."
              : rejected
                ? "Rejected"
                : joined
                  ? "Joined"
                  : "Join Booking"}
          </button>
        </div>
      </div>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />

          <Dialog.Content
            className="
              fixed
              left-1/2
              top-1/2
              w-[90vw]
              max-w-md
              -translate-x-1/2
              -translate-y-1/2
              rounded-3xl
              bg-white
              p-6
              shadow-xl
            "
          >
            <Dialog.Title className="text-2xl font-bold">
              🏸 Complete your profile
            </Dialog.Title>

            <Dialog.Description className="mt-3 text-gray-500">
              Please complete your gender and skill level before joining a
              booking.
            </Dialog.Description>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl border px-4 py-2 hover:bg-gray-100"
              >
                Later
              </button>

              <button
                onClick={() => {
                  setOpen(false);
                  router.push("/onboarding");
                }}
                className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Complete Profile
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </main>
  );
}
