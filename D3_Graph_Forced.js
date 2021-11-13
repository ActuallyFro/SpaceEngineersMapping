//Zoom functions: https://embed.plnkr.co/1Mub7rTUKQuuAB6TAoJb/

var loadedResourcesJSONData;
// var loadedConfigJSONData;

function DrawGraph(name_of_json){
  document.getElementById("GraphArea").innerHTML = "";
  document.getElementById("div_tooltip").innerHTML = "";

  
  var w = window.innerWidth*1.0,
      h = window.innerHeight*0.66;

  var vis = d3.select("#GraphArea").append("svg:svg").attr("width", w).attr("height", h);

  d3.json(name_of_json, function(json) {

    for (var i = 0; i < json.links.length; i++) {
      var link = json.links[i];  

      var sourceFound = false;
      var targetFound = false;

      for (var ii = 0; ii < json.nodes.length; ii++) {
        var node = json.nodes[ii];

        if (sourceFound == false) {
          if (node.id == link.source) {
            json.links[i].source = ii;
            sourceFound = true;
          }  
        }

        if (targetFound == false) {
          if (node.id == link.target) {
            json.links[i].target = ii;
            targetFound = true;
          }
        }

        if (sourceFound == true && targetFound == true) {
          break;
        }
      }
    }

    //TOOL TIP - START
    var Tooltip = d3.select("#div_tooltip").append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")

    // Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function(d) {
      Tooltip.style("opacity", 1)

      d3.select(this)
        .style("stroke", "black")
        .style("opacity", 1)
    }

    var mousemove = function(d) {
      Tooltip.html("Decription:" + d.description).style("left", (d3.mouse(this)[0]+70) + "px").style("top", (d3.mouse(this)[1]) + "px")
    }

    var mouseleave = function(d) {
      Tooltip.style("opacity", 0)
      
      d3.select(this)
        .style("stroke", "none")
        .style("opacity", 0.8)
    }
    //TOOL TIP - END

    var force = self.force = d3.layout.force()
      .nodes(json.nodes)
      .links(json.links)
      .gravity(.05)
      .distance(100)
      .charge(-100)
      .size([w, h])
      .start();

    var link = vis.selectAll("line.link")
      .data(json.links)
      .enter().append("svg:line")
      .attr("class", "link")
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

    var node_drag = d3.behavior.drag().on("dragstart", dragstart).on("drag", dragmove).on("dragend", dragend);
    var node_zoom = d3.behavior.zoom().scaleExtent([1, 8]).on("zoom", zoom);

    function dragstart(d, i) {
        force.stop() // stops the force auto positioning before you start dragging
    }

    function dragmove(d, i) {
      d.px += d3.event.dx;
      d.py += d3.event.dy;
      d.x += d3.event.dx;
      d.y += d3.event.dy; 
      tick(); // this is the key to make it work together with updating both px,py,x,y on d !
    }

    function dragend(d, i) {
      d.fixed = true; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
      tick();
      force.resume();
    }

    function zoom() {
      var zoom = d3.event;
      vis.attr("transform", "translate(" + zoom.translate + ")scale(" + zoom.scale + ")");
    }
    
    var node = vis.selectAll("g.node")
      .data(json.nodes)
      .enter().append("svg:g")
      .attr("class", "node")
      .call(node_drag)
      .call(node_zoom);


    // var references;
    $.getJSON("references.json", function(jsonData) { //Async!!!!  
      // var references;
      loadedResourcesJSONData = jsonData;
      console.log(json); // this will show the info it in firebug console


      node.append("svg:image").attr("class", "circle").attr("xlink:href", function (d){
        var IconLink=loadedResourcesJSONData.DefaultIconLink;
      
        //iterate over icons. See if d.name == name of iconKeys
        for (var i = 0; i < loadedResourcesJSONData.icons.length; i++) {
          console.log("Looking for ("+d.name+")");
          if (d.name == loadedResourcesJSONData.icons[i].name) {
            console.log("Found Match for ("+d.name+") at: "+loadedResourcesJSONData.icons[i]);
            IconLink = loadedResourcesJSONData.icons[i].IconLink;
            break;
          }
        }

        return IconLink;
      })
      .attr("x", "-8px")
      .attr("y", "-8px")
      .attr("width", "16px")
      .attr("height", "16px")
      .on("mouseover", mouseover)     //|Tool tip check on hover/etc.
      .on("mousemove", mousemove)     //|
      .on("mouseleave", mouseleave);  //|
    });

    node
      .append("svg:text")
      .attr("class", "nodetext")
      .attr("dx", 12)
      .attr("dy", ".35em")
      .text(function(d) { return d.name });

    node.filter(function(d) { return !d.name; }).remove(); //May need: d.name == "" check        

    force.on("tick", tick);

    function tick() {
      link.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    };
  });
}


