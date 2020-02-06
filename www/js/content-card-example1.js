class ContentCardExample extends HTMLElement {
  set hass(hass) {
    if (!this.content) {
      const card = document.createElement('ha-card');
      card.header = 'Example card';
      this.content = document.createElement('div');
      this.content.style.padding = '0 16px 16px';
      card.appendChild(this.content);
      this.appendChild(card);
    }

    const entityId = this.config.entity;
    const state = hass.states[entityId];
    const stateStr = state ? state.state : 'unavailable';

    this.content.innerHTML = `
      <div class="ct-chart"></div>
      
      <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment.min.js"></script>
	  <script src="https://cdnjs.cloudflare.com/ajax/libs/chartist/0.11.4/chartist.min.js"></script>
      
      <script>
         	var stringVar;
			
			var xhr = new XMLHttpRequest();
			xhr.open("GET", "https://gpsgadget.buienradar.nl/data/raintext?lat=52.365150&lon=4.934230");
			xhr.onreadystatechange = function() {
				if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
					console.log(xhr.response);
					decodeString(xhr.response, "|", "\n");
					// handle xhr.response
				}
			}
			xhr.send();
			
			
			function decodeString(str, variable_sep, line_endings) {
			
				var result = [];
				var time = [];
				var rainfall = [];
				var lines = str.split(line_endings);
				for (var i = 0; i < lines.length; i++) {
					var line = lines[i];
					var variables = line.split(variable_sep);
			
					if (variables[1] != null) {
						rainfall.push(Math.pow(10, ((parseInt(variables[0]) - 109) / 32)));
						time.push(moment(variables[1], 'HH:mm'));
					}
			
				}
			
				console.log(rainfall);
				console.log(time);
			
				var chart = new Chartist.Line('.ct-chart', {
					labels: time,
					series: [rainfall]
			
				}, {
					showArea: true,
					showPoint: false,
					fullWidth: true,
					lineSmooth: Chartist.Interpolation.simple({
						divisor: 2
					}),
					axisX: {
						labelInterpolationFnc: function skipLabels(value, index) {
							thevalue = index % 2 === 0 ? value : null;
							if (thevalue != null) {
								return moment(value).format('h:mm');
							} else {
								return null;
							}
						},
						showGrid: false,
					},
					axisY: {
						showGrid: true,
						scaleMinSpace: 50,
					}
				});
			
				created = false;
				chart.on('draw', function(data) {
					if (created == false) {
						if (data.type === 'line' || data.type === 'area') {
							data.element.animate({
								d: {
									begin: 1000 * data.index,
									dur: 1000,
									from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
									to: data.path.clone().stringify(),
									easing: Chartist.Svg.Easing.easeOutQuint
								}
							});
							setTimeout(function() {
								created = true
							}, 1000);
			
						}
			
					}
				});
			
				function reportWindowSize() {
					chart.update();
				}
			
				window.onresize = reportWindowSize;
			
			}
      </script>
    `;
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define an entity');
    }
    this.config = config;
  }

  // The height of your card. Home Assistant uses this to automatically
  // distribute all cards over the available columns.
  getCardSize() {
    return 3;
  }
}

customElements.define('content-card-example', ContentCardExample);