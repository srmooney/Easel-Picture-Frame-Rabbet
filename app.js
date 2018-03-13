var makerjs = require('makerjs');
var meapi = require('makerjs-easel-api');

// Define a properties array that returns array of objects representing
// the accepted properties for your application
var properties = function(projectSettings){
  var defaults = {
    "Width": 6,
    "Height": 4,
    "Reveal Width": 0.125,
    "Reveal Depth": 0.125
  };
  
  if (projectSettings.preferredUnit === "mm"){
    defaults["Width"] = 152;
    defaults["Height"] = 102;
    defaults["Reveal Width"] = 4;
    defaults["Reveal Depth"] = 4;
  }
  
  return [
    {type: 'text', id: "Width", value: defaults["Width"], help: "MD stuff that should show below the input"},
    {type: 'text', id: "Height", value: defaults["Height"] },
    {type: 'text', id: "Reveal Width", value: defaults["Reveal Width"] },
    {type: 'text', id: "Reveal Depth", value: defaults["Reveal Depth"] }
  ];
};

// Define an executor function that builds an array of volumes,
// and passes it to the provided success callback, or invokes the failure
// callback if unable to do so
var executor = function(args, success, failure) {
  var params = args.params;
  var material = args.material;
  var volumes = [];
  var width = parseFloat(params["Width"]);
  if (isNaN(width)) { failure('Width is not a number'); return; }
  var height = parseFloat(params["Height"]);
  if (isNaN(height)) { failure('Height is not a number'); return; }
  var offset = parseFloat(params["Reveal Width"]) * 2;
  if (isNaN(offset)) { failure('Reveal Width is not a number'); return; }
  var depth = parseFloat(params["Reveal Depth"]);
  if (isNaN(depth)) { failure('Reveal Depth is not a number'); return; }
  
  if (args.preferredUnit == 'mm') {
    width /= 25.4;
    height /= 25.4;
    offset /= 25.4;
    depth /= 25.4;
  }
  
  width += 0.001; //Add a tolerance
  height += 0.001; //Add a tolerance
  
  
  var bitD = args.bitParams.bit.width;
  var bitR = bitD/2;
  var dogbone = bitR;
  var cutWidth = width - offset;
  var cutHeight = height - offset;
  var centerX = args.material.dimensions.x/2;
	var centerY = args.material.dimensions.y/2;
  depth = material.dimensions.z - depth;
  
  if (depth <= 0) { failure('Reveal Depth is too big for material'); return; }

	var selectedVolume = args.volumes.filter(function(volume){
	  return args.selectedVolumeIds.indexOf(volume.id) >= 0;
	})[0];
	if (selectedVolume){
	  centerX = selectedVolume.shape.center.x;
	  centerY = selectedVolume.shape.center.y;
	}

  var models = {
    rabbet: {
      model: new makerjs.models.Dogbone(width, height, dogbone, 0, false),
      cut: {
      		type: "fill",
      		depth: depth
        }
    },
    mask: {
      model: new makerjs.models.Rectangle(cutWidth - bitR, cutHeight - bitR),
      cut: {
      		type: "fill",
      		depth: 0
        }
    },
    cut: {
      model: new makerjs.models.Rectangle(cutWidth, cutHeight),
      cut: {
    		type: "outline",
    		outlineStyle: "inside",
    		depth: material.dimensions.z,
    		tabPreference: true,
    		tabs: [
            { 
              center: { 
                x: (centerX), 
                y: (centerY + (cutHeight/2))
              }
            },
            {
              center: { 
                x: (centerX), 
                y: (centerY - (cutHeight/2))
              }
            },
            { 
              center: { 
                x: (centerX + (cutWidth/4)), 
                y: (centerY)
              }
            },
            {
              center: { 
                x: (centerX - (cutWidth/4)), 
                y: (centerY)
              }
            }
          ]
      }
    }
  };
  
  
  //console.log('models', models);

  for (var key in models) {
      if (models.hasOwnProperty(key)) {
        var model = models[key].model;
        var measurement = makerjs.measure.modelExtents(model);
        //console.log('measurement', measurement);
        var allPoints = meapi.exportModelToEaselPointArray(model);
        //console.log('allPoints', allPoints);
        var volume = {
          shape: {
              type: "path",
              points: allPoints,
              flipping: {},
              center: {
                x: centerX,
                y: centerY
              },
              width: measurement.width,
              height: measurement.height,
              rotation: 0
          }
        }; 
        volume.cut = models[key].cut;
        volumes.push(volume);
      }
  }
  
  //console.log('volumes', volumes);
  success(volumes);
  return;

};
