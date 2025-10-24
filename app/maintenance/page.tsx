import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Under Maintenance - Gunpla Sekai",
  description:
    "Gunpla Sekai is currently under maintenance. We'll be back soon with exciting updates!",
};

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="text-6xl mb-4">🚧</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Under Maintenance
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            I&apos;m working on a mobile app and looking for beta testers to
            help shape the experience!
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Join Our Discord
          </h2>
          <p className="text-gray-600 mb-6">
            Join our Discord if you want to be part of{" "}
            <strong>beta testing</strong>, get <strong>early access</strong> to
            the mobile app, or <strong>request features</strong>. Let&apos;s
            build something together! 💪
          </p>
          <a
            href="https://discord.gg/4e2trxVyqH"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            💬 Join our Discord
          </a>
        </div>

        <div className="text-sm text-gray-500">
          <p>Thanks for your patience. Exciting things are coming!</p>
        </div>
      </div>
    </div>
  );
}
