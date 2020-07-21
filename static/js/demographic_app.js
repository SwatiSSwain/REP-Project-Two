{/* <script src="https://cdn.plot.ly/plotly-latest.min.js"></script> */}

let demographics_data = demographics
let income_data = income
//console.log(demographics_data);
//console.log(income_data);

var racepercent = demographics[0];
//console.log(racepercent);
//console.log(demographics_data.white_pct);
demographics_data.forEach(function (incident) {
    white_pct = parseFloat(incident.white_pct)
    of_color_pct = parseFloat(incident.of_color_pct)
    console.log(white_pct)
  })
income_data.forEach(function (incident) {
    incomeless35000_percent = parseFloat(incident.incomeless35000_percent)
    incomeless35to49_percent = parseFloat(incident.incomeless35to49_percent)
    incomeless50to74_percent = parseFloat(incident.incomeless50to74_percent)
    incomeless75to99_percent = parseFloat(incident.incomeless75to99_percent)
    income100plus_percent = parseFloat(incident.income100plus_percent)
    console.log(income100plus_percent)
  })

// INCOME DEMOGRAPHICS BAR CHART
// var labels = income_data[0]
var data = [
    {
      y: ['>35,00', '35-49', '50-74', '75-99', '100+'],
      x: [incomeless35000_percent, incomeless35to49_percent, incomeless50to74_percent, incomeless75to99_percent, income100plus_percent],
    //   text: labels,
      type: 'bar',
      color: 'green',
      orientation: "h"
    }
  ];
  Plotly.newPlot('bar', data);

// RACE DEMOGRAPHICS PIE CHRT 
    var data = [{
        values: [white_pct, of_color_pct],
        labels: ['White', 'Of Colour'],
        type: 'pie'
      }];
      
      var layout = {
        height: 400,
        width: 500
      };
      
      Plotly.newPlot('pie', data, layout);

// Init();
