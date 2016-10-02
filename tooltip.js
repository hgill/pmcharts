		function showToolTip(d) {//outer: ragchart,xScale,yScale
			let box = d3.select(this.parentNode).node().getBBox();
			let coords = d3.transform(d3.select(this.parentNode).attr("transform")).translate;
			box.x = coords[0];

			let iwidth = 30 / 100 * width,
				iheight = 30 / 100 * height;

			let newbox = {
				width: iwidth,
				height: iheight,
				y: coords[1] + 20, //padding for triangle
				x: box.x + box.width / 2 - iwidth / 2
			}

			if (newbox.x < margin.left)
				newbox.x = margin.left;
			else if (newbox.x + newbox.width > width - margin.right)
				newbox.x = width - margin.right - newbox.width;

			let ing = ragchart.append("g").attr({
				id: "tooltip"
			})


			ing.append("path").attr({
				d: () => {
					return `M ${box.x+box.width/2} ${translate} l 10 22 l -20 0 Z`
				}
			}).style({
				stroke: "black",
				"stroke-width": "1px",
				fill: "white",
				opacity: 1,
			})

			let svg = ing.append("svg")
				.attr(newbox);

			svg.append('rect').attr({
				opacity: 1,
				width: "100%",
				height: "100%",
				rx: 7,
				ry: 7
			}).style({
				"stroke-width": "1px",
				stroke: "black",
				fill: "white"
			})

			let errorList = _.toPairs(_.countBy(_.filter(d.processInfo, redsc), (d2) => {
				return d2.errors
			})); // this has to be optimized - get errorList filter, after getting REDS objects, how to get error values

			errorList = _.orderBy(errorList, d => d[1], 'desc');

			var padding = {
				inner: 10,
				leftright: 10,
				topbottom: 10
			};

			let yScale = d3.scale.linear()
				.domain([0, 4])
				.range([padding.topbottom, newbox.height - padding.topbottom]);

			if (errorList.length >= yScale.domain()[1] + 1)
				svg.transition().attr({
					height: d => {
						return yScale(errorList.length)
					}
				})
			let xScale = d3.scale.linear()
				.domain([0, _.max(errorList.map(d => d[1]))])
				.range([padding.leftright, newbox.width - padding.leftright]);

			let gs = svg.selectAll('g').data(errorList, d => d).enter().append('g')
				.attr({
					transform: (d, i) => {
						return `translate(${xScale(0)},${yScale(i)})`
					}
				});

			gs.append('rect').attr({
					height: (d) => {
						return 2
					},
					width: 0,
					opacity: 0.6,
					fill: COLORS.red
				})
				.transition()
				.attr({
					width: d => (xScale(d[1]) - xScale(0))
				});

			gs.append('text').attr({
					x: xScale(0),
					"text-anchor": "end",
					y: 8
				}).style({
					"alignment-baseline": "middle"
				})
				.attr({
					x: d => (xScale(d[1]) - xScale(0) - padding.inner)
				}).text(d => `x${d[1]}`)

			gs.append('text').attr({
					x: padding.inner,
					y: 10
				})
				.style({
					"alignment-baseline": "middle"
				}).text(d => d[0]);

		}

		function hideToolTip(d) {
			ragchart.selectAll(Selectors.tooltip).remove();
		}