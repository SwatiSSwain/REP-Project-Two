let demographics_data = demographics
let income_data = income
console.log(demographics_data);
console.log(income_data);

var racepercent = demographics[0];
console.log(racepercent);
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
    median_income_total = parseFloat(incident.median_income_total)
    console.log(median_income_total)

    console.log(income100plus_percent)
  })

// INCOME DEMOGRAPHICS BAR CHART

var data = [ 
    {
      y: ['>35,00', '35-49', '50-74', '75-99', '100+'],
      x: [incomeless35000_percent, incomeless35to49_percent, incomeless50to74_percent, incomeless75to99_percent, income100plus_percent],
        
      title: "labels",
      marker: {
      color: 'olive'},
      type: 'bar',
      orientation: "h"
    }

  ];
var layout = {
    margin: {t:0 },
    title: "INCOME DEMOGRAPHICS BAR CHART",
    xaxis: { title: 'Percent of Population' },
    yaxis: { title: 'Yearly Income in USD'}
            };

//   TITLE AND AXIS LABEL

  Plotly.newPlot('bar', data, layout);

// RACE DEMOGRAPHICS PIE CHRT 
    var data = [{
        values: [white_pct, of_color_pct],
        labels: ['White', 'Of Colour'],
        type: 'pie',
        marker: {
            colors : [
            'rgb(240, 240, 240)',
            'rgb(0, 0, 0)',

            ]           
        }
      }];
      
      var layout = {
        height: 400,
        width: 500
      };
      
      Plotly.newPlot('pie', data, layout);

