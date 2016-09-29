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
        root.textchart = factory(root._,root.d3);
    }
}(this,realAction));

function realAction(_,d3){
    return function(){

        this.render=function(){
            let placeholder=this.placeholder(),
                data=this.data(),
                current=this.current(),
                dimensions=this.dimensions(),
                uniqueAccessor=this.uniqueAccessor(),
                textClickHandler=this.textClickHandler();
            
            let ph = d3.select(placeholder);
        
        if(_.isArray(data) && _.every(data,_.isObject)){
                let textchart=null;
        
                let {width,height,margin}=dimensions;
                let t1=d3.transition().duration(0)
                if (ph.select("pre#textchart").size() > 0){
                    textchart = ph.select("pre#textchart");
                    if(!_.isEqual(data,textchart.datum())){
                        t1=textchart
                        .style({"opacity":0.7})
                        .transition()
                        .style({"opacity":1})
                    }
                } else {
                    textchart = ph.append("pre").attr({
                        id: "textchart"
                    }).style({
                        width: width+"px",
                        height: height+"px",
                        padding: `${margin.top}px ${margin.right}px ${margin.bottom}px ${margin.left}px`,
                        "overflow-y": "auto",
                        "background-color": "steelblue",
                        "opacity":1
                    });
                }
                
                textchart.datum(data);

                let before=textchart.selectAll("div").data();

                let divs=textchart.selectAll("div").data(data,uniqueAccessor);
                divs.exit().remove();

                divs.enter()
                .append("div")
                .text(d=>{return JSON.stringify(d,null,' ')});

                divs.style("display","block");
                let after=textchart.selectAll("div").data();
               
                divs.style({
                    "color":function(d){
                        let color="#A9A9A9";
                        if(_.isEqual(d,current)){
                                color="white";
                                let scrollheight=this.offsetTop-this.parentNode.offsetTop-75;
                                t1.each("end",()=>{
                                     textchart.transition().duration(150)
                                    .tween("uniquetweenname", scrollTopTween(scrollheight)); 
                                })
                               
                        }
                        return color;
                    }
                })

                divs.on('click',textClickHandler);
                
                function scrollTopTween(scrollTop) { 
                    return function() { 
                        var i = d3.interpolateNumber(this.scrollTop, scrollTop); 
                        return function(t) { this.scrollTop = i(t); }; 
                    }; 
                } 
        
        }else{
            throw Error("textchart takes Array of Objects")
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

        this.textClickHandler=function(){
           if(arguments.length){
              let textClickHandler=arguments[0];
              this.__textClickHandler__=textClickHandler; 
              return this;
            }else return this.__textClickHandler__;
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