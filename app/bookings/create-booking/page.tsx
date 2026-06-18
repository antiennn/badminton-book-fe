"use client";

import React, { useEffect, useState } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/navigation";
import LocationPicker from "../../src/components/LocationPicker";
import LocationSearch, {
  LocationResult,
} from "../../src/components/LocationSearch";

const facilities = [
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

const levels = [
  {
    id: "Beginner",
    label: "Beginner",
  },
  {
    id: "LowIntermediate",
    label: "Low Intermediate",
  },
  {
    id: "Intermediate",
    label: "Intermediate",
  },
  {
    id: "Advanced",
    label: "Advanced",
  },
];

const CREATE_BOOKING = gql`
  mutation CreateBooking($input: CreateBookingInput!) {
    createBooking(input: $input) {
      _id
      day
      startTime
      endTime
    }
  }
`;



export default function CreateBookingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth0();
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [form, setForm] = useState({
    maleLevelRequired: [] as string[],
    femaleLevelRequired: [] as string[],

    maleRequired: 0,
    femaleRequired: 0,

    startTime: "",
    endTime: "",

    day: "",

    malePrice: 0,
    femalePrice: 0,

    facilities: [] as string[],
  });

  const toggleMaleLevel = (level: string) => {
    setForm((prev) => ({
      ...prev,
      maleLevelRequired: prev.maleLevelRequired.includes(level)
        ? prev.maleLevelRequired.filter((item) => item !== level)
        : [...prev.maleLevelRequired, level],
    }));
  };
  const toggleFemaleLevel = (level: string) => {
    setForm((prev) => ({
      ...prev,
      femaleLevelRequired: prev.femaleLevelRequired.includes(level)
        ? prev.femaleLevelRequired.filter((item) => item !== level)
        : [...prev.femaleLevelRequired, level],
    }));
  };

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [successMessage, setSuccessMessage] = useState("");


  const [createBooking, { loading, error: mutationError }] = useMutation(
    CREATE_BOOKING,
    {
      onCompleted: () => {
        setSuccessMessage("Booking created successfully.");
        router.push("/");
      },
    },
  );

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleFacilityToggle = (id: string) => {
    setForm((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(id)
        ? prev.facilities.filter((facilityId) => facilityId !== id)
        : [...prev.facilities, id],
    }));
  };

  const validate = () => {
    const errors: Record<string, string> = {};

    if (form.maleLevelRequired.length === 0)
      errors.maleLevelRequired = "Select male level";

    if (form.femaleLevelRequired.length === 0)
      errors.femaleLevelRequired = "Select female level";

    if (form.maleRequired <= 0) errors.maleRequired = "Invalid number";

    if (form.femaleRequired <= 0) errors.femaleRequired = "Invalid number";

    if (!form.startTime) errors.startTime = "Required";

    if (!form.endTime) errors.endTime = "Required";

    if (!form.day) errors.day = "Required";

    if (!form.malePrice || Number(form.malePrice) <= 0)
      errors.malePrice = "Invalid price";

    if (!form.femalePrice || Number(form.femalePrice) <= 0)
      errors.femalePrice = "Invalid price";

    if (!location) errors.location = "Select location";

    setValidationErrors(errors);
    console.log("Validation errors:", errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSuccessMessage("");

    if (!validate()) {
      return;
    }

    createBooking({
      variables: {
        input: {
          maleLevelRequired: form.maleLevelRequired,
          femaleLevelRequired: form.femaleLevelRequired,

          maleRequired: Number(form.maleRequired),
          femaleRequired: Number(form.femaleRequired),

          startTime: form.startTime,
          endTime: form.endTime,

          day: form.day,

          malePrice: Number(form.malePrice),
          femalePrice: Number(form.femalePrice),

          address: location?.address ?? "",

          longitude: Number(location?.longitude ?? 0),
          latitude: Number(location?.latitude ?? 0),

          facilities: form.facilities,
        },
      },
    });
  };

  return (
    <section className="w-full max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold">Booking Information</h2>
        <p className="mt-2 text-sm text-gray-500">
          Fill out the information below to create a booking.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold">Booking Information</legend>
          <div className="space-y-2">
            <label>Date</label>

            <input
              type="date"
              value={form.day}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  day: e.target.value,
                }))
              }
              className="w-full rounded-lg border px-3 py-2"
            />
            {validationErrors.day && (
              <p className="mt-1 text-sm text-red-500">
                {validationErrors.day}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Start Time</label>

              <input
                type="time"
                value={form.startTime}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    startTime: e.target.value,
                  }))
                }
                className="w-full rounded-lg border px-3 py-2"
              />
              {validationErrors.startTime && (
                <p className="mt-1 text-sm text-red-500">
                  {validationErrors.startTime}
                </p>
              )}
            </div>

            <div>
              <label>End Time</label>

              <input
                type="time"
                value={form.endTime}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    endTime: e.target.value,
                  }))
                }
                className="w-full rounded-lg border px-3 py-2"
              />
              {validationErrors.endTime && (
                <p className="mt-1 text-sm text-red-500">
                  {validationErrors.endTime}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Male Price
              </label>

              <input
                type="number"
                min={0}
                step="1000"
                placeholder="100000"
                value={form.malePrice}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    malePrice: +e.target.value,
                  }))
                }
                className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {validationErrors.malePrice && (
                <p className="mt-1 text-sm text-red-500">
                  {validationErrors.malePrice}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Female Price
              </label>

              <input
                type="number"
                min={0}
                step="1000"
                placeholder="80000"
                value={form.femalePrice}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    femalePrice: +e.target.value,
                  }))
                }
                className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {validationErrors.femalePrice && (
                <p className="mt-1 text-sm text-red-500">
                  {validationErrors.femalePrice}
                </p>
              )}
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-6">
          <legend className="text-lg font-semibold">Player Requirement</legend>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Male */}
            <div className="rounded-lg border p-4 space-y-4">
              <h3 className="font-semibold text-blue-600">Male</h3>

              <div className="space-y-2">
                <label className="font-medium">Required</label>

                <input
                  type="number"
                  min={1}
                  value={form.maleRequired}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      maleRequired: Number(e.target.value),
                    }))
                  }
                  className={`w-full rounded-lg border px-3 py-2 ${
                    validationErrors.maleRequired
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />

                {validationErrors.maleRequired && (
                  <p className="text-sm text-red-500">
                    {validationErrors.maleRequired}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="font-medium">Level</label>

                <div className="flex flex-wrap gap-2">
                  {levels.map((level) => {
                    const selected = form.maleLevelRequired.includes(level.id);

                    return (
                      <button
                        type="button"
                        key={level.id}
                        onClick={() => toggleMaleLevel(level.id)}
                        className={`rounded-full border px-4 py-2 transition ${
                          selected
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-gray-300 hover:border-blue-400"
                        }`}
                      >
                        {level.label}
                      </button>
                    );
                  })}
                </div>

                {validationErrors.maleLevelRequired && (
                  <p className="text-sm text-red-500">
                    {validationErrors.maleLevelRequired}
                  </p>
                )}
              </div>
            </div>

            {/* Female */}
            <div className="rounded-lg border p-4 space-y-4">
              <h3 className="font-semibold text-pink-600">Female</h3>

              <div className="space-y-2">
                <label className="font-medium">Required</label>

                <input
                  type="number"
                  min={1}
                  value={form.femaleRequired}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      femaleRequired: Number(e.target.value),
                    }))
                  }
                  className={`w-full rounded-lg border px-3 py-2 ${
                    validationErrors.femaleRequired
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />

                {validationErrors.femaleRequired && (
                  <p className="text-sm text-red-500">
                    {validationErrors.femaleRequired}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="font-medium">Level</label>

                <div className="flex flex-wrap gap-2">
                  {levels.map((level) => {
                    const selected = form.femaleLevelRequired.includes(
                      level.id,
                    );

                    return (
                      <button
                        type="button"
                        key={level.id}
                        onClick={() => toggleFemaleLevel(level.id)}
                        className={`rounded-full border px-4 py-2 transition ${
                          selected
                            ? "bg-pink-600 text-white border-pink-600"
                            : "border-gray-300 hover:border-pink-400"
                        }`}
                      >
                        {level.label}
                      </button>
                    );
                  })}
                </div>

                {validationErrors.femaleLevelRequired && (
                  <p className="text-sm text-red-500">
                    {validationErrors.femaleLevelRequired}
                  </p>
                )}
              </div>
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <div>
            <h2 className="mb-2 text-lg font-semibold">Location</h2>
            <LocationSearch onSelect={(value) => setLocation(value)} />
            <LocationPicker location={location} />
            {validationErrors.location && (
              <p className="mt-2 text-sm text-red-500">
                {validationErrors.location}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label
              htmlFor="address"
              className="text-sm font-medium text-gray-700"
            >
              Address
            </label>
            <input
              id="address"
              name="address"
              value={location?.address ?? ""}
              readOnly
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label
                htmlFor="longitude"
                className="text-sm font-medium text-gray-700"
              >
                Longitude
              </label>
              <input
                id="longitude"
                name="longitude"
                type="number"
                step="0.000001"
                placeholder="106.700000"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                readOnly
                value={location?.longitude ?? ""}
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="latitude"
                className="text-sm font-medium text-gray-700"
              >
                Latitude
              </label>
              <input
                id="latitude"
                name="latitude"
                type="number"
                step="0.000001"
                placeholder="10.770000"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                readOnly
                value={location?.latitude ?? ""}
              />
            </div>
          </div>
        </fieldset>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Facilities</h3>
          <div className="flex flex-wrap gap-3">
            {facilities.map((facility) => {
              const selected = form.facilities.includes(facility.id);
              return (
                <label key={facility.id} className="cursor-pointer">
                  <input
                    type="checkbox"
                    name="facilities"
                    value={facility.id}
                    checked={selected}
                    onChange={() => handleFacilityToggle(facility.id)}
                    className="peer sr-only"
                  />
                  <span
                    className={`inline-flex items-center rounded-full border px-4 py-2 text-sm transition hover:border-blue-400 ${selected ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300 text-gray-700"}`}
                  >
                    {facility.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {mutationError && (
          <p className="text-sm text-red-500">{mutationError.message}</p>
        )}
        {successMessage && (
          <p className="text-sm text-green-600">{successMessage}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
        >
          {loading ? "Creating booking..." : "Create Booking"}
        </button>
      </form>
    </section>
  );
}
