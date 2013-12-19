

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
