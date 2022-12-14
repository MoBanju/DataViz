import { Container, TextField, Typography, Button, Box, Autocomplete, Checkbox, FormControlLabel } from '@mui/material'
import mainpageBackground from "../../Assets/mainpageBackground.png";
import MainBar from "./MainBar";
import MainPage from '../../Assets/mainPage.png';
import SecondPage from '../../Assets/mapDarkMode.png';
import { ColorModeContext } from '../../context/ColorModeContext';
import Image from 'mui-image';
import React, { useEffect, useState, useContext } from 'react'
import { useQuery } from 'react-query';
import SourceFinder from '../../Apis/SourceFinder';
import JSONstat from "jsonstat-toolkit";
import { BeatLoader, DotLoader } from 'react-spinners';
import SsbVisualization from '../SsbVisualization';
import { usePromiseTracker } from "react-promise-tracker";
import { trackPromise } from 'react-promise-tracker';
import SortingDropDownMenu from '../../Components/SortingDropDownMenu';
import SsbContext from '../../context/SsbContext';
import axios from 'axios';
import MapFormat from '../../Components/MapFormat';
const SsbData2 = () => {
    const { sorting, setSorting } = useContext(SsbContext);
    const [geoJson, setGeoJson] = useState(null);
    const [aviablesId, setAviablesId] = useState(null);
    const [mapFormatSelect,setMapFormatSelect] = useState("heatmap");
    const [checkBox, setCheckBox] = useState(false)
    const { promiseInProgress } = usePromiseTracker();
    const [id, setId] = useState("")
    const colorMode = useContext(ColorModeContext);
    //Everything that has to do with fetching and storing data this is like a hub for the site, we could have used context but that may have lowered the performance
    const { data, refetch, isLoading, isError, error } = useQuery("ssbData", async () => {
        const url = "https://data.ssb.no/api/v0/dataset/" + id + ".json?lang=no";
        const { data } = await SourceFinder.get("incomejson", {
            params: { url: url,mapFormat:mapFormatSelect },
        });
        console.log(data.geoJson)
        setGeoJson(data.geoJson)
        return data;
    }, {
        refetchOnWindowFocus: false,
        enabled: false // turned off by default, manual refetch is needed
    });

    //Fetching the different values
    function getOptions(url) {
        return JSONstat(url).then(main);
    }
    async function main(j) {
        var ds = j.Dataset(0);
        let variabler = ds.id.filter(item => { return item !== 'Region' && item !== 'ContentsCode' && item !== 'Tid' })
        let ContentsCodesIds = ds.Dimension("ContentsCode").id
        let ContentsCodes = []
        ContentsCodesIds.forEach((content, index) => {
            const ContentCodeObject = {
                label:ds.Dimension("ContentsCode").Category(index).label,
                unit:ds.Dimension("ContentsCode").Category(index).unit
              }
              ContentsCodes.push(ContentCodeObject)
        })
        if (variabler.length > 0) {
            let variablerValues = []
            variabler.forEach((item) => {
                let itemLength = ds.Dimension(item).length;
                let itemBlock = {}
                itemBlock["options"] = []
                itemBlock["id"] = item
                for (let i = 0; i < itemLength; i++) {
                    itemBlock["options"].push(ds.Dimension(item).Category(i).label)
                }
                itemBlock["value"] = ds.Dimension(item).Category(0).label
                variablerValues.push(itemBlock)
            })
            if (variablerValues.length > 0) {
                setSorting({
                    options: variablerValues,
                    times: ds.Dimension("Tid").id,
                    ContentsCodes: ContentsCodes,
                    ContentCode: ContentsCodes[0]
                })
            }
            else {
                setSorting({
                    times: ds.Dimension("Tid").id,
                    value: "NoSortNeeded",
                    ContentsCodes: ContentsCodes,
                    ContentCode: ContentsCodes[0]
                }
                )
            }
        }
        else {
            setSorting({
                times: ds.Dimension("Tid").id,
                value: "NoSortNeeded",
                ContentsCodes: ContentsCodes,
                ContentCode: ContentsCodes[0]
                }
            )
        }
    }
   
    useEffect(() => {
        if (id === "11694") {
            console.log("We apologize but the 11694 dataset misses alot of information and is not possible to display")
        }
        else if (id !== "") {
            const url = "https://data.ssb.no/api/v0/dataset/" + id + ".json?lang=no";
            trackPromise(getOptions(url));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get("https://data.ssb.no/api/v0/dataset/list.json?lang=no");
                if (response) {
                    const filter = ["kommuner", "tidsserie"]
                    const currentArray = []
                    response.data.datasets.forEach((dataset) => {
                        const value = filter.every(kommunertidsserie => {
                            return dataset.tags.includes(kommunertidsserie)
                        })
                        if (value === true && dataset.id !== "65962") {
                            currentArray.push(dataset)
                        }
                    })
                    setAviablesId(currentArray)
                }
            } catch (err) {
                console.log(err)
            }
        }
        fetchData()
    }, []);



    if (isLoading) {
        return <Container maxWidth="" sx={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}><BeatLoader color={'#123abc'} /><Typography>Right now we are preparing your map!</Typography></Container>;
    }
    if (isError) {
        return <Typography>{error.message}</Typography>
    }
    
    const InfoAboutSelected = () => {
        return (
            <Container>
                {sorting.times && <Box sx={{ display: "flex" }}><Typography>Time interval:</Typography><Typography>start:{sorting.times[0]}, end:{sorting.times[sorting.times.length - 1]}</Typography></Box>}
            </Container>
        )
    }
    const DropDownMenuOfOptions = () => (
        <Box sx={{ display: "flex"}}>
            <Autocomplete
                disablePortal
                id="combo-box-demo"
                options={aviablesId}
                onChange={(event, value) => {
                    setId(value.id);
                }}
                value={aviablesId.filter((aviableId) => aviableId.id === id)[0]}
                sx={{ width: 300 }}
                getOptionLabel={(option) => checkBox ? option.id : option.title}
                renderInput={(params) => <TextField {...params} label="Dataset" />}
            />
            <FormControlLabel control={<Checkbox color={colorMode.mode === 'dark' ? 'secondary' : 'primary'} checked={checkBox} onChange={() => setCheckBox(!checkBox)} />} label="Choose with Id instead" />
        </Box>
    )

    return (
        <>
            {!data ?
                <>
                    <Container
                        maxWidth=""
                        sx={{
                            backgroundImage: colorMode.mode === "dark" ?
                                "URL(" +
                                mainpageBackground +
                                "),linear-gradient(to bottom right, #1c527e 50%, #0d4b62 50%);" :
                                "URL(" +
                                mainpageBackground +
                                "),#fff",
                            backgroundRepeat: "no-repeat",
                            backgroundSize: "cover",
                            position: "absolute",
                            top: 0,
                            bottom: 0,
                            right: 0,
                            left: 0,
                            width: "100vw",
                            height: "100vh",
                            }}
                    >
                        <MainBar colorMode={colorMode}/>
                        <FillOutForm />
                    </Container>
                </>
                : <SsbVisualization geoJson={geoJson} />}
        </>
    )
}

export default SsbData2

    /* useEffect(() => {
        sortArray()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sorting.options,dataArray]); */


/*         let needsKommune = null
        if (kommuner !== []) {
            needsKommune = true
        }
        else {
            needsKommune = false
        } */


 /* function sortArray() {
        if (dataArray) {
            let filter = {}
            if (sorting.options && sorting.options.length > 0) {
                sorting.options.forEach((option) => {
                    filter[option.id] = option.value
                })
            }
            const matching = dataArray.filter((item) => Object.entries(filter).every(([key, value]) => item[key] === value));
            const newArray = kommuner.features.map((kommune) => {
                if (matching.filter((e) => e.RegionNumber === kommune.properties.kommunenummer)) {
                    let ContentObjects={}
                    sorting.ContentsCodes.map((ContentCode)=>{
                        const KommuneFiltered = matching.filter((e)=>parseInt(e.RegionNumber)===kommune.properties.kommunenummer && e.ContentsCode===ContentCode.label);
                        ContentObjects[ContentCode]=Object.fromEntries(KommuneFiltered.map((item) => [item["Tid"], item["value"]]));
                      })
                    return {
                        ...kommune,
                        properties: {
                            ...kommune.properties,
                            ...ContentObjects,
                            ...filter
                        }
                    }
                }
            })
            let geoJson = {
                "type": "FeatureCollection",
                "features": newArray
            }
            setGeoJsonArray(geoJson)
        }
    } */