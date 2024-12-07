"use client";

import { Header } from "@/components/Header";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { Button } from "@/components/Button";
import { Toast } from "@/components/Toast";
import { Spinner } from "@/components/Spinner";

interface ProfileData {
  name: string;
  email: string;
  role: "MENTOR" | "MENTEE";
  skills: string[];
  interests: string[];
  bio: string;
}

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [newInterest, setNewInterest] = useState("");
  const [profileData, setProfileData] = useState<ProfileData>({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "MENTEE",
    skills: [],
    interests: [],
    bio: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setIsPageLoading(true);
      try {
        if (!user?.id) return;

        const response = await fetch(`/api/profile/${user.id}`);
        const data = await response.json();

        if (response.ok) {
          setProfileData({
            ...data,
            skills: Array.isArray(data.skills)
              ? data.skills
              : data.skills.split(",").map((s: string) => s.trim()),
            interests: Array.isArray(data.interests)
              ? data.interests
              : data.interests.split(",").map((i: string) => i.trim()),
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile");
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const addSkill = () => {
    if (newSkill.trim()) {
      setProfileData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const addInterest = () => {
    if (newInterest.trim()) {
      setProfileData((prev) => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()],
      }));
      setNewInterest("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/profile/${user?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      setIsEditing(false);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-6 py-12 flex items-center justify-center">
          <Spinner size="lg" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Your Profile</h1>
          <div className="bg-white p-6 rounded-lg shadow-md">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    Bio
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        bio: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-md"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    Skills
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      className="flex-grow px-3 py-2 border rounded-md"
                      placeholder="Add a skill"
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="bg-indigo-100 px-3 py-1 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    Interests
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      className="flex-grow px-3 py-2 border rounded-md"
                      placeholder="Add an interest"
                    />
                    <button
                      type="button"
                      onClick={addInterest}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profileData.interests.map((interest) => (
                      <span
                        key={interest}
                        className="bg-indigo-100 px-3 py-1 rounded-full"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    Role
                  </label>
                  <select
                    value={profileData.role}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        role: e.target.value as "MENTOR" | "MENTEE",
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="MENTOR">Mentor</option>
                    <option value="MENTEE">Mentee</option>
                  </select>
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md"
                  >
                    Cancel
                  </button>
                  <Button type="submit" isLoading={isLoading}>
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    {profileData.name}
                  </h2>
                  <p className="text-indigo-600">{profileData.role}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Bio</h3>
                  <p className="text-gray-600">{profileData.bio}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="bg-indigo-100 px-3 py-1 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData.interests.map((interest) => (
                      <span
                        key={interest}
                        className="bg-indigo-100 px-3 py-1 rounded-full"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      {error && (
        <Toast message={error} type="error" onClose={() => setError("")} />
      )}
    </div>
  );
}
