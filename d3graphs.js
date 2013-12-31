// DATA MANIPULATION FUNCTIONS
//
// Graphs will begin with data in either an array, or a hash of subhashes, such as:
//
// [{time: '01:00', width: 3.4}, {time: 02:00, width: 4.4}]
// or
// {'01:00': {time: '01:00', width: 3.4}, 
//  '02:00': {time: 02:00, width: 4.4}}

// split an array into an array of subarrays of <interval> length
// split_every([1,2,3,4,5,6,7,8,9], 3) => 
// [[1,2,3],
//  [4,5,6],
//  [7,8,9]]

function split_every(array, interval) {
    if (array.length < interval) {
	return [array]; }
    else {
	return  [array.slice(0, interval)]
	    .concat(split_every(array.slice(interval), interval)); }} 

function hashify_array(array) {
    return array.map(function(sub_array) {
	var o = {};
	for (var i = 1; i < arguments.length; i++) {
	    o[arguments[i]] = sub_array[i - 1]; }
	return o; }); }

function array_to_keyed_hash(array, key) {
    var o = {};
    array.each(function(sub_array) {
	o[sub_array[key]] = sub_array; }); 
    return o; }

function hashes_merge_data() {
    var hash = arguments[0]; 
    for (var i = 1; i < arguments.length; i++) {
	var hash2 = arguments[i];
	for (var j in hash2) {
	    if (!hash[j]) {
		hash[j] = {}; }
	    for (var key in hash2[j]) {
		hash[j][key] = hash2[j][key]; }}}
    return hash; }
	    

// GRAPHING FUNCTIONS
//
// Calling create_graph(svg, data, options) will create a graph object with functions
// for drawing charts and modules for addons. 
//
// Functions drawing to the svg should draw in layers by applying classes to all DOM elements 
// and select()ing only elements of their layer (like axes with labels, charts, legends, etc).
// This way multiple charts can be overlapped or combined without moving around the wrong elements.

var graphing_modules = {};

function register_graphing_module(name, module) {
    graphing_modules[name] = module; }

create_graph = function(svg, data, options) {
    var graph = {};
    
    graph.data = data;
    graph.svg = svg;
    graph.layers = {};
    graph.style = {};
    graph.width = options.width || parseInt(svg.attr('width'));
    graph.height = options.height || parseInt(svg.attr('height'));
    graph.margins = {top: (options.margin_top || 0), right: (options.margin_right || 0),
		     left: (options.margin_left || (0.1 * graph.width)),
		     bottom: (options.margin_bottom || (0.1 * graph.height))};
    graph.offset_x = options.offset_x || 0;
    graph.offset_y = options.offset_y || 0;
    graph.margin_top = graph.offset_y + graph.margins.top;
    graph.margin_left = graph.offset_x + graph.margins.left;
    graph.margin_bottom = graph.offset_y + graph.height - graph.margins.bottom;
    graph.margin_right = graph.offset_x + graph.width - graph.margins.right;
    graph.inner_width = graph.margin_right - graph.margin_left;
    graph.inner_height = graph.margin_bottom - graph.margin_top;


    graph.get_pos = function(x, y) {
	return {x: (x + this.offset_x), 
		y: (y + this.offset_y)}; }

    graph.get_pos_x = function(x) {
	return this.offset_x + x; }

    graph.get_pos_y = function(y) {
	return this.offset_y + y; }

    graph.get_percent_x = function(percent) {
	return this.width * percent; }

    graph.get_percent_y = function(percent) {
	return this.height * percent; }

    graph.get_percent_pos_x = function(percent) {
	return this.offset_x + 
	    (this.width * percent); }

    graph.get_percent_pos_y = function(percent) {
	return this.offset_y 
	    + (this.height * percent); }

    graph.get_percent_from_pos_x = function(percent) {
	return this.offset_x + this.width -
	    (this.width * percent); }

    graph.get_percent_from_pos_y = function(percent) {
	return this.offset_y + this.height - 
	    (this.height * percent); }

    graph.last_layer_id = 0;
    graph.gen_layer_name = function() {
	this.last_layer_id += 1;
	return "layer_" + this.last_layer_id; }
	    
    for (var name in graphing_modules) {
	graphing_modules[name](graph); }

    return graph; }

// take a hash or array of objects, and return a list of all
// valuse of the given key

function get_key(hash) {
    var rh = [];
    for (var i in hash) {
	rh.push(hash[i]); }
    return rh; }


function extract_from_hash(hash, key, including_fields) {
    var a = [];
    for (var i in hash) {
	if (hash[i][key]) {
	    var val = hash[i][key];
	    for (var j in including_fields) {
		var field = including_fields[j];
		val[field] = hash[i][field]; }
	    a.push(val); }}
    return a; }

 selector = function(tagname, layername) {
    var s = tagname + ' .' + layername;
    for (var i = 2; i < arguments.length; i++) {
	s += '.' + arguments[i]; }
    return s; }

function apply_classes(classes, to) {
    var s = classes.join(".");
    return to.attr('class', s); }

function grabber(key) {
    return function(d) {
	return d.key; }}

function interval_getter(interval_length, offset) {
    return function(d, i) {
	return (offset || 0) 
	    + (i * interval_length); }; }

function enter_and_exit(svg, data, tag, classes, styles) {
    return apply_style(
	apply_classes(
	    classes,
	    svg.selectAll(selector.apply([tag].concat(classes)))
		.data(data).enter().append(tag)), 
	styles); }


// take a list of styles ending with the highest in precedence and apply them to the d3 
// selection items. Styles should take the format:
//
// { styles: {fill: '#333', ...}, 
//   attrs: {'text-anchor': 'middle', ...}}

function apply_style(items, styles) {
    style = merge_style(styles);
    for (var key in style.styles) {
	items.style(key, style.styles[key]); }
    for (var key in style.attrs) {
	items.attr(key, style.attrs[key]); }
    return items; }

function merge_style(styles) {
    styles = styles.filter(function(x) {return x; });
    console.log(JSON.stringify(styles));
    var style = {styles: {}, attrs: {}};
    for (var i in styles) {
	style = {styles: descend(style.styles || {},
				 styles[i].styles || {}),
		 attrs: descend(style.attrs || {},
				styles[i].attrs || {})}; }
    console.log(JSON.stringify(style));
    return style; }

function descend(from_hash, to_hash) {
    for (var key in to_hash) {
	from_hash[key] = to_hash[key]; }
    return from_hash; }

function returner(a) {
    return a; }

function hash_to_array(hash) {
    var array = [];
    for (var i in hash) {
	array.push(hash[i]); }
    return array; }

register_graphing_module(
    'colorizer', function(graph) {

	graph.random_colorizer = function(s, b, a) {
	    return function() {
		var s = s || '50%';
		var b = b || '50%';
		var a = a || 0.75;
		return 'hsla(' + (Math.round(Math.random() * 360)) + ', ' + s + ', ' + b + ', ' + a + ')'; }; }

	graph.colorize = function (colorizer) {
	    colorizer = colorizer || graph.random_colorizer();
	    for (var i in graph.data) {
		graph.data[i].__color = colorizer(graph.data[i]); }
	    return graph; }});


register_graphing_module(
    'bar_chart', function(graph) {
	
	graph.draw_bar_chart = function(params, layer) {
 	    layer = layer || this.gen_layer_name();
	    var key = params.key;
	    var data = hash_to_array(this.data);
	    var svg = this.svg;
	    var scale_start = this.y_axis.start;
	    var scale_end = this.y_axis.end;
	    var height = this.inner_height;
	    var bars = data.length;
	    var bar_width = this.inner_width / bars;
	    var graph = this;
	    
	    function datum_height(d) {
		var scale = scale_end - scale_start;
		var datum = d[key] - scale_start;
		return (datum / scale) * height; }

	    console.log(data);
	    enter_and_exit(svg, data, 'rect',
			   [layer],
			   [params.style])
		.attr('width', bar_width)
		.attr('x', interval_getter(bar_width, this.margin_left))
		.attr('height', datum_height)
		.attr('y', function(d, i) {
		    return (graph.margin_top + height) - datum_height(d); })
		.attr('fill', function (d, i) {
		    return d.__color; });

}});
	    
register_graphing_module(
    'line_graph', function(graph) {
	
	graph.draw_line_graph = function(params, layer) {
 	    layer = layer || this.gen_layer_name();
	    var key = params.key;
	    var data = hash_to_array(this.data);
	    var svg = this.svg;
	    var scale_start = this.y_axis.start;
	    var scale_end = this.y_axis.end;
	    var height = this.inner_height;
	    var bars = data.length;
	    var bar_width = this.inner_width / bars;
	    var graph = this;
	    
	    function datum_height(d) {
		var scale = scale_end - scale_start;
		var datum = d[key] - scale_start;
		return (datum / scale) * height; }

	    console.log(data);
	    enter_and_exit(svg, data, 'line',
			   [layer],
			   [params.style])
		.attr('x1', interval_getter(bar_width, this.margin_left))
		.attr('x2', interval_getter(bar_width, this.margin_left + bar_width))
		.attr('y1', function(d, i) {
		    return (graph.margin_top + height) - datum_height(d); })
		.attr('y2', function(d, i) {
		    var d2 = data[i+1];
		    if (d2) {
			return (graph.margin_top + height) - datum_height(d2); }
		    return (graph.margin_top + height) - datum_height(d); })
		.attr('stroke', function (d, i) {
		    return '#333'; });

}});
	    

register_graphing_module(
    'axes', function(graph) {
	var default_sort = function(a, b) {
	    return ((a < b) ? -1 : 
		    ((a > b) ? 1 : 0)); }

	// Should take two hashes of parameters for the x and y axes and a layer name
	// as arguments, and draws the axes on the layer given. The available options for 
	// each axis are:
	//
	// key, from, to, interval, draw_gridlines, axis_style,
	// guideline_style, font_style, style, size, sort

	graph.draw_axes = function(x, y, layer) {
	    graph.draw_axis_x(x, layer); 
	    graph.draw_axis_y(y, layer); }

	graph.draw_axis_y = function(params, layer) {
 	    layer = layer || this.gen_layer_name();
	    var sort_fun = params.sort || default_sort;
	    var key = params.key;
//		|| (keys && keys(this.data[0])[0]);
	    var sort = function(a, b) {
		return sort_fun(a.key, b.key); }
	    var data = extract_from_hash(this.data, key)
		.sort(sort_fun);
	    var svg = this.svg;
	    var offset = params.offset 
		|| this.margin_left;
	    var borderline = {y1: this.margin_top, y2: this.margin_bottom, x1: offset, x2: offset};
	    console.log(JSON.stringify(borderline));
	    // draw axis border line
	    bline = enter_and_exit(svg, borderline, 'line', [layer, 'y_axis', 'borderline'],
				  [params.guideline_style, params.axis_style])
		.attr('x1', borderline.x1)
		.attr('y1', borderline.y1)
		.attr('x2', borderline.x2)
		.attr('y2', borderline.y2);
	    
	    // draw guidelines

	    var intervals = params.intervals || data.length;
	    var start = 0;
	    var interval_length = this.inner_height / intervals;
	    var interval_amount = Math.ceil(data[data.length - 1] / intervals);
	    var end = interval_amount * intervals;
	    var guideline_end = this.margin_right;
	    var guideline_start = offset;
	    var graph = this;
	    
	    graph.y_axis = descend(params, {intervals: intervals, interval_length: interval_length,
					    interval_amount: interval_amount,
					    start: start, end: end, layer: layer, offset: offset});

	    var data = [];
	    for (var i = intervals; i >= 1; i--) {
		data.push(i*interval_amount); }

	    guidelines = get_key(data, key);
	    glines = enter_and_exit(svg, data, 'line', [layer, 'y_axis', 'guideline'],
				  [params.guideline_style])
		.attr('y1', function(d, i) {
		    return graph.margin_top + (i * interval_length); })
		.attr('x1', guideline_end)
		.attr('y2', function(d, i) {
		    return graph.margin_top + (i * interval_length); })
		.attr('x2', guideline_start);
	    
	    // draw labels
	    
	    var text_offset = (offset + this.offset_x) / 2;
	    labels = enter_and_exit(svg, data, 'text', 
				    [layer, 'x_axis', 'label'], 
				    [params.font_style])
		.attr('y', interval_getter(interval_length, this.margin_top  + 12))
		.attr('x', text_offset)
		.text(returner); }

	graph.draw_axis_x = function(params, layer) {
	    layer = layer || this.gen_layer_name();
	    var sort_fun = params.sort;
	    var key = params.key
		|| (keys && keys(this.data[0])[0]);
	    var sort = function(a, b) {
		return sort_fun(a.key, b.key); }
	    var data = extract_from_hash(this.data, key);

	    if (sort_fun) {
		data = data.sort(sort_fun); }

	    var svg = this.svg;
	    var offset = params.offset 
		|| this.margin_bottom;
	    var borderline = {x1: this.margin_left, x2: this.margin_right, y1: offset, y2: offset};
	    console.log(JSON.stringify(borderline));
	    // draw axis border line
	    line = svg.selectAll(selector('line', layer, 'x_axis', 'borderline'))
		.data([borderline]).enter().append('line')
		.attr('x1', borderline.x1)
		.attr('y1', borderline.y1)
		.attr('x2', borderline.x2)
		.attr('y2', borderline.y2);
	    apply_style(line, [params.guideline_style, params.axis_style]);
	    
	    // draw guidelines

	    var intervals = data.length;
	    var interval_length = this.inner_width / intervals;
	    var guideline_top = this.margin_top;
	    var guideline_btm = offset;
	    var graph = this;

	    guidelines = get_key(data, key);
	    glines = svg.selectAll(selector('line', layer, 'x_axis', 'guideline'))
		.data(data).enter().append('line')
		.attr('x1', function(d, i) {
		    return graph.margin_left + (i * interval_length); })
		.attr('y1', guideline_top)
		.attr('x2', function(d, i) {
		    return graph.margin_left + (i * interval_length); })
		.attr('y2', guideline_btm);
	    apply_style(glines, [params.guideline_style]);
	    
	    // draw labels
	    
	    var text_offset = (offset + this.height) / 2;
	    labels = enter_and_exit(svg, data, 'text', 
				    [layer, 'x_axis', 'label'], 
				    [params.font_style])
		.attr('x', interval_getter(interval_length, (this.margin_left
							     + (interval_length / 2))))
		.attr('y', text_offset)
		.text(returner); }});	    
		

if (Meteor.isClient) {
  Template.hello.greeting = function () {
    return "Welcome to d3graphs.";
  };

  Template.hello.events({
    'click input' : function () {
      // template data, if any, is available in 'this'
      if (typeof console !== 'undefined')
        console.log("You pressed the button");
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
