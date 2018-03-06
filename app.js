// Define a properties array that returns array of objects representing
// the accepted properties for your application
var properties = [
  {type: 'text', id: "Width", value: 4, help: "MD stuff that should show below the input"},
  {type: 'text', id: "Height", value: 3},
  {type: 'text', id: "Reveal Width", value: .125},
  {type: 'text', id: "Reveal Depth", value: .125}
];

// Define an executor function that builds an array of volumes,
// and passes it to the provided success callback, or invokes the failure
// callback if unable to do so
var executor = function(args, success, failure) {
  console.log(args);
  var params = args.params;
  var material = args.material;
  var volumes = [];
  var width = parseFloat(params["Width"]);
  var height = parseFloat(params["Height"]);
  var offset = parseFloat(params["Reveal Width"]) * 2;
  var depth = parseFloat(params["Reveal Depth"]);
  depth = material.dimensions.z - depth;

  var centerX = args.material.dimensions.x/2;
  var centerY = args.material.dimensions.y/2;

  var selectedVolume = args.volumes.filter(function(x){
    return args.selectedVolumeIds.indexOf(x.id) >= 0;
  })[0];
  if (selectedVolume){
    centerX = selectedVolume.shape.center.x;
    centerY = selectedVolume.shape.center.y;
  }

  var cutWidth = width - offset;
  var cutHeight = height - offset;

  //var centerX = width / 2;
  //var centerY = height / 2;

  var bitD = args.bitParams.bit.width;
  var bitR = bitD/2;

  var d = Math.sqrt((Math.pow(bitR, 2) + Math.pow(bitR, 2)));
  //d = 0//.0125;

  var notchSize = args.bitParams.bit.width + (args.bitParams.bit.width/2); // (2 * args.bitParams.bit.width) / Math.PI;
  console.log('notchSize', notchSize);

  var halfWidth = width/2;
  var halfHeight = height/2;

  d = (notchSize/4);
  console.log('d', d);


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

  console.log('volumes', volumes);

  success(volumes);
};
