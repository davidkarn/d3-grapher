loaditup = function() {
  document.graph = create_graph(d3.select('body').append('svg').attr('width', 500).attr('height', 300),
      [{test: 'one', f: 5}, {test: 'two', f: 3}, {test: 'three', f: 12.76}, {test: 'four', f: 14.2}, {test: 'five', f: 8.3}, {test: 'six', f: 2.43}], {});
    document.graph.draw_axes({key: 'test', guideline_style:{styles:{stroke:'#ddd', 'stroke-width': '0.5pt'}}, axis_style: {styles: {stroke:'black', 'stroke-width': '1pt'}}, font_style:{attrs:{'font-size': 14, 'font-family': 'verdana, sans serif', fill:'#444'}}},
			     {intervals: 6, key: 'f', guideline_style:{styles:{stroke:'#ddd', 'stroke-width': '0.5pt'}}, axis_style: {styles: {stroke:'black', 'stroke-width': '1pt'}}, font_style:{attrs:{'font-size': 14, 'font-family': 'verdana, sans serif', fill:'#444'}, styles: {'text-align': 'center'}}}, 'axes'); 
    document.graph.colorize();
    document.graph.draw_line_graph({key: 'f'}, 'line_graph');
    document.graph.add_hovers({layer: 'line_graph'}); 

    document.graph2 = create_graph(d3.select('body').append('svg').attr('width', 500).attr('height', 300),
      [{test: 'one', f: 5}, {test: 'two', f: 3}, {test: 'three', f: 12.76}, {test: 'four', f: 14.2}, {test: 'five', f: 8.3}, {test: 'six', f: 2.43}], {});
    document.graph2.draw_axes({key: 'test', guideline_style:{styles:{stroke:'#ddd', 'stroke-width': '0.5pt'}}, axis_style: {styles: {stroke:'black', 'stroke-width': '1pt'}}, font_style:{attrs:{'font-size': 14, 'font-family': 'verdana, sans serif', fill:'#444'}}},
			     {intervals: 6, key: 'f', guideline_style:{styles:{stroke:'#ddd', 'stroke-width': '0.5pt'}}, axis_style: {styles: {stroke:'black', 'stroke-width': '1pt'}}, font_style:{attrs:{'font-size': 14, 'font-family': 'verdana, sans serif', fill:'#444'}, styles: {'text-align': 'center'}}}, 'axes'); 
    document.graph2.colorize();
    document.graph2.draw_bar_chart({key: 'f'}, 'line_graph');
    document.graph2.add_hovers({layer: 'line_graph'}); 

    document.graph3 = create_graph(
	d3.select('body')
	    .append('svg')
	    .attr('width', 500)
	    .attr('height', 300),
      [{label: 'first',
	data: [{test: 'one', f: 5}, 
	       {test: 'two', f: 3}, 
	       {test: 'three', f: 12.76}, 
	       {test: 'four', f: 14.2}, 
	       {test: 'five', f: 8.3}, 
	       {test: 'six', f: 2.43}]},
       {label: 'second',
	data: [{test: 'one', f: 3.2}, 
	       {test: 'two', f: 5.4}, 
	       {test: 'three', f: 6.2}, 
	       {test: 'four', f: 2.3}, 
	       {test: 'five', f: 8.3}, 
	       {test: 'six', f: 14.89}]},
       {label: 'third',
	data: [{test: 'one', f: 9.3}, 
	       {test: 'two', f: 12.4}, 
	       {test: 'three', f: 16.3}, 
	       {test: 'four', f: 18.4}, 
	       {test: 'five', f: 5.6}, 
	       {test: 'six', f: 4.4}]}], 
				   {});
    document.graph3.draw_axes(
	{key: 'test', 
	 guideline_style: {styles: {stroke:'#ddd', 
				    'stroke-width': '0.5pt'}}, 
	 axis_style: {styles: {stroke:'black', 
			       'stroke-width': '1pt'}}, 
	 font_style: {attrs: {'font-size': 14, 
			      'font-family': 'verdana, sans serif', 
			      fill:'#444'}}},
	{intervals: 6, 
	 key: 'f', 
	 guideline_style: {styles: {stroke:'#ddd', 
				    'stroke-width': '0.5pt'}}, 
	 axis_style: {styles: {stroke:'black', 
			       'stroke-width': '1pt'}}, 
	 font_style: {attrs: {'font-size': 14, 
			      'font-family': 'verdana, sans serif', 
			      fill:'#444'}, 
		      styles: {'text-align': 'center'}}}, 
	'axes'); 
    document.graph3.colorize();
    document.graph3.draw_multiple_line_graphs({key: 'f'}, 'line_graph');
    document.graph3.add_hovers({layer: 'line_graph'}); }

if (Meteor.isClient) {
$(document).ready(loaditup);
}
