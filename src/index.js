import React from 'react';
import ReactDOM from 'react-dom';
import * as d3 from 'd3';
import './CSS/main.css';

/*
  Coded by @yunsuklee

  A project to apply D3 and AJAX in a React App.
  Fetching data from API in JSON and getting to display the 
  data into a bar chart using d3 library.

  I'll be commenting naively throughout the code to make it 
  easier for myself to understand how things are going.
*/

// Variables
const width = 900;
const height = 600;
const barWidth = 800 / 275;

const tooltip = d3
  .select('.container')
  .append('div')
  .attr('id', 'tooltip')
  .style('opacity', 0);

// Prepare an SVG container in out HTML.
let svgContainer = d3
  .select('.container')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .attr('class', 'svgContainer');

// Fetching data.
d3.json(
  'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json'
) 
  // If data fetching was succesful.
  .then((data) => {
    console.log(JSON.stringify(data));

    // Adding the y-axis title.
    svgContainer.append('text')
                .text("Gross Domestic Product")
                .attr('transform', 'rotate(-90)')
                .attr('x', -255)
                .attr('y', 100)
                .attr('class', 'axis-title');
    
    // Adding the x-axis title.
    svgContainer.append('text')
                .text("Year")
                .attr('x', 830)
                .attr('y', 520)
                .attr('class', 'axis-title');

    // Adding data's source.
    svgContainer.append('text')
                .text("More Information: ")
                .attr('x', 410)
                .attr('y', 560)
                .attr('class', 'source')
                .append('a')
                .attr('href', 'http://www.bea.gov/national/pdf/nipaguid.pdf')
                .text('http://www.bea.gov/national/pdf/nipaguid.pdf');
    /*
      At the data JSON object there's a key named 'data' which
      contains arrays displaying on pos 0 dates and at pos 1
      its corresponding GDP.
    */

    // Getting the year + month to display at tooltip. 
    let yearsTooltip = data.data.map((item) => {
      let month; 
      let aux = item[0].substring(5, 7);

      switch(aux) {
        case '01':
          month = 'January';
          break;
        case '02':
          month = 'February';
          break;
        case '03':
          month = 'March';
          break;
        case '04':
          month = 'April';
          break;
        case '05':
          month = 'May';
          break;
        case '06':
          month = 'June';
          break;
        case '07':
          month = 'July';
          break;
        case '08':
          month = 'August';
          break;
        case '09':
          month = 'September';
          break;
        case '10':
          month = 'October';
          break;
        case '11':
          month = 'November';
          break;
        case '12':
          month = 'December';
          break;
        default:
          return 'No-Month';
      }

      return item[0].substring(0, 4) + ' ' + month;
    });

    // Getting the dates to display.
    let yearsDate = data.data.map((item) => {
      return new Date(item[0]);
    });

    // Adding 3 months in the x-axis so that the chart has
    // some 'padding' sensation.
    let maxDate = new Date(d3.max(yearsDate));
    maxDate.setMonth(maxDate.getMonth() + 3);

    // Getting the x-axis scale ready.
    let xScale = d3
      .scaleTime()
      .domain([d3.min(yearsDate), maxDate])
      .range([0, 800]);

    // x-axis scaled.
    let xAxis = d3.axisBottom().scale(xScale);

    // Adding the x-axis scaled.
    svgContainer.append('g')
                .call(xAxis)
                .attr('id', 'x-axis')
                .attr('transform', 'translate(70, 460)')
    
    // Getting the GDP's to display.
    let GDP = data.data.map((item) => {
      return item[1];
    });

    // Preparing a horizontal scale for the y-axis.
    let linearScale = d3
      .scaleLinear()
      .domain([0, d3.max(GDP)])
      .range([0, 400]);

    // Preparing the gdp's to display in the rect elements
    // scaled horizontally.
    let gdpForBars = [];
    gdpForBars = GDP.map((item) => {
      return linearScale(item);
    });

    // Preparing the y-axis scale.
    let yScale = d3
      .scaleLinear()
      .domain([0, d3.max(GDP)])
      .range([400, 0]);
    
    // Getting the y-axis scaled.
    let yAxis = d3.axisLeft().scale(yScale);

    // Adding the y-axis scaled.
    svgContainer.append('g')  
                .call(yAxis)
                .attr('id', 'y-axis')
                .attr('transform', 'translate(70, 60)');

    // Adding the bars.
    d3.select('svg')
      .selectAll('rect')
      .data(gdpForBars)
      .enter()
      .append('rect')
      .attr('data-date', (d, i) => {
        return data.data[i][0];
      })
      .attr('data-gdp', (d, i) => {
        return data.data[i][1];
      })
      .attr('class', 'bar')
      .attr('x', (d, i) => {
        return xScale(yearsDate[i]);
      })
      .attr('y', (d) => {
        return height - d;
      })
      .attr('width', barWidth + 'px')
      .attr('height', (d) => d)
      .attr('index', (d, i) => i)
      .attr('transform', 'translate(70, -140)')
      .style('fill', '#283618')
      .on('mouseover', function (event) {
        let i = event.target.getAttribute('index');

        tooltip.transition()
               .duration(200)
               .style('opacity', 0.9);
        tooltip.html(
                  yearsTooltip[i] +
                  '<br>' +
                  '$' +
                  GDP[i].toFixed(1).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') +
                  ' Billion'
                )
               .attr('data-date', data.data[i][0])
               .style('left', event.clientX - 30 + 'px')
               .style('transform', 'translateX(60px)');
      })
      .on('mouseout', function () {
        tooltip.transition()
               .duration(200)
               .style('opacity', 0);
      });
  });