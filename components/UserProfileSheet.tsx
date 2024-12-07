import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useEffect, useState } from "react";
import { Spinner } from "./Spinner";
import { useToast } from "@/hooks/use-toast";
import { UserAvatar } from "@/components/UserAvatar";

interface UserProfile {
  id: string;
  name: string;
  role: "MENTOR" | "MENTEE";
  skills: string[];
  interests: string[];
  bio: string;
}

interface UserProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
}

export function UserProfileSheet({
  isOpen,
  onClose,
  userId,
}: UserProfileSheetProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/profile/${userId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch profile");
        }

        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && userId) {
      fetchProfile();
    }
  }, [userId, isOpen, toast]);

  const ProfileContent = () => (
    <div className="mt-6 space-y-6">
      <div className="flex items-center gap-4">
        <UserAvatar name={profile?.name || ""} className="h-12 w-12" />
        <div>
          <h2 className="text-2xl font-semibold">{profile?.name}</h2>
          <p className="text-indigo-600">{profile?.role}</p>
        </div>
      </div>
      {profile?.bio && (
        <div>
          <h3 className="font-semibold mb-2">Bio</h3>
          <p className="text-gray-600">{profile?.bio}</p>
        </div>
      )}
      <div>
        <h3 className="font-semibold mb-2">Skills</h3>
        <div className="flex flex-wrap gap-2">
          {profile?.skills.map((skill) => (
            <span
              key={skill}
              className="bg-indigo-100 px-3 py-1 rounded-full text-sm"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Interests</h3>
        <div className="flex flex-wrap gap-2">
          {profile?.interests.map((interest) => (
            <span
              key={interest}
              className="bg-purple-100 px-3 py-1 rounded-full text-sm"
            >
              {interest}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>User Profile</DrawerTitle>
          </DrawerHeader>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Spinner size="lg" />
            </div>
          ) : profile ? (
            <div className="px-4 pb-8">
              <ProfileContent />
            </div>
          ) : (
            <div className="text-center text-gray-500 p-4">
              Profile not found
            </div>
          )}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>User Profile</SheetTitle>
        </SheetHeader>
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Spinner size="lg" />
          </div>
        ) : profile ? (
          <ProfileContent />
        ) : (
          <div className="text-center text-gray-500 mt-6">
            Profile not found
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
