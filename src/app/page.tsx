import { Header } from "@/components/common/header";
import { DonationCard } from "@/components/common/donation-card";
import { ActionButton } from "@/components/common/action-button";
import { NavBar } from "@/components/common/nav-bar";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header section */}
      <Header title="Good afternoon!" />
      
      {/* Main content */}
      <main className="flex-1 px-6 pb-24">
        {/* Active Donations Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-normal mb-4">Active Donations</h2>
          <DonationCard isEmpty />
        </section>

        {/* Past Donations Section */}
        <section>
          <h2 className="text-2xl font-normal mb-4">Past donations</h2>
          <div className="space-y-4">
            {/* Donation cards - using array to generate multiple placeholders */}
            {[1, 2, 3].map((item) => (
              <DonationCard 
                key={item}
                title={`Donation ${item}`}
                date="March 15, 2024"
                amount="€50"
                status="completed"
              />
            ))}
          </div>
        </section>

        {/* New Donation Button - Fixed at bottom but above navbar */}
        <ActionButton 
          href="/new-donation" 
          fixed 
          position="bottom-right"
          className="bg-green-800 text-white hover:bg-green-900"
        >
          New Donation
        </ActionButton>
      </main>

      {/* Bottom Navigation Bar */}
      <NavBar 
        items={[
          { label: 'Receive', href: '/receive' },
          { label: 'Donate', href: '/', isActive: true }
        ]} 
      />
    </div>
  );
}
