async function fetchData() {
    url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
    const response = await fetch(url);
    const data = await response.json();
    return data;
    }


/*
rawData = fetchData()   // prend 3s 

console.log(rawData)    //met log affiche direct, suaf que les data sont pas dispo direct   


rawData.then(rawData => console.log(rawData)) //affiche que quand les data est dispo
*/

function processData(geodata) {
    return geodata.features.map(features => {
        return {
        cordinates: features.geometry.coordinates,
        magnitude: features.properties.mag,
        time: features.properties.time
        }

    });
    }

    /*
fetchData()
    .then(rawData=> {
        cleanData = processData(rawData)
        console.log(cleanData[0]);
    })
*/

function plotData(earthquakeData){
    plotMap(earthquakeData);
    plotMagnitudeHistogram(earthquakeData);
    plotTimeSeries(earthquakeData);
    plotMagnitudeVsDepth(earthquakeData);
}

function plotMap(earthquakeData){
    const trace1 = {
        type: 'scattergeo',
        locationmode: 'world',
        lon : earthquakeData.map(d => d.cordinates[0]),
        lat: earthquakeData.map(d => d.cordinates[1]),
        text: earthquakeData.map(d => `Magnitude: ${d.magnitude} Time: ${new Date(d.time)}`),
        marker : {
            size : earthquakeData.map( d => d.magnitude * 4),
            color : earthquakeData.map(d => d.magnitude),
            cmin: 0,
            cmax:8,
            colorscale : 'Viridis',
            colorbar : {
                title : 'Magnitude'
            }
        }

    };
    const layout1 = {
        title : 'Global Earthquakes in the last week',
        geo : {
            scope : 'world',
            projection : {
                type: 'natural earth'
            },
            showland : true,
            landcolor : 'rgb(243, 243, 243)',
            countrycolor : 'rgb(204, 204, 204)'
        }
    };
    Plotly.newPlot('earthquakePlot', [trace1], layout1);
}


function plotMagnitudeHistogram(earthquakeData){
    const magnitudes = earthquakeData.map(d => d.magnitude)
    const trace = {
        x: magnitudes,
        type: 'histogram',
        marker : {
            color: '#E6A4B4'
        }
    };
    const layout = {
        title: 'Histogram of erathquake magnitude',
        xaxis : {title: 'Magnitude'},
        yaxis: {title: 'Frequency'}
    };
    Plotly.newPlot('magnitudeHistogram', [trace], layout)

}


function plotTimeSeries(earthquakeData){
    const dates = earthquakeData.map(d => new Date(d.time).toISOString().slice(0, 10));
    const dateCounts = dates.reduce((acc, date) => {
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});
    const trace2 = {
        x: Object.keys(dateCounts),
        y: Object.values(dateCounts),
        type: 'scatter',
        mode : 'lines+markers',
        marker: {color:'#E6A4B4'}
    };
    const layout2 = {
        title: 'Daily Earthquake Frequency',
        xaxis : {title: 'Date'},
        yaxis: {title: 'Number of earthquake'}
    };
    Plotly.newPlot('timeSeriesPlot', [trace2], layout2)

}

function plotMagnitudeVsDepth(earthquakeData){
    const magnitudes = earthquakeData.map(d => d.magnitude);
    const depths = earthquakeData.map(d => d.cordinates[2]);

    const trace3 = {
        x: magnitudes,
        y: depths,
        mode: 'markers',
        type: 'scatter',
        marker: {
            color: '#E6A4B4',  
            size: 8  
        }
    };
    const layout3 = {
        title: 'Magnitude vs Profondeur',
        xaxis: { title: 'Magnitude' },
        yaxis: { title: 'Profondeur (km)' },
        height : 600
    };
    Plotly.newPlot('magnitudeDepthPlot', [trace3], layout3);

}



fetchData()
    .then(rawData => processData(rawData))
    .then(cleanData => plotData(cleanData))