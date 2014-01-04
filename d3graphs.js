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
    var s = tagname + '.' + layername;
    for (var i = 2; i < arguments.length; i++) {
	s += '.' + arguments[i]; }
    return s; }

function apply_classes(classes, to) {
    var s = classes.join(" ");
    return to.attr('class', s); }

function grabber(key) {
    return function(d) {
	return d.key; }}

function interval_getter(interval_length, offset) {
    return function(d, i) {
	return (offset || 0) 
	    + (i * interval_length); }; }

function enter_and_exit(svg, data, tag, classes, styles) {
    console.log(selector.apply(false,[tag].concat(classes)));
    var sel = svg.selectAll(selector.apply(false, [tag].concat(classes)))
	.data(data);

    sel.enter().append(tag);

    apply_style(
	apply_classes(
	    classes, sel),
	styles);
    return sel; }


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
    var style = {styles: {}, attrs: {}};
    for (var i in styles) {
	style = {styles: descend(style.styles || {},
				 styles[i].styles || {}),
		 attrs: descend(style.attrs || {},
				styles[i].attrs || {})}; }
    return style; }

function descend(from_hash, to_hash) {
    for (var key in to_hash) {
	from_hash[key] = to_hash[key]; }
    return from_hash; }

function returner(a) {
    return a; }

function extractor(key) {
    return function(d, i) {
	return d[key]; }}

function hash_to_array(hash) {
    var array = [];
    for (var i in hash) {
	array.push(hash[i]); }
    return array; }

function sum() {
    var s = 0;
    for (var i = 0; i < arguments.length; i++) {
	s += arguments[i]; }
    return s; }

function compose(a, b) {
    return function(x) {
	return a(b(x)); }}

function delay(fn) {
    var delayed_args = [];
    for (var i = 1; i < arguments.length; i++) {
	delayed_args.push(arguments[i]); }
    return function() {
	var args = delayed_args.slice(0);
	var j = 0;
	for (var i = 0; i < arguments.length; i++) {
	    while(args[j]) {
		j++; }
	    args[j] = arguments[i]; }
	return fn.apply(false, args); }}

function get_attr(node, attr) {
    var item = node.attributes.getNamedItem(attr);
    return (item ? item.value  : false); }

function caller(to_call) {
    return function(x) { 
	var args = []
	for (var i = 1; i < arguments.length; i++) {
	    args.push(arguments[i]); }
	return x[to_call].apply(x, args); }; }

function compose_or(x, y) {
    return function(v) {
	return y(v) || x(v); }; }

function unique(array) {
    var ar = [];
    for (var i in array) {
	if (ar.indexOf(array[i]) < 0) {
	    ar.push(array[i]); }}
    return ar; }

function nearest(array, value) {
    var n = array[0];
    for (var i = 1; i < array.length; i++) {
	var v = array[i];
	if (Math.abs(v - value) < Math.abs(n - value)) {
	    n = v; }}
    return n; }

function add_chunk_to_data(data, chunk) {
    for (var i in chunk) {
	var ch = chunk[i];
	for (var j in data) {
	    if (data[j].label == ch.label) {
		data[j].data = data[j].data.concat(ch.data); }}}
    return data; }

register_graphing_module(
    'sockets', function(graph) {
	
	graph.open_socket = function(url) {
	    graph.socket = eio(url);
	    graph.socket.onopen = function() {
		graph.socket.onmessage = function(data) {
		    data = JSON.parse(data);
		    if (data.op == 'add-chunk') {
			graph.data = add_chunk_to_data(graph.data, data.data); 
			graph.render(); }
		    if (data.op == 'reload-data') {
			graph.data = data.data;
			graph.render(); }}; }; }

});

register_graphing_module(
    'render_chain', function(graph) {
	graph.chain = [];
	graph.use = function(fn_name) {
	    var args = [];
	    var graph = this;
	    for (var i = 1; i < arguments.length; i++) {
		args.push(arguments[i]); }
	    graph.chain.push(function() {
		graph[fn_name].apply(graph, args); }); };

	graph.transition = function(sel) {
	    return sel.transition().delay(graph.tr_delay || 0).duration(graph.tr_duration || 300); }

	graph.render = function() {
	    for (var i in this.chain) {
		this.chain[i](); }};
	});

register_graphing_module(
    'multiples', function(graph) {
	
	graph.has_multiple_datas = function() {
	    return graph.data.map &&
		graph.data.map(function(x) { 
		    return x.label && x.data; })
		.filter(function(x) { return x;})
		.length == graph.data.length; };

	graph.column_count = function(data) {
	    return Math.max.apply(graph, data.map(function(x) {
		return x.data.length; })); }
	
	graph.draw_multiple_bar_chart = function(params, layer) {
 	    layer = layer || this.gen_layer_name();
	    var graph = this;
	    var points = this.plot_points_multiple(params.key, true);

	    for (var j in points) {
		var points_set = points[j];
		var bars = enter_and_exit(this.svg, points_set, 'rect',
			       [layer, this.data[j].label],
			   [params.style]);
		bars
		    .attr('width', extractor('width'))
		    .attr('datum_value', extractor('datum_value'))
		    .attr('x', extractor('x'))
		    .attr('height', extractor('height'))
		    .attr('y', extractor('y'))
		    .attr('fill', extractor('color'));
		graph.transition(bars.exit()); }

	    this.record_layer(layer, {points: this.merge_points(points), tag: 'rect'}); }

	graph.draw_multiple_line_graphs = function(params, layer) {
 	    layer = layer || this.gen_layer_name();
	    var graph = this;
	    var points = this.plot_points_multiple(params.key, false);

	    enter_and_exit(this.svg, points, 'polyline',
			   [layer],
			   [params.style])
		.attr('points', function(d) {
		    console.log(d);
		    var points = "";
		    for (var i in d) {
			points += '' + d[i].x + ',' + d[i].y + ' '; }
		    return points; })
		.style('fill', 'none')
		.attr('stroke', function (d, i) {
		    return d[0].color || '#333'; }); };

	function mean(a) {
	    return a.reduce(function(a,b) { return a + b; })
		/ a.length; }

	graph.make_path = function(data, g) {
	    var d = "M " + g.margin_left + ' ' + g.margin_bottom + " ";
	    var graph = []
		for (var i = 0; i < data.length; i++) {
		    graph.push([data[i].x,data[i].y]) }
	    graph.push([g.margin_right, graph[graph.length - 1][1]]);
	    graph.push([g.margin_right, g.margin_bottom]);
	    d += "L " + graph[0].join(" ") + " ";
	    for (i = 1; i < graph.length - 1; i++) {
		var prev = graph[i - 1];
		var dis = graph[i];
		var next = graph[i + 1];
		d += ["S", mean([prev[0],  dis[0]]), dis[1],  dis[0], dis[1]].join(" ") + " "; }
	    return d + ["L"].concat(graph[graph.length - 1]).join(" ") + "z"; }

	graph.draw_multiple_area_graph = function(params, layer) {
 	    layer = layer || this.gen_layer_name();
	    var graph = this;
	    var points = this.plot_points_multiple(params.key, false);

	    var areas = enter_and_exit(this.svg, points, 'path',
			   [layer],
			   [params.style])
	    graph.transition(areas)
		.attr('d', delay(graph.make_path, false, graph))
		.attr('datum_value', function(d) {
		    return JSON.stringify(d); })
		.attr('fill', function (d, i) {
		    return d[0].color || '#333'; }); 
	    areas.exit();};
	    
    });

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
    'layers', function(graph) {
	
	graph.layers_rendered = {};

	graph.record_layer = function(layer, data) {
	    graph.layers_rendered[layer] = data; }; });

register_graphing_module(
    'bar_chart', function(graph) {
	
	graph.draw_bar_chart = function(params, layer) {
 	    layer = layer || this.gen_layer_name();
	    var data = hash_to_array(this.data);
	    var bar_width = this.inner_width / data.length;
	    var graph = this;

	    var points = graph.plot_points(params.key, 
					   graph.margin_left, 
					   bar_width, 
					   hash_to_array(this.data));

	    var bars = enter_and_exit(graph.svg, points, 'rect',
			   [layer],
			   [params.style]);
	    bars
		.attr('width', extractor('width'))
		.attr('datum_value', extractor('datum'))
		.attr('x', compose(caller('toString'), extractor('x')))
		.attr('height', extractor('height'))
		.attr('y', extractor('y'))
		.attr('fill', extractor('color'));
	    
	    graph.transition(bars.exit()); 
	    
	    graph.record_layer(layer, {points: points, tag: 'rect', content: 'bar_chart'});
}});

register_graphing_module(
    'hovers', function(graph) {

	graph.get_datum_height = function(scale_end, scale_start, height, key) {
	    return function(d) {
		var scale = scale_end - scale_start;
		var datum = d[key] - scale_start;
		return (datum / scale) * height; }; };

	graph.plot_points = function(key, margin_left, column_width, data, color, bar_width) {
	    var points = [];
	    var datum_height = this.get_datum_height(this.y_axis.end, this.y_axis.start, this.inner_height, key);
	    for (var i in data) {
		var d = data[i];
		var height = datum_height(d);
		points.push({x: interval_getter(column_width, margin_left)(false, i),
			     y: (this.margin_bottom - height),
			     height: height,
			     width: (bar_width || column_width),
			     datum: JSON.stringify(d),
			     datum_value: JSON.stringify(d[key]),
			     color: (color || d.__color)}); }; 
	    return points; }
		
	graph.plot_points_multiple = function(key, divide_columns) {
	    var data = this.prepare_data(this.data);
	    var column_width = this.inner_width / this.column_count(data);
	    
	    if (divide_columns) {
		var bars = data.length;
		var bar_width = column_width / bars; }

	    var points = [];
	    
	    for (var i in data) { 
		var d = data[i];
		points.push(this.plot_points(
		    key, 
		    this.margin_left 
			+ (divide_columns ? bar_width * i : 0), 
		    column_width, 
		    d.data, 
		    d.__color,
		    bar_width)); }
	    return points; };

	graph.merge_points = function(multiple_points) {
	    return multiple_points.reduce(function(a, b) { return a.concat(b); }); }

	graph.draw_dots_multiple = function(params, layer) {
 	    layer = layer || this.gen_layer_name();
	    var data = this.data;
	    var points = this.plot_points_multiple(params.key, params.divide_columns);
	    
	    for (var j in points) {
		var points_set = points[j];
		var sel = enter_and_exit(this.svg, points_set, 'circle',
			       [layer, '__dots', data[j].label],
			       [params.style]);
		this.transition(sel)
		    .attr('cx', extractor('x'))
		    .attr('cy', extractor('y'))
		    .attr('r', (params.radius || '3'))
		    .attr('fill', extractor('color'));
		sel.exit(); }
	    }; 

	graph.draw_labels_multiple = function(params, layer) {
	    layer = layer || this.gen_layer_name();
	    var data = this.data;
	    var points = this.plot_points_multiple(params.key, params.divide_columns);
	    
	    for (var j in points) {
		var points_set = points[j];
		var points_sel = enter_and_exit(this.svg, points_set, 'text',
			       [layer, this.data[j].label],
			       [params.style]);
		this.transition(points_sel)
		    .attr('datum_value', compose(extractor(params.key), compose(JSON.parse, extractor('datum'))))
		    .attr('x', compose(delay(sum, 10), extractor('x')))
		    .attr('cx', extractor('x'))
		    .attr('y', compose(delay(sum, -8), extractor('y')))
		    .text(compose(extractor(params.key), compose(JSON.parse, extractor('datum'))));
		points_sel.exit(); }
	};

	graph.add_vertical_bar_hover = function(params, layer) {
	    layer = layer || this.gen_layer_name();
	    params.style = {styles: {'opacity': '0.0'}};
	    this.draw_labels_multiple(params, layer);
	    this.draw_dots_multiple(params, layer);
	    var graph = this;
	    var svg = this.svg;

	    var line = enter_and_exit(this.svg, [true], 'line',
				      [layer + '_bar'],
				      [{styles: {'stroke-width': '0.5pt', stroke: '#f88', 
						 opacity: '0.0'}},
				       params.bar_style]);
	    graph.transition(line)
		.attr('y1', this.margin_top)
		.attr('y2', this.margin_bottom);
	    this.svg.on('mousemove.', function() {
		var mouse = d3.mouse(svg[0][0]);
	    var hovers = svg.selectAll('.' + layer);
	    var xs = unique(hovers[0].map(compose_or(delay(get_attr, false, 'x'),
							 delay(get_attr, false, 'cx'))));
		if (mouse[0] < graph.margin_left || mouse[0] >= graph.margin_right) {
		    line.style('opacity', '0.0');
		    hovers.style('opacity', '0.0'); 
		    return; }

		line.attr('x1', mouse[0])
		    .attr('x2', mouse[0])
		    .style('opacity', '1.0');

		var n = nearest(xs, mouse[0]); 
		hovers.style('opacity', function(d, i) {
		    if (d.cx == n || d.x == n) {
			return '1.0'; }
		    return '0.0'; }); }); }

	graph.add_hovers = function(params, layer) {
             layer = layer || this.gen_layer_name();
            var above_layer = params.layer;
            var data = graph.svg.selectAll('.' + above_layer);
            var tag = data[0][0].tagName;
            var stroke_size = params.stroke_size || '5pt';
            var points = (graph.layers_rendered[above_layer] 
                          && graph.layers_rendered[above_layer].points);

            var detail_hovers = enter_and_exit(graph.svg, points, 'text',
                                          [layer, 'label'],
                                          [params.style]);
            
            var ar = [];

            detail_hovers.attr('x', extractor('x'))
                .attr('y', extractor('y'))
                .text(extractor('datum_value'))
                .attr('font-size', '12px')
                .attr('fill', '#000')
                .style('background-color','#FFF')
                .attr('font-family', 'verdana')
                .attr('font-weight', 'bold')
                .attr('class', function(d, i) {
                    return above_layer + " " + layer + " " + layer + '_' + i; })
                .style('opacity', '0.0');

            detail_hovers.exit();

            var overlays = enter_and_exit(graph.svg, data[0], tag,
                                          [layer],
                                          [params.style]);

            for (var i =0; i < data[0][0].attributes.length; i++) {
                var item = data[0][0].attributes.item(i);
                overlays.attr(item.name, function(d, i) {
                    return d.attributes.getNamedItem(item.name).value; }); }

            for (var style in data[0][0].style) {
                overlays.style(style, function(d, i) {
                    return d.style[style]; }); }
            
            overlays.attr('stroke-width', stroke_size)
                .style('opacity', '0.0')
                .attr('class', function(d, i) {
                    return this.className + " " + layer + '_' + i; })
                .attr('stroke', function(d) {
                    attr = d.attributes.getNamedItem('fill') ||
                        d.attributes.getNamedItem('stroke');
                    if (attr) { return attr.value; }
                    return 'black'; })
                .on('mouseover', function(d, i) {
                    graph.svg.selectAll('.' + layer + '_' + i).style('opacity', '0.8'); })
                .on('mouseout', function(d, i) {
                    graph.svg.selectAll('.' + layer + '_' + i).style('opacity', '0.0'); });
            overlays.exit(); }});
	    
	    
register_graphing_module(
    'line_graph', function(graph) {
	graph.draw_line_graph = function(params, layer) {
 	    layer = layer || this.gen_layer_name();
	    var svg = this.svg;
	    var graph = this;
	    var points = graph.plot_points(params.key, 
					   graph.margin_left, 
					   this.inner_width / this.data.length, 
					   hash_to_array(this.data));


	    var lines = enter_and_exit(svg, points, 'line',
			   [layer],
			   [params.style]);
	    lines.attr('x1', extractor('x'))
		.attr('x2', function(d) { return d.x + d.width; })
		.attr('datum_value', extractor('datum'))
		.attr('y1', extractor('y'))
		.attr('y2', function(d, i) {
		    var d2 = points[i+1];
		    if (d2) {
			return d2.y; }
		    return d.y; })
		.attr('stroke', function (d, i) {
		    return '#333'; });
	    lines.exit();
	    
	    this.record_layer(layer, {points: points, tag: 'line', content: 'line_graph'}); }
});
	    

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
	    graph.draw_axis(
		descend({axis: 'y', 
			 guidelines: true, 
			 intervals: 8,
			 type: 'scale'},
			params), layer); }

	graph.draw_axis_x = function(params, layer) {
	    graph.draw_axis(
		descend({axis: 'x', 
			 intervals_limit: 12,
			 guidelines: true, 
			 type: 'discrete'},
			params), layer); }

	graph.get_axis_labels = function(params, data) {
	    data = extract_from_hash(data, params.key);
	    if (this.has_multiple_datas()) {
		data = _.unique(
		    this.data.map(function(x) { return extract_from_hash(x.data, params.key); })
			.reduce(function(x, y) { return x.concat(y); })); }

	    if (params.type == 'discrete') {
		var limit = params.intervals_limit;
		if (limit > 0) {
		    data = data.slice(-limit); }
		return {data: data}; }
	    
	    data.sort(params.sort || default_sort);
	    var intervals = params.intervals || data.length;
	    var interval_amount = Math.ceil(data[data.length - 1] / intervals);
	    
	    var data = [];
	    for (var i = intervals; i >= 1; i--) {
		data.push(i*interval_amount); }

	    return {data: data,
		    start: (params.start || 0),
		    end: (interval_amount * intervals)}; };

	graph.get_axis_specs = function(axis) {
	    if (axis == 'x') {
		return {start: this.margin_left,
			axis: 'x',
			end: this.margin_right,
			negative_offset: this.offset_y + this.height,
			offset: this.margin_bottom }; }
	    return {start: this.margin_top,
		    axis: 'y',
		    end: this.margin_bottom,
		    negative_offset: this.offset_x,
		    offset: this.margin_left }; }

	graph.draw_borderline = function(svg, axis, style, layer) {
	    bline = enter_and_exit(svg, 
				   [(axis == 'x' ? 
				    {x1: this.margin_left, x2: this.margin_right,
				     y1: this.margin_bottom, y2: this.margin_bottom} 
				    : {y1: this.margin_top, y2: this.margin_bottom,
				       x1: this.margin_left, x2: this.margin_left})], 
				   'line', [layer, axis  + '_axis', 'borderline'], style);
	    this.transition(bline)
		.attr('x1', extractor('x1'))
		.attr('y1', extractor('y1'))
		.attr('x2', extractor('x2'))
		.attr('y2', extractor('y2'));
	    this.transition(bline.exit()); }
    
	graph.draw_axis = function(params, layer) {
 	    layer = layer || this.gen_layer_name();
	    var sort_fun = params.sort || default_sort;
	    var key = params.key;
	    var intervals = this.get_axis_labels(params, this.data);
	    var this_axis = this.get_axis_specs(params.axis);
	    var that_axis = this.get_axis_specs(params.axis == 'x' ? 'y' : 'x');

	    var svg = this.get_axis_group(layer);
	    var offset = params.offset 
		|| this.margin_left;
	    var borderline = {y1: this.margin_top, y2: this.margin_bottom, x1: offset, x2: offset};

	    this.draw_borderline(svg, params.axis, 
				 [params.guideline_style, params.borderline_style], layer);

	    var graph = this;
	    graph[params.axis+ '_axis'] = 
		descend(params, 
			{intervals: intervals.data, 
			 start: intervals.start, end: intervals.end, layer: layer, 
			 filterer: function(data) {
			     if (params.type != 'discrete') {
				 return data; }
			     else { 
				 return data.filter(function(x) {
				     return intervals.data.indexOf(x[params.key]) >= 0; }); }},
			 offset: this_axis.offset});
	    console.log(intervals);
	    var interval_length = (this_axis.end - this_axis.start) / intervals.data.length;
	    console.log(intervals.data);
	    console.log(interval_length);
	    glines = enter_and_exit(svg, intervals.data, 
				    'line', [layer, this_axis.axis + '_axis', 'guideline'],
				  [params.guideline_style]);
	    this.transition(glines)
		.attr(this_axis.axis + '1', function(d, i) {
		    return this_axis.start + (i * interval_length); })
		.attr(that_axis.axis + '1', that_axis.end)
		.attr(this_axis.axis + '2', function(d, i) {
		    return this_axis.start + (i * interval_length); })
		.attr(that_axis.axis + '2', that_axis.start);
	    glines.exit();

	    // draw labels
	    
	    var text_offset = this_axis.negative_offset;
	    labels = enter_and_exit(svg, intervals.data, 'text', 
				    [layer, this_axis.axis + '_axis', 'label'], 
				    [params.font_style]);
	    this.transition(labels)
		.attr(this_axis.axis, interval_getter(interval_length, this_axis.start  + 12))
		.attr(that_axis.axis, text_offset)
		.text(returner);
	    labels.exit(); }

	function prep_data(data) {
	    return graph.y_axis.filterer(graph.x_axis.filterer(data)); }

	graph.prepare_data = function(data) {
	    console.log(JSON.stringify({'prepping': data}));
	    if (this.has_multiple_datas()) {
		data = data.map(function(d) {
		    var e = _.clone(d);
		    e.data = prep_data(e.data); 
		    return e; }); 
		console.log(JSON.stringify({'prepping': data}));
		return data; }
	    return prep_data(data); }

	graph.get_axis_group = function(layer) {
	    var g = this.svg.selectAll('g.' + layer).data([true]);
	    g.enter().append('g').attr('class', layer);
	    return g; }
});
		

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

function random_dec(upto, decs) {
    var exp = Math.pow(10, decs || 0);
    return Math.round(Math.random() * upto * exp , decs || 0) / exp; }

if (Meteor.isServer) {
    Meteor.startup(function () { 
    });
}
