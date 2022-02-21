import { Button,Slider,Box, Typography,Container } from '@mui/material';
import React, { useContext, useState } from 'react';
import { useEffect } from 'react';
import SourceFinder from '../../Apis/SourceFinder';
import { SourceContext } from "../../context/SourceContext";
import TableForFylke from './TableForFylke';
import MapView from './MapView';
import Chart from './Chart';
const Test = () => {
  const {sources,setSources}= useContext(SourceContext)
  const [fylker,setFylker]= useState(null);
  const [loading,setLoading] = useState(true)
  const [valgteSources,setValgteSources] = useState(null)
  const [spesifiedTime,setSpesifiedTime] = useState([1549697922])
  const currentTime = Math.floor(Date.now() / 1000);
  const[weatherData,setWeatherData] = useState(null)
  const [min,setMin] = useState(null)
  //Lage ferdig Kart for en source
    //Ta inn kart || DONE
    //Ferdig med filterbydayFeature
    //Bli ferdig med Label
  //HeatMap
    //Implementere kart og heatmap
  //Ta dataen inn i databasen og gjøre slik at alle dataen vises på skjermen om den har data tilgjenlig
  //Utvide slikt at man kan ta inn opptil 10 sources  
  //Lage funksjon som sender 10 sources i request
  //Lage en Nodejs funksjon som fetcher 10 dataer og returner en massiv array
  const handleTimeChange = (event, newValue) => {
    setSpesifiedTime(newValue);
  };
  function unixTimeToFrostTime(time){
    var a = new Date(time * 1000);
  var year = a.getFullYear();
  var month = (a.getMonth()+1).toString().padStart(2,"0");
  var date = a.getDate().toString().padStart(2, "0");
  var time = year + '-' + month + '-' + date;
  return time;
  }
  function timeNow(){
    return unixTimeToFrostTime(spesifiedTime)
  }
  useEffect(() => {
      const fetchData = async ()=>{
        try{
          const sources = await SourceFinder.get("/sources");
          const fylker = await SourceFinder.get("/fylker");
          setFylker(fylker.data.data.fylker)
          setSources(sources.data.data.plass)
        } catch(err){
          console.log(err)
        }
      }
      if(sources === null){
        fetchData()
      }
     setLoading(false)
  }, []);
  function FilterAndSort(filterBy){
    return (sources.features.filter((source)=>source.properties.county.toLowerCase() === filterBy.toLowerCase()))
}
async function GetData(){
  const inpWeatherData = await SourceFinder.get("/weatherdata",{params:{
    id:valgteSources[0]
  }});
  setWeatherData(inpWeatherData.data.data.plass)
  setMin(Math.floor(new Date(inpWeatherData.data.data.plass.features[0].properties.referenceTime).getTime()/1000))
  setSpesifiedTime(Math.floor(new Date(inpWeatherData.data.data.plass.features[0].properties.referenceTime).getTime()/1000))
}
function SortByDate(){
  const features = weatherData.features.filter((dag)=>dag.properties.referenceTime.split("T")[0]===unixTimeToFrostTime(spesifiedTime))
  /* if(newArray.length>0){
  console.log(newArray[0])} */
  return {type:'FeatureCollection',features}
}
if (loading){
  return <p>Loading..</p>
}
  return <div>
    {sources&&
    fylker.map((fylke)=><TableForFylke key={fylke.fylkesnavn} fylke = {fylke.fylkesnavn} valgteSources={valgteSources} setValgteSources={setValgteSources} fylkeListe={FilterAndSort(fylke.fylkesnavn)}/>)
    }
    <Box sx={{ justifyContent:"center",display:"flex"}}>    
    </Box>
    {valgteSources&&<><h1>{valgteSources.length}</h1>
    <Typography>{timeNow()}</Typography>
    <Button onClick={GetData}>Hent data</Button>
    <Slider
      getAriaLabel={() => 'Date range'}
      value={spesifiedTime}
      onChange={handleTimeChange}
      valueLabelDisplay="auto"
      step={43200}
      sx={{width:"500px"}}
      max={currentTime}
      min={min}
    /></>}
    {weatherData&&
    <>{console.log(SortByDate())}</>&&
    SortByDate().features.length>0?
    SortByDate().features.map((dag)=><><div><h1>RefTime:</h1>{dag.properties.referenceTime}</div><br></br><h4>Value:</h4><div>{dag.properties.value}</div></>):<p>loading</p>}
   
    {weatherData&& <><Chart data={weatherData}></Chart><Container maxWidth="lg" sx={{height:"500px"}}><MapView data={SortByDate()}/></Container></>}
  </div>;
};

export default Test;
 //Velge 10 sources
    //import the sources || DONE
    //Gjøre slik at man kan velge max antall sources || DONE
//Hente inn data for active sources når knappen blir trykka 
    //Lage en NodeJs funksjon som fetcher 1 data og returnerer en array basert på den dataen || DONE  