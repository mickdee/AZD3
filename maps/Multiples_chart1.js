			//Width and height
			var w = 320;
			var h = 500;

			//Define Arizona map projection
			var projection = d3.geo.albers()
								   .translate([w/2, h/2])
								   .scale([3400])
								   .rotate([108, 0, 0])
								   .translate([360, 0]);

			//Define path generator
			var path = d3.geo.path()
							 .projection(projection);
							 
			//Define scale to sort data values into buckets of color
			var colorPop = d3.scale.quantize()
								.range(["rgb(247,252,253)","rgb(229,245,249)","rgb(204,236,230)","rgb(153,216,201)","rgb(102,194,164)","rgb(65,174,118)","rgb(35,139,69)","rgb(0,109,44)","rgb(0,68,27)"]);
								//Colors taken from colorbrewer.js

			//Create SVG element (if multiple charts on a single page, give var a unique name)
			var svgPop = d3.select("#az-countyPop-map")
						.append("svg")
						.attr("width", w)
						.attr("height", h);

			//Load in population data
			d3.csv("data/arizona-counties.csv", function(data) {

				//Set input domain for color scale (customize scale using integers instead of d.value if necessary)
				colorPop.domain([
					d3.min(data, function(d) { return 0; }), 
					d3.max(data, function(d) { return 500000; })
				]);

				//Load in GeoJSON data
				d3.json("data/us-arizona-counties.json", function(json) {

					//Merge the pop. data and GeoJSON
					//Loop through once for each pop. data value
					for (var i = 0; i < data.length; i++) {
				
						//Grab county name
						var dataCounty = data[i].county;
						
						//Grab data value, and convert from string to float
						var dataValue = parseFloat(data[i].population);
				
						//Find the corresponding county inside the GeoJSON
						for (var j = 0; j < json.features.length; j++) {
						
							var jsonCounty = json.features[j].properties.name;
				
							if (dataCounty == jsonCounty) {
						
								//Copy the data value into the JSON
								json.features[j].properties.value = dataValue;
								
								//Stop looking through the JSON
								break;
								
							}
						}		
					}

					//Bind data and create one path per GeoJSON feature
					svgPop.selectAll("path")
					   .data(json.features)
					   .enter()
					   .append("path")
					   .attr("d", path)
					   .style("stroke","#ccc")
					   .style("fill", function(d) {
					   		//Get data value
					   		var valuePop = d.properties.value;
					   		
					   		if (valuePop) {
					   			//If value exists…
						   		return colorPop(valuePop);
					   		} else {
					   			//If value is undefined…
						   		return "#ccc";
					   		}
					   })
					   .on("mouseover", function(d) {   //Add tooltip on mouseover for each circle

								//Get this county's x/y values, then augment for the tooltip
								var xPosition = d3.select(this).attr("x");
								var yPosition = d3.select(this).attr("y");

								//Update the tooltip position and value
								d3.select("#tooltip1")
									//Show the tooltip above where the mouse triggers the event
									.style("left", (d3.event.pageX) + "px")     
                					.style("top", (d3.event.pageY - 70) + "px")
									.select("#countyPop-label")	
									//CSV data has been bound to JSON at this point - so values must be referenced from JSON properties
									.html("<strong>" + d.properties.name + "</strong>" + "<br/>" + "population: " + d.properties.value)			
						   
								//Show the tooltip
								d3.select("#tooltip1").classed("hidden", false);

						   })
						   .on("mouseout", function() {
						   
								//Hide the tooltip
								d3.select("#tooltip1").classed("hidden", true);
								
						   })	
			
				});
			
			});