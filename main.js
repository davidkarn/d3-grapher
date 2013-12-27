loaditup = function() {
  document.graph = create_graph(d3.select('body').append('svg').attr('width', 500).attr('height', 300),
      {1: {test: 3, f: 5}, 2: {test: 4, f: 3}, 3: {test: 8, f: 12}}, {});
    document.graph.draw_axes({key: 'test', guideline_style:{styles:{stroke:'#ddd', 'stroke-width': '0.5pt'}}, axis_style: {styles: {stroke:'black', 'stroke-width': '1pt'}}, font_style:{attrs:{'font-size': 14, 'font-family': 'verdana, sans serif', fill:'#444'}}},
			     {key: 'f', guideline_style:{styles:{stroke:'#ddd', 'stroke-width': '0.5pt'}}, axis_style: {styles: {stroke:'black', 'stroke-width': '1pt'}}, font_style:{attrs:{'font-size': 14, 'font-family': 'verdana, sans serif', fill:'#444'}}}, 'axes'); }

if (Meteor.isClient) {
$(document).ready(loaditup);
}
