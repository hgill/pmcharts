"use strict";
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['lodash','d3','moment'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('lodash'),require('d3'),require('moment'));
    } else {
        // Browser globals (root is window)
        root.ragchart = factory(root._,root.d3,root.moment);
    }
}(this,realAction));

function realAction(_,d3,moment){

	    return function(){

        this.render=function(){
		/********* Extract everything related to processInfo, startTime, EndTime, times *********/
		//Shared Stuff : Colours, Dimensions,Scales, Axes
		let placeholder=this.placeholder(),
			dimensions=this.dimensions(),
			data=this.data(),
			redTotalAccessor=this.redTotalAccessor(),
			amberTotalAccessor=this.amberTotalAccessor(),
			greenTotalAccessor=this.greenTotalAccessor(),
			COLORS=this.colors(),
			ragClickHandler=this.ragClickHandler(),
			uniqueAccessor=this.uniqueAccessor(),
			search=this.search(),
			searchAccessor=this.searchAccessor(),
			startTimeAccessor=this.startTimeAccessor(),
			endTimeAccessor=this.endTimeAccessor();

	let ph = d3.select(placeholder);

	let ragchart = null,xAxis1,xAxis2;

	let {width,height,margin}=dimensions,translate=height/2;

	if (ph.select("svg#ragchart").size() > 0){
		ragchart = ph.select("svg#ragchart");
		xAxis1=ragchart.select('g.xAxis');	
		xAxis2=ragchart.select('g.xAxis2');
	}else {

		ragchart = ph.append("svg").attr({
			id: "ragchart",
			width: width,
			height: height,
			fill: "white"
		});

		xAxis1=ragchart.append("g").attr({
			class: "xAxis",
			transform: `translate(0,${translate})`
		});

		xAxis2=ragchart.append("g").attr({
			class: "xAxis2"
		});


	}



		const Selectors={
			tooltip:"g#tooltip",
			gdata:"g.data",
			ginfo:"g.data g#info",
			redrect:"g.data rect.reds"
		}

		//Aggregate/Derived functions



		//let svg = d3.select(REMOVETHIS.chart);

		let isoP = d3.time.format.iso.parse;
		let HMf = d3.time.format("%H:%M");
		let YMDf = d3.time.format("%d.%m.%Y");
		let extent=d3.extent(_(data).map(d => {
				return [startTimeAccessor(d),endTimeAccessor(d)]
			}).flatten().value());
		console.log(extent);
		let xScale = d3.time.scale()
			.domain([isoP(extent[0]),isoP(extent[1])]) /* Extract Data manipulations */
			.range([margin.left, width - margin.right]).clamp(true);

		let yScale = d3.scale.linear().range([margin.top, height - margin.bottom]);

		let yScaleAG = d3.scale
			.linear()
			.domain([0, data.reduce((max, d) => {
				let calc = amberTotalAccessor(d) +
					greenTotalAccessor(d);

				return max > calc ? max : calc;
			}, 0)]) /* Extract Data manipulations */
			.range([0, height - translate - margin.bottom]);

		let yScaleR = d3.scale
			.linear()
			.domain([0, data.reduce((max, d) => {
				let calc = redTotalAccessor(d);
				return max > calc ? max : calc;
			}, 0)])/* Extract Data manipulations */
			.range([0, translate - margin.top]);

		//Change Axis and then call theRealAction
		let xAxis = d3.svg.axis().scale(xScale)
			.orient("bottom").tickSize(5, 0)
			.tickPadding(3)
			.tickFormat(HMf);

		xAxis1.transition().duration(50)
			.attr({
				transform: `translate(0,${translate})`
			})
			.call(xAxis.tickValues(xScale.domain()))
			.each("end", () => {
				theRealAction(data);
				plotAxis2(xScale);
				//Move axes to front
				ragchart.node().appendChild(xAxis1.node());
				ragchart.node().appendChild(xAxis2.node());
			})

		function plotAxis2(tScale) {//outer: xAxis2

			var daysArr = [];
			var start = tScale.domain()[0];
			var end = tScale.domain()[1];

			start = moment(start).startOf('day')
			end = moment(end).endOf('day')

			var lineFunction = d3.svg.line()
				.x(function(d2, i) {
					return d2.x;
				})
				.y(function(d2, i) {
					return d2.y;
				})
				.interpolate("linear");

			while (start < end) {
				daysArr.push(start.toISOString());
				start.add(1, 'days');
			}

			/*let axis2 = d3.select(REMOVETHIS.xAxis2).attr({
				opacity: 1
			});*/
			let gs = xAxis2.selectAll('g').data(daysArr, d2 => {
				return d2
			});

			gs.exit().attr({
				opacity: 1
			}).transition().duration(50)
			.attr({
				opacity: 0
			}).remove();

			gs.select('text').transition().attr({
				x: d2 => {
					//d is ISO string of Start of Day - Find xScale SoD, xScale EoD and take half
					let startx = tScale(moment(d2))
					let endx = tScale(moment(d2).endOf('day'))
					return (startx + endx) / 2;
				}
			})
			//.text(d2 => YMDf(new Date(d2)));

			gs.select('path').datum(d2 => {
				var x = tScale(moment(d2).startOf('day'));
				var o = [{
					x: x,
					y: _.min(yScale.range())
				}, {
					x: x,
					y: _.max(yScale.range())
				}];
				return o;
			}).transition().attr({
				"d": d2 => {
					return lineFunction(d2)
				},
			})


			var entered = gs.enter().append('g');

			entered.append('text').transition().attr({
				x: d2 => {
					//d is ISO string of Start of Day - Find tScale SoD, tScale EoD and take half
					let startx = tScale(moment(d2).startOf('day'));
					let endx = tScale(moment(d2).endOf('day'));
					return (startx + endx) / 2;
				},
				y: 20,
				"text-anchor": "middle",
				stroke: "gray"
			}).text(d2 => YMDf(new Date(d2)));

			entered.append('path').datum(d2 => {
				var x = tScale(moment(d2).startOf('day'));
				var o = [{
					x: x,
					y: _.min(yScale.range())
				}, {
					x: x,
					y: _.max(yScale.range())
				}];
				return o;
			}).transition().attr({
				"d": d2 => {
					return lineFunction(d2)
				},
				"stroke-width": 1,
				"stroke-opacity": 0.6,
				stroke: "gray",
				fill: "none",
				"stroke-dasharray": "2,4"
			});

		}
		
		function theRealAction(data2) {//outer: ragchart

			let gs = ragchart.selectAll(Selectors.gdata)
				.data(data2,uniqueAccessor)

			//exit
			gs.exit().attr({
					opacity: 1
				}).transition().duration(50)
				.attr({
					opacity: 0.2
				}).remove();

			//update
			let trans=gs.transition().attr({
				transform: (d) => {
					let x = xScale(isoP(startTimeAccessor(d)));
					return `translate(${x},${translate})`;
				}
			}).each(function(d) {

				let ambers = amberTotalAccessor(d);
				let reds = redTotalAccessor(d);
				let greens = greenTotalAccessor(d);
				let iwidth = xScale(isoP(endTimeAccessor(d))) - xScale(isoP(startTimeAccessor(d)));

				rrag.call(this, "ambers", iwidth, 0, yScaleAG(ambers), 0, 0, 0, COLORS.amber) //amber
				rrag.call(this, "greens", iwidth, 0, yScaleAG(greens), 0, 0, yScaleAG(ambers), COLORS.green) //green
				rrag.call(this, "reds", iwidth, 0, yScaleR(reds), 0, 0, -yScaleR(reds), COLORS.red) //red


				let gt = null;
				if (d3.select(this).select(Selectors.ginfo).node()) {
					gt = d3.select(this).select(Selectors.ginfo)
				} else //redundant
					gt = d3.select(this)
					.append('g').attr({
						"id": "info",
						class: "hide"
					});

				textlabel.call(gt.node(), "greens", iwidth / 2,
					yScaleAG(greens/2 + ambers),
					greens);

				textlabel.call(gt.node(), "ambers", iwidth / 2,
					yScaleAG(ambers/2),
					ambers);

				textlabel.call(gt.node(), "reds", iwidth / 2, -(yScaleR(reds/2)),
					reds);


			})
			trans.each("end",()=>{
				if(search && searchAccessor){
	            	gs.filter(searchAccessor(search))
	              	.selectAll("rect").attr({opacity:0.5});
				}
			})

			//enter
			gs.enter().append('g')
				.attr({
					class: "data",
					fill: "#888888",
					transform: (d) => {
						let x = xScale(isoP(startTimeAccessor(d)));
						return `translate(${x},${translate})`
					}
				}).each(function(d) {

					let ambers = amberTotalAccessor(d);
					let reds = redTotalAccessor(d);
					let greens = greenTotalAccessor(d);
					let iwidth = xScale(isoP(endTimeAccessor(d))) - xScale(isoP(startTimeAccessor(d)));

					rrag.call(this, "ambers", iwidth, 0, yScaleAG(ambers), 0, 0, 0, COLORS.amber,"cubicIn") //amber
						.each("end", () => {
							rrag.call(this, "greens", iwidth, 0, yScaleAG(greens), 0, yScaleAG(ambers), yScaleAG(ambers), COLORS.green,"cubicOut") //green
								.each("end", () => {
									rrag.call(this, "reds", iwidth, 0, yScaleR(reds), 0, 0, -yScaleR(reds), COLORS.red) //red
										.each("end", () => {

											let rectred = d3.select(this).select(Selectors.redrect);
											//rectred.on('mouseover', showToolTip);
											//rectred.on('mouseout', hideToolTip);

											let gt = null;
											if (d3.select(this).select(Selectors.ginfo).node()) {
												gt = d3.select(this).select(Selectors.ginfo)
											} else
												gt = d3.select(this)
												.append('g').attr({
													"id": "info",
													class: "hide"
												});

											textlabel.call(gt.node(), "greens", iwidth / 2,
												yScaleAG(greens/2 + ambers),
												greens);

											textlabel.call(gt.node(), "ambers", iwidth / 2,
												yScaleAG(ambers/2),
												ambers);

											textlabel.call(gt.node(), "reds", iwidth / 2, -(yScaleR(reds/2)),
												reds);


										})
								})
						})
				})



			//event listeners
			gs.on("mouseover", function(d) {
					d3.select(this)
						.selectAll("g#info")
						.classed("hide", false);
					plotChangedAxis([isoP(startTimeAccessor(d)), isoP(endTimeAccessor(d))]);
				})
				.on("mouseout", function(d) {
					d3.select(this)
						.selectAll(Selectors.ginfo)
						.classed("hide", true);
					//plotAxis();
				})
				.on('click', (d) => ragClickHandler(d));

		}

		//RENDERER functions
		function rrag(classed, width, height1, height2, x, y1, y2, fill,ease) {

			if (d3.select(this).select('rect.' + classed).node()) {
				return d3.select(this).select('rect.' + classed)
					.transition()
					.attr({
						height: height2,
						y: y2,
						width: width,
						x: x,
						opacity:1
					});
			} else {
				return d3.select(this).append('rect').attr({
						width: width,
						fill: fill,
						height: height1,
						x: x,
						y: y1,
						opacity: 1,
						class: classed
					}).transition()
					.ease(ease || "cubic")
					.duration(100)
					.attr({
						y: y2,
						height: height2
					})
			}
		}

		function textlabel(classed, x, y, text) {
			if (d3.select(this).select('text.' + classed).size()>0) {
				d3.select(this).select('text.' + classed)
					.attr({
						x: x,
						y: y,						
					})
			} else {
				d3.select(this).append('text')
					.attr({
						x: x,
						y: y,
						stroke:"white",
						"text-anchor":"middle",
						"font-size":10,
						"alignment-baseline":"middle"
					})
					.classed(classed,true)
					.text(text)
			}
		}

		function plotChangedAxis(addVal) {//outer:xAxis1,xAxis
			var tarr = xScale.domain();
			tarr.push(...addVal);
			xAxis1.attr({
					transform: `translate(0,${translate})`
				})
				.transition().duration(0)
				.call(xAxis.tickValues(tarr.sort()));
		}





	}

        this.data=function(){
            if(arguments.length){
              let data=arguments[0];
              this.__data__=data; 
              return this;
            }else return this.__data__;
        }

        this.placeholder=function(){
           if(arguments.length){
              let placeholder=arguments[0];
              this.__placeholder__=placeholder; 
              return this;
            }else return this.__placeholder__;
        }

        this.dimensions=function(){
           if(arguments.length){
              let dimensions=arguments[0];
              this.__dimensions__=dimensions; 
              return this;
            }else return this.__dimensions__;
        }

        this.current=function(){
           if(arguments.length){
              let current=arguments[0];
              this.__current__=current; 
              return this;
            }else return this.__current__;
        }

        this.redTotalAccessor=function(){
           if(arguments.length){
              let redTotalAccessor=arguments[0];
              this.__redTotalAccessor__=redTotalAccessor; 
              return this;
            }else return this.__redTotalAccessor__;
        }

        this.amberTotalAccessor=function(){
           if(arguments.length){
              let amberTotalAccessor=arguments[0];
              this.__amberTotalAccessor__=amberTotalAccessor; 
              return this;
            }else return this.__amberTotalAccessor__;
        }
        this.greenTotalAccessor=function(){
           if(arguments.length){
              let greenTotalAccessor=arguments[0];
              this.__greenAccessor__=greenTotalAccessor; 
              return this;
            }else return this.__greenAccessor__;
        }
        this.colors=function(){
           if(arguments.length){
              let colors=arguments[0];
              this.__colors__=colors; 
              return this;
            }else return this.__colors__;
        }        
        this.ragClickHandler=function(){
           if(arguments.length){
              let ragClickHandler=arguments[0];
              this.__ragClickHandler__=ragClickHandler; 
              return this;
            }else return this.__ragClickHandler__;
        }
        this.uniqueAccessor=function(){
            if(arguments.length){
              let uniqueAccessor=arguments[0];
              this.__uniqueAccessor__=uniqueAccessor; 
              return this;
            }else return this.__uniqueAccessor__ || JSON.stringify;
        }
        this.search=function(){
           if(arguments.length){
              let search=arguments[0];
              this.__search__=search;               
              return this;
            }else return this.__search__;
        }
        this.startTimeAccessor=function(){
           if(arguments.length){
              let startTimeAccessor=arguments[0];
              this.__startTimeAccessor__=startTimeAccessor;               
              return this;
            }else return this.__startTimeAccessor__;
        }
        this.endTimeAccessor=function(){
           if(arguments.length){
              let endTimeAccessor=arguments[0];
              this.__endTimeAccessor__=endTimeAccessor;               
              return this;
            }else return this.__endTimeAccessor__;
        }        
        this.searchAccessor=function(){
           if(arguments.length){
              let searchAccessor=arguments[0];
              this.__searchAccessor__=searchAccessor; 
              return this;
            }else return this.__searchAccessor__;
        }

        return this;
    }
}
