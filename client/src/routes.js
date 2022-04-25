import React from 'react'
import Home from './Page/Home';
const OldHome = React.lazy(()=>import("./Page/Home"));
const weatherData = React.lazy(()=>import("./Page/Værdata"));
const SsbData = React.lazy(() => import("./Page/SsbData"));
const SsbDataId = React.lazy(() => import("./Page/SsbVisualization"));
const Help = React.lazy(() => import("./Page/Help"));
const Test = React.lazy(()=>import("./Page/Test"))
const routes=[
    {path:"/",element:Home},
    {path:"/weather",element:weatherData},
    {path:"/ssb",element:SsbData},
    {path:"/ssb/:id",element:SsbDataId},
    {path:"/help",element:Help},
    {path:"/test",element:Test},
]
export default routes;
