import { Container, TextField, Typography, Button, Box, Autocomplete, Checkbox, FormControlLabel } from '@mui/material'
import React, { useEffect, useState, useContext, useMemo } from 'react'
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
const SsbData = () => {
    const { sorting, setSorting } = useContext(SsbContext);
    const [geoJsonArray, setGeoJsonArray] = useState(null);
    const [dataArray, setDataArray] = useState(null);
    const [kommuner, setKommuner] = useState(null);
    const [aviablesId, setAviablesId] = useState(null);
    const [checkBox, setCheckBox] = useState(false)
    const { promiseInProgress } = usePromiseTracker();
    const [id, setId] = useState("")
    //Everything that has to do with fetching and storing data this is like a hub for the site, we could have used context but that may have lowered the performance
    const { data, refetch, isLoading, isError, error } = useQuery("ssbData", async () => {
        const url = "https://data.ssb.no/api/v0/dataset/" + id + ".json?lang=no";
        let needsKommune = null
        if (kommuner !== []) {
            needsKommune = true
        }   
        else {
            needsKommune = false
        }
        const { data } = await SourceFinder.get("/incomejson", {
            params: { sorting:sorting, url: url, needsKommune: needsKommune},
        });
        setGeoJsonArray(data.sortedArray)
        setDataArray(data.unSortedArray)
        setKommuner(data.kommuner)
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
        ContentsCodesIds.forEach((content,index)=>{
            ContentsCodes.push(ds.Dimension("ContentsCode").Category(index).label)
        })
        if (variabler.length > 0) {
            let variablerValues = {}
            variabler.forEach((item) => {
                let itemLength = ds.Dimension(item).length;
                variablerValues[item] = []
                for (let i = 0; i < itemLength; i++) {
                    variablerValues[item].push(ds.Dimension(item).Category(i).label)
                }
            })
            if (Object.keys(variablerValues).length > 0) {
                setSorting({
                    options: variablerValues,
                    value: variablerValues[Object.keys(variablerValues)[0]][0],
                    times: ds.Dimension("Tid").id,
                    ContentsCodes:ContentsCodes,
                    ContentCode:ContentsCodes[0]
                })
            }
            else {
                setSorting({
                    times: ds.Dimension("Tid").id,
                    value: "NoSortNeeded",
                    ContentsCodes:ContentsCodes,
                    ContentCode:ContentsCodes[0]
                }
                )
            }
        }
        else {
            setSorting({
                times: ds.Dimension("Tid").id,
                value: "NoSortNeeded",
                ContentsCodes:ContentsCodes,
                ContentCode:ContentsCodes[0]
                }
            )
        }
    }
    async function sortArray() {
        if (dataArray) {
            let validKommuner = []
            const newSortedArray = dataArray.filter((item) => item.HusholdType === sorting.value);
            kommuner.features.forEach((kommune) => {
                let currentKommune = null
                if (newSortedArray.find((e) => parseInt(e.RegionNumber) === kommune.properties.RegionNumber)) {
                    currentKommune = kommune
                    currentKommune.properties = newSortedArray.find((e) => parseInt(e.RegionNumber) === kommune.properties.RegionNumber)
                    validKommuner.push(currentKommune)
                }
            })
            let geoJson = {
                "type": "FeatureCollection",
                "features": validKommuner
            }
            setGeoJsonArray(geoJson)
        }
    }
    useEffect(() => {
        if (id !== "") {
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
                        if (value === true) {
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

    useMemo(() => {
        sortArray()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sorting.value]);

    if (isLoading) {
        return <Container maxWidth="" sx={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}><BeatLoader color={'#123abc'} /><Typography>Right now we are preparing your map!</Typography></Container>;
    }
    if (isError) {
        return <Typography>{error.message}</Typography>
    }
    const FillOutForm = () => (
        <Container sx={{ justifyContent: "center", display: "flex", flexDirection: "column" }}>
            <Typography variant="h3" color="primary.main">Welcome to ssb visualisation toolkit</Typography>
            <Typography> Kommuner:<a href="https://data.ssb.no/api/?tags=kommuner">Velg data set</a></Typography>
            {aviablesId ? <DropDownMenuOfOptions /> : <Typography>Fetching aviable Ids</Typography>}
            {id !== "" && <Typography>Urlen som vil bli vist: {"https://data.ssb.no/api/v0/dataset/" + id + ".json?lang=no"}</Typography>}
            {(promiseInProgress === true) ? <Box sx={{ display: "flex", alignItems: "center" }}><DotLoader color={"#123abc"} /><Typography>Contating SSB to recieve sorting options</Typography></Box> : <>{ id!== "" && <>{sorting !== "" && sorting.value !== "" && sorting.value !== "NoSortNeeded" ? Object.keys(sorting.options).length > 0 && <><Typography variant="h6">Velg sorting:</Typography><SortingDropDownMenu fetched={false} /></> : <Typography>No sorting needed</Typography>}
                {id && aviablesId && <InfoAboutSelected />}</>}</>}
            <Button variant="contained" disabled={sorting === ""} onClick={() => refetch()} sx={{ mt: 2 }}>HENT DATA</Button>
        </Container>
    );
    const InfoAboutSelected = () => {
        const currSelected = aviablesId.filter((dataset) => dataset.id === id)[0]
        return (
            <Container>
                {/* <Typography>You have chosen: <br></br><span style={{ fontWeight: 700 }}>id:{currSelected["id"]}</span><br></br><span style={{ fontWeight: 700 }}>title:{currSelected["title"]}</span></Typography> */}
                {sorting.times && <Box sx={{ display: "flex" }}><Typography>Time interval:</Typography><Typography>start:{sorting.times[0]}, end:{sorting.times[sorting.times.length-1]}</Typography></Box>}
            </Container>
        )
    }
    const DropDownMenuOfOptions = () => (
        <Box sx={{ display: "flex" }}>
            <Autocomplete
                disablePortal
                id="combo-box-demo"
                options={aviablesId}
                onChange={(event, value) => {
                    setId(value.id);
                }}
                value={aviablesId.filter((aviableId)=>aviableId.id===id)[0]}
                sx={{ width: 300 }}
                getOptionLabel={(option) => checkBox ? option.id : option.title}
                renderInput={(params) => <TextField {...params} label="Dataset" />}
            />
            <FormControlLabel control={<Checkbox checked={checkBox} onChange={() => setCheckBox(!checkBox)}/>} label="Choose with Id instead" />
        </Box>
    )

    return (
        <>
            {!data ?
                <>
                    <FillOutForm />
                </>
                : <SsbVisualization geoJsonArray={geoJsonArray} />}
        </>
    )
}

export default SsbData