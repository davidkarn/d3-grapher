loaditup = function() {
  document.graph = create_graph(d3.select('body').append('svg').attr('width', 500).attr('height', 300),
      {1: {test: 3}, 2: {test: 4}, 3: {test: 8}}, {});
    document.graph.draw_axes({key: 'test', guideline_style:{styles:{stroke:'#bbb', 'stroke-width': '1pt'}}, axis_style: {styles: {stroke:'black', 'stroke-width': '1pt'}}, font_style:{attrs:{'font-size': 16, 'font-family': 'verdana, sans serif', fill:'black'}}}, {}, 'axes'); }
if (Meteor.isClient) {
$(document).ready(loaditup);
}
