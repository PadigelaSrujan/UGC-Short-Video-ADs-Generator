import Navbar from './components/Navbar';
import Home from './pages/Home';
import SoftBackdrop from './components/SoftBackdrop';
import Footer from './components/Footer';
import LenisScroll from './components/lenis';
import { Route, Routes } from 'react-router-dom';
import Genetator from './pages/genetator';
import Result from './pages/Results';
import MyGenerations from './pages/myGeneration';
import Plans from './pages/Plans';
import Loading from './pages/Loading';
import Community from './pages/Community';
import {Toaster} from 'react-hot-toast';

function App() {
	return (
		<>
		    <Toaster toastOptions={{style:{background:'#333',color:"#fff"}}} />
			<SoftBackdrop />
			<LenisScroll />
			<Navbar />
			<Routes>
				<Route path='/' element={<Home />} />
				<Route path='/generate' element={<Genetator />} />
				<Route path='/result/:projectID' element={<Result />} />
				<Route path='/my-generations' element={<MyGenerations />} />
				<Route path='/community' element={<Community />} />
				<Route path='/plans' element={<Plans />} />
				<Route path='/loading' element={<Loading />} />
			</Routes>
			<Footer />
		</>
	);
}
export default App;