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

function create_graph(svg, data, options) {
    var graph = {};
    
    graph.data = data;
    graph.svg = svg;
    graph.layers = {};
    graph.style = {;}
    graph.width = options.width || svg.width;
    graph.height = options.height || svg.height;
    graph.offset_x = options.offset_x || 0;
    graph.offset_y = options.offset_y || 0;

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

    graph.get_percent_pos_from_x = function(percent) {
	return this.offset_x + this.width -
	    (this.width * percent); }

    graph.get_percent_pos_from_y = function(percent) {
	return this.offset_y + this.height - 
	    (this.height * percent); }

    graph.last_layer_id = 0;
    graph.gen_layer_name = function() {
	this.last_layer_id += 1;
	return "layer_" + this.last_layer_id; }
	    
    for (var name in graphing_modules) {
	graphing_modules[name](graph); }

    return graph; }

function extract_from_hash(hash, key) {
    var a = [];
    for (var i in hash) {
	if (hash[i][key]) {
	    a.push(hash[i][key]); }}
    return a; }

function selector(tagname, layername) {
    var s = tagname = '.' + layername;
    for (var i = 2; i < arguments.length; i++) {
	s += '.' + arguments[i]; }
    return s; }

function apply_classes(classes. to) {
    var s = classes.join(".");
    return to.attr('class', s); }

function grabber('key') {
    return function(d) {
	return d.key; }}

function interval_getter(interval_length) {
    return function(d, i) {
	return i * interval_length; }; }

function enter_and_exit(svg, data, tag, classes, styles) {
    return apply_styles(
	apply_classes(
	    classes,
	    svg.selectAll(selector.apply([tag].concat(classes)))
		.data(data).enter(tag).exit()), 
	styles); }

// take a list of styles ending with the highest in precedence and apply them to the d3 
// selection items. Styles should take the format:
//
// { styles: {fill: '#333', ...}, 
//   attrs: {'text-anchor': 'middle', ...}}

function apply_styles(items, styles) {
    style = merge_style(styles);
    for (var key in style.styles) {
	items.style(key, style.styles[key]); }
    for (var key in style.attrs) {
	items.attr(key, style.attrs[key]); }
    return items; }

function merge_styles(styles) {
    if (styles.length == 1) {
	return styles; }
    else {
	return {styles: descend((styles[0].styles || {}),
				(styles[1].styles || {})),
		attrs: descend((styles[0].attrs || {}),
			       (styles[1].attrs || {}))};}}

function descend(from_hash, to_hash) {
    for (var key in to_hash) {
	from_hash[key] = to_hash[key]; }
    return from_hash; }

function returner(a) {
    return a; }

register_graphing_module(
    'axes', function(graph) {
	function default_sort = function(a, b) {
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
	    }

	graph.draw_axis_x = function(params, layer) {
	    layer = layer || this.gen_layer_name();
	    var sort_fun = params.sort || default_sort;
	    var key = params.key
		|| (keys && keys(this.data[0])[0]);
	    var sort = function(a, b) {
		return sort_fun(a.key, b.key); }
	    var data = extract_from_hash(this.data, key)
		.sort(sort_fun);
	    var svg = this.svg;
	    var offset = params.offset 
		|| this.get_percent_from_pos_x((this.height && (this.height * 0.01)) || 0.1);
	    var borderline = {x1: this.x, x2: (this.x + this.width), y1: offset, y2: offset};

	    // draw axis border line
	    line = svg.selectAll(selector('line', layer, 'x_axis', 'borderline'))
		.data(borderline).enter('line').exit()
		.attr('x1', grabber('x1'))
		.attr('y1', grabber('y1'))
		.attr('x2', grabber('x2'))
		.attr('y2', grabber('y2'));
	    apply_style(line, [params.guideline_style, params.axis_style]);
	    
	    // draw guidelines

	    var intervals = data.length;
	    var interval_length = this.width / intervals;
	    var guideline_top = this.y;
	    var guideline_btm = offset;

	    guidelines = get_key(data, key)
	    glines = svg.selectAll(selector('line', layer, 'x_axis', 'guideline'))
		.data(data).enter('line').exit()
		.attr('x1', interval_getter(interval_length))
		.attr('y1', guideline_top),
		.attr('x2', interval_getter(interval_length))
		.attr('y2', guideline_btm);
	    apply_style(glines, [params.guideline_style]);
	    
	    // draw labels
	    
	    var text_offset = (offset + this.height) / 2;
	    labels = enter_and_exit(svg, data, 'line', 
				    [layer, 'x_axis', 'label'], 
				    [params.font_style])
		.attr('x', interval_getter(interval_length))
		.attr('y', text_offset)
		.text(returner); }

	    
	    
		
			 
		    
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
