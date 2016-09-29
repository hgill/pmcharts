"use strict";
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['lodash','d3'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('lodash'),require('d3'));
    } else {
        // Browser globals (root is window)
        root.overlaychart = factory(root._,root.d3);
    }
}(this,realAction));

function realAction(_,d3){
  return function(){
    this.render=function(){

        let placeholder=this.placeholder(),
            dimensions=this.dimensions(),
            current=this.current(),
            search=this.search(),
            searchAccessor=this.searchAccessor(),
            uniqueAccessor=this.uniqueAccessor(),
            data=this.data();

        let ph = d3.select(placeholder);

        let overlaychart = null;

        let {width,height,margin}=dimensions;

        if (ph.select("svg#overlaychart").size() > 0){
          overlaychart = ph.select("svg#overlaychart");
        }else {
          overlaychart = ph.append("svg").attr({
            id: "overlaychart",
            width: width,
            height: height,
            fill: "white"
          });
        }

        let gs=overlaychart.selectAll("g")
              .data(this.data(),uniqueAccessor);
        
        let availableArr=this.data().map(d=>d.index);
        let xScale=d3.scale.linear().domain([_.head(availableArr),_.last(availableArr)]).range([margin.left,width-margin.right]);
        let yScale=d3.scale.linear().domain([0,10]).range([height-margin.top,margin.bottom])
        gs.exit().remove();
        
        gs.transition().attr({
          transform: (d)=>`translate(${xScale(d.index)},0)`
        })
        
        gs.select("path").attr({stroke:"#AAAAAA"})
      
        let entered=gs.enter().append("g").attr({
          transform: (d)=>`translate(${xScale(d.index)},0)`
        })
        
        let paths=entered.append("path").attr({
            "stroke-width":1,     
            stroke:"#AAAAAA",
            d: d=>{return `M 0 ${yScale(0)} L 0 ${yScale(d.value.reds)}`}
        });
        
          paths
            .attr("stroke-dasharray", function() {
              return this.getTotalLength() + " " + this.getTotalLength();
            })
            .attr("stroke-dashoffset", function() {
              return this.getTotalLength()
            })
            .transition()
            .attr("stroke-dashoffset", 0);
          
          if(this.search() && this.searchAccessor()){
                        gs.filter(this.searchAccessor()(this.search()))
                          .select("path").attr({stroke:"red"});
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


