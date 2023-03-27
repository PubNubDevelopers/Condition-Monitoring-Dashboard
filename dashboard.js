(function () {
  feather.replace({ 'aria-hidden': 'true' })

  var getMax = function(chart) { //Returns the maximum value from the chart.
    datasets = chart.data.datasets;
    max = 0;
    for(var i=0; i<datasets.length; i++) {
        dataset=datasets[i]
        if(chart.data.datasets[i].hidden) {
            continue;
        }
        dataset.data.forEach(function(d) {
            if(typeof(d)=="number" && d>max) {
                max = d
            }
        })
    }
    return max;
  }

  // Graphs
  var sensorchart1 = new Chart(document.getElementById('sensorchart1'), {
    type: 'line',
    data: {
      datasets: [{
        label: 'Reported X Deviation',
        lineTension: 0.1,
        backgroundColor: 'transparent',
        borderColor: '#007bff',
        borderWidth: 4,
        pointBackgroundColor: '#007bff'
      },
      {
        label: 'Reported Y Deviation',
        lineTension: 0.1,
        backgroundColor: 'transparent',
        borderColor: '#FF0000',
        borderWidth: 5,
        pointBackgroundColor: '#FF0000'
      }]
    },
    options: {
      legend: {
        display: true
      }
    }
  })
  var sensorchart2 = new Chart(document.getElementById('sensorchart2'), {
    type: 'line',
    data: {
      datasets: [{
        label: 'Reported X Deviation',
        lineTension: 0.1,
        backgroundColor: 'transparent',
        borderColor: '#007bff',
        borderWidth: 4,
        pointBackgroundColor: '#007bff'
      },
      {
        label: 'Reported Y Deviation',
        lineTension: 0.1,
        backgroundColor: 'transparent',
        borderColor: '#FF0000',
        borderWidth: 5,
        pointBackgroundColor: '#FF0000'
      }]
    },
    options: {
      legend: {
        display: true
      }
    }
  })

  pubnub = new PubNub({ // Your PubNub keys here. Get them from https://dashboard.pubnub.com.
    publishKey : 'pub-c-a2daf68e-5588-4854-ba05-3f84a92d0d09',
    subscribeKey : 'sub-c-fec9355f-951f-48bb-811f-c573dd48e003',
    uuid : 'dashboard'
  });

var lastUpdate;
const arrAvg = arr => arr.reduce((a,b) => a + b, 0) / arr.length
  
 pubnub.fetchMessages( // Load history into the charts
      {
          channels: ['monitoringchannel'],
          count: 40,
      },
      function (status, response) {
              response.channels['monitoringchannel'].forEach((message) => {
                  var date = new Date(Math.trunc((message.timetoken / 10000), 16)); 
                  lastUpdate = date;
                  var timedisplay = date.toLocaleString();
                  //console.log(message);
                  sensorchart1.data.labels.push(timedisplay);
                  sensorchart1.data.datasets[0].data.push([message.message.channel1]);
                  sensorchart1.data.datasets[1].data.push([message.message.channel2]);
                  sensorchart2.data.labels.push(timedisplay);
                  sensorchart2.data.datasets[0].data.push([message.message.channel3]);
                  sensorchart2.data.datasets[1].data.push([message.message.channel4]);

                  if (sensorchart1.data.datasets[0].data.length > 40) {
                    // Remove the oldest data and label
                    sensorchart1.data.datasets[0].data.shift();
                    sensorchart1.data.datasets[1].data.shift();
                    sensorchart1.data.labels.shift();
                  }
                  if (sensorchart2.data.datasets[0].data.length > 40) {
                    // Remove the oldest data and label
                    sensorchart2.data.datasets[0].data.shift();
                    sensorchart2.data.datasets[1].data.shift();
                    sensorchart2.data.labels.shift();
                  }
                  var maxarray = sensorchart1.data.datasets[0].data.concat(sensorchart1.data.datasets[1].data);
                  sensorchart1.options.scales = {
                    xAxes: [],
                    yAxes: [
                      {
                        ticks: {
                          beginAtZero: false,
                          max: Math.max(...maxarray)+1  
                        }
                      }
                    ]
                  };
                
                  sensorchart1.update();
                  maxarray = sensorchart2.data.datasets[0].data.concat(sensorchart2.data.datasets[1].data);
                  sensorchart2.options.scales = {
                    xAxes: [],
                    yAxes: [
                      {
                        ticks: {
                          beginAtZero: false,
                          max: Math.max(...maxarray)+1  
                        }
                      }
                    ]
                  };
                
                  sensorchart2.update();
                  
              }); 
      }
  );
  
  pubnub.addListener({ // Subscribe for new values and update charts.
    message: function(message) {
          var date = new Date(Math.trunc((message.timetoken / 10000), 16)); 
          lastUpdate = date;
          var timedisplay = date.toLocaleString();
          //console.log(message);
          sensorchart1.data.labels.push(timedisplay);
          sensorchart1.data.datasets[0].data.push([message.message.channel1]);
          sensorchart1.data.datasets[1].data.push([message.message.channel2]);
          document.getElementById("c1_last_x").textContent=message.message.channel1;
          document.getElementById("c1_last_y").textContent=message.message.channel2;

          sensorchart2.data.labels.push(timedisplay);
          sensorchart2.data.datasets[0].data.push([message.message.channel3]);
          sensorchart2.data.datasets[1].data.push([message.message.channel4]);
          document.getElementById("c2_last_x").textContent=message.message.channel3;
          document.getElementById("c2_last_y").textContent=message.message.channel4;

          if (sensorchart1.data.datasets[0].data.length > 40) {
            // Remove the oldest data and label
            sensorchart1.data.datasets[0].data.shift();
            sensorchart1.data.datasets[1].data.shift();
            sensorchart1.data.labels.shift();
          }
          if (sensorchart2.data.datasets[0].data.length > 40) {
            // Remove the oldest data and label
            sensorchart2.data.datasets[0].data.shift();
            sensorchart2.data.datasets[1].data.shift();
            sensorchart2.data.labels.shift();
          }
          var maxarray = sensorchart1.data.datasets[0].data.concat(sensorchart1.data.datasets[1].data);
          sensorchart1.options.scales = {
            xAxes: [],
            yAxes: [
              {
                ticks: {
                  beginAtZero: false,
                  max: Math.max(...maxarray)+1  
                }
              }
            ]
          };

          document.getElementById("c1_max_x").textContent = Math.max(...sensorchart1.data.datasets[0].data);
          document.getElementById("c1_max_y").textContent = Math.max(...sensorchart1.data.datasets[1].data);

          // Update status boxes

          if (Math.max(...maxarray) < 3) { // low vibration. OS=warn and VS=low
            document.getElementById('C1OSD').classList.add("d-none");
            document.getElementById('C1OSW').classList.remove("d-none");
            document.getElementById('C1OSN').classList.add("d-none");
            document.getElementById('C1VSD').classList.add("d-none");
            document.getElementById('C1VSW').classList.add("d-none");
            document.getElementById('C1VSS').classList.remove("d-none");
          } else if (Math.max(...maxarray) >= 3 && Math.max(...maxarray) < 12 ) { // med vibration. OS=ok and VS=warn
            document.getElementById('C1OSD').classList.add("d-none");
            document.getElementById('C1OSW').classList.add("d-none");
            document.getElementById('C1OSN').classList.remove("d-none");
            document.getElementById('C1VSD').classList.add("d-none");
            document.getElementById('C1VSW').classList.remove("d-none");
            document.getElementById('C1VSS').classList.add("d-none");
          } else if (Math.max(...maxarray) >= 12) { // danger  OS=ok and VS=danger
            document.getElementById('C1OSD').classList.add("d-none");
            document.getElementById('C1OSW').classList.add("d-none");
            document.getElementById('C1OSN').classList.remove("d-none");
            document.getElementById('C1VSD').classList.remove("d-none");
            document.getElementById('C1VSW').classList.add("d-none");
            document.getElementById('C1VSS').classList.add("d-none");
          } 
      
          sensorchart1.update();
          maxarray = sensorchart2.data.datasets[0].data.concat(sensorchart2.data.datasets[1].data);
          sensorchart2.options.scales = {
            xAxes: [],
            yAxes: [
              {
                ticks: {
                  beginAtZero: false,
                  max: Math.max(...maxarray)+1  
                }
              }
            ]
          };

          document.getElementById("c2_max_x").textContent = Math.max(...sensorchart2.data.datasets[0].data);
          document.getElementById("c2_max_y").textContent = Math.max(...sensorchart2.data.datasets[1].data);

          if (Math.max(...maxarray) < 3) { // low vibration. OS=warn and VS=low
            document.getElementById('C2OSD').classList.add("d-none");
            document.getElementById('C2OSW').classList.remove("d-none");
            document.getElementById('C2OSN').classList.add("d-none");
            document.getElementById('C2VSD').classList.add("d-none");
            document.getElementById('C2VSW').classList.add("d-none");
            document.getElementById('C2VSS').classList.remove("d-none");
          } else if (Math.max(...maxarray) >= 3 && Math.max(...maxarray) < 12 ) { // med vibration. OS=ok and VS=warn
            document.getElementById('C2OSD').classList.add("d-none");
            document.getElementById('C2OSW').classList.add("d-none");
            document.getElementById('C2OSN').classList.remove("d-none");
            document.getElementById('C2VSD').classList.add("d-none");
            document.getElementById('C2VSW').classList.remove("d-none");
            document.getElementById('C2VSS').classList.add("d-none");
          } else if (Math.max(...maxarray) >= 12) { // danger  OS=ok and VS=danger
            document.getElementById('C2OSD').classList.add("d-none");
            document.getElementById('C2OSW').classList.add("d-none");
            document.getElementById('C2OSN').classList.remove("d-none");
            document.getElementById('C2VSD').classList.remove("d-none");
            document.getElementById('C2VSW').classList.add("d-none");
            document.getElementById('C2VSS').classList.add("d-none");
          } 
          sensorchart2.update();
      }
  });

pubnub.subscribe({
    channels: ['monitoringchannel'] // Listen for data.
});

function checkStatus() { // If the stream is offline update the status boxes
  var currenttime = new Date();
  if(currenttime-lastUpdate > 20*1000){ // Data stream went offline if no data in 20 seconds
    document.getElementById('C1OSD').classList.remove("d-none");
    document.getElementById('C1OSW').classList.add("d-none");
    document.getElementById('C1OSN').classList.add("d-none");
    document.getElementById('C1VSD').classList.add("d-none");
    document.getElementById('C1VSW').classList.add("d-none");
    document.getElementById('C1VSS').classList.remove("d-none");

    document.getElementById('C2OSD').classList.remove("d-none");
    document.getElementById('C2OSW').classList.add("d-none");
    document.getElementById('C2OSN').classList.add("d-none");
    document.getElementById('C2VSD').classList.add("d-none");
    document.getElementById('C2VSW').classList.add("d-none");
    document.getElementById('C2VSS').classList.remove("d-none");
  }
}

setInterval(checkStatus, 500);

const myModal = new bootstrap.Modal('#staticBackdrop'); // Show info to explain dashboard
myModal.show();

//The below code is for the interactive demo on PubNub.com. It is not part of the demo of this application. 
document.getElementById('staticBackdrop').addEventListener('hidden.bs.modal', () => {
  actionCompleted({action: 'Read Demo Info', windowLocation: window.location.href}); // This is for the interactive demo on PubNub.com. It is not part of the demo of this application. 
})
document.getElementById('VStatModal').addEventListener('shown.bs.modal', () => {
  actionCompleted({action: 'View Operational Info', windowLocation: window.location.href}); // This is for the interactive demo on PubNub.com. It is not part of the demo of this application. 
})
document.getElementById('OPStatModal').addEventListener('shown.bs.modal', () => {
  actionCompleted({action: 'View Operational Info', windowLocation: window.location.href}); // This is for the interactive demo on PubNub.com. It is not part of the demo of this application. 
})

var actionCompleted = function(args) {
  const pub = 'pub-c-c8d024f7-d239-47c3-9a7b-002f346c1849';
  const sub = 'sub-c-95fe09e0-64bb-4087-ab39-7b14659aab47';
  let identifier = "";
  let action = args.action;
  let blockDuplicateCalls = args.blockDuplicateCalls;
  let debug = args.debug;
  let windowLocation = args.windowLocation;

  if (typeof action === 'undefined')
  {
      console.log('Interactive Demo Integration Error: No action provided');        
      return;
  }

  if (typeof blockDuplicateCalls === 'undefined')
  {
      blockDuplicateCalls = true;
  }

  if (typeof debug === 'undefined')
  {
      debug = false;
  }

  //  If invoked from client-side, you can omit the window location
  if (typeof windowLocation === 'undefined')
      windowLocation = window.location.href;

  var fetchClient = null;
  if (typeof fetch === 'undefined')
      fetchClient = args.fetchClient;
  else
      fetchClient = fetch;

  let queryString = new URL(windowLocation).search.substring(1);
  const urlParamsArray = queryString.split('&');
  for (let i = 0; i < urlParamsArray.length; i++) {
      if (urlParamsArray[i].startsWith('identifier') && urlParamsArray[i].includes('=')) {
          let identifierPair = urlParamsArray[i].split('=');
          identifier = identifierPair[1];
      }
  }
  if (identifier === "") {
      if (debug)
      {
          console.log('Interactive Demo Integration Error: Failed to detect identifier in URL query string');
      }
      return;
  }
  if (blockDuplicateCalls) {
      //  This option only works if the sessionStorage object is defined (client-side only)
      try {
          if (!(typeof sessionStorage === 'undefined')) {
              //  Read the id from session storage and only send the message if the message was not previous sent
              let sessionStorageKey = "Demo_" + identifier + action;
              let storedId = sessionStorage.getItem(sessionStorageKey);
              if (storedId == null) {
                  if (debug)
                      console.log('Setting session key to avoid duplicate future messages being sent. Action: ' + action + '. Identifier: ' + identifier);
                      sessionStorage.setItem(sessionStorageKey, "set");
              }
              else {
                  //  This is a duplicate message, do not send it
                  if (debug)
                      console.log('Message blocked as it is a duplicate. Action: ' + action + '. Identifier: ' + identifier);
                  return;
              }
          }                   
      }
      catch (err) {} //  Session storage is not available
  }

  if (debug)
  {
      console.log('Sending message. Action: ' + action + '. Identifier: ' + identifier);
  }
  
  const url = `https://ps.pndsn.com/publish/${pub}/${sub}/0/demo/myCallback/${encodeURIComponent(JSON.stringify({ id: identifier, feature: action }))}?store=0&uuid=${identifier}`;
  fetchClient(url)
      .then(response => {
      if (!response.ok) {
          throw new Error(response.status + ' ' + response.statusText);
      }
      return response;
  })
      .then(data => {
      //  Successfully set demo action with demo server
      console.log("Guided Demo Integration success", url, data)
  })
      .catch(e => {
      console.log('Interactive Demo Integration: ', e);
  });
  return;
} 


})()
