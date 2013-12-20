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

function create_graph(svg, data) {
    var graph = {};
    
    graph.layers = {};
    graph.style = {;}

    for (var name in graphing_modules) {
	graphing_modules[name](graph); }

    return graph; }

register_graphing_module(
    'axes', function(graph) {
	
	// Should take two hashes of parameters for the x and y axes and a layer name
	// as arguments, and draws the axes on the layer given. The available options for 
	// each axis are:
	//
	// key, from, to, interval, divisions, draw_gridlines, axis_style,
	// guideline_style, font_style, style

	graph.draw_axes = function(x, y, layer) {
	    
			 

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
