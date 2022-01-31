import React from 'react'
const Home = React.lazy(()=>import("./Page/Home"));
const MapSide = React.lazy(()=>import("./Page/MapSide"));
const routes=[
    {
        path:"/",element:Home
    },
    {
        path:"/map",element:MapSide
    }
]
export default routes;
