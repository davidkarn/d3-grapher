loaditup = function() {
  document.graph = create_graph(d3.select('body').append('svg').attr('width', 500).attr('height', 300),
      [{test: 'one', f: 5}, {test: 'two', f: 3}, {test: 'three', f: 12.76}, {test: 'four', f: 14.2}, {test: 'five', f: 8.3}, {test: 'six', f: 2.43}], {});
    document.graph.draw_axes({key: 'test', guideline_style:{styles:{stroke:'#ddd', 'stroke-width': '0.5pt'}}, axis_style: {styles: {stroke:'black', 'stroke-width': '1pt'}}, font_style:{attrs:{'font-size': 14, 'font-family': 'verdana, sans serif', fill:'#444'}}},
			     {intervals: 6, key: 'f', guideline_style:{styles:{stroke:'#ddd', 'stroke-width': '0.5pt'}}, axis_style: {styles: {stroke:'black', 'stroke-width': '1pt'}}, font_style:{attrs:{'font-size': 14, 'font-family': 'verdana, sans serif', fill:'#444'}, styles: {'text-align': 'center'}}}, 'axes'); 
    document.graph.colorize();
    document.graph.draw_bar_chart({key: 'f'}); }

if (Meteor.isClient) {
$(document).ready(loaditup);
}
