import Features from "./Features";
import Footer from "./Footer";
import Header from "./Header";
import HeroSection from "./Hero";
import Problem from "./Problem";
import Ready from "./Ready";
import About from "./About";

const HomePage = () => {
  return (
    <>
      <Header />
      <HeroSection />
      <About />
      <Problem />
      <Ready />
      <Footer />
    </>
  );
};

export default HomePage;