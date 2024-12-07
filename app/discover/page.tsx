"use client";

import { Header } from "@/components/Header";
import { useState, useEffect } from "react";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/Button";
import { useToast } from "@/hooks/use-toast";
import { UserAvatar } from "@/components/UserAvatar";
import { UserProfileSheet } from "@/components/UserProfileSheet";

interface User {
  id: string;
  name: string;
  role: "MENTOR" | "MENTEE";
  skills: string[];
  interests: string[];
}

export default function Discover() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const { toast } = useToast();
  const [connectionStates, setConnectionStates] = useState<Map<string, string>>(
    new Map()
  );
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users", {
          credentials: "include", // Important for sending cookies
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch users");
        }

        setUsers(data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to load users");
      } finally {
        setIsLoading(null);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchExistingConnections = async () => {
      try {
        const response = await fetch("/api/connections");
        if (!response.ok) throw new Error("Failed to fetch connections");

        const data = await response.json();
        const states = new Map();
        data.connections.forEach((conn: { userId: string; status: string }) => {
          states.set(conn.userId, conn.status);
        });
        setConnectionStates(states);
      } catch (error) {
        console.error("Error fetching connections:", error);
      }
    };

    fetchExistingConnections();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.skills.some((skill) =>
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        user.interests.some((interest) =>
          interest.toLowerCase().includes(searchTerm.toLowerCase())
        )) &&
      (roleFilter === "ALL" || user.role === roleFilter)
  );

  const handleConnect = async (userId: string) => {
    try {
      setIsLoading(userId);
      const response = await fetch("/api/connections/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId: userId }),
      });

      if (!response.ok) {
        throw new Error("Failed to send connection request");
      }

      setConnectionStates((prev) => {
        const newMap = new Map(prev);
        newMap.set(userId, "PENDING");
        return newMap;
      });

      toast({
        title: "Success",
        description: "Connection request sent successfully!",
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  if (isLoading) {
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
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">
          Discover Mentors and Mentees
        </h1>
        <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:gap-0 sm:justify-between sm:items-center">
          <input
            type="text"
            placeholder="Search by name, skill, or interest"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-2/3"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Roles</option>
            <option value="MENTOR">Mentors</option>
            <option value="MENTEE">Mentees</option>
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div key={user.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <UserAvatar name={user.name} />
                <div>
                  <h2
                    className="text-xl font-semibold hover:underline cursor-pointer"
                    onClick={() => setSelectedUserId(user.id)}
                  >
                    {user.name}
                  </h2>
                  <p className="text-indigo-600">
                    {user.role === "MENTOR" ? "Mentor" : "Mentee"}
                  </p>
                </div>
              </div>
              <div className="mb-2">
                <strong>Skills:</strong> {user.skills.join(", ")}
              </div>
              <div className="mb-4">
                <strong>Interests:</strong> {user.interests.join(", ")}
              </div>
              {connectionStates.get(user.id) === "ACCEPTED" ? (
                <Button disabled>Connected</Button>
              ) : connectionStates.get(user.id) === "PENDING" ? (
                <Button disabled>Request Sent</Button>
              ) : (
                <Button
                  onClick={() => handleConnect(user.id)}
                  isLoading={isLoading === user.id}
                >
                  Connect
                </Button>
              )}
            </div>
          ))}
        </div>
        <UserProfileSheet
          isOpen={!!selectedUserId}
          onClose={() => setSelectedUserId(null)}
          userId={selectedUserId}
        />
      </main>
    </div>
  );
}
