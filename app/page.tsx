import { Header } from "@/components/Header";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-6 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome to MentorMatch
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Connect with mentors and mentees in your field
          </p>
          <div className="space-x-4">
            <Link
              href="/register"
              className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition duration-300"
            >
              Get Started
            </Link>
          </div>
        </div>
      </main>
      <footer className="bg-gray-100 py-6">
        <div className="container mx-auto px-6 text-center text-gray-600">
          © 2024 MentorMatch. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
