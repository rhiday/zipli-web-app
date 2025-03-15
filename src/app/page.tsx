import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header section */}
      <header className="flex justify-between items-center p-6">
        <h1 className="text-4xl font-bold">Good afternoon!</h1>
        <div className="w-12 h-12 bg-gray-400 rounded-full"></div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 px-6 pb-24">
        {/* Active Donations Section */}
        <section className="mb-8">
          <h2 className="text-2xl text-gray-500 font-normal mb-4">Active Donations</h2>
          <div className="bg-red-50 rounded-2xl p-6 h-48 flex items-center justify-center">
            {/* Placeholder for active donations - empty state */}
          </div>
        </section>

        {/* Past Donations Section */}
        <section>
          <h2 className="text-2xl text-gray-500 font-normal mb-4">Past donations</h2>
          <div className="space-y-4">
            {/* Donation cards - using array to generate multiple placeholders */}
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-red-50 rounded-2xl p-6 h-32 flex items-center justify-center">
                {/* Placeholder for past donation */}
              </div>
            ))}
          </div>
        </section>

        {/* New Donation Button - Fixed at bottom but above navbar */}
        <div className="fixed bottom-24 right-6 flex">
          <Link href="/new-donation">
            <button className="bg-green-800 text-white text-xl py-3.5 px-10 rounded-full shadow-md hover:bg-green-900 hover:shadow-lg transition-all duration-200">
              New Donation
            </button>
          </Link>
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4">
        <div className="flex justify-around">
          <button className="flex flex-col items-center">
            <div className="w-6 h-6 bg-gray-400 rounded-full mb-1"></div>
            <span className="text-gray-500">Receive</span>
          </button>
          <button className="flex flex-col items-center">
            <div className="w-6 h-6 bg-black rounded-full mb-1"></div>
            <span className="text-black font-medium">Donate</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
