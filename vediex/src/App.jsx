import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Products from './components/Products';
import StockTokens from './components/StockTokens';
import CryptoTrading from './components/CryptoTrading';
import PerpetualFutures from './components/PerpetualFutures';
import Security from './components/Security';
import Highlights from './components/Highlights';
import Markets from './components/Markets';
import Company from './components/Company';
import Support from './components/Support';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-dark overflow-x-hidden">
      <Navbar />
      <main>
        {/* Home */}
        <Hero />
        <Products />

        {/* Markets */}
        <Markets />
        <StockTokens />
        <CryptoTrading />

        {/* Solutions */}
        <PerpetualFutures />
        <Security />
        <Highlights />

        {/* Company */}
        <Company />

        {/* Support */}
        <Support />
      </main>
      <Footer />
    </div>
  );
}

export default App;
