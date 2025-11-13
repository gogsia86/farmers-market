import { locales } from "@/i18n/config";

export default function DiagnosticPage() {
  return (
    <div className="container mx-auto px-4 py-16 bg-white min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-black">
        🔍 Language Routing Diagnostic
      </h1>

      <div className="bg-gray-100 rounded-lg shadow-lg border-2 border-gray-300 p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4 text-black">
          Configured Locales:
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {locales.map((locale) => (
            <a
              key={locale}
              href={`/${locale}`}
              className="block p-4 bg-green-600 hover:bg-green-700 rounded text-center font-bold text-white text-lg"
            >
              {locale.toUpperCase()}
            </a>
          ))}
        </div>
      </div>

      <div className="bg-orange-200 rounded-lg border-4 border-orange-600 p-8">
        <h2 className="text-3xl font-black mb-6 text-gray-900">
          📋 Test Instructions:
        </h2>
        <ol className="list-decimal list-inside space-y-4 text-2xl font-black text-gray-900">
          <li>Click on any language code above</li>
          <li>You should see the homepage in that language</li>
          <li>If you see a 404, open DevTools (F12) → Network tab</li>
          <li>Check the response status code</li>
        </ol>
      </div>
    </div>
  );
}
