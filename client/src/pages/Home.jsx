import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen font-sans">
      <Navbar />

      {/* Hero Section */}
      <section
        className="flex-1 bg-cover bg-center flex flex-col items-center justify-center text-center p-8 relative"
        style={{ backgroundImage: 'url("/hero-bg.jpg")' }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 animate-fade-in-down">
            Find Your Dream Home
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-6 animate-fade-in-up">
            Buy, Sell or Rent Properties Easily
          </p>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 px-6 md:px-20 bg-gray-100">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
          Why Choose Our Platform?
        </h2>
        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              title: "Easy To Use",
              desc: "Find and post properties with just a few clicks. Designed for simplicity and speed.",
            },
            {
              title: "Verified Listings",
              desc: "Only verified property listings are shown to ensure your safety and trust.",
            },
            {
              title: "Seamless Experience",
              desc: "Chat directly with buyers/sellers, no middleman involved. Faster deal closures!",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-md hover:shadow-2xl transition duration-300 hover:-translate-y-2 text-center"
            >
              <h3 className="text-2xl font-semibold mb-4 text-blue-600">
                {item.title}
              </h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-6 md:px-20">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
          How It Works?
        </h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-12">
          {[
            {
              icon: "🔍",
              title: "Search Properties",
              desc: "Browse from thousands of homes, plots, commercial spaces.",
            },
            {
              icon: "📝",
              title: "Register / Login",
              desc: "Login to start buying, selling, or saving properties you love!",
            },
            {
              icon: "🤝",
              title: "Connect & Deal",
              desc: "Chat with owners/buyers directly and make your dream deal happen.",
            },
          ].map((step, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md p-8 text-center hover:shadow-2xl transition duration-300 hover:scale-105"
            >
              <div className="text-5xl mb-4">{step.icon}</div>
              <h4 className="text-xl font-bold mb-2 text-blue-600">{step.title}</h4>
              <p className="text-gray-600">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
