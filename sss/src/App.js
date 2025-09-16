import './App.css';
import Navbar from './content/Navbar';
import Footer from './content/Footer';
import HomePage from './content/HomePage';
import Donation from './Pages/Donation';
import BrowseDonations from './content/BrowseDonations';
import PageNotFound from './content/PageNotFound';
import { Toaster } from 'react-hot-toast'; 

// Imports are consolidated into one line for cleanliness
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AboutPage from './content/AboutPage';
import Impact from './content/Impact';


function App() {
  return (
    // Using a React Fragment <> to avoid an unnecessary div in the DOM
    <>
      <Router>
        <Navbar />
        <Toaster position="top-right" />
        <Routes>
          {/* Use the "element" prop for components in v6 */}
          <Route path='/' element={<HomePage />} />
          <Route path='/postdonation' element={<Donation />} />
          <Route path='/browsedonation' element={<BrowseDonations />} />
          <Route path='/about' element={<AboutPage />} />
          <Route path='/impact' element={<Impact/>} />
          {/* This "catch-all" route should be last */}
          <Route path='*' element={<PageNotFound />} />
          
        </Routes>
        <Footer />
      </Router>
    </>
  );
}

export default App;