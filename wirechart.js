"use strict";
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['d3'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('d3'));
    } else {
        // Browser globals (root is window)
        root.wirechart = factory(root.d3);
    }
}(this,realAction));

function realAction(d3){
	    return function(){
	    let self=this;
        this.render=function(){

        let placeholder=this.placeholder(),
			dimensions=this.dimensions(),
			data2=this.data(),
			redsc=this.redAccessor(),
			ambersc=this.amberAccessor(),
			greensc=this.greenAccessor(),
			COLORS=this.colors(),
			wireClickHandler=this.wireClickHandler(),
			uniqueAccessor=this.uniqueAccessor(),
			current=this.current();
		const Selectors={
			gdata: "g.data"
		};

			let ph = d3.select(placeholder);
	let {width,height,margin}=dimensions;

			let wirechart = null,xAxis1=null;

			if (ph.select("svg#wirechart").size() > 0)
			{	
				wirechart = ph.select("svg#wirechart");
				xAxis1=wirechart.select("g#xAxis")
			}
			else {
				wirechart = ph.append("svg").attr({
							id: "wirechart",
							width: width,
							height: height
						});
				xAxis1=wirechart.append('g').attr({id:"xAxis"})
			}

		//wirechart.selectAll(Selectors.gdata).remove();

		let isoP = d3.time.format.iso.parse;
		let xScale = d3.time.scale()
			.domain([isoP(data2.startTime), isoP(data2.endTime)])
			.range([margin.left, width - margin.right]);

		let db = data2.database;

		var lineFunction = d3.svg.line()
			.x(function(d, i) {
				return xScale(isoP(d));
			})
			.y(function(d, i) {
				return yScale(i);
			})
			.interpolate("linear");

		let yScale = d3.scale.ordinal().domain([0, 1, 2, 3, 4])
			.rangeBands([height - margin.bottom, margin.top]);
		let xAxis = d3.svg.axis().scale(xScale)
			.orient("bottom").tickSize(5, 0)
			.tickPadding(3)
			.tickFormat(d3.time.format("%H:%M:%S"));
		

		let gs = wirechart.selectAll(Selectors.gdata)
			.data(data2.processInfo,uniqueAccessor);


		xAxis1.transition().duration(150).attr({
				transform: `translate(0,${yScale(0)})`
			})
			.call(xAxis.tickValues(xScale.domain())).each("end", () => {
				theRealAction()
			});

		function theRealAction() {
			gs.exit().remove();

			let entered=gs.enter().append('g').attr({
				class: "data"
			})

			entered.append("path")
				.attr({
					"d": d => lineFunction(d.times.sort()),
					"stroke-width": 2,
					stroke: d => getRAG(d),
					fill: "none"
				}).attr("stroke-dasharray", function() {
					return this.getTotalLength() + " " + this.getTotalLength();
				})
				.attr("stroke-dashoffset", function() {
					return this.getTotalLength()
				})
				.transition()
				.duration((d) => {
					return 150 / 5 * d.times.length
				})
				//        .ease("linear")
				.attr("stroke-dashoffset", 0);;

			entered.selectAll('circle').data(d => {
				return d.times
			}).enter().append('circle').attr({
				r: 5,
				cx: (d) => xScale(isoP(d)),
				cy: (d, i) => yScale(i),
				"stroke-width": 0,
				fill: function() {
					return getRAG(
						d3.select(
							this.parentNode
						).datum());
				}
			});
			
			gs.selectAll("path")
				.attr({"stroke-width": 2});

			gs.selectAll("circle")
				.attr({"stroke-width": 0})
			/*var totalLength = path.node().getTotalLength();
			 */
			
			addGSListeners();
			gs.filter(d=>{
				_.isEqual(d,current)?console.log("wirechart Current",d,current,_.isEqual(d,current)):0;
				return _.isEqual(d,current);
			}).each(function(d){
				wirechart.node().appendChild(this);
				d3.select(this).select("path").attr({"stroke-width":10});
				d3.select(this).selectAll("circle").attr({"stroke-width":2});
				d3.select(this).on('mouseout',null);
				wireClickHandler(d);
			});


			
			wirechart.on('click', () => {
				//toggles between only reds view/all view
				wirechart.selectAll(Selectors.gdata).filter(d => {
					return getRAG(d) !== COLORS.red;
				}).style({
					opacity: function() {
						var op = d3.select(this).style('opacity');
						return op === "0" ? "1" : "0";
					}
				})
			});
		}

		function addGSListeners() {
			remGSListeners();
			gs.on('mouseover', function(d) {
				d3.select(this).select("path").attr({"stroke-width":10});
				d3.select(this).selectAll("circle").attr({"stroke-width":2});
				//d3.select(this).classed("selectedG", true);
			})
			gs.on('mouseout', function(d) {
				d3.select(this).select("path").attr({"stroke-width":2});
				d3.select(this).selectAll("circle").attr({"stroke-width":0});				
				//d3.select(this).classed("selectedG", false);
			})

			gs.on('click', function(d, i,a) {
				d3.event.stopPropagation();
				self.current(d).render();
			})
		}

		function remGSListeners() {
			gs.on('mouseover', null);
			gs.on('mouseout', null);
			gs.on('click', null);
		}

		function getRAG(d) {
			if (redsc(d)) return COLORS.red;
			else if (ambersc(d)) return COLORS.amber;
			else if (greensc(d)) return COLORS.green;
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

        this.redAccessor=function(){
           if(arguments.length){
              let redAccessor=arguments[0];
              this.__redAccessor__=redAccessor; 
              return this;
            }else return this.__redAccessor__;
        }

        this.amberAccessor=function(){
           if(arguments.length){
              let amberAccessor=arguments[0];
              this.__amberAccessor__=amberAccessor; 
              return this;
            }else return this.__amberAccessor__;
        }
        this.greenAccessor=function(){
           if(arguments.length){
              let greenAccessor=arguments[0];
              this.__greenAccessor__=greenAccessor; 
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
        this.wireClickHandler=function(){
           if(arguments.length){
              let wireClickHandler=arguments[0];
              this.__wireClickHandler__=wireClickHandler; 
              return this;
            }else return this.__wireClickHandler__;
        }

        this.uniqueAccessor=function(){
            if(arguments.length){
              let uniqueAccessor=arguments[0];
              this.__uniqueAccessor__=uniqueAccessor; 
              return this;
            }else return this.__uniqueAccessor__ || JSON.stringify;
        }

        return this;
    }
}