"use client";

import { Header } from "@/components/Header";
import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/Button";
import { Spinner } from "@/components/Spinner";
import { UserProfileSheet } from "@/components/UserProfileSheet";
import { UserAvatar } from "@/components/UserAvatar";
import { io } from "socket.io-client";

interface Match {
  id: number;
  name: string;
  role: "MENTOR" | "MENTEE";
  matchScore: number;
}

export default function Matches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [isConnecting, setIsConnecting] = useState<number | null>(null);
  const [connectionStates, setConnectionStates] = useState<Map<number, string>>(
    new Map()
  );
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    try {
      if (!user?.id) return;

      const response = await fetch(`/api/matches?userId=${user.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch matches");
      }

      setMatches(data.matches);
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchMatches();

      const socket = io();
      socket.on("connection_update", () => {
        fetchMatches();
      });

      return () => {
        socket.off("connection_update");
        socket.close();
      };
    }
  }, [fetchMatches, user?.id]);

  const handleConnect = async (userId: number) => {
    try {
      setIsConnecting(userId);
      const response = await fetch("/api/connections/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId: userId.toString() }),
      });

      if (!response.ok) {
        throw new Error("Failed to send connection request");
      }

      setMatches((prev) => prev.filter((match) => match.id !== userId));
      setConnectionStates((prev) => {
        const newMap = new Map(prev);
        newMap.set(userId, "PENDING");
        return newMap;
      });

      toast.success("Connection request sent successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to send connection request");
    } finally {
      setIsConnecting(null);
    }
  };

  if (loading) {
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
        <h1 className="text-3xl font-bold text-center mb-8">Your Matches</h1>
        {matches.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-600 mb-4">No matches found yet.</p>
            <p className="text-gray-600">
              Try updating your profile or checking back later when more users
              join!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => (
              <div key={match.id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <UserAvatar name={match.name} />
                  <div>
                    <h2
                      className="text-xl font-semibold hover:underline cursor-pointer"
                      onClick={() => setSelectedUserId(match.id.toString())}
                    >
                      {match.name}
                    </h2>
                    <p className="text-indigo-600">
                      {match.role === "MENTOR" ? "Mentor" : "Mentee"}
                    </p>
                  </div>
                </div>
                <div className="mb-4">
                  <strong>Match Score:</strong> {match.matchScore}%
                </div>
                {connectionStates.get(match.id) === "ACCEPTED" ? (
                  <Button disabled>Connected</Button>
                ) : connectionStates.get(match.id) === "PENDING" ? (
                  <Button disabled>Request Sent</Button>
                ) : (
                  <Button
                    onClick={() => handleConnect(match.id)}
                    isLoading={isConnecting === match.id}
                  >
                    Connect
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
        <UserProfileSheet
          isOpen={!!selectedUserId}
          onClose={() => setSelectedUserId(null)}
          userId={selectedUserId}
        />
      </main>
    </div>
  );
}
