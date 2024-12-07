"use client";

import { Header } from "@/components/Header";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { Button } from "@/components/Button";
import { Spinner } from "@/components/Spinner";
import { toast } from "sonner";
import { UserProfileSheet } from "@/components/UserProfileSheet";
import { UserAvatar } from "@/components/UserAvatar";

interface Connection {
  id: string;
  user: {
    id: string;
    name: string;
    role: "MENTOR" | "MENTEE";
  };
  createdAt: string;
}

export default function Connections() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [removingConnection, setRemovingConnection] = useState<string | null>(
    null
  );
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchConnections();
  }, [user]);

  const fetchConnections = async () => {
    try {
      const response = await fetch("/api/connections/accepted");
      const data = await response.json();
      setConnections(data.connections);
    } catch (error) {
      console.error("Error fetching connections:", error);
      toast.error("Failed to fetch connections");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveConnection = async (connectionId: string) => {
    try {
      setRemovingConnection(connectionId);
      const response = await fetch(`/api/connections/${connectionId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to remove connection");

      setConnections((prev) => prev.filter((conn) => conn.id !== connectionId));

      toast.success("Connection removed successfully");
    } catch (error) {
      console.error("Error removing connection:", error);
      toast.error("Failed to remove connection");
    } finally {
      setRemovingConnection(null);
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
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">
          My Connections
        </h1>
        {connections.length === 0 ? (
          <div className="text-center text-gray-500">
            <p>You don&apos;t have any connections yet.</p>
            <p>Try connecting with mentors or mentees!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {connections.map((connection) => (
              <div
                key={connection.id}
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <div className="flex items-center gap-3 mb-4">
                  <UserAvatar name={connection.user.name} />
                  <div>
                    <h2
                      className="text-xl font-semibold hover:underline cursor-pointer"
                      onClick={() => setSelectedUserId(connection.user.id)}
                    >
                      {connection.user.name}
                    </h2>
                    <p className="text-indigo-600">
                      {connection.user.role === "MENTOR" ? "Mentor" : "Mentee"}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handleRemoveConnection(connection.id)}
                  variant="destructive"
                  isLoading={removingConnection === connection.id}
                >
                  Remove Connection
                </Button>
              </div>
            ))}
          </div>
        )}
      </main>
      <UserProfileSheet
        isOpen={!!selectedUserId}
        onClose={() => setSelectedUserId(null)}
        userId={selectedUserId}
      />
    </div>
  );
}
