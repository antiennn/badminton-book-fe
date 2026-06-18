"use client";

import { useAuth0 } from "@auth0/auth0-react";

import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";

import {
  gql,
  useMutation,
  useQuery,
} from '@apollo/client';

const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      _id
      level
      gender
      availableDays
      availableTimes
      expectedPrice
      profileCompleted
    }
  }
`;

const ME = gql`
  query Me {
    me {
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
      gender
    }
  }
`;

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const TIMES = [
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
];

const LEVELS = ["Beginner", "Low Intermediate", "Intermediate", "Advanced"];


const GENDERS = ["Male", "Female"];

const MIN_PRICE = 50000;
const MAX_PRICE = 200000;
const PRICE_STEP = 1000;

export default function OnboardingPage() {
  const router = useRouter();
  const { isLoading: authLoading } = useAuth0();

  const [level, setLevel] = useState("");
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [expectedPrice, setExpectedPrice] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [gender, setGender] = useState("");

  const [updateProfile, { loading, error: mutationError }] = useMutation(
    UPDATE_PROFILE,
    {
      onCompleted: (data) => {
        if (data?.updateProfile?.profileCompleted) {
          router.push("/");
        }
      },
    },
  );

  const {
    data,
    loading: meLoading,
  } = useQuery(ME);

  useEffect(() => {
    if (authLoading) return;
  }, [authLoading]);

  const handleDayToggle = (day: string) => {
    setAvailableDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const handleTimeToggle = (time: string) => {
    setAvailableTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time],
    );
  };

  useEffect(() => {
    const profile = data?.me;

    if (!profile) return;

    setGender(profile.gender ?? '');
    setLevel(profile.level ?? '');
    setAvailableDays(profile.availableDays ?? []);
    setAvailableTimes(profile.availableTimes ?? []);
    setExpectedPrice(
      profile.expectedPrice
        ? String(profile.expectedPrice)
        : '',
    );
  }, [data]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!level) {
      newErrors.level = "Level is required";
    }

    if (availableDays.length === 0) {
      newErrors.availableDays = "Select at least one day";
    }

    if (availableTimes.length === 0) {
      newErrors.availableTimes = "Select at least one time";
    }

    const price = parseInt(expectedPrice);
    if (
      !expectedPrice ||
      isNaN(price) ||
      price < MIN_PRICE ||
      price > MAX_PRICE
    ) {
      newErrors.expectedPrice = `Expected price must be between ${MIN_PRICE.toLocaleString()} and ${MAX_PRICE.toLocaleString()} VND`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    updateProfile({
      variables: {
        input: {
          level,
          gender,
          availableDays,
          availableTimes,
          expectedPrice: parseInt(expectedPrice),
        },
      },
    });
  };

  if (authLoading || meLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white p-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-black">
            Complete Your Profile
          </h1>
          <p className="text-black">
            Help us match you with the right badminton partners
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-8 rounded-lg bg-white p-8 shadow"
        >
          {/* Level */}
          <div>
            <label className="mb-3 block font-semibold text-black">
              Skill Level
              <span className="text-red-500 text-g">*</span>
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className={`w-full rounded border px-4 py-2 text-black ${
                errors.level ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select your level...</option>
              {LEVELS.map((lv) => (
                <option key={lv} value={lv}>
                  {lv}
                </option>
              ))}
            </select>
            {errors.level && (
              <p className="mt-1 text-sm text-red-500">{errors.level}</p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="mb-3 block font-semibold text-black">
              Gender
              <span className="text-red-500">*</span>
            </label>

            <div className="flex gap-6">
              {GENDERS.map((item) => (
                <label
                  key={item}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <input
                    type="radio"
                    name="gender"
                    value={item}
                    checked={gender === item}
                    onChange={(e) => setGender(e.target.value)}
                    className="h-4 w-4"
                  />

                  <span className="text-black">{item}</span>
                </label>
              ))}
            </div>

            {errors.gender && (
              <p className="mt-1 text-sm text-red-500">{errors.gender}</p>
            )}
          </div>

          {/* Available Days */}
          <div>
            <label className="mb-3 block font-semibold text-black">
              Available Days
              <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {DAYS.map((day) => (
                <label key={day} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={availableDays.includes(day)}
                    onChange={() => handleDayToggle(day)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-black">{day}</span>
                </label>
              ))}
            </div>
            {errors.availableDays && (
              <p className="mt-2 text-sm text-red-500">
                {errors.availableDays}
              </p>
            )}
          </div>

          {/* Available Times */}
          <div>
            <label className="mb-3 block font-semibold text-black">
              Available Times
              <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2 md:grid-cols-4 lg:grid-cols-6">
              {TIMES.map((time) => (
                <label key={time} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={availableTimes.includes(time)}
                    onChange={() => handleTimeToggle(time)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-black">{time}</span>
                </label>
              ))}
            </div>
            {errors.availableTimes && (
              <p className="mt-2 text-sm text-red-500">
                {errors.availableTimes}
              </p>
            )}
          </div>

          {/* Expected Price */}
          <div>
            <label className="mb-3 block font-semibold text-black">
              Expected Price Per Hour
              <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min={MIN_PRICE}
                max={MAX_PRICE}
                step={PRICE_STEP}
                value={expectedPrice || String(MIN_PRICE)}
                onChange={(e) => setExpectedPrice(e.target.value)}
                className="w-full"
                aria-valuemin={MIN_PRICE}
                aria-valuemax={MAX_PRICE}
              />
              <div className="w-36 text-right text-black font-semibold">
                {expectedPrice
                  ? `${Number(expectedPrice).toLocaleString()} VND`
                  : `${MIN_PRICE.toLocaleString()} VND`}
              </div>
            </div>
            {errors.expectedPrice && (
              <p className="mt-1 text-sm text-red-500">
                {errors.expectedPrice}
              </p>
            )}
          </div>

          {/* Error Message */}
          {mutationError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {mutationError.message}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Saving..." : "Complete Profile"}
          </button>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.setItem("skipOnboarding", "1");
              }
              router.push("/");
            }}
            className="w-full mt-2 rounded-lg bg-gray-200 px-6 py-3 font-semibold text-black hover:bg-gray-300"
          >
            Skip for now
          </button>
        </form>
      </div>
    </main>
  );
}
