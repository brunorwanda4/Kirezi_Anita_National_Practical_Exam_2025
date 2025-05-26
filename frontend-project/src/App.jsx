import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import Login from './pages/Login';
import Home from './pages/Home';
import Signup from './pages/Signup';
import SpareParts from './pages/systemPages/Spare';
import StockIn from './pages/systemPages/Stockin';
import StockOut from './pages/systemPages/Stockout';
import Report from './pages/systemPages/Report';

const App = () => {
    return(
        <Router>
            <Routes>
                <Route path='/signup' element = {<Signup/>}/>
                <Route path='/' element = {<Login/>}/> 
                <Route path='/home' element = {<Home/>}/>
                <Route path='/sparepart' element = {<SpareParts/>}/>
                <Route path='/stockin' element = {<StockIn/>}/>
                <Route path='/stockout' element = {<StockOut/>}/>
                <Route path='/rep' element = {<Report/>}/>
                <Route path='*' element = {<div>page not found || 404</div>}/>
            </Routes>
        </Router>
    )
}
export default App;