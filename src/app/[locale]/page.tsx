import { useTranslations } from "next-intl";
import Link from "next/link";

export default function HomePage() {
  const t = useTranslations("home");

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-5xl font-bold text-agricultural-700 mb-4">
          {t("hero.title")}
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          {t("hero.subtitle")}
        </p>
        <Link
          href="/products"
          className="inline-block bg-agricultural-600 text-white px-8 py-3 rounded-lg hover:bg-agricultural-700 transition-colors"
        >
          {t("hero.cta")}
        </Link>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        <div className="text-center">
          <div className="text-4xl mb-4">🌾</div>
          <h3 className="text-xl font-semibold mb-2">
            {t("features.organic.title")}
          </h3>
          <p className="text-gray-600">{t("features.organic.description")}</p>
        </div>
        <div className="text-center">
          <div className="text-4xl mb-4">🍃</div>
          <h3 className="text-xl font-semibold mb-2">
            {t("features.fresh.title")}
          </h3>
          <p className="text-gray-600">{t("features.fresh.description")}</p>
        </div>
        <div className="text-center">
          <div className="text-4xl mb-4">🤝</div>
          <h3 className="text-xl font-semibold mb-2">
            {t("features.local.title")}
          </h3>
          <p className="text-gray-600">{t("features.local.description")}</p>
        </div>
        <div className="text-center">
          <div className="text-4xl mb-4">♻️</div>
          <h3 className="text-xl font-semibold mb-2">
            {t("features.sustainable.title")}
          </h3>
          <p className="text-gray-600">
            {t("features.sustainable.description")}
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 rounded-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-12">
          {t("howItWorks.title")}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="text-2xl font-bold text-agricultural-600 mb-2">
              1
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {t("howItWorks.step1.title")}
            </h3>
            <p className="text-gray-600">{t("howItWorks.step1.description")}</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-agricultural-600 mb-2">
              2
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {t("howItWorks.step2.title")}
            </h3>
            <p className="text-gray-600">{t("howItWorks.step2.description")}</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-agricultural-600 mb-2">
              3
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {t("howItWorks.step3.title")}
            </h3>
            <p className="text-gray-600">{t("howItWorks.step3.description")}</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-agricultural-600 mb-2">
              4
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {t("howItWorks.step4.title")}
            </h3>
            <p className="text-gray-600">{t("howItWorks.step4.description")}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
