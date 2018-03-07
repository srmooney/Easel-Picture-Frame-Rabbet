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
  var height = parseFloat(params["Height"]);
  var offset = parseFloat(params["Reveal Width"]) * 2;
  var depth = parseFloat(params["Reveal Depth"]);

  if (args.preferredUnit == 'mm') {
    width /= 25.4;
    height /= 25.4;
    offset /= 25.4;
    depth /= 25.4;
  }

  depth = material.dimensions.z - depth;

  var centerX = args.material.dimensions.x/2;
  var centerY = args.material.dimensions.y/2;

  var selectedVolume = args.volumes.filter(function(volume){
    return args.selectedVolumeIds.indexOf(volume.id) >= 0;
  })[0];
  if (selectedVolume){
    centerX = selectedVolume.shape.center.x;
    centerY = selectedVolume.shape.center.y;
  }

  var cutWidth = width - offset;
  var cutHeight = height - offset; 

  var bitD = args.bitParams.bit.width;
  var bitR = bitD/2;

  var d = Math.sqrt((Math.pow(bitR, 2) + Math.pow(bitR, 2)));

  var notchSize = args.bitParams.bit.width + (args.bitParams.bit.width/2); // (2 * args.bitParams.bit.width) / Math.PI;

  var halfWidth = width/2;
  var halfHeight = height/2;

  d = (notchSize/4);

  // Rabbet
  volumes.push({
    shape: {
      type: "rectangle",
      center: {
        x: centerX,
        y: centerY
      },
      flipping: {},
      width: width,
      height: height,
      rotation: 0
    },
    cut: {
      depth: depth,
      type: 'fill',
      tabPreference: false
    }
  });
  //Dogbone 1
  volumes.push({
    shape: {
      type: "ellipse",
      center: {
        x: ((centerX - halfWidth) + d),
        y: ((centerY + halfHeight) - d)
      },
      flipping: {},
      width: notchSize,
      height: notchSize,
      rotation: 0
    },
    cut: {
      depth: depth,
      type: 'fill',
      tabPreference: false
    }
  });
  //Dogbone 2
  volumes.push({
    shape: {
      type: "ellipse",
      center: {
        x: ((centerX + halfWidth) - d),
        y: ((centerY + halfHeight) - d)
      },
      flipping: {},
      width: notchSize,
      height: notchSize,
      rotation: 0
    },
    cut: {
      depth: depth,
      type: 'fill',
      tabPreference: false
    }
  });
  //Dogbone 3
  volumes.push({
    shape: {
      type: "ellipse",
      center: {
        x: ((centerX + halfWidth) - d),
        y: ((centerY - halfHeight) + d)
      },
      flipping: {},
      width: notchSize,
      height: notchSize,
      rotation: 0
    },
    cut: {
      depth: depth,
      type: 'fill',
      tabPreference: false
    }
  });
  //Dogbone 4
  volumes.push({
    shape: {
      type: "ellipse",
      center: {
        x: ((centerX - halfWidth) + d),
        y: ((centerY - halfHeight) + d)
      },
      flipping: {},
      width: notchSize,
      height: notchSize,
      rotation: 0
    },
    cut: {
      depth: depth,
      type: 'fill',
      tabPreference: false
    }
  });
  //Rabbet Mask to prevent too much pocketing
  volumes.push({
    shape: {
      type: "rectangle",
      center: {
        x: centerX,
        y: centerY
      },
      flipping: {},
      width: cutWidth - args.bitParams.bit.width,
      height: cutHeight - args.bitParams.bit.width,
      rotation: 0
    },
    cut: {
      depth: 0,
      type: 'fill',
      tabPreference: false
    }
  });
  //Frame cutout
  volumes.push({
    shape: {
      type: "rectangle",
      center: {
        x: centerX,
        y: centerY
      },
      flipping: {},
      width: cutWidth,
      height: cutHeight,
      rotation: 0
    },
    cut: {
      depth: material.dimensions.z,
      type: 'outline',
      outlineStyle: 'inside',
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
  });

  success(volumes);
};
